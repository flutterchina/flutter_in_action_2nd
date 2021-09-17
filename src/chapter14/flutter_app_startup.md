# 14.3 Flutter启动流程和渲染管线

本节我们会先介绍一下Flutter的启动流程，然后再介绍一下 Flutter 的 rendering pipeline (渲染管线)。

## 14.3.1 启动

Flutter的入口在"lib/main.dart"的`main()`函数中，它是Dart应用程序的起点。在Flutter应用中，`main()`函数最简单的实现如下：

```dart
void main() => runApp(MyApp());
```

可以看`main()`函数只调用了一个`runApp()`方法，我们看看`runApp()`方法中都做了什么：

```dart
void runApp(Widget app) {
  WidgetsFlutterBinding.ensureInitialized()
    ..attachRootWidget(app)
    ..scheduleWarmUpFrame();
}
```

参数`app`是一个 widget，它是 Flutter 应用启动后要展示的第一个组件。而`WidgetsFlutterBinding`正是绑定widget 框架和Flutter 引擎的桥梁，定义如下：

```dart
class WidgetsFlutterBinding extends BindingBase with GestureBinding, ServicesBinding, SchedulerBinding, PaintingBinding, SemanticsBinding, RendererBinding, WidgetsBinding {
  static WidgetsBinding ensureInitialized() {
    if (WidgetsBinding.instance == null)
      WidgetsFlutterBinding();
    return WidgetsBinding.instance;
  }
}
```

可以看到`WidgetsFlutterBinding`继承自`BindingBase` 并混入了很多`Binding`，在介绍这些`Binding`之前我们先介绍一下`Window`，下面是`Window`的官方解释：

> The most basic interface to the host operating system's user interface.

很明显，`Window` 正是 Flutter Framework 连接宿主操作系统的接口。我们看一下 `Window  `类的部分定义：

```dart
class Window {
    
  // 当前设备的DPI，即一个逻辑像素显示多少物理像素，数字越大，显示效果就越精细保真。
  // DPI是设备屏幕的固件属性，如Nexus 6的屏幕DPI为3.5 
  double get devicePixelRatio => _devicePixelRatio;
  
  // Flutter UI绘制区域的大小
  Size get physicalSize => _physicalSize;

  // 当前系统默认的语言Locale
  Locale get locale;
    
  // 当前系统字体缩放比例。  
  double get textScaleFactor => _textScaleFactor;  
    
  // 当绘制区域大小改变回调
  VoidCallback get onMetricsChanged => _onMetricsChanged;  
  // Locale发生变化回调
  VoidCallback get onLocaleChanged => _onLocaleChanged;
  // 系统字体缩放变化回调
  VoidCallback get onTextScaleFactorChanged => _onTextScaleFactorChanged;
  // 绘制前回调，一般会受显示器的垂直同步信号VSync驱动，当屏幕刷新时就会被调用
  FrameCallback get onBeginFrame => _onBeginFrame;
  // 绘制回调  
  VoidCallback get onDrawFrame => _onDrawFrame;
  // 点击或指针事件回调
  PointerDataPacketCallback get onPointerDataPacket => _onPointerDataPacket;
  // 调度Frame，该方法执行后，onBeginFrame和onDrawFrame将紧接着会在合适时机被调用，
  // 此方法会直接调用Flutter engine的Window_scheduleFrame方法
  void scheduleFrame() native 'Window_scheduleFrame';
  // 更新应用在GPU上的渲染,此方法会直接调用Flutter engine的Window_render方法
  void render(Scene scene) native 'Window_render';

  // 发送平台消息
  void sendPlatformMessage(String name,
                           ByteData data,
                           PlatformMessageResponseCallback callback) ;
  // 平台通道消息处理回调  
  PlatformMessageCallback get onPlatformMessage => _onPlatformMessage;
  
  ... //其它属性及回调
   
}
```

可以看到`Window`类包含了当前设备和系统的一些信息以及Flutter Engine的一些回调。现在我们再回来看看`WidgetsFlutterBinding`混入的各种Binding。通过查看这些 Binding的源码，我们可以发现这些Binding中基本都是监听并处理`Window`对象的一些事件，然后将这些事件按照Framework的模型包装、抽象然后分发。可以看到`WidgetsFlutterBinding`正是粘连Flutter engine与上层Framework的“胶水”。

- `GestureBinding`：提供了`window.onPointerDataPacket` 回调，绑定Framework手势子系统，是Framework事件模型与底层事件的绑定入口。
- `ServicesBinding`：提供了`window.onPlatformMessage` 回调， 用于绑定平台消息通道（message channel），主要处理原生和Flutter通信。
- `SchedulerBinding`：提供了`window.onBeginFrame`和`window.onDrawFrame`回调，监听刷新事件，绑定Framework绘制调度子系统。
- `PaintingBinding`：绑定绘制库，主要用于处理图片缓存。
- `SemanticsBinding`：语义化层与Flutter engine的桥梁，主要是辅助功能的底层支持。
- `RendererBinding`: 提供了`window.onMetricsChanged` 、`window.onTextScaleFactorChanged` 等回调。它是渲染树与Flutter engine的桥梁。
- `WidgetsBinding`：提供了`window.onLocaleChanged`、`onBuildScheduled ` 等回调。它是Flutter widget层与engine的桥梁。

