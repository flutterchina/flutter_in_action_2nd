# 8.4 手势原理与手势冲突

## 8.4.1 手势识别原理

手势的识别和处理都是在事件分发阶段的，GestureDetector 是一个 StatelessWidget， 包含了  RawGestureDetector，我们看一下它的 build 方法实现：

```dart
@override
Widget build(BuildContext context) {
  final  gestures = <Type, GestureRecognizerFactory>{};
  // 构建 TapGestureRecognizer 
  if (onTapDown != null ||
      onTapUp != null ||
      onTap != null ||
      ... //省略
  ) {
    gestures[TapGestureRecognizer] = GestureRecognizerFactoryWithHandlers<TapGestureRecognizer>(
      () => TapGestureRecognizer(debugOwner: this),
      (TapGestureRecognizer instance) {
        instance
          ..onTapDown = onTapDown
          ..onTapUp = onTapUp
          ..onTap = onTap
          //省略
      },
    );
  }

  
  return RawGestureDetector(
    gestures: gestures, // 传入手势识别器
    behavior: behavior, // 同 Listener 中的 HitTestBehavior
    child: child,
  );
}
```

注意，上面我们删除了很多代码，只保留了 TapGestureRecognizer（点击手势识别器） 相关代码，我们以点击手势识别为例讲一下整个过程。RawGestureDetector 中会通过 Listener 组件监听 PointerDownEvent 事件，相关源码如下：

```dart

@override
Widget build(BuildContext context) {
  ... // 省略无关代码
  Widget result = Listener(
    onPointerDown: _handlePointerDown,
    behavior: widget.behavior ?? _defaultBehavior,
    child: widget.child,
  );
}  
 
void _handlePointerDown(PointerDownEvent event) {
  for (final GestureRecognizer recognizer in _recognizers!.values)
    recognizer.addPointer(event);
}  
```

下面我们看一下 TapGestureRecognizer 的几个相关方法，由于 TapGestureRecognizer 有多层继承关系，笔者合并了一个简化版：

```dart
class CustomTapGestureRecognizer1 extends TapGestureRecognizer {

  void addPointer(PointerDownEvent event) {
    //会将 handleEvent 回调添加到 pointerRouter 中
    GestureBinding.instance!.pointerRouter.addRoute(event.pointer, handleEvent);
  }
  
  @override
  void handleEvent(PointerEvent event) {
    //会进行手势识别，并决定是是调用 acceptGesture 还是 rejectGesture，
  }
  
  @override
  void acceptGesture(int pointer) {
    // 竞争胜出会调用
  }

  @override
  void rejectGesture(int pointer) {
    // 竞争失败会调用
  }
}
```

可以看到当 PointerDownEvent 事件触发时，会调用 TapGestureRecognizer 的 addPointer，在 addPointer 中会将 handleEvent 方法添加到 pointerRouter 中保存起来。这样一来当手势发生变化时只需要在 pointerRouter中取出 GestureRecognizer 的 handleEvent 方法进行手势识别即可。

正常情况下应该是手势直接作用的对象应该来处理手势，所以一个简单的原则就是同一个手势应该只有一个手势识别器生效，为此，手势识别才映入了手势竞技场（Arena）的概念，简单来讲：

1. 每一个手势识别器（GestureRecognizer）都是一个“竞争者”（GestureArenaMember），当发生指针事件时，他们都要在“竞技场”去竞争本次事件的处理权，默认情况最终只有一个“竞争者”会胜出(win)。
2. GestureRecognizer 的 handleEvent 中会识别手势，如果手势发生了某个手势，竞争者可以宣布自己是否胜出，一旦有一个竞争者胜出，竞技场管理者（GestureArenaManager）就会通知其他竞争者失败。
3. 胜出者的 acceptGesture 会被调用，其余的 rejectGesture 将会被调用。

上一节我们说过命中测试是从  RenderBinding 的 hitTest 开始的：

