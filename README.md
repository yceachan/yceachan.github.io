# Ea-Knowledge_Base

## Pre

> [!note]
>
> [Legacy.kb.io](https://github.com/yceachan/Legacy.kb.io/)
>
> [Lysssyo.github.io/](https://github.com/Lysssyo/Lysssyo.github.io/)

- Why I finally Deprecated `Legacy.kb,io`?

  Legacy是一个嵌入式开发者纯Vibe Coding实现的前端博客项目。旧的知识库，使用`React + SPA(single page app) + tailwind theme`的技术栈来渲染md文档，并提供explorer风格的导航功能。这是我的核心想法。但它渐渐地暴漏了一些问题:

  - markdown render:

    Tailwind theme 的开箱渲染效果不尽如人意，需要和AI对话很多轮逐个添加插件，在devper 对 forntend 技术栈掌握不深的情况下，技术债务累叠，项目维护苦难。

  - CI/CD 繁琐:

    旧的方案是在js里配置扫描本地路径，全量扫描；同步和全构建，devper需要定时运维博客，do.bat sync一下note repo 的更新。（never say ,  这个项目的最大需求场景就是，我会拥有很多个，不同领域的，项目/笔记混杂的仓库）

    我的最终目标是，直接在note repo push 一下，就是直接CI/CD 到`github.io`的web端笔记同步更新。

  - 移动端适配

    不想再重头设计移动端UI了。

- Solution

  - VitePress'

    - VitePress + PWA(Progress Web APP) ，theme 开箱即用，移动端适配性好
    -  有好Hommie的模板抄[Lysssyo.github.io/](https://github.com/Lysssyo/Lysssyo.github.io/)

  - CI/CD

    VPS 上，部署本地git服务器，update 钩子 sync 仓库中的notes 到 VitePress Engine ,然后CI/CD 集成到github Page，最省心。