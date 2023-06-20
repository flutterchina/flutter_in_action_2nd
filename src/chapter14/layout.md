# 14.4 布局（Layout）过程

Layout（布局）过程主要是确定每一个组件的布局信息（大小和位置），Flutter 的布局过程如下：

1. 父节点向子节点传递约束（constraints）信息，限制子节点的最大和最小宽高。
2. 子节点根据约束信息确定自己的大小（size）。
3. 父节点根据特定布局规则（不同布局组件会有不同的布局算法）确定每一个子节点在父节点布局空间中的位置，用偏移 offset 表示。
4. 递归整个过程，确定出每一个节点的大小和位置。

可以看到，组件的大小是由自身决定的，而组件的位置是由父组件决定的。

Flutter 中的布局类组件很多，根据孩子数量可以分为单子组件和多子组件，下面我们先通过分别自定义一个单子组件和多子组件来直观理解一下Flutter的布局过程，之后会介绍一下布局更新过程和 Flutter 中的 Constraints（约束）。

## 14.4.1 单子组件布局示例（CustomCenter）

我们实现一个单子组件 CustomCenter，功能基本和 Center 组件对齐，通过这个实例我们演示一下布局的主要流程。

首先，我们定义组件，为了介绍布局原理，我们不采用组合的方式来实现组件，而是直接通过定制 RenderObject 的方式来实现。因为居中组件需要包含一个子节点，所以我们直接继承 SingleChildRenderObjectWidget。

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

接着实现 RenderCustomCenter。这里直接继承 RenderObject 会更接近底层一点，但这需要我们自己手动实现一些和布局无关的东西，比如事件分发等逻辑。为了更聚焦布局本身，我们选择继承自RenderShiftedBox，它会帮我们实现布局之外的一些功能，这样我们只需要重写`performLayout`，在该函数中实现子节点居中算法即可。

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

布局过程请参考注释，在此需要额外说明有3点：

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



### performLayout 流程

可以看到，布局的逻辑是在 performLayout 方法中实现的。我们梳理一下  performLayout 中具体做的事：

1. 如果有子组件，则对子组件进行递归布局。
2. 确定当前组件的大小（size），通常会依赖子组件的大小。
3. 确定子组件在当前组件中的起始偏移。

在Flutter组件库中，有一些常用的单子组件比如Align、SizedBox、DecoratedBox等，都可以打开源码去看看其实现。

下面我们看一个多子组件的例子。

## 14.4.2 多子组件布局示例（LeftRightBox）

实际开发中我们会经常用到贴边左-右布局，现在我们就来实现一个 LeftRightBox 组件来实现左-右布局，因为LeftRightBox 有两个孩子，用一个 Widget 数组来保存子组件。

首先我们定义组件，与单子组件不同的是多子组件需要继承自 MultiChildRenderObjectWidget：

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

接下来需要实现 RenderLeftRight，在其 performLayout 中我们实现实现左-右布局算法：

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

可以看到，实际布局流程和单子节点并没有太大区别，只不过多子组件需要同时对多个子节点进行布局。另外和RenderCustomCenter 不同的是，RenderLeftRight是直接继承自 RenderBox，同时混入了ContainerRenderObjectMixin 和 RenderBoxContainerDefaultsMixin 两个 mixin，这两个 mixin 实现了通用的绘制和事件处理相关逻辑（现在先不用关注，后面章节会讲）。

## 14.4.3 关于ParentData

上面两个例子中我们在实现相应的 RenderObject 时都用到了子节点的 parentData 对象(将子节点的offset信息保存其中)，可以看到 parentData 虽然属于child的属性，但它从设置（包括初始化）到使用都在父节点中，这也是为什么起名叫“parentData”。实际上Flutter框架中，parentData 这个属性主要就是为了在 layout 阶段保存组件布局信息而设计的。

需要注意：“parentData 用于保存节点的布局信息” 只是一个约定，我们定义组件时完全可以将子节点的布局信息保存在任意地方，也可以保存非布局信息。但是，还是强烈建议大家遵循Flutter的规范，这样我们的代码会更容易被他人看懂，也会更容易维护。

## 14.4.4 布局更新

