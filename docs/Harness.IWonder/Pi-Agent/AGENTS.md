# Pi Agent Harness 研究仓库纲领

本目录是面向Pi Harness 的经验研究与知识沉淀仓库，采用以下顶级研究链路：

> **Artifact 先行 → Chat Research 研讨 → Write Notes 沉淀**


## 一、Artifact 先行


1. Artifact定义：`*/00-Artifact/`下的参阅文章，或用户prompt的研究问题。

## 二、Chat Research 研讨

Chat Research 是从既定Artifact到知识的推理阶段。

0. 用户主导阶段，聚焦于用户问题，explore evidance fact ,输出可信知识。
1. 重复答疑，直至用户判定能够收束point by point 的研究要点为一个完整的知识面，显式要求构建知识库。
2. 将 Artifact 的讨论面 与知识树中的设计面 进行比较。
3. 明确哪些结论继续成立、需要收窄、已经过时或仍缺证据。
5. 区分模型能力问题、Harness 架构问题、环境噪声和任务本身复杂度。
7. 在研讨收敛前，不急于把临时观点写成领域规范。

Chat Research 阶段的最小交付清单：
- 核心判断；
- 可梳理的脉络，有落点的结论
- 拟新增、修订或保留的知识面。

## 三、Write Notes 沉淀

Write Notes 将研讨结论写入树状知识库，使用语义化路径，中文命名，locates尊重既有layout。

1. 倒序惯例:`98-devp` `99-misc`
3. `00-Artifact` 保存只读原始研究对象,`99-Artifact-Audit`保存对artifact 的研究
5. 使用 [[writing-notes]] skill 行文


## 四、知识库修订协议

当新 Artifact、运行轨迹或外部证据推翻、收窄或补充既有结论时：

1. 修订对应领域笔记，使其继续表达当前有效知识。
2. 在受影响的具体段落旁加入 `> [!revision]` 短引用
3. 另建Artifact-Audit笔记，集中保存事实、因果解释、适用范围与修订矩阵。
4. Revision Callout 只写最小充分摘要，通过相对链接回指经验笔记和原始 Artifact
5. 更新受影响笔记的 `updated` 日期、知识树入口和上下层导航。

Revision Callout 模板：

```markdown
<!-- revision-history -->``
> [!revision]
> **yyyy-mm-dd 修订**
>
> 基于 [原始 Artifact](relative/path) 与 [验证记录](relative/path)，原“旧结论”修订为“新结论”；一句话说明触发该变化的事实。
```


## 五、交付验证

**快速交付笔记库帮助用户建立认知才是核心目的**，别总想着这这那那的Frontmatter，link，entry全部合规，细致检查可以期待以后的自动化，相信后来Agent的智慧。