```dart
@override
void hitTest(HitTestResult result, Offset position) {
  // 从根节点开始进行命中测试
  renderView.hitTest(result, position: position); 
  // 会调用 GestureBinding 中的 hitTest()方法，我们将在下一节中介绍。
  super.hitTest(result, position); 
}
```

渲染树命中测试完成后会调用 GestureBinding 中的 hitTest() 方法：

```dart
@override // from HitTestable
void hitTest(HitTestResult result, Offset position) {
  result.add(HitTestEntry(this));
}
```

很简单， GestureBinding 也通过命中测试了，这样的话在事件分发阶段，GestureBinding 的 handleEvent 便也会被调用，由于它是最后被添加到 HitTestResult 中的，所以在事件分发阶段 GestureBinding 的 handleEvent会在最后被调用：

```dart
@override 
void handleEvent(PointerEvent event, HitTestEntry entry) {
  // 会调用在 pointerRouter 中添加的 GestureRecognizer 的 handleEvent
  pointerRouter.route(event);
  if (event is PointerDownEvent) {
    // 分发完毕后，关闭竞技场
    gestureArena.close(event.pointer);
  } else if (event is PointerUpEvent) {
    gestureArena.sweep(event.pointer);
  } else if (event is PointerSignalEvent) {
    pointerSignalResolver.resolve(event);
  }
}
```

gestureArena 是 GestureArenaManager 类实例，负责管理竞技场。

上面关键的代码就是第一行，功能是会调用之前在 pointerRouter 中添加的 GestureRecognizer 的 handleEvent，不同 GestureRecognizer 的 handleEvent 会识别不同的手势，然后它会和 gestureArena 交互（如果当前的 GestureRecognizer 胜出，需要 gestureArena 去通知其他竞争者它们失败了），最终，如果当前GestureRecognizer 胜出，则最终它的 acceptGesture 会被调用，如果失败则其  rejectGesture 将会被调用，因为这部分代码不同的 GestureRecognizer 会不同，知道做了什么就行，读者有兴趣可以自行查看源码。

## 8.4.2 手势竞争

如果对一个组件同时监听水平和垂直方向的拖动手势，当我们斜着拖动时哪个方向的拖动手势回调会被触发？实际上取决于第一次移动时两个轴上的位移分量，哪个轴的大，哪个轴在本次滑动事件竞争中就胜出。上面已经说过，每一个手势识别器（`GestureRecognizer`）都是一个“竞争者”（`GestureArenaMember`），当发生指针事件时，他们都要在“竞技场”去竞争本次事件的处理权，默认情况最终只有一个“竞争者”会胜出(win)。例如，假设有一个`ListView`，它的第一个子组件也是`ListView`，如果现在滑动这个子`ListView`，父`ListView`会动吗？答案是否定的，这时只有子`ListView`会动，因为这时子`ListView`会胜出而获得滑动事件的处理权。

下面我们看一个简单的例子：

```dart
GestureDetector( //GestureDetector2
  onTapUp: (x)=>print("2"), // 监听父组件 tapUp 手势
  child: Container(
    width:200,
    height: 200,
    color: Colors.red,
    alignment: Alignment.center,
    child: GestureDetector( //GestureDetector1
      onTapUp: (x)=>print("1"), // 监听子组件 tapUp 手势
      child: Container(
        width: 50,
        height: 50,
        color: Colors.grey,
      ),
    ),
  ),
);
```

当我们点击子组件（灰色区域）时，控制台只会打印 “1”, 并不会打印 “2”，这是因为手指抬起后，GestureDetector1 和 GestureDetector 2 会发生竞争，判定获胜的规则是“子组件优先”，所以 GestureDetector1 获胜，因为只能有一个“竞争者”胜出，所以 GestureDetector 2 将被忽略。这个例子中想要解决冲突的方法很简单，将 GestureDetector 换为 Listener 即可，具体原因我们在后面解释。