理论上，某个组件的布局变化后，就可能会影响其他组件的布局，所以当有组件布局发生变化后，最笨的办法是对整棵组件树 relayout（重新布局）！但是对所有组件进行 relayout 的成本还是太大，所以我们需要探索一下降低 relayout 成本的方案。实际上，在一些特定场景下，组件发生变化后我们只需要对部分组件进行重新布局即可（而无需对整棵树 relayout ）。

### 1. 布局边界（relayoutBoundary）

假如有一个页面的组件树结构如图14-5所示：

![图14-5](../imgs/14-5.png)

假如 Text3 的文本长度发生变化，则会导致 Text4 的位置和 Column2 的大小也会变化；又因为 Column2 的父组件 SizedBox 已经限定了大小，所以 SizedBox 的大小和位置都不会变化。所以最终我们需要进行 relayout 的组件是：Text3、Column2，这里需要注意：

1. Text4 是不需要重新布局的，因为 Text4 的大小没有发生变化，只是位置发生变化，而它的位置是在父组件 Column2 布局时确定的。
2. 很容易发现：假如 Text3 和 Column2 之间还有其他组件，则这些组件也都是需要 relayout 的。

在本例中，Column2 就是 Text3 的 relayoutBoundary （重新布局的边界节点）。每个组件的 renderObject 中都有一个 `_relayoutBoundary` 属性指向自身的布局边界节点，如果当前节点布局发生变化后，自身到其布局边界节点路径上的所有的节点都需要 relayout。

那么，一个组件是否是 relayoutBoundary 的条件是什么呢？这里有一个原则和四个场景，原则是“组件自身的大小变化不会影响父组件”，如果一个组件满足以下四种情况之一，则它便是 relayoutBoundary ：

1. 当前组件父组件的大小不依赖当前组件大小时；这种情况下父组件在布局时会调用子组件布局函数时并会给子组件传递一个 parentUsesSize 参数，该参数为 false 时表示父组件的布局算法不会依赖子组件的大小。

2. 组件的大小只取决于父组件传递的约束，而不会依赖后代组件的大小。这样的话后代组件的大小变化就不会影响自身的大小了，这种情况组件的 sizedByParent 属性必须为 true（具体我们后面会讲）。

3. 父组件传递给自身的约束是一个严格约束（固定宽高，下面会讲）；这种情况下即使自身的大小依赖后代元素，但也不会影响父组件。

4. 组件为根组件；Flutter 应用的根组件是 RenderView，它的默认大小是当前设备屏幕大小。

对应的代码实现是：

```dart
// parent is! RenderObject 为 true 时则表示当前组件是根组件，因为只有根组件没有父组件。
if (!parentUsesSize || sizedByParent || constraints.isTight || parent is! RenderObject) {
  _relayoutBoundary = this;
} else {
  _relayoutBoundary = (parent! as RenderObject)._relayoutBoundary;
}
```

代码中 if 里的判断条件和上面的 4 条 一一对应，其中除了第二个条件之外（ sizedByParent 为 true ），其他的都很直观，我们会在后面专门介绍一下第二个条件。

### 2. markNeedsLayout

当组件布局发生变化时，它需要调用 `markNeedsLayout` 方法来更新布局，它的功能主要有两个：

1. 将自身到其 relayoutBoundary 路径上的所有节点标记为 “需要布局” 。
2. 请求新的 frame；在新的 frame 中会对标记为“需要布局”的节点重新布局。

我们看看其核心源码：

```dart
void markNeedsLayout() {
   _needsLayout = true;
  if (_relayoutBoundary != this) { // 如果不是布局边界节点
    markParentNeedsLayout(); // 递归调用前节点到其布局边界节点路径上所有节点的方法 markNeedsLayout
  } else {// 如果是布局边界节点 
    if (owner != null) {
      // 将布局边界节点加入到 pipelineOwner._nodesNeedingLayout 列表中
      owner!._nodesNeedingLayout.add(this); 
      owner!.requestVisualUpdate();//该函数最终会请求新的 frame
    }
  }
}
```

### 3. flushLayout()

