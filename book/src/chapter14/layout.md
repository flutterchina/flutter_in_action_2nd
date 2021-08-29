# 布局（Layout）过程

Layout（布局）过程主要是确定每一个组件的布局信息（大小和位置），Flutter 的布局过程如下：

1. 父节点向子节点传递约束（constraints）信息，限制子节点的最大和最小宽高。
2. 子节点根据约束信息确定自己的大小（size）。
3. 父节点根据特定布局规则（不同布局组件会有不同的布局算法）确定每一个子节点在父节点布局空间中的位置，用偏移 offset 表示。
4. 递归整个过程，确定出每一个节点的位置的大小和位置。

可以看到，组件的大小是由自身决定的，而组件的位置是由父组件决定的。

Flutter 中的布局类组件很多，根据孩子数量可以分为单子组件和多子组件，下面我们先通过分别自定义一个单子组件和多子组件来深入理解一下Flutter的布局过程，之后会讲一下布局更新过程和 Flutter 中的 Constraints（约束）。

## 实例一：单子组件-CustomCenter 

我们实现一个CustomCenter组件，功能基本和Center组件对齐。

1. 定义组件；为了展示原理，我们不采用组合的方式来实现组件，而是直接通过定制RenderObject的方式来实现。因为居中组件需要包含一个子节点，所以我们直接继承SingleChildRenderObjectWidget。

```dart
class CustomCenter extends SingleChildRenderObjectWidget {
  const CustomCenter2({Key? key, required Widget child})
      : super(key: key, child: child);

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderCustomCenter();
  }
}
```

2. 实现RenderCustomCenter；这里直接继承RenderBox会更接近底层一点，但这需要我们自己手动实现一些和布局无关的东西，比如事件分发等逻辑。为了更聚焦布局本身，我们选择继承自RenderShiftedBox，它会帮我们实现布局之外的一些功能，这样我们只需要重写`performLayout`，在该函数中实现子节点居中算法即可。

```dart
class RenderCustomCenter extends RenderShiftedBox {
  RenderCustomCenter({RenderBox? child}) : super(child);

  @override
  void performLayout() {
    //1. 先对子组件进行layout，随后获取它的size
    child!.layout(
      constraints.loosen(), //将约束传递给子节点
      parentUsesSize: true, // 因为我们接下来要使用child的size,所以不能为false
    );
    //2.根据子组件的大小确定自身的大小
    size = constraints.constrain(Size(
      constraints.maxWidth == double.infinity
          ? child!.size.width
          : double.infinity,
      constraints.maxHeight == double.infinity
          ? child!.size.height
          : double.infinity,
    ));

    // 3. 根据父节点子节点的大小，算出子节点在父节点中居中之后的偏移，然后将这个偏移保存在
    // 子节点的parentData中，在后续的绘制阶段，会用到。
    BoxParentData parentData = child!.parentData as BoxParentData;
    parentData.offset = ((size - child!.size) as Offset) / 2;
  }
}
```

布局过程请参考注释，在此需要额外说明有x点。

1. 在对子节点进行布局时， `constraints ` 是 CustomCenter 的父组件传递给自己的约束信息，我们传递给子节点的约束信息是`constraints.loosen()`，下面看一下loosen的实现源码：

   ```dart
   BoxConstraints loosen() {
     return BoxConstraints(
       minWidth: 0.0,
       maxWidth: maxWidth,
       minHeight: 0.0,
       maxHeight: maxHeight,
     );
   }
   ```

   很明显，CustomCenter 约束子节点最大宽高不超过自身的最大宽高。

2. 子节点在父节点（CustomCenter）的约束下，确定自己的宽高；此时CustomCenter会根据子节点的宽高确定自己的宽高，上面代码的逻辑是，如果CustomCenter父节点传递给它最大宽高约束是无限大时，它的宽高会设置为它子节点的宽高。注意，如果这时将CustomCenter的宽高也设置为无限大就会有问题，因为在一个无限大的范围内自己的宽高也是无限大的话，那么实际上的宽高到底是多大，它的父节点会懵逼的！屏幕的大小是固定的，这显然不合理。如果CustomCenter父节点传递给它的最大宽高约束不是无限大，那么是可以指定自己的宽高为无限大的，因为在一个有限的空间内，子节点如果说自己无限大，那么最大也就是父节点的大小。所以，简而言之，CustomCenter 会尽可能让自己填满父元素的空间。

