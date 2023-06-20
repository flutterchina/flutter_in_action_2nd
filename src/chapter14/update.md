setState：

1. 调用markNeedsBuild，标记element为dirty 。
2. 调用scheduleBuildFor，将当前element添加到一个全局的dirtyElements列表。
3. 请求一个新的frame，随后会绘制新的frame，onBuildScheduled->ensureVisualUpdate->scheduleFrame()



绘制过程：

WidgetsBinding.drawFrame：

```dart

void drawFrame() {
  buildOwner!.buildScope(renderViewElement!); //重新构建widget树
  pipelineOwner.flushLayout(); // 更新布局
  pipelineOwner.flushCompositingBits(); //更新合成信息
  pipelineOwner.flushPaint(); // 更新绘制
  if (sendFramesToEngine) {
    renderView.compositeFrame(); // 上屏，会将绘制出的bit数据发送给GPU
    pipelineOwner.flushSemantics(); // this also sends the semantics to the OS.
    _firstFrameSent = true;
  }
}
```

1. 重新构建widget树：如果dirtyElements列表不为空，则遍历该列表，调用每一个element的rebuild方法重新构建新的widget（树），由于新的widget(树)使用新的状态构建，所以可能导致widget布局信息（占用的空间和位置）发生变化，如果发生变化，则会调用其renderObject的markNeedsLayout方法，该方法会从当前节点向父级查找，直到找到一个relayoutBoundary的节点，然后会将它添加到一个全局的nodesNeedingLayout列表中；如果直到根节点也没有找到relayoutBoundary，则将根节点添加到nodesNeedingLayout列表中。
2. 更新布局：遍历nodesNeedingLayout数组，对每一个renderObject重新布局（调用其layout方法），确定新的大小和偏移。layout方法中会调用markNeedsPaint()，该方法和 markNeedsLayout 方法功能类似，也会从当前节点向父级查找，直到找到一个isRepaintBoundary属性为true的父节点，然后将它添加到一个全局的nodesNeedingPaint列表中；由于根节点（RenderView）的 isRepaintBoundary 为 true，所以必会找到一个。查找过程结束后会调用buildOwner.requestVisualUpdate方法，该方法最终会调用scheduleFrame()，该方法中会先判断是否已经请求过新的frame，如果没有则请求一个新的frame。
3. 更新合成信息：
4. 更新绘制：遍历nodesNeedingPaint列表，调用每一个节点的paint方法进行重绘，绘制过程会生成Layer。需要说明一下，flutter中绘制结果是保存在Layer中的，也就是说只要Layer不释放，那么绘制的结果就会被缓存，因此，Layer可以跨frame来缓存绘制结果，避免不必要的重绘开销。Flutter框架绘制过程中，遇到isRepaintBoundary 为 true 的节点时，才会生成一个新的Layer。可见Layer和 renderObject 不是一一对应关系，父子节点可以共享，这个我们会在随后的一个试验中来验证。当然，如果是自定义组件，我们可以在renderObject中手动添加任意多个 Layer，这通常用于只需一次绘制而随后不会发生变化的绘制元素的缓存场景，这个随后我们也会通过一个例子来演示。
5. 上屏：绘制完成后，我们得到的是一棵Layer树，最后我们需要将Layer树中的绘制信息在屏幕上显示。我们知道Flutter是自实现的渲染引擎，因此，我们需要将绘制信息提交给Flutter engine，而`renderView.compositeFrame` 正是完成了这个使命。

以上，便是setState被调用到UI更的大概更新过程，实际的流程会更复杂一些，比如在build过程中是不允许再调用setState的，框架需要做一些检查；又比如在frame中会涉及到动画的调度、在上屏时会将所有的Layer添加到场景（Scene）对象后，再渲染Scene，读者有兴趣可以自行查看源码或关注笔者博客（后续会有补充内容哦）。



## 试验一： RepaintBoundary 验证 。

我们先定义一个绘制组件所占区域边框的画笔：

```dart
class OutlinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    print("paint");
    var paint = Paint()
      ..strokeWidth = 2
      ..style= PaintingStyle.stroke
      ..color = Colors.black;
    canvas.drawRect(Offset.zero & size, paint);
  }

  // 本例中，rebuild时，painter会重新构建一个新实例，返回false,
  // 表示即使Painter实例发生变化也不需要重新绘制。
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

测试用例如下：

```dart
class _RepaintBoundaryTestState extends State<RepaintBoundaryTest> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CustomPaint(
          size: Size(50, 50),
          painter: OutlinePainter(),
        ),
        ElevatedButton(
          onPressed: () => setState(() {}),
          child: Text("setState"),
        )
      ],
    );
  }
}
```

此时我们点击“setState”按钮，会发现控制台输出了多次“paint”。这是因为ElevatedButton按钮点击时会执行水波动画，动画的每一帧都会触发一次ElevatedButton重绘（markNeedsRepaint），虽然重绘是ElevatedButton触发，但是我们前面说过markNeedsRepaint在执行过程中会向父级查找最近的一个 isRepaintBoundary 为 true 的节点，然后会在flushPaint时会创建一个layer，然后会从该父级节点出发向下绘制及其所有子节点，直到遇到一个 isRepaintBoundary为true的节点时停止向下查找绘制。所以在本例中，最终CustomPaint也重新绘制了。那如何防止CustomPaint被牵连呢？有两个方法：

1. 给ElevatedButton添加一个`RepaintBoundary`。
2. 给CustomPaint添加一个`RepaintBoundary`。

RepaintBoundary 是一个可以有单个孩子的widget，实现原理很简单，就是将自己renderObject的isRepaintBoundary设为true，这样在绘制的过程中就会为其（以及其子节点）单独生成一个layer，子节点触发重绘时，RepaintBoundary为其最近的isRepaintBoundary为true的父节点，所以会从RepaintBoundary向下绘制，如此，CustomPaint和 ElevatedButton的重绘就不会相互牵连了。其实从名字上也能看出来RepaintBoundary 的作用其实就是一个“绘制边界”。上述绘制逻辑的实现在PaintContext方法中，感兴趣的话可以自己查阅源码。

同理，在layout阶段，LayoutBoundary的效果也类似。