markNeedsLayout 执行完毕后，就会将其 relayoutBoundary  节点添加到 `pipelineOwner._nodesNeedingLayout` 列表中，然后请求新的 frame，新的 frame 到来时就会执行 `drawFrame` 方法（可以参考上一节）：

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

### 4. Layout流程

如果组件有子组件，则在 performLayout 中需要调用子组件的 layout 方法先对子组件进行布局，我们看一下 layout 的核心流程：

```dart
void layout(Constraints constraints, { bool parentUsesSize = false }) {
  RenderObject? relayoutBoundary;
  // 先确定当前组件的布局边界
  if (!parentUsesSize || sizedByParent || constraints.isTight || parent is! RenderObject) {
    relayoutBoundary = this;
  } else {
    relayoutBoundary = (parent! as RenderObject)._relayoutBoundary;
  }
  // _needsLayout 表示当前组件是否被标记为需要布局
  // _constraints 是上次布局时父组件传递给当前组件的约束
  // _relayoutBoundary 为上次布局时当前组件的布局边界
  // 所以，当当前组件没有被标记为需要重新布局，且父组件传递的约束没有发生变化，
  // 且布局边界也没有发生变化时则不需要重新布局，直接返回即可。
  if (!_needsLayout && constraints == _constraints && relayoutBoundary == _relayoutBoundary) {
    return;
  }
  // 如果需要布局，缓存约束和布局边界
  _constraints = constraints;
  _relayoutBoundary = relayoutBoundary;

  // 后面解释
  if (sizedByParent) {
    performResize();
  }
  // 执行布局
  performLayout();
  // 布局结束后将 _needsLayout 置为 false
  _needsLayout = false;
  // 将当前组件标记为需要重绘（因为布局发生变化后，需要重新绘制）
  markNeedsPaint();
}
```

简单来讲布局过程分以下几步：

1. 确定当前组件的布局边界。

2. 判断是否需要重新布局，如果没必要会直接返回，反之才需要重新布局。不需要布局时需要同时满足三个条件：

   - 当前组件没有被标记为需要重新布局。

   - 父组件传递的约束没有发生变化。

   - 当前组件的布局边界也没有发生变化时。

3. 调用 performLayout() 进行布局，因为  performLayout()  中又会调用子组件的 layout 方法，所以这时一个递归的过程，递归结束后整个组件树的布局也就完成了。

4. 请求重绘。

## 14.4.5 sizedByParent

在 layout 方法中，有如下逻辑：

```dart
if (sizedByParent) {
  performResize(); //重新确定组件大小
}
```

上面我们说过 sizedByParent 为 true 时表示：当前组件的大小只取决于父组件传递的约束，而不会依赖后代组件的大小。前面我们说过，performLayout 中确定当前组件的大小时通常会依赖子组件的大小，如果 sizedByParent 为 true，则当前组件的大小就不依赖子组件大小了，为了逻辑清晰，Flutter 框架中约定，当sizedByParent 为 true 时，确定当前组件大小的逻辑应抽离到 performResize() 中，这种情况下 performLayout 主要的任务便只有两个：对子组件进行布局和确定子组件在当前组件中的布局起始位置偏移。

下面我们通过一个 AccurateSizedBox 示例来演示一下 sizedByParent 为 true 时我们应该如何布局：

### AccurateSizedBox

Flutter 中的 SizedBox 组件会将其父组件的约束传递给其子组件，这也就意味着，如果父组件限制了最小宽度为100，即使我们通过 SizedBox 指定宽度为50，那也是没用的，**因为 SizedBox的实现中会让 SizedBox 的子组件先满足 SizedBox 父组件的约束**。还记得之前我们想在 AppBar 中限制 loading 组件大小的例子吗：

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

实际结果如图14-6：

![图14-6](../imgs/14-6.png)



之所以不生效，是因为父组件限制了最小高度，当然我们也可以使用  UnconstrainedBox + SizedBox 来实现我们想要的效果，但是这里我们希望通过一个组件就能搞定，为此我们自定义一个 AccurateSizedBox 组件，它和 SizedBox 的主要区别是 AccurateSizedBox 自身会遵守其父组件传递的约束**而不是让其子组件去满足AccurateSizedBox 父组件的约束**，具体：