3. CustomCenter 确定了自己的大小和子节点大小之后就可以确定子节点的位置了，根据居中算法，将子节点的原点坐标算出后保存在子节点的 parentData 中，在后续的绘制阶段会用到，具体怎么用，我们看一下RenderShiftedBox中默认的 paint 实现：

   ```dart
   @override
   void paint(PaintingContext context, Offset offset) {
     if (child != null) {
       final BoxParentData childParentData = child!.parentData! as BoxParentData;
       //从child.parentData中取出子节点相对当前节点的偏移，加上当前节点在屏幕中的偏移，
       //便是子节点在屏幕中的偏移。
       context.paintChild(child!, childParentData.offset + offset);
     }
   }
   ```



在Flutter组件库中，有一些常用的单子组件比如Align、SizedBox、DecoratedBox等，都可以打开源码去看看其实现。下面我们看一个多子组件的例子。

## 实例二：多子组件 - LeftRightBox

实际开发中我们会经常用到贴边左-右布局，现在我们就来实现它。

1. 定义组件。

   ```dart
   class LeftRightBox extends MultiChildRenderObjectWidget {
     LeftRightBox({
       Key? key,
       required List<Widget> children,
     })  : assert(children.length == 2, "只能传两个children"),
           super(key: key, children: children);
   
     @override
     RenderObject createRenderObject(BuildContext context) {
       return RenderLeftRight();
     }
   }
   ```

   由于我们需要两个子节点，用一个Widget数组来保存子节点。然后我们在`RenderLeftRight`中实现左右布局算法。

2. 实现RenderLeftRight。

   ```dart
   class LeftRightParentData extends ContainerBoxParentData<RenderBox> {}
   
   class RenderLeftRight extends RenderBox
       with
           ContainerRenderObjectMixin<RenderBox, LeftRightParentData>,
           RenderBoxContainerDefaultsMixin<RenderBox, LeftRightParentData> {
    
     // 初始化每一个child的parentData        
     @override
     void setupParentData(RenderBox child) {
       if (child.parentData is! LeftRightParentData)
         child.parentData = LeftRightParentData();
     }
   
     @override
     void performLayout() {
       final BoxConstraints constraints = this.constraints;
       RenderBox leftChild = firstChild!;
       
       LeftRightParentData childParentData =
           leftChild.parentData! as LeftRightParentData;
       
       RenderBox rightChild = childParentData.nextSibling!;
   
       //我们限制右孩子宽度不超过总宽度一半
       rightChild.layout(
         constraints.copyWith(maxWidth: constraints.maxWidth / 2),
         parentUsesSize: true,
       );
   
       //调整右子节点的offset
       childParentData = rightChild.parentData! as LeftRightParentData;
       childParentData.offset = Offset(
         constraints.maxWidth - rightChild.size.width,
         0,
       );
   
       // layout left child
       // 左子节点的offset默认为（0，0），为了确保左子节点始终能显示，我们不修改它的offset
       leftChild.layout(
         //左侧剩余的最大宽度
         constraints.copyWith(
           maxWidth: constraints.maxWidth - rightChild.size.width,
         ),
         parentUsesSize: true,
       );
   
       //设置LeftRight自身的size
       size = Size(
         constraints.maxWidth,
         max(leftChild.size.height, rightChild.size.height),
       );
     }
   
     @override
     void paint(PaintingContext context, Offset offset) {
       defaultPaint(context, offset);
     }
   
     @override
     bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
       return defaultHitTestChildren(result, position: position);
     }
   }
   ```

   可以看到，实际布局流程和单子节点没有什么区别，只不过多子组件需要同时对多个子节点进行布局。另外和RenderCustomCenter不同的是，RenderLeftRight是直接继承自RenderBox，同时混入了ContainerRenderObjectMixin和RenderBoxContainerDefaultsMixin两个mixin，这两个mixin中帮我们实现了默认的绘制和事件点击测试函数。