我们再看一个例子，我们以拖动手势为例，同时识别水平和垂直方向的拖动手势，当用户按下手指时就会触发竞争（水平方向和垂直方向），一旦某个方向“获胜”，则直到当次拖动手势结束都会沿着该方向移动。代码如下：

```dart
class _BothDirectionTest extends StatefulWidget {
  @override
  _BothDirectionTestState createState() => _BothDirectionTestState();
}

class _BothDirectionTestState extends State<_BothDirectionTest> {
  double _top = 0.0;
  double _left = 0.0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Positioned(
          top: _top,
          left: _left,
          child: GestureDetector(
            child: CircleAvatar(child: Text("A")),
            //垂直方向拖动事件
            onVerticalDragUpdate: (DragUpdateDetails details) {
              setState(() {
                _top += details.delta.dy;
              });
            },
            onHorizontalDragUpdate: (DragUpdateDetails details) {
              setState(() {
                _left += details.delta.dx;
              });
            },
          ),
        )
      ],
    );
  }
}
```

此示例运行后，每次拖动只会沿一个方向移动（水平或垂直），而竞争发生在手指按下后首次移动（move）时，此例中具体的“获胜”条件是：首次移动时的位移在水平和垂直方向上的分量大的一个获胜。

## 8.4.3 多手势冲突

由于手势竞争最终只有一个胜出者，所以，当我们通过一个 GestureDetector 监听多种手势时，也可能会产生冲突。假设有一个widget，它可以左右拖动，现在我们也想检测在它上面手指按下和抬起的事件，代码如下：

```dart
class GestureConflictTestRouteState extends State<GestureConflictTestRoute> {
  double _left = 0.0;
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Positioned(
          left: _left,
          child: GestureDetector(
              child: CircleAvatar(child: Text("A")), //要拖动和点击的widget
              onHorizontalDragUpdate: (DragUpdateDetails details) {
                setState(() {
                  _left += details.delta.dx;
                });
              },
              onHorizontalDragEnd: (details){
                print("onHorizontalDragEnd");
              },
              onTapDown: (details){
                print("down");
              },
              onTapUp: (details){
                print("up");
              },
          ),
        )
      ],
    );
  }
}
```

现在我们按住圆形“A”拖动然后抬起手指，控制台日志如下:

```
I/flutter (17539): down
I/flutter (17539): onHorizontalDragEnd
```

我们发现没有打印"up"，这是因为在拖动时，刚开始按下手指且没有移动时，拖动手势还没有完整的语义，此时TapDown手势胜出(win)，此时打印"down"，而拖动时，拖动手势会胜出，当手指抬起时，`onHorizontalDragEnd` 和 `onTapUp`发生了冲突，但是因为是在拖动的语义中，所以`onHorizontalDragEnd`胜出，所以就会打印 “onHorizontalDragEnd”。

如果我们的代码逻辑中，对于手指按下和抬起是强依赖的，比如在一个轮播图组件中，我们希望手指按下时，暂停轮播，而抬起时恢复轮播，但是由于轮播图组件中本身可能已经处理了拖动手势（支持手动滑动切换），甚至可能也支持了缩放手势，这时我们如果在外部再用`onTapDown`、`onTapUp`来监听的话是不行的。这时我们应该怎么做？其实很简单，通过Listener监听原始指针事件就行：

```dart
Positioned(
  top:80.0,
  left: _leftB,
  child: Listener(
    onPointerDown: (details) {
      print("down");
    },
    onPointerUp: (details) {
      //会触发
      print("up");
    },
    child: GestureDetector(
      child: CircleAvatar(child: Text("B")),
      onHorizontalDragUpdate: (DragUpdateDetails details) {
        setState(() {
          _leftB += details.delta.dx;
        });
      },
      onHorizontalDragEnd: (details) {
        print("onHorizontalDragEnd");
      },
    ),
  ),
)
```



