# 4.1 布局类组件简介

布局类组件都会包含一个或多个子组件，不同的布局类组件对子组件排列（layout）方式不同，如表4-1所示：

| Widget                        | 说明             | 用途                                                         |
| ----------------------------- | ---------------- | ------------------------------------------------------------ |
| LeafRenderObjectWidget        | 非容器类组件基类 | Widget树的叶子节点，用于没有子节点的widget，通常基础组件都属于这一类，如Image。 |
| SingleChildRenderObjectWidget | 单子组件基类     | 包含一个子Widget，如：ConstrainedBox、DecoratedBox等         |
| MultiChildRenderObjectWidget  | 多子组件基类     | 包含多个子Widget，一般都有一个children参数，接受一个Widget数组。如Row、Column、Stack等 |

​																						表4-1

布局类组件就是指直接或间接继承(包含)`SingleChildRenderObjectWidget` 和`MultiChildRenderObjectWidget`的Widget，它们一般都会有一个`child`或`children`属性用于接收子 Widget。我们看一下继承关系 Widget > RenderObjectWidget > (Leaf/SingleChild/MultiChild)RenderObjectWidget 。

`RenderObjectWidget`类中定义了创建、更新`RenderObject`的方法，子类必须实现他们，关于`RenderObject`我们现在只需要知道它是最终布局、渲染UI界面的对象即可，也就是说，对于布局类组件来说，其布局算法都是通过对应的`RenderObject`对象来实现的，所以读者如果对接下来介绍的某个布局类组件的原理感兴趣，可以查看其对应的`RenderObject`的实现，比如`Stack`（层叠布局）对应的`RenderObject`对象就是`RenderStack`，而层叠布局的实现就在`RenderStack`中。

在本章中，为了让读者对布局类 Widget 有个快速的认识，所以我们并不会深入到`RenderObject`的细节中去。在学习本章时，读者的重点是掌握不同布局组件的布局特点，具体原理和细节等我们对 Flutter 整体入门后，感兴趣的话再去研究。