1. AccurateSizedBox 自身大小只取决于父组件的约束和用户指定的宽高。
2. AccurateSizedBox 确定自身大小后，限制其子组件大小。

```dart
class AccurateSizedBox extends SingleChildRenderObjectWidget {
  const AccurateSizedBox({
    Key? key,
    this.width = 0,
    this.height = 0,
    required Widget child,
  }) : super(key: key, child: child);

  final double width;
  final double height;

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderAccurateSizedBox(width, height);
  }

  @override
  void updateRenderObject(context, RenderAccurateSizedBox renderObject) {
    renderObject
      ..width = width
      ..height = height;
  }
}

class RenderAccurateSizedBox extends RenderProxyBoxWithHitTestBehavior {
  RenderAccurateSizedBox(this.width, this.height);

  double width;
  double height;

  // 当前组件的大小只取决于父组件传递的约束
  @override
  bool get sizedByParent => true;


  // performResize 中会调用
  @override
  Size computeDryLayout(BoxConstraints constraints) {
    //设置当前元素宽高，遵守父组件的约束
    return constraints.constrain(Size(width, height));
  }

  // @override
  // void performResize() {
  //   // default behavior for subclasses that have sizedByParent = true
  //   size = computeDryLayout(constraints);
  //   assert(size.isFinite);
  // }

  @override
  void performLayout() {
    child!.layout(
      BoxConstraints.tight(
          Size(min(size.width, width), min(size.height, height))),
      // 父容器是固定大小，子元素大小改变时不影响父元素
      // parentUseSize为false时，子组件的布局边界会是它自身，子组件布局发生变化后不会影响当前组件
      parentUsesSize: false,
    );
  }
}
```

上面代码有三点需要注意：

1. 我们的 RenderAccurateSizedBox 不再直接继承自 RenderBox，而是继承自 RenderProxyBoxWithHitTestBehavior，RenderProxyBoxWithHitTestBehavior 是间接继承自 RenderBox的，它里面包含了默认的命中测试和绘制相关逻辑，继承自它后就不用我们再手动实现了。
2. 我们将确定当前组件大小的逻辑挪到了computeDryLayout 方法中，因为RenderBox 的 performResize 方法会调用 computeDryLayout ，并将返回结果作为当前组件的大小。按照Flutter 框架约定，我们应该重写computeDryLayout 方法而不是 performResize 方法，就像在布局时我们应该重写 performLayout 方法而不是 layout 方法；不过，这只是一个约定，并非强制，但我们应该尽可能遵守这个约定，除非你清楚的知道自己在干什么并且能确保之后维护你代码的人也清楚。
3.  RenderAccurateSizedBox 在调用子组件 layout 时，将 `parentUsesSize` 置为 `false`，这样的话子组件就会变成一个布局边界。

下面我们测试一下：

```dart
class AccurateSizedBoxRoute extends StatelessWidget {
  const AccurateSizedBoxRoute({Key? key}) : super(key: key);

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
            child: AccurateSizedBox(
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

运行效果如图14-7：

![图14-7](../imgs/14-7.png)

可以发现，当父组件约束子组件大小宽高是100时，我们通过 SizedBox 指定 Container 大小是为 50×50 是不能成功的， 而通过 AccurateSized 时成功了。

这里需要提醒一下读者，如果一个组件的 sizedByParent 为 true，那它在布局子组件时也是能将  `parentUsesSize` 置为 true 的，sizedByParent 为 true 表示自己是布局边界，而将  `parentUsesSize` 置为 true 或 false 决定的是子组件是否是布局边界，两者并不矛盾，这个不要混淆了。顺便提一点 Flutter 自带的 OverflowBox 组件的实现中，它的 sizedByParent 为 true，在调用子组件layout 方法时，`parentUsesSize` 传的是 true，详情读者可以查看 OverflowBox 的实现源码。

## 14.4.6 AfterLayout 

我们在第四章中介绍过 AfterLayout （在 9.4节 - Hero 动画 一节中也使用过它），现在我们就来看看它的实现原理。

AfterLayout 可以在布局结束后拿到子组件的代理渲染对象 （RenderAfterLayout）， RenderAfterLayout 对象会代理子组件渲染对象 ，因此，通过RenderAfterLayout 对象也就可以获取到子组件渲染对象上的属性，比如件大小、位置等。

AfterLayout 的实现代码如下：

```dart
class AfterLayout extends SingleChildRenderObjectWidget {
  AfterLayout({
    Key? key,
    required this.callback,
    Widget? child,
  }) : super(key: key, child: child);

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderAfterLayout(callback);
  }

  @override
  void updateRenderObject(
      BuildContext context, RenderAfterLayout renderObject) {
    renderObject..callback = callback;
  }
  ///组件树布局结束后会被触发，注意，并不是当前组件布局结束后触发
  final ValueSetter<RenderAfterLayout> callback;
}