## 关于ParentData

上面两个例子中我们在实现相应的RenderObject时都用到了子节点的parentData对象(将子节点的offset信息保存其中)，可以看到 parentData 虽然属于child的属性，但它从设置（包括初始化）到使用都在父节点中，这也是为什么起名叫“parentData”，实际上Flutter框架中这个属性主要就是为了在layout阶段保存自身布局信息而设计的。

另外，“ParentData 保存节点的布局信息” 只是一个约定，我们定义组件时完全可以将子节点的布局信息保存在任意地方，也可以保存非布局信息。但是，还是强烈建议大家遵循Flutter的规范，这样我们的代码会更容易被他人看懂，也会更容易维护。

## 布局更新

理论上，某个组件的布局变化后，会影响其它组件的布局，所以当有组件布局发生变化后，最笨的办法是对整棵组件树 relayout（重新布局）！但是对所有组件进行 relayout 的成本还是太大，所以我们需要探索一下降低 relayout 成本的方案。实际上，在一些特定场景下，组件发生变化后我们只需要对部分组件进行重新布局即可（而无需对整棵树 relayout ）。

### relayoutBoundary

假如有一个页面的组件树结构如下：

![image-20210816134038482](../imgs/image-20210816134038482.png)

假如 Text3 的文本长度发生变化，则会导致 Text4 的位置和 Column2 的大小也会变化；又因为 Column2 的父组件 SizedBox 已经限定了大小，所以 SizedBox 的大小和位置都不会变化。所以最终我们需要进行 relayout 的组件是：Text3、Column2，这里需要注意：

1. Text4 是不需要重新布局的，因为 Text4 的大小没有发生变化，只是位置发生变化，而它的位置是在父组件 Column2 布局时确定的。
2. 很容易发现：假如 Text3 和 Column2 之间还有其它组件，则这些组件也都是需要 relayout 的。

在本例中，Column2 就是 Text3 的 relayoutBoundary （重新布局的边界节点）。每个组件的 renderObject 中都有一个 `_relayoutBoundary` 属性指向自身的布局，如果当前节点布局发生变化后，自身到  `_relayoutBoundary` 路径上的所有的节点都需要 relayout。

那么，一个组件是否是 relayoutBoundary 的条件是什么呢？这里有一个原则和四个场景，原则是“组件自身的大小变化不会影响父组件”，如果一个组件满足以下四种情况之一，则它便是 relayoutBoundary ：

2. 组件父组件的大小不依赖组件本身；这种情况下自身的布局变化不会影响父组件。
2. 组件的大小只取决于父组件传递的约束，而不会依赖后代组件的大小；这样的话后代组件的大小变化就不会影响自身的大小了。
3. 父组件传递给自身的约束是一个严格约束；这种情况下即使自身的大小依赖后代元素，但也不会影响父组件。
4. 组件为根组件；Flutter 应用的根组件是 RenderView，它的默认大小是当前设备屏幕大小。

对应的代码实现是：

```dart
if (!parentUsesSize || sizedByParent || constraints.isTight || parent is! RenderObject) {
  _relayoutBoundary = this;
} else {
  _relayoutBoundary = (parent! as RenderObject)._relayoutBoundary;
}
```

代码中 if 里的判断条件和上面的 4 条 一一对应。

### markNeedsLayout

当组件布局发生变化时，它需要调用 `markNeedsLayout` 方法来更新布局，它的功能主要有两个：

1. 将自身到其 relayoutBoundary 路径上的所有节点标记为 “需要布局” 。
2. 请求新的 frame；在新的 frame 中会对标记为“需要布局”的节点重新布局。

我们看看其核心源码：

```dart
void markNeedsLayout() {
   _needsLayout = true;
  if (_relayoutBoundary != this) { // 如果是布局边界节点
    markParentNeedsLayout(); // 递归将当前节点到其布局边界节点的所有节点标记为
  } else {// 如果是布局边界节点 
    if (owner != null) {
      // 将布局边界节点加入到 piplineOwner._nodesNeedingLayout 列表中
      owner!._nodesNeedingLayout.add(this); 
      owner!.requestVisualUpdate();//该函数最终会请求新的 frame
    }
  }
}
```

