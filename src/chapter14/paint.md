

# 14.5 绘制（一）绘制原理及Layer

## 14.5.1 Flutter 绘制原理

Flutter中和绘制相关的对象有三个，分别是Canvas、Layer 和 Scene：

- Canvas：封装了Flutter Skia各种绘制指令，比如画线、画圆、画矩形等指令。
- Layer：分为容器类和绘制类两种；暂时可以理解为是绘制产物的载体，比如调用 Canvas 的绘制 API 后，相应的绘制产物被保存在 PictureLayer.picture 对象中。
- Scene：屏幕上将要要显示的元素。在上屏前，我们需要将Layer中保存的绘制产物关联到 Scene 上。

Flutter 绘制流程：

1. 构建一个 Canvas，用于绘制；同时还需要创建一个绘制指令记录器，因为绘制指令最终是要传递给 Skia 的，而 Canvas 可能会连续发起多条绘制指令，指令记录器用于收集 Canvas 在一段时间内所有的绘制指令，因此Canvas 构造函数第一个参数必须传递一个 PictureRecorder 实例。
2. Canvas 绘制完成后，通过 PictureRecorder 获取绘制产物，然后将其保存在 Layer 中。
3. 构建 Scene 对象，将 layer 的绘制产物和 Scene 关联起来。
4. 上屏；调用window.render API 将Scene上的绘制产物发送给GPU。

下面我们通过一个实例来演示整个绘制流程：

还记得之前绘制棋盘的例子吗，之前无论是通过CustomPaint还是自定义RenderObject，都是在Flutter的Widget框架模型下进行的绘制，实际上，最终到底层Flutter都会按照上述的流程去完成绘制，既然如此，那么我们也可以直接在main函数中调用这些底层API来完成，下面我们演示一下直接在main函数中在屏幕中绘制棋盘。

```dart
void main() {
  //1.创建绘制记录器和Canvas
  PictureRecorder recorder = PictureRecorder();
  Canvas canvas = Canvas(recorder);
  //2.在指定位置区域绘制。
  var rect = Rect.fromLTWH(30, 200, 300,300 );
  drawChessboard(canvas,rect); //画棋盘
  drawPieces(canvas,rect);//画棋子
  //3.创建layer，将绘制的产物保存在layer中
  var pictureLayer = PictureLayer(rect);
  //recorder.endRecording()获取绘制产物。
  pictureLayer.picture = recorder.endRecording();
  var rootLayer = OffsetLayer();
  rootLayer.append(pictureLayer);
  //4.上屏，将绘制的内容显示在屏幕上。
  final SceneBuilder builder = SceneBuilder();
  final Scene scene = rootLayer.buildScene(builder);
  window.render(scene);
}
```

运行效果如图14-9：

![图14-9](../imgs/14-9.png)

## 14.5.2 Picture

上面我们说过 PictureLayer 的绘制产物是 Picture，关于 Picture 有两点需要阐明：

1. Picture 实际上是一系列的图形绘制操作指令，这一点可以参考 Picture 类源码的注释。
2. Picture 要显示在屏幕上，必然会经过光栅化，随后Flutter会将光栅化后的位图信息缓存起来，也就是说同一个 Picture 对象，其绘制指令只会执行一次，执行完成后绘制的位图就会被缓存起来。

综合以上两点，我们可以看到 PictureLayer 的“绘制产物”一开始是一些列“绘图指令”，当第一次绘制完成后，位图信息就会被缓存，绘制指令也就不会再被执行了，所以这时“绘制产物”就是位图了。为了便于理解，后续我们可以认为指的就是绘制好的位图。

### Canvas绘制的位图转图片

既然 Picture 中保存的是绘制产物，那么它也应该能提供一个方法能将绘制产物导出，实际上，Picture有一个toImage方法，可以根据指定的大小导出Image。

```dart
//将图片导出为Uint8List
final Image image = await pictureLayer.picture.toImage();
final ByteData? byteData = await image.toByteData(format: ImageByteFormat.png);
final Uint8List pngBytes = byteData!.buffer.asUint8List();
print(pngBytes);
```

## 14.5.3 Layer

现在我们思考一个问题：Layer作为绘制产物的持有者有什么作用？ 答案就是：

1. 可以在不同的frame之间复用绘制产物（如果没有发生变化）。
2. 划分绘制边界，缩小重绘范围。

下面我们来研究一下Flutter中Layer具体是怎么工作的，不过在此之前，我们先要补充一些前置知识。

### 1. Layer类型

本节开始的示例中，我们定义了两个Layer对象：

1. OffsetLayer：根 Layer，它继承自ContainerLayer，而ContainerLayer继承自 Layer 类，我们将直接继承自ContainerLayer 类的 Layer 称为**容器类Layer**，容器类 Layer 可以添加任意多个子Layer。
2. PictureLayer：保存绘制产物的 Layer，它直接继承自 Layer 类。我们将可以直接承载（或关联）绘制结果的 Layer 称为**绘制类 Layer**。

### 2. 容器类 Layer

上面介绍的容器类 Layer 的概念，那么它的作用和具体使用场景是什么呢？

