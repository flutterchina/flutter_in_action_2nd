(window.webpackJsonp=window.webpackJsonp||[]).push([[104],{627:function(s,a,t){"use strict";t.r(a);var n=t(45),e=Object(n.a)({},(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"_13-2-实现localizations"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_13-2-实现localizations"}},[s._v("#")]),s._v(" 13.2 实现Localizations")]),s._v(" "),t("p",[s._v("前面讲了Material组件库如何支持国际化，本节我们将介绍一下我们自己的UI中如何支持多语言。根据上节所述，我们需要实现两个类：一个"),t("code",[s._v("Delegate")]),s._v("类一个"),t("code",[s._v("Localizations")]),s._v("类，下面我们通过一个实例说明。")]),s._v(" "),t("h2",{attrs:{id:"_13-2-1-实现localizations类"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_13-2-1-实现localizations类"}},[s._v("#")]),s._v(" 13.2.1 实现Localizations类")]),s._v(" "),t("p",[s._v("我们已经知道"),t("code",[s._v("Localizations")]),s._v("类中主要实现提供了本地化值，如文本：")]),s._v(" "),t("div",{staticClass:"language-dart line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dart"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//Locale资源类")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("isZh"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//是否为中文")]),s._v("\n  bool isZh "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("false")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//为了使用方便，我们定义一个静态方法")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("static")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("of")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("BuildContext")]),s._v(" context"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Localizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("of"),t("span",{pre:!0,attrs:{class:"token generics"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("context"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//Locale相关值，title为应用标题")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("String")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("get")]),s._v(" title "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" isZh "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("?")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Flutter应用"')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Flutter APP"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//... 其它的值  ")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br")])]),t("p",[t("code",[s._v("DemoLocalizations")]),s._v("中会根据当前的语言来返回不同的文本，如"),t("code",[s._v("title")]),s._v("，我们可以将所有需要支持多语言的文本都在此类中定义。"),t("code",[s._v("DemoLocalizations")]),s._v("的实例将会在Delegate类的"),t("code",[s._v("load")]),s._v("方法中创建。")]),s._v(" "),t("h2",{attrs:{id:"_13-2-2-实现delegate类"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_13-2-2-实现delegate类"}},[s._v("#")]),s._v(" 13.2.2 实现Delegate类")]),s._v(" "),t("p",[s._v("Delegate类的职责是在Locale改变时加载新的Locale资源，所以它有一个"),t("code",[s._v("load")]),s._v("方法，Delegate类需要继承自"),t("code",[s._v("LocalizationsDelegate")]),s._v("类，实现相应的接口，示例如下：")]),s._v(" "),t("div",{staticClass:"language-dart line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dart"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//Locale代理类")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizationsDelegate")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("extends")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("LocalizationsDelegate")]),t("span",{pre:!0,attrs:{class:"token generics"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizationsDelegate")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//是否支持某个Local")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token metadata symbol"}},[s._v("@override")]),s._v("\n  bool "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("isSupported")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Locale")]),s._v(" locale"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'en'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'zh'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("contains")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("locale"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("languageCode"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// Flutter会调用此类加载相应的Locale资源类")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token metadata symbol"}},[s._v("@override")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Future")]),t("span",{pre:!0,attrs:{class:"token generics"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("load")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Locale")]),s._v(" locale"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("print")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"$locale"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("SynchronousFuture")]),t("span",{pre:!0,attrs:{class:"token generics"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("locale"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("languageCode "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("==")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"zh"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n  "),t("span",{pre:!0,attrs:{class:"token metadata symbol"}},[s._v("@override")]),s._v("\n  bool "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("shouldReload")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizationsDelegate")]),s._v(" old"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("false")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br"),t("span",{staticClass:"line-number"},[s._v("20")]),t("br")])]),t("p",[t("code",[s._v("shouldReload")]),s._v("的返回值决定当Localizations组件重新build时，是否调用"),t("code",[s._v("load")]),s._v("方法重新加载Locale资源。一般情况下，Locale资源只应该在Locale切换时加载一次，不需要每次在"),t("code",[s._v("Localizations")]),s._v("重新build时都加载，所以返回"),t("code",[s._v("false")]),s._v("即可。可能有些人会担心返回"),t("code",[s._v("false")]),s._v("的话在APP启动后用户再改变系统语言时"),t("code",[s._v("load")]),s._v("方法将不会被调用，所以Locale资源将不会被加载。事实上，每当Locale改变时Flutter都会再调用"),t("code",[s._v("load")]),s._v("方法加载新的Locale，无论"),t("code",[s._v("shouldReload")]),s._v("返回"),t("code",[s._v("true")]),s._v("还是"),t("code",[s._v("false")]),s._v("。")]),s._v(" "),t("h2",{attrs:{id:"_13-2-3-添加多语言支持"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_13-2-3-添加多语言支持"}},[s._v("#")]),s._v(" 13.2.3 添加多语言支持")]),s._v(" "),t("p",[s._v("和上一节中介绍的相同，我们现在需要先注册"),t("code",[s._v("DemoLocalizationsDelegate")]),s._v("类，然后再通过"),t("code",[s._v("DemoLocalizations.of(context)")]),s._v("来动态获取当前Locale文本。")]),s._v(" "),t("p",[s._v("只需要在MaterialApp或WidgetsApp的"),t("code",[s._v("localizationsDelegates")]),s._v("列表中添加我们的Delegate实例即可完成注册：")]),s._v(" "),t("div",{staticClass:"language-dart line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dart"}},[t("code",[s._v("localizationsDelegates"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("\n "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 本地化的代理类")]),s._v("\n "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("GlobalMaterialLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("delegate"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("GlobalWidgetsLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("delegate"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 注册我们的Delegate")]),s._v("\n "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizationsDelegate")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br")])]),t("p",[s._v("接下来我们可以在Widget中使用Locale值：")]),s._v(" "),t("div",{staticClass:"language-dart line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dart"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Scaffold")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n  appBar"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("AppBar")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//使用Locale title  ")]),s._v("\n    title"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Text")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DemoLocalizations")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("of")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("context"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("title"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//省略无关代码")]),s._v("\n ） \n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br")])]),t("p",[s._v("这样，当在美国英语和中文简体之间切换系统语言时，APP的标题将会分别为“Flutter APP”和“Flutter应用”。")]),s._v(" "),t("h2",{attrs:{id:"_13-2-4-总结"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_13-2-4-总结"}},[s._v("#")]),s._v(" 13.2.4 总结")]),s._v(" "),t("p",[s._v("本节我们通过一个简单的示例说明了Flutter应用国际化的基本过程及原理。但是上面的实例还有一个严重的不足就是我们需要在DemoLocalizations类中获取"),t("code",[s._v("title")]),s._v("时手动的判断当前语言Locale，然后返回合适的文本。试想一下，当我们要支持的语言不是两种而是8种甚至20几种时，如果为每个文本属性都要分别去判断到底是哪种Locale从而获取相应语言的文本将会是一件非常复杂的事。还有，通常情况下翻译人员并不是开发人员，能不能像i18n或l10n标准那样可以将翻译单独保存为一个arb文件交由翻译人员去翻译，翻译好之后开发人员再通过工具将arb文件转为代码。答案是肯定的！我们将在下一节介绍如何通过Dart intl包来实现这些。")])])}),[],!1,null,null,null);a.default=e.exports}}]);