## 8.4.5 解决手势冲突

手势是对原始指针的语义化的识别，**手势冲突只是手势级别的，也就是说只会在组件树中的多个 GestureDetector 之间才有冲突的场景，如果压根就没有使用  GestureDetector  则不存在所谓的冲突，因为每一个节点都能收到事件**，只是在 GestureDetector 中为了识别语义，它会去决定哪些子节点应该忽略事件，哪些节点应该生效。

解决手势冲突的方法有两种：

1. 使用 Listener。这相当于跳出了手势识别那套规则。
2. 自定义手势手势识别器（ Recognizer）。

### 1. 通过 Listener 解决手势冲突

通过 Listener 解决手势冲突的原因是竞争只是针对手势的，而 Listener 是监听原始指针事件，原始指针事件并非语义话的手势，所以根本不会走手势竞争的逻辑，所以也就不会相互影响。拿上面两个 Container 嵌套的例子来说，通过Listener的解决方式为：

```dart
Listener(  // 将 GestureDetector 换位 Listener 即可
  onPointerUp: (x) => print("2"),
  child: Container(
    width: 200,
    height: 200,
    color: Colors.red,
    alignment: Alignment.center,
    child: GestureDetector(
      onTap: () => print("1"),
      child: Container(
        width: 50,
        height: 50,
        color: Colors.grey,
      ),
    ),
  ),
);
```

代码很简单，只需将 GestureDetector 换位 Listener 即可，可以两个都换，也可以只换一个。可以看见，通过`Listener`直接识别原始指针事件来解决冲突的方法很简单，因此，当遇到手势冲突时，我们应该优先考虑 Listener 。

### 2. 通过自定义 Recognizer 解决手势冲突

自定义手势识别器的方式比较麻烦，原理时当确定手势竞争胜出者时，会调用胜出者的`acceptGesture` 方法，表示“宣布成功”，然后会调用其他手势识别其的` rejectGesture` 方法，表示“宣布失败”。既然如此，我们可以自定义手势识别器（Recognizer），然后去重写它的` rejectGesture` 方法：在里面调用`acceptGesture`  方法，这就相当于它失败是强制将它也变成竞争的成功者了，这样它的回调也就会执行。

我们先自定义tap手势识别器（Recognizer）：

```dart
class CustomTapGestureRecognizer extends TapGestureRecognizer {
  @override
  void rejectGesture(int pointer) {
    //不，我不要失败，我要成功
    //super.rejectGesture(pointer);
    //宣布成功
    super.acceptGesture(pointer);
  }
}

//创建一个新的GestureDetector，用我们自定义的 CustomTapGestureRecognizer 替换默认的
RawGestureDetector customGestureDetector({
  GestureTapCallback? onTap,
  GestureTapDownCallback? onTapDown,
  Widget? child,
}) {
  return RawGestureDetector(
    child: child,
    gestures: {
      CustomTapGestureRecognizer:
          GestureRecognizerFactoryWithHandlers<CustomTapGestureRecognizer>(
        () => CustomTapGestureRecognizer(),
        (detector) {
          detector.onTap = onTap;
        },
      )
    },
  );
}
```

我们通过 RawGestureDetector 来自定义 customGestureDetector，GestureDetector 中也是通过 RawGestureDetector 来包装各种Recognizer 来实现的，我们需要自定义哪个 Recognizer，就添加哪个即可。

现在我们看看修改调用代码：

```dart
customGestureDetector( // 替换 GestureDetector
  onTap: () => print("2"),
  child: Container(
    width: 200,
    height: 200,
    color: Colors.red,
    alignment: Alignment.center,
    child: GestureDetector(
      onTap: () => print("1"),
      child: Container(
        width: 50,
        height: 50,
        color: Colors.grey,
      ),
    ),
  ),
);
```

这样就 OK 了，需要注意，这个例子同时说明了一次手势处理过程也是可以有多个胜出者的。