1. 将组件树的绘制结构组成一棵树。

   因为 Flutter 中的 Widget 是树状结构，那么相应的 RenderObject 对应的**绘制结构**也应该是树状结构，Flutter 会根据一些“特定的规则”（后面解释）为组件树生成一棵 Layer 树，而容器类Layer就可以组成树状结构（父 Layer 可以包含任意多个子 Layer，子Layer又可以包含任意多个子Layer）。

2. 可以对多个 layer 整体应用一些变换效果。

   容器类 Layer 可以对其子 Layer 整体做一些变换效果，比如剪裁效果（ClipRectLayer、ClipRRectLayer、ClipPathLayer）、过滤效果（ColorFilterLayer、ImageFilterLayer）、矩阵变换（TransformLayer）、透明变换（OpacityLayer）等。

虽然 ContainerLayer 并非抽象类，开发者可以直接创建 ContainerLayer 类的示例，但实际上很少会这么做，相反，在需要使用使用 ContainerLayer 时直接使用其子类即可，比如在当前的 Flutter 源码中，笔者没有搜到有直接创建 ContainerLayer 类的地方。如果我们确实不需要任何变换效果，那么就使用 OffsetLayer，不用担心会有额外性能开销，它的底层（Skia 中）实现是非常高效的。

> 约定：后续我们提到 ContainerLayer 时，如无特别说明，它可以代指任意容器类组件。因为我们基本不会直接创建 ContainerLayer 实例，所以基本不会有歧义。

### 3. 绘制类 Layer

下面我们重点介绍一下 PictureLayer 类，它是 Flutter 中最常用的一种绘制类Layer。

我们知道最终显示在屏幕上的是位图信息，而位图信息正是由 Canvas API 绘制的。实际上，Canvas 的绘制产物是 Picture 对象表示，而当前版本的 Flutter 中只有 PictureLayer 才拥有 picture 对象，换句话说，Flutter 中通过Canvas 绘制自身及其子节点的组件的绘制结果最终会落在 PictureLayer 中。

> 探索题：Flutter中还有两个Layer类：TextureLayer 和 PlatformViewLayer，读者可以自己研究一下它们的功能及适用场景。

### 4. 变换效果实现方式的选择

上面说过 ContainerLayer 可以对其子 layer 整体进行一些变换，实际上，在大多数UI系统的 Canvas API 中也都有一些变换相关的 API ，那么也就意味着一些变换效果我们既可以通过 ContainerLayer 来实现，也可以通过 Canvas 来实现。比如，要实现平移变换，我们既可以使用 OffsetLayer ，也可以直接使用 Canva.translate API。既然如此，那我们选择实现方式的原则是什么呢？

现在，我们先了解一下容器类 Layer 实现变换效果的原理。容器类 Layer的变换在底层是通过 Skia 来实现的，不需要 Canvas 来处理。具体的原理是，有变换功能的容器类 Layer 会对应一个 Skia 引擎中的 Layer，为了和Flutter framework中 Layer 区分，flutter 中将 Skia 的Layer 称为 engine layer。而有变换功能的容器类 Layer 在添加到 Scene 之前就会构建一个 engine layer，我们以 OffsetLayer 为例，看看其相关实现：

```dart
@override
void addToScene(ui.SceneBuilder builder, [ Offset layerOffset = Offset.zero ]) {
  // 构建 engine layer
  engineLayer = builder.pushOffset(
    layerOffset.dx + offset.dx,
    layerOffset.dy + offset.dy,
    oldLayer: _engineLayer as ui.OffsetEngineLayer?,
  );
  addChildrenToScene(builder);
  builder.pop();
}

```

OffsetLayer 对其子节点整体做偏移变换的功能是 Skia 中实现支持的。Skia 可以支持多层渲染，但并不是层越多越好，engineLayer 是会占用一定的资源，Flutter 自带组件库中涉及到变换效果的都是优先使用 Canvas 来实现，如果 Canvas 实现起来非常困难或实现不了时才会用 ContainerLayer 来实现。

那么有什么场景下变换效果通过 Canvas 实现起来会非常困难，需要用 ContainerLayer 来实现 ？一个典型的场景是，我们需要对组件树中的某个子树整体做变换，且子树中有多个 PictureLayer 时。这是因为一个 Canvas 往往对应一个 PictureLayer，不同 Canvas 之间相互隔离的，只有子树中所有组件都通过同一个 Canvas 绘制时才能通过该 Canvas 对所有子节点进行整体变换，否则就只能通过 ContainerLayer 。那什么时候子节点会复用同一个 PictureLayer，什么时候又会创建新的 PictureLayer，这个我们在下一节介绍。

> 注意：Canvas对象中也有名为 ...layer 相关的 API，如 Canvas.saveLayer，它和本节介绍的Layer 含义不同。Canvas对象中的 layer 主要是提供一种在绘制过程中**缓存中间绘制结果**的手段，为了在绘制复杂对象时方便多个绘制元素之间分离绘制而设计的，更多关于Canvas layer相关API读者可以查阅相关文档，我们可以简单认为不管 Canvas 对创建多少个 layer，这些 layer 都是在同一个 PictureLayer 上（当然具体Canvas API底层实现方式还是 Flutter团队说了算，但作为应用开发者，理解到这里就够了）。

好了，有了这些前置知识，下一节我们就可以研究Flutter框架中组件树的绘制流程了。
