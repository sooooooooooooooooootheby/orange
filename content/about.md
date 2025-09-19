# 关于这个网站

这个网站由 `AliceIClodia` 独自开发, 项目开源在 Github, 如果你有想法, 欢迎你来给网站做贡献!

::card{title="Github-orange" icon="i-lucide-github" color="primary" to="https://github.com/sooooooooooooooooootheby/orange" target="\_blank"}
这是OrangeCraftMC服务器的官网, 使用Nuxt4制作!
::

如果你发现网站存在问题, 请在qq上私聊 `AliceIClodia`, 或者创建一个 `issues`.

::note{icon="gravity-ui:sparkles-fill"}
动动你发财的小手给我点个 star 吧
::

---

目前网站有一个很严重的问题, 在服务器指北和蓝图页面刷新会出现数据丢失的原因.

这是因为 `@nuxt/content` 依赖的 `better-sqlite3` 是一个特殊的模块, 这个模块需要在生产环境的服务器上编译才能够正常运行, 但是部署网站的服务器配置比较低, 没法 build 这个项目, 所以项目是在 Github Actions 的虚拟机中 Build 的, 环境不同导致 `better-sqlite3` 出错.

我没招了, 等一个大佬来出解决方案.