### flushLayout()

markNeedsLayout 执行完毕后，就会将其 relayoutBoundary  节点添加到 `piplineOwner._nodesNeedingLayout` 列表中，然后请求新的 frame，新的 frame 到来时就会执行 `piplineOwner.drawFrame` 方法：

```dart
void drawFrame() {
  pipelineOwner.flushLayout(); //重新布局
  pipelineOwner.flushCompositingBits();
  pipelineOwner.flushPaint();
  ...
}
```

flushLayout() 中会对之前添加到 `_nodesNeedingLayout` 中的节点重新布局，我们看一下其核心源码：

```dart
void flushLayout() {
  while (_nodesNeedingLayout.isNotEmpty) {
    final List<RenderObject> dirtyNodes = _nodesNeedingLayout;
    _nodesNeedingLayout = <RenderObject>[]; 
    //按照节点在树中的深度从小到大排序后再重新layout
    for (final RenderObject node in dirtyNodes..sort((a,b) => a.depth - b.depth)) {
      if (node._needsLayout && node.owner == this)
        node._layoutWithoutResize(); //重新布局
    }
  }
}
```

看一下 `_layoutWithoutResize` 实现

```dart
void _layoutWithoutResize() {
  performLayout(); // 重新布局；会递归布局后代节点
  _needsLayout = false;
  markNeedsPaint(); //布局更新后，UI也是需要更新的
}
```

代码很简单，不再赘述。

> 思考题：为什么 flushLayout() 中刷新布局时要先对dirtyNodes 根据在树中的深度按照从小到大排序？从大到小不行吗？

## 再论 Constraints

Constraints（约束）主要描述了最小和最大宽高的限制，理解组件在布局过程中如何根据约束确定自身或子节点的大小对我们理解组件的布局行为有很大帮助，现在我们就通过一个实现 200*200 的红色 Container 的例子来说明。为了排除干扰，我们让根节点（RenderView）作为 Container 的父组件，我们的代码是：

```dart
Container(width: 200, height: 200, color: Colors.red)
```

但实际运行之后，你会发现整个屏幕都变成了红色！为什么呢？我们看看 RenderView 的布局实现：

```dart
@override
void performLayout() {
  //configuration.size 为当前设备屏幕
  _size = configuration.size; 
  if (child != null)
    child!.layout(BoxConstraints.tight(_size)); //强制子组件和屏幕一样大
}
```

这里需要介绍一下两种常用的约束：

1. 宽松约束：不限制最小宽高（为0），只限制最大宽高，可以通过 `BoxConstraints.loose(Size size)` 来快速创建。
2. 严格约束：限制为固定大小；即最小宽度等于最大宽度，最小高度等于最大高度，可以通过 `BoxConstraints.tight(Size size)` 来快速创建。

可以发现，RenderView  中给子组件传递的是一个严格约束，即强制子组件大小等于屏幕大小，所以 Container 便撑满了屏幕。那我们怎么才能让指定的大小生效呢？标准答案就是**引入一个中间组件，让这个中间组件遵守父组件的约束，然后对子组件传递新的约束**。对于这个例子来讲，最简单的方式是用一个 Align 组件来包裹 Container：

```dart
@override
Widget build(BuildContext context) {
  var container = Container(width: 200, height: 200, color: Colors.red);
  return Align(
    child: container,
    alignment: Alignment.topLeft,
  );
}
```

Align 会遵守 RenderView 的约束，让自身撑满屏幕，然后会给子组件传递一个宽松约束（最小宽高为0，最大宽高为200），这样 Container 就可以变成 200 * 200 了。

当然我们还可以使用其它组件来代替 Align，比如 UnconstrainedBox，但原理是相同的，读者可以查看源码验证。

### CustomSizedBox

Flutter 中的 SizedBox 组件会将其父组件的约束传递给其子组件，这也就意味着，如果父组件限制了 SizedBox 最小宽度为100，即使我们通过 SizedBox 指定宽度为50，那也是没用的，因为 SizedBox 的子组件必须先满足SizedBox 父组件的约束。还记得之前我们想在 AppBar 中限制 loading 组件大小的例子吗：