` WidgetsFlutterBinding.ensureInitialized()`负责初始化一个`WidgetsBinding`的全局单例，紧接着会调用`WidgetsBinding`的`attachRootWidget`方法，该方法负责将根Widget添加到`RenderView`上，代码如下：

```dart
void attachRootWidget(Widget rootWidget) {
  _renderViewElement = RenderObjectToWidgetAdapter<RenderBox>(
    container: renderView, 
    debugShortDescription: '[root]',
    child: rootWidget
  ).attachToRenderTree(buildOwner, renderViewElement);
}
```

注意，代码中的有`renderView`和`renderViewElement`两个变量，`renderView`是一个`RenderObject`，它是渲染树的根，而`renderViewElement`是`renderView`对应的`Element`对象，可见该方法主要完成了根widget到根 `RenderObject`再到根`Element`的整个关联过程。我们看看`attachToRenderTree`的源码实现：

```dart
RenderObjectToWidgetElement<T> attachToRenderTree(BuildOwner owner, [RenderObjectToWidgetElement<T> element]) {
  if (element == null) {
    owner.lockState(() {
      element = createElement();
      assert(element != null);
      element.assignOwner(owner);
    });
    owner.buildScope(element, () {
      element.mount(null, null);
    });
  } else {
    element._newWidget = this;
    element.markNeedsBuild();
  }
  return element;
}
```

该方法负责创建根element，即` RenderObjectToWidgetElement`，并且将element与widget 进行关联，即创建出 widget树对应的element树。如果element 已经创建过了，则将根element 中关联的widget 设为新的，由此可以看出element 只会创建一次，后面会进行复用。那么`BuildOwner`是什么呢？其实他就是widget framework的管理类，它跟踪哪些widget需要重新构建。

组件树在构建（build）完毕后，回到`runApp`的实现中，当调用完`attachRootWidget`后，最后一行会调用 `WidgetsFlutterBinding` 实例的 `scheduleWarmUpFrame()` 方法，该方法的实现在`SchedulerBinding` 中，它被调用后会立即进行一次绘制，在此次绘制结束前，该方法会锁定事件分发，也就是说在本次绘制结束完成之前 Flutter 将不会响应各种事件，这可以保证在绘制过程中不会再触发新的重绘。

## 14.3.2 渲染管线

### Frame

一次绘制过程，我们称其为一帧（frame）。我们之前说的Flutter可以实现60fps（Frame Per-Second），就是指一秒钟最多可以触发 60 次重绘，FPS 值越大，界面就越流畅。这里需要说明的是 Flutter中 的 frame 概念并不等同于屏幕刷新帧（frame），因为Flutter UI 框架的 frame 并不是每次屏幕刷新都会触发，这是因为，如果 UI 在一段时间不变，那么每次屏幕刷新都重新走一遍渲染流程是不必要的，因此，Flutter 在第一帧渲染结束后会采取一种主动请求 frame 的方式来实现只有当UI可能会改变时才会重新走渲染流程。

1. Flutter 在 `window` 上注册一个 `onBeginFrame `和一个 `onDrawFrame` 回调，在`onDrawFrame` 回调中最终会调用 `drawFrame`。
2. 当我们调用 `window.scheduleFrame()` 方法之后，Flutter引擎会在合适的时机（可以认为是在屏幕下一次刷新之前，具体取决于lutter引擎的实现）来调用`onBeginFrame `和` onDrawFrame `。

可以看见，只有主动调用`scheduleFrame() `，才会执行 `drawFrame`。所以，**我们在Flutter 中的提到 frame 时，如无特别说明，则是和 `drawFrame()` 的调用对应，而不是和屏幕的刷新频率对应**。

### 渲染管线：每一帧都做了什么？

`onDrawFrame`  最终会调用到 WidgetsBinding 的 `drawFrame()` 方法，我们来看看它的实现：

```dart
@override
void drawFrame() {
 ...//省略无关代码
  try {
    buildOwner.buildScope(renderViewElement); // 先执行构建
    super.drawFrame(); //然后调用父类的 drawFrame 方法
  } 
}
```

实际上关键的代码就两行：先 rebuild，然后再调用父类的 drawFrame 方法，我们将父类的 drawFrame方法展开后：

