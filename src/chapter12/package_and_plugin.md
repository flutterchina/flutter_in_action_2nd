# 12.1 包和插件

本节将会介绍 Flutter 中包和插件，然后介绍一些常用的包，但本节不会介绍具体的

## 12.1.1 包

第二章中已经讲过如何使用包（Package），我们知道通过包可以复用模块化代码，一个最小的Package包括：

- 一个`pubspec.yaml`文件：声明了Package的名称、版本、作者等的元数据文件。
- 一个 `lib` 文件夹：包括包中公开的(public)代码，最少应有一个`<package-name>.dart`文件

Flutter 包分为两类：

- Dart包：其中一些可能包含Flutter的特定功能，因此对Flutter框架具有依赖性，这种包仅用于Flutter，例如[`fluro`](https://pub.dartlang.org/packages/fluro)包。
- 插件包：一种专用的Dart包，其中包含用Dart代码编写的API，以及针对Android（使用Java或Kotlin）和针对iOS（使用OC或Swift）平台的特定实现，也就是说插件包括原生代码，一个具体的例子是[`battery`](https://pub.dartlang.org/packages/battery)插件包。

## 12.1.2 插件

Flutter 本质上只是一个 UI 框架，运行在宿主平台之上，Flutter 本身是无法提供一些系统能力，比如使用蓝牙、相机、GPS等，因此要在 Flutter 中调用这些能力就必须和原生平台进行通信。目前Flutter 已经支持 iOS、Android、Web、macOS、Windows、Linux等众多平台，要调用特定平台 API 就需要写插件。插件是一种特殊的包，和纯 dart 包主要区别是插件中除了dart代码，还包括特定平台的代码，比如 image_picker 插件可以在 iOS 和 Android 设备上访问相册和摄像头。

### 1. 插件实现原理

我们知道一个完整的Flutter应用程序实际上包括原生代码和Flutter代码两部分。Flutter 中提供了平台通道（platform channel）用于Flutter和原生平台的通信，平台通道正是Flutter和原生之间通信的桥梁，它也是Flutter插件的底层基础设施。

Flutter与原生之间的通信本质上是一个远程调用（RPC），通过消息传递实现：

- 应用的Flutter部分通过平台通道（platform channel）将调用消息发送到宿主应用。
- 宿主监听平台通道，并接收该消息。然后它会调用该平台的API，并将响应发送回Flutter。

由于插件编写涉及具体平台的开发知识，比如 image_picker 插件需要开发者在 iOS 和 Android 平台上分别实现图片选取和拍摄的功能，因此需要开发者熟悉原生开发，而本书主要聚焦 Flutter ，因此不做过多介绍，不过插件的开发也并不复杂，感兴趣的读者可以查看官方的[插件开发示例](https://flutter.cn/docs/development/packages-and-plugins/developing-packages)。

### 2. 如何获取平台信息

有时，在 Flutter 中我们想根据宿主平台添加一些差异化的功能，因此 Flutter 中提供了一个全局变量 `defaultTargetPlatform` 来获取当前应用的平台信息，`defaultTargetPlatform`定义在"platform.dart"中，它的类型是`TargetPlatform`，这是一个枚举类，定义如下：

```dart
enum TargetPlatform {
  android,
  fuchsia,
  iOS,
  ...
}
```

可以看到目前Flutter只支持这三个平台。我们可以通过如下代码判断平台：

```dart
if(defaultTargetPlatform == TargetPlatform.android){
  // 是安卓系统，do something
  ...
}
...
```

由于不同平台有它们各自的交互规范，Flutter Material库中的一些组件都针对相应的平台做了一些适配，比如路由组件`MaterialPageRoute`，它在android和ios中会应用各自平台规范的切换动画。那如果我们想让我们的APP在所有平台都表现一致，比如希望在所有平台路由切换动画都按照ios平台一致的左右滑动切换风格该怎么做？Flutter中提供了一种覆盖默认平台的机制，我们可以通过显式指定`debugDefaultTargetPlatformOverride`全局变量的值来指定应用平台。比如：

```dart
debugDefaultTargetPlatformOverride=TargetPlatform.iOS;
print(defaultTargetPlatform); // 会输出TargetPlatform.iOS
```

上面代码即使在Android中运行后，Flutter APP也会认为是当前系统是iOS，Material组件库中所有组件交互方式都会和iOS平台对齐，`defaultTargetPlatform`的值也会变为`TargetPlatform.iOS`。

### 3. 常用的插件

Flutter 官方提供了一系列常用的插件，如访问相机/相册、本地存储、播放视频等，完整列表见：https://github.com/flutter/plugins/tree/master/packages 读者可以自行查看。除了官方维护的插件，Flutter 社区也有不少现成插件，具体读者可以在 https://pub.dev/ 上查找。



