(window.webpackJsonp=window.webpackJsonp||[]).push([[28],{391:function(t,e,a){},399:function(t,e,a){t.exports=a.p+"assets/img/book2.73e63aa4.jpeg"},422:function(t,e,a){"use strict";a(391)},651:function(t,e,a){"use strict";a.r(e);a(195),a(31),a(117);var n,o=a(648),i=a(646),r=a(647),s=a(649),c=a(362);var h=["/join_us.html"],u={name:"Layout",components:{Home:o.a,Page:r.a,Sidebar:s.a,Navbar:i.a},data:function(){return{isSidebarOpen:!1,showBook:!1}},computed:{shouldShowNavbar:function(){var t=this.$site.themeConfig;return!1!==this.$page.frontmatter.navbar&&!1!==t.navbar&&(this.$title||t.logo||t.repo||t.nav||this.$themeLocaleConfig.nav)},shouldShowSidebar:function(){var t=this.$page.frontmatter;return!t.home&&!1!==t.sidebar&&this.sidebarItems.length},sidebarItems:function(){return Object(c.l)(this.$page,this.$page.regularPath,this.$site,this.$localePath)},pageClasses:function(){var t=this.$page.frontmatter.pageClass;return[{"no-navbar":!this.shouldShowNavbar,"sidebar-open":this.isSidebarOpen,"no-sidebar":!this.shouldShowSidebar},t]}},mounted:function(){var t=this;!function(){n=n||[];var t=document.createElement("script");t.src="https://hm.baidu.com/hm.js?170231fea4f81697eb046edc1a91fe5b";var e=document.getElementsByTagName("script")[0];t.id="bd",e.parentNode.insertBefore(t,e)}(),this.lastPathname="",this.$router.afterEach((function(){if(-1===h.indexOf(location.pathname)&&(t.showBook=!0),t.lastPathname!==location.pathname){console.log(location.pathname),n.push(["_trackPageview",t.lastPathname=location.pathname]);var e=window.location.href,a=document.referrer;if(!/([http|https]:\/\/[a-zA-Z0-9\_\.]+\.baidu\.com)/gi.test(e)){var o="https://sp0.baidu.com/9_Q4simg2RQJ8t7jm9iCKT-xh_/s.gif";a?(o+="?r="+encodeURIComponent(document.referrer),e&&(o+="&l="+e)):e&&(o+="?l="+e),(new Image).src=o}}t.isSidebarOpen=!1}));var e=this.$site.themeConfig,a=e.logo,o=function(){window.innerWidth<720&&""!==e.log?(e.logo="",t.$refs.nav.$forceUpdate()):window.innerWidth>=720&&""===e.logo&&(e.logo=a,t.$refs.nav.$forceUpdate())};o(),window.addEventListener("resize",o)},methods:{buy:function(t,e){n.push(["_trackEvent","buy","click","btn"]),console.log(n.push(["_trackEvent","buy","click",t]))},toggleSidebar:function(t){this.isSidebarOpen="boolean"==typeof t?t:!this.isSidebarOpen,this.$emit("toggle-sidebar",this.isSidebarOpen)},onTouchStart:function(t){this.touchStart={x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}},onTouchEnd:function(t){var e=t.changedTouches[0].clientX-this.touchStart.x,a=t.changedTouches[0].clientY-this.touchStart.y;Math.abs(e)>Math.abs(a)&&Math.abs(e)>40&&(e>0&&this.touchStart.x<=80?this.toggleSidebar(!0):this.toggleSidebar(!1))}}},l=(a(422),a(62)),d=Object(l.a)(u,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"theme-container",class:t.pageClasses,on:{touchstart:t.onTouchStart,touchend:t.onTouchEnd}},[t.shouldShowNavbar?n("Navbar",{ref:"nav",on:{"toggle-sidebar":t.toggleSidebar}}):t._e(),t._v(" "),n("div",{staticClass:"sidebar-mask",on:{click:function(e){return t.toggleSidebar(!1)}}}),t._v(" "),n("Sidebar",{attrs:{items:t.sidebarItems},on:{"toggle-sidebar":t.toggleSidebar},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("sidebar-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("sidebar-bottom")]},proxy:!0}],null,!0)}),t._v(" "),t.$page.frontmatter.home?n("Home"):n("Page",{attrs:{"sidebar-items":t.sidebarItems},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("page-top"),t._v(" "),t.showBook?n("div",{staticStyle:{"text-align":"center","margin-top":"100px"}},[n("img",{staticClass:"book",attrs:{src:a(399),title:"点击去购买"},on:{click:function(e){return e.preventDefault(),t.buy("btn")}}}),t._v(" "),n("div",{staticStyle:{"margin-top":"30px"}},[t._v("购买第二版实体书："),n("a",{attrs:{href:"#"},on:{click:function(e){return e.preventDefault(),t.buy("btn")}}},[t._v("京东")]),t._v(" | "),n("a",{attrs:{href:"#"},on:{click:function(e){return e.preventDefault(),t.buy("btn","dangdang")}}},[t._v("当当")])])]):t._e()]},proxy:!0},{key:"bottom",fn:function(){return[n("div",{staticStyle:{"text-align":"center"}},[n("img",{attrs:{src:"/assets/img/pay.a6c3cb25.jpeg",width:"200"}}),t._v(" "),n("div",[t._v(" 请作者喝杯咖啡 ")])]),t._v(" "),n("div",{staticClass:"copyright"},[t._v(" 版权所有，禁止私自转发、克隆网站。")]),t._v(" "),n("div",{staticClass:"f-links",staticStyle:{"text-align":"center"}},[n("a",{attrs:{title:"点击购买",target:"_blank"},on:{click:function(e){return t.buy("link")}}},[t._v(" 购买实体书\n        ")]),t._v(" |\n        "),n("a",{attrs:{href:"https://github.com/flutterchina"}},[t._v("Flutter中国开源项目")]),t._v("\n        |\n        "),n("a",{attrs:{href:"https://github.com/wendux"}},[t._v("\n          关于作者\n        ")])])]},proxy:!0}],null,!0)})],1)}),[],!1,null,null,null);e.default=d.exports}}]);