```dart
void drawFrame() {
  buildOwner!.buildScope(renderViewElement!); // 1.重新构建widget树
  //下面是 展开 super.drawFrame() 方法
  pipelineOwner.flushLayout(); // 2.更新布局
  pipelineOwner.flushCompositingBits(); //3.更新“层合成”信息
  pipelineOwner.flushPaint(); // 4.重绘
  if (sendFramesToEngine) {
    renderView.compositeFrame(); // 5. 上屏，会将绘制出的bit数据发送给GPU
    pipelineOwner.flushSemantics(); // this also sends the semantics to the OS.
    _firstFrameSent = true;
  }
}
```

可以看到主要做了5件事：

1. 重新构建widget树。

2. 更新布局。
3. 更新“层合成”信息。
4. 重绘。
5. 上屏：将绘制的产物显示在屏幕上

我们称上面的5步为  rendering pipline，中文翻译为“渲染流水线”或 “渲染管线”。而渲染管线的这 5 个步骤的具体过程便是本章重点要介绍的。下面我们以 setState 的执行更新的流程为例先对整个更新流程有一个大概的影响

### setState 执行流

setState 调用后：

1. 首先调用当前 element 的 markNeedsBuild 方法，将当前 element标记为 dirty 。
2. 接着调用 scheduleBuildFor，将当前 element 添加到piplineOwner的 dirtyElements 列表。
3. 最后请求一个新的 frame，随后会绘制新的 frame：onBuildScheduled->ensureVisualUpdate->scheduleFrame() 。当新的 frame 到来时执行渲染管线

```
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

1. 重新构建widget树：如果 dirtyElements 列表不为空，则遍历该列表，调用每一个element的rebuild方法重新构建新的widget（树），由于新的widget(树)使用新的状态构建，所以可能导致widget布局信息（占用的空间和位置）发生变化，如果发生变化，则会调用其renderObject的markNeedsLayout方法，该方法会从当前节点向父级查找，直到找到一个relayoutBoundary的节点，然后会将它添加到一个全局的nodesNeedingLayout列表中；如果直到根节点也没有找到relayoutBoundary，则将根节点添加到nodesNeedingLayout列表中。
2. 更新布局：遍历nodesNeedingLayout数组，对每一个renderObject重新布局（调用其layout方法），确定新的大小和偏移。layout方法中会调用markNeedsPaint()，该方法和 markNeedsLayout 方法功能类似，也会从当前节点向父级查找，直到找到一个isRepaintBoundary属性为true的父节点，然后将它添加到一个全局的nodesNeedingPaint列表中；由于根节点（RenderView）的 isRepaintBoundary 为 true，所以必会找到一个。查找过程结束后会调用buildOwner.requestVisualUpdate方法，该方法最终会调用scheduleFrame()，该方法中会先判断是否已经请求过新的frame，如果没有则请求一个新的frame。
3. 更新合成信息：先忽略，后面我们专门介绍。
4. 更新绘制：遍历nodesNeedingPaint列表，调用每一个节点的paint方法进行重绘，绘制过程会生成Layer。需要说明一下，flutter中绘制结果是是保存在Layer中的，也就是说只要Layer不释放，那么绘制的结果就会被缓存，因此，Layer可以跨frame来缓存绘制结果，避免不必要的重绘开销。Flutter框架绘制过程中，遇到isRepaintBoundary 为 true 的节点时，才会生成一个新的Layer。可见Layer和 renderObject 不是一一对应关系，父子节点可以共享，这个我们会在随后的一个试验中来验证。当然，如果是自定义组件，我们可以在renderObject中手动添加任意多个 Layer，这通常用于只需一次绘制而随后不会发生变化的绘制元素的缓存场景，这个随后我们也会通过一个例子来演示。
5. 上屏：绘制完成后，我们得到的是一棵Layer树，最后我们需要将Layer树中的绘制信息在屏幕上显示。我们知道Flutter是自实现的渲染引擎，因此，我们需要将绘制信息提交给Flutter engine，而`renderView.compositeFrame` 正是完成了这个使命。

以上，便是setState调用到UI更的大概更新过程，实际的流程会更复杂一些，比如在build过程中是不允许再调用setState的，框架需要做一些检查。又比如在frame中会涉及到动画的的调度、在上屏时会将所有的Layer添加到场景（Scene）对象后，再渲染Scene。上面的流程读者先有个映像即可，我们将在后面的小节中详细介绍。

### 总结

本节介绍了Flutter App 从启动到显示到屏幕上的主流程，重点是 Flutter 的渲染流程：![image-20210829204119900](/Users/duwen/Library/Application Support/typora-user-images/image-20210829204119900.png)

需要说明的是 build 过程和 layout 过程是可以交替执行的，这个我们在介绍 LayoutBuilder 一节时已经解释过了。读者需要对整个渲染流程有个大概映像，后面我们会详细介绍，不过在深入介绍渲染管线之前，我们得仔细的了解一下 Element 、BuildContext 和 RenderObject 三个类。