```dart
AppBar(
   title: Text(title),
   actions: <Widget>[
     SizedBox( // 尝试使用SizedBox定制loading 宽高
       width: 20, 
       height: 20,
       child: CircularProgressIndicator(
         strokeWidth: 3,
         valueColor: AlwaysStoppedAnimation(Colors.white70),
       ),
     )
   ],
)
```

实际结果是：

![图5-8](../imgs/5-7.png)



之所以不生效，是因为父组件限制了最小高度，当然我们也可以使用 Align 或 UnconstrainedBox 来实现我们想要的效果，但是这里我们希望通过一个组件就能搞定，为此我们自定义一个 CustomSizedBox 组件，它和 SizedBox 的主要区别是 CustomSizedBox 自身会遵守其父组件传递的约束**而不是让其子组件去满足父组件的约束**。

```dart
class CustomSizedBox extends SingleChildRenderObjectWidget {
  const CustomSizedBox({
    Key? key,
    this.width = 0,
    this.height = 0,
    required Widget child,
  }) : super(key: key, child: child);

  final double width;
  final double height;

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderCustomSizedBox(width, height);
  }

  @override
  void updateRenderObject(context, RenderCustomSizedBox renderObject) {
    renderObject
      ..width = width
      ..height = height;
  }
}

class RenderCustomSizedBox extends RenderProxyBoxWithHitTestBehavior {
  RenderCustomSizedBox(this.width, this.height);

  double width;
  double height;
  
  @override
  void performLayout() {
    //设置当前元素宽高，遵守父组件的约束
    size = constraints.constrain(Size(width, height));
    child!.layout(
      BoxConstraints.tight(Size(min(size.width,width), min(size.height,height))),
      // 父容器是固定大小，子元素大小改变时不影响父元素
      // parentUseSize为false时，会生成LayoutBoundary
      parentUsesSize: false,
    );
  }
}
```

实现很简单，有两点需要注意：

1. 我们的 RenderCustomSizedBox 不再直接继承自 RenderBox，而是继承自 RenderProxyBoxWithHitTestBehavior，RenderProxyBoxWithHitTestBehavior 是间接继承自 RenderBox，它里面包含了默认的点击测试和绘制相关逻辑，继承自它后就不用我们再手动实现了。
2. RenderCustomSizedBox 在调用子组件 layout 时，将 `parentUsesSize` 置为 `false`，这样的话子组件就会变成一个布局边界。

测试一下：

```dart
class CustomSizedBoxTestRoute extends StatelessWidget {
  const CustomSizedBoxTestRoute({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final child = GestureDetector(
      onTap: () => print("tap"),
      child: Container(width: 300, height: 300, color: Colors.red),
    );
    return Row(
      children: [
        ConstrainedBox(
          constraints: BoxConstraints.tight(Size(100, 100)),
          child: SizedBox(
            width: 50,
            height: 50,
            child: child,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 8),
          child: ConstrainedBox(
            constraints: BoxConstraints.tight(Size(100, 100)),
            child: CustomSizedBox(
              width: 50,
              height: 50,
              child: child,
            ),
          ),
        ),
      ],
    );
  }
}
```

运行结果如下：

![image-20210816211022442](../imgs/image-20210816211022442.png)

可以发现，当父组件约束子组件大小宽高是100时，我们通过 SizedBox 指定 Container 大小是 50*50 时不能成功， 而通过 CustomSizedBox 时成功了。

## 总结

通过本节，相信你已经对 flutter 的布局流程熟悉了，现在我们看一张 flutter 官网的图：



现在我们再来看一下官网关于Flutter布局的解释：

> “ 在进行布局的时候，Flutter 会以 DFS（深度优先遍历）方式遍历渲染树，并 **将限制以自上而下的方式** 从父节点传递给子节点。子节点若要确定自己的大小，则 **必须** 遵循父节点传递的限制。子节点的响应方式是在父节点建立的约束内 **将大小以自下而上的方式** 传递给父节点。” 

是不是理解的更透彻了一些！
