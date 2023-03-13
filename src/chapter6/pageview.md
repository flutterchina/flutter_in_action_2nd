# 6.7 PageView与页面缓存

## 6.7.1 PageView

如果要实现页面切换和 Tab 布局，我们可以使用 PageView 组件。需要注意，PageView 是一个非常重要的组件，因为在移动端开发中很常用，比如大多数 App 都包含 Tab 换页效果、图片轮动以及抖音上下滑页切换视频功能等等，这些都可以通过 PageView 轻松实现。

```dart
PageView({
  Key? key,
  this.scrollDirection = Axis.horizontal, // 滑动方向
  this.reverse = false,
  PageController? controller,
  this.physics,
  List<Widget> children = const <Widget>[],
  this.onPageChanged,
  
  //每次滑动是否强制切换整个页面，如果为false，则会根据实际的滑动距离显示页面
  this.pageSnapping = true,
  //主要是配合辅助功能用的，后面解释
  this.allowImplicitScrolling = false,
  //后面解释
  this.padEnds = true,
})
```

我们看一个 Tab 切换的实例，为了突出重点，我们让每个 Tab 页都只显示一个数字。

```dart
// Tab 页面 
class Page extends StatefulWidget {
  const Page({
    Key? key,
    required this.text
  }) : super(key: key);

  final String text;

  @override
  _PageState createState() => _PageState();
}

class _PageState extends State<Page> {
  @override
  Widget build(BuildContext context) {
    print("build ${widget.text}");
    return Center(child: Text("${widget.text}", textScaleFactor: 5));
  }
}
```

我们创建一个 PageView：

```dart
@override
Widget build(BuildContext context) {
  var children = <Widget>[];
  // 生成 6 个 Tab 页
  for (int i = 0; i < 6; ++i) {
    children.add( Page( text: '$i'));
  }

  return PageView(
    // scrollDirection: Axis.vertical, // 滑动方向为垂直方向
    children: children,
  );
}
```

运行后就可以左右滑动来切换页面了，效果如图6-16所示：

![图6-16](../imgs/6-16.gif)

如果将 PageView 的滑动方向指定为垂直方向（上面代码中注释部分），则会变为上下滑动切换页面。

## 6.7.2 页面缓存

我们在运行上面示例时，读者可能已经发现：每当页面切换时都会触发新 Page 页的 build，比如我们从第一页滑到第二页，然后再滑回第一页时，控制台打印如下：

```
flutter: build 0
flutter: build 1
flutter: build 0
```

可见 PageView 默认并没有缓存功能，一旦页面滑出屏幕它就会被销毁，这和我们前面讲过的 ListView/GridView 不一样，在创建 ListView/GridView 时我们可以手动指定 ViewPort 之外多大范围内的组件需要预渲染和缓存（通过 `cacheExtent` 指定），只有当组件滑出屏幕后又滑出预渲染区域，组件才会被销毁，但是不幸的是 PageView 并没有 `cacheExtent` 参数！但是在真实的业务场景中，对页面进行缓存是很常见的一个需求，比如一个新闻 App，下面有很多频道页，如果不支持页面缓存，则一旦滑到新的频道旧的频道页就会销毁，滑回去时又得重新请求数据和构建页面，这谁扛得住！

按道理  `cacheExtent`  是 Viewport 的一个配置属性，且 PageView 也是要构建 Viewport 的，那么为什么就不能透传一下这个参数呢？于是笔者带着这个疑问看了一下 PageView 的源码，发现在 PageView 创建Viewport 的代码中是这样的：

```dart
child: Scrollable(
  ...
  viewportBuilder: (BuildContext context, ViewportOffset position) {
    return Viewport(
      // TODO(dnfield): we should provide a way to set cacheExtent
      // independent of implicit scrolling:
      // https://github.com/flutter/flutter/issues/45632
      cacheExtent: widget.allowImplicitScrolling ? 1.0 : 0.0,
      cacheExtentStyle: CacheExtentStyle.viewport,
      ...
    );
  },
)
```

我们发现 虽然 PageView 没有透传 cacheExtent，但是却在`allowImplicitScrolling` 为 true 时设置了预渲染区域，注意，此时的缓存类型为 CacheExtentStyle.viewport，则 cacheExtent 则表示缓存的长度是几个 Viewport 的宽度，cacheExtent 为 1.0，则代表前后各缓存一个页面宽度，即前后各一页。既然如此，那我们将 PageView 的 `allowImplicitScrolling`  置为 true 则不就可以缓存前后两页了？我们修改代码，然后运行示例，发现在第一页时，控制台打印信息如下：

```
flutter: build 0
flutter: build 1 // 预渲染第二页
```

滑到第二页时：

```
flutter: build 0
flutter: build 1
flutter: build 2 // 预渲染第三页
```

当再滑回第一页时，控制台信息不变，这也就意味着第一页缓存成功，它没有被重新构建。但是如果我们从第二页滑到第三页，然后再滑回第一页时，控制台又会输出 ”build 0“，这也符合预期，因为我们之前分析的就是设置  `allowImplicitScrolling`  置为 true 时就只会缓存前后各一页，所以滑到第三页时，第一页就会销毁。

OK，能缓存前后各一页也貌似比不能缓存好一点，但还是不能彻底解决不了我们的问题。为什么明明就是顺手的事， flutter 就不让开发者指定缓存策略呢？然后我们翻译一下源码中的注释：

> Todo：我们应该提供一种独立于隐式滚动（implicit scrolling）的设置 cacheExtent 的机制。

放开 cacheExtent 透传是很简单的事情，为什么还要以后再做？是有什么难题么？要理解这个我们就需要看看 `allowImplicitScrolling`  到底是什么了，根据文档以及注释中 issue 的链接，发现PageView 中设置 cacheExtent 会和 iOS 中 辅助功能有冲突（读者可以先不用关注），所以暂时还没有什么好的办法。看到这可能国内的很多开发者要说我们的 App 不用考虑辅助功能，既然如此，那问题很好解决，将 PageView 的源码拷贝一份，然后透传 cacheExtent 即可。

拷源码的方式虽然很简单，但毕竟不是正统做法，那有没有更通用的方法吗？有！还记得我们在本章第一节中说过“可滚动组件提供了一种通用的缓存子项的解决方案” 吗，我们将在下一节重点介绍。

