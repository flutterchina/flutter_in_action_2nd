# 10.2 组合现有组件

在Flutter中页面UI通常都是由一些低级别组件组合而成，当我们需要封装一些通用组件时，应该首先考虑是否可以通过组合其他组件来实现，如果可以，则应优先使用组合，因为直接通过现有组件拼装会非常简单、灵活、高效。

## 10.2.1 实例：自定义渐变按钮

### 1. 实现GradientButton

Flutter Material组件库中的按钮默认不支持渐变背景，为了实现渐变背景按钮，我们自定义一个`GradientButton `组件，它需要支持一下功能：

1. 背景支持渐变色
2. 手指按下时有涟漪效果
3. 可以支持圆角

我们先来看看最终要实现的效果（图10-1）：

![图10-1](../imgs/10-1.png)

我们`DecoratedBox`可以支持背景色渐变和圆角，`InkWell`在手指按下有涟漪效果，所以我们可以通过组合`DecoratedBox`和`InkWell`来实现`GradientButton`，代码如下：

```dart
import 'package:flutter/material.dart';

class GradientButton extends StatelessWidget {
  const GradientButton({Key? key, 
    this.colors,
    this.width,
    this.height,
    this.onPressed,
    this.borderRadius,
    required this.child,
  }) : super(key: key);

  // 渐变色数组
  final List<Color>? colors;

  // 按钮宽高
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  //点击回调
  final GestureTapCallback? onPressed;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    //确保colors数组不空
    List<Color> _colors =
        colors ?? [theme.primaryColor, theme.primaryColorDark];

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: _colors),
        borderRadius: borderRadius,
        //border: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
      ),
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          splashColor: _colors.last,
          highlightColor: Colors.transparent,
          borderRadius: borderRadius,
          onTap: onPressed,
          child: ConstrainedBox(
            constraints: BoxConstraints.tightFor(height: height, width: width),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: DefaultTextStyle(
                  style: const TextStyle(fontWeight: FontWeight.bold),
                  child: child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

可以看到`GradientButton`是由`DecoratedBox`、`Padding`、`Center`、`InkWell`等组件组合而成。当然上面的代码只是一个示例，作为一个按钮它还并不完整，比如没有禁用状态，读者可以根据实际需要来完善，为了使用方便，笔者封装了一个功能更加完整的GradientButton，并将它添加到了flukit组件库中，读者可以引入flukit库后就可以直接使用了。

### 2. 使用GradientButton

```dart
import 'package:flutter/material.dart';
import '../widgets/index.dart';

class GradientButtonRoute extends StatefulWidget {
  const GradientButtonRoute({Key? key}) : super(key: key);

  @override
  _GradientButtonRouteState createState() => _GradientButtonRouteState();
}

class _GradientButtonRouteState extends State<GradientButtonRoute> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        GradientButton(
          colors: const [Colors.orange, Colors.red],
          height: 50.0,
          child: const Text("Submit"),
          onPressed: onTap,
        ),
        GradientButton(
          height: 50.0,
          colors: [Colors.lightGreen, Colors.green.shade700],
          child: const Text("Submit"),
          onPressed: onTap,
        ),
        GradientButton(
          height: 50.0,
          //borderRadius: const BorderRadius.all(Radius.circular(5)),
          colors: [Colors.lightBlue.shade300, Colors.blueAccent],
          child: const Text("Submit"),
          onPressed: onTap,
        ),
      ],
    );
  }
  onTap() {
    print("button click");
  }
}
```



## 10.2.2 总结

通过组合的方式定义组件和我们之前写界面并无差异，不过在抽离出单独的组件时我们要考虑代码规范性，如必要参数要用`required`关键词标注，对于可选参数在特定场景需要判空或设置默认值等。这是由于使用者大多时候可能不了解组件的内部细节，所以为了保证代码健壮性，我们需要在用户错误地使用组件时能够兼容或报错提示（使用`assert`断言函数）。