class RenderAfterLayout extends RenderProxyBox {
  RenderAfterLayout(this.callback);

  ValueSetter<RenderAfterLayout> callback;

  @override
  void performLayout() {
    super.performLayout();
    // 不能直接回调callback，原因是当前组件布局完成后可能还有其他组件未完成布局
    // 如果callback中又触发了UI更新（比如调用了 setState）则会报错。因此，我们
    // 在 frame 结束的时候再去触发回调。
    SchedulerBinding.instance
        .addPostFrameCallback((timeStamp) => callback(this));
  }

  /// 组件在屏幕坐标中的起始点坐标（偏移）
  Offset get offset => localToGlobal(Offset.zero);
  /// 组件在屏幕上占有的矩形空间区域
  Rect get rect => offset & size;
}
```

上面代码有三点需要注意：

1. callback 调用时机不是在子组件完成布局后就立即调用，原因是子组件布局完成后可能还有其他组件未完成布局，如果此时调用callback，一旦 callback 中存在触发更新的代码（比如调用了 setState）则会报错。因此我们在 frame 结束的时候再去触发回调。

2. RenderAfterLayout 的 performLayout方法中直接调用了父类 RenderProxyBox 的 performLayout方法：

   ```dart
   void performLayout() {
     if (child != null) {
       child!.layout(constraints, parentUsesSize: true);
       size = child!.size;
     } else {
       size = computeSizeForNoChild(constraints);
     }
   }
   ```

   可以看到是直接将父组件传给自身的约束传递给子组件，并将子组件的大小设置为自身大小。也就是说 RenderAfterLayout 的大小和其子组件大小是相同的

3. 我们定义了 offset 和 rect 两个属性，它们是组件相对于屏幕的位置偏移和占用的矩形空间范围。但是实战中，我们经常需要获取的是子组件相对于某个父级组件的坐标和矩形空间范围，这时候我们可以调用 RenderObject 的`localToGlobal` 方法，比如下面的代码展示了Stack中某个子组件获取相对于Stack 的矩形空间范围：

   ```dart
   ...
   Widget build(context){
     return Stack(
       alignment: AlignmentDirectional.topCenter,
       children: [
         AfterLayout(
           callback: (renderAfterLayout){
            //我们需要获取的是AfterLayout子组件相对于Stack的Rect
            _rect = renderAfterLayout.localToGlobal(
               Offset.zero,
               //找到 Stack 对应的 RenderObject 对象
               ancestor: context.findRenderObject(),
             ) & renderAfterLayout.size;
           },
           child: Text('Flutter@wendux'),
         ),
       ]
     );
   }
   ```

## 14.4.7 再论 Constraints

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

当然我们还可以使用其他组件来代替 Align，比如 UnconstrainedBox，但原理是相同的，读者可以查看源码验证。

## 14.4.8 总结

通过本节，相信你已经对 flutter 的布局流程熟悉了，现在我们看一张 flutter 官网的图（图14-8）：

![图14-8](../imgs/14-8.png)

现在我们再来看一下官网关于Flutter布局的解释：

> “ 在进行布局的时候，Flutter 会以 DFS（深度优先遍历）方式遍历渲染树，并 **将限制以自上而下的方式** 从父节点传递给子节点。子节点若要确定自己的大小，则 **必须** 遵循父节点传递的限制。子节点的响应方式是在父节点建立的约束内 **将大小以自下而上的方式** 传递给父节点。” 

是不是理解的更透彻了一些！
