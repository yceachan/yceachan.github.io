# 从 Die 到 Package：芯片封装内部层级与物理实现

芯片封装（Packaging）的本质是一座连接微观硅片世界（nm/μm 级）与宏观 PCB 世界（mm 级）的桥梁。这个过程进行**尺度变换（Scale Transformation）**、**空间扇出（Fan-out）**以及**机械/环境保护**。

以下是从裸片（Die）到独立元器件（Component）的内部物理层级：

---

## Level 0: 晶圆级后处理 (Wafer Level Post-Proc)
在晶圆厂（Foundry）或封装厂（OSAT）完成，直接对硅片进行加工，为互联做准备。

1.  **UBM (Under Bump Metallization - 凸点下金属化)：**
    *   **位置：** 位于 Die 顶层铝/铜 Pad 的正上方。
    *   **作用：** 作为“地基”。因为焊锡无法直接焊在铝/铜 Pad 上（会氧化或扩散），必须先镀一层镍/金/钛薄膜作为过渡层，提供粘附力并阻挡原子扩散。
2.  **RDL (Redistribution Layer - 重布线层)：**
    *   **作用：** **XY 轴的空间映射**。Die 的原生 IO Pad 通常沿边缘排列（Periphery），间距极小。RDL 利用一层额外的聚合物电介质和铜走线，将这些 Pad 重新引线到 Die 的中心区域，形成阵列（Array），以便生长焊球。
3.  **Wafer Thinning (晶圆减薄)：**
    *   物理研磨背面，将 700μm 的晶圆减薄至 50-100μm，以适应超薄封装（如智能手机芯片）。

---

## Level 1: 第一级互联 (First Level Interconnect - FLI)
**核心物理任务：将 Die 的微小信号引出到“载体”（Carrier）上。**

### 1. Wire Bonding (引线键合) —— *点对点拉线*
*   **物理结构：** 使用 15-25μm 的金线（Au）或铜线（Cu）。
*   **连接方式：**
    *   **第一焊点 (Ball Bond)：** 利用超声波热压，将金线融化成球，压接在 Die 的 Pad 上（通常是铝）。
    *   **线弧 (Loop)：** 机械臂拉出一条精确计算高度和形状的抛物线。
    *   **第二焊点 (Stitch Bond)：** 将线尾压接在引线框架（Leadframe）的“手指”上，切断。
*   **特征：** 寄生电感大（线长），适合低频、低引脚数（< 200 pin）场景。

### 2. Flip-Chip (倒装焊 / C4) —— *面附着*
*   **物理结构：** 使用微凸点（Micro-bumps/Pillars），通常为锡银（SnAg）或铜柱（Cu Pillar）。
*   **连接方式：**
    *   Die 正面朝下，成百上千个凸点直接对准基板（Substrate）上的焊盘。
    *   通过**回流焊 (Reflow)** 一次性完成所有电气连接。
*   **特征：** 路径极短（电感极低），IO 密度极高，电源分配能力强（Power/Ground 可直接从 Die 中心垂直引入）。

---

## Level 2: 封装载体 (Package Carrier)
**核心物理任务：尺度变换 (Pitch Transformation) 与 扇出 (Fan-out)。**
*这是封装中成本占比最高的部分之一，决定了信号完整性和电源完整性。*

### A. 引线框架 (Leadframe) —— *用于 SOP, QFP, QFN*
*   **材料：** 蚀刻或冲压成型的铜合金薄板。
*   **结构：**
    *   **Die Paddle (基岛)：** 中心的一块大铜片，用于承载 Die（通过导电胶 Die Attach）。
    *   **Inner Leads (内引脚)：** 靠近 Die 的指状末端，用于接收 Bonding Wire。
    *   **Outer Leads (外引脚)：** 延伸出封装体外部，变形成海鸥翼状（SOP/QFP）或底部焊盘（QFN）。
*   **局限：** 单层布线，无法交叉，限制了引脚数量和信号复杂度。

### B. 封装基板 (Substrate / Interposer) —— *用于 BGA, CSP*
*   **本质：** 一块**微型高密度 PCB**（通常使用 BT 树脂或 ABF 薄膜作为介质）。
*   **结构：**
    *   **多层路由 (Multi-layer Routing)：** 内部有 2-10 层微米级走线。
    *   **过孔 (Micro-vias)：** 盲孔/埋孔连接各层。
    *   **扇出机制：** 将顶部 FLI 层的密集信号（如 50μm Pitch），通过内部走线“炸开”，连接到底部 PCB 端的锡球阵列（如 0.5mm - 1.0mm Pitch）。
*   **优势：** 具有完整的电源/地平面，支持阻抗控制（50Ω/100Ω）。

---

## Level 3: 元器件级封装形态 (Component Body Construction)
**核心物理任务：机械保护、热管理与最终成型。**
根据载体不同，形成了我们看到的各种黑色方块。

### 1. 塑封引线框架类 (Leadframe-based Packages)
*   **SOP (Small Outline Package) / DIP：**
    *   **构造：** Leadframe + Die + Wirebond。
    *   **封装体：** 使用环氧树脂模塑料（EMC）进行**传递模塑 (Transfer Molding)**，将 Die 和金线完全包裹，只露出 Leadframe 的引脚脚趾。
    *   **剖面特征：** 侧面看，引脚是从封装体中间“长”出来的。
*   **QFN (Quad Flat No-lead)：**
    *   **构造：** 类似 SOP，但无伸出引脚。
    *   **封装体：** 底部被打磨平整，露出 Leadframe 的截面和中心的 Die Paddle（用于散热）。
    *   **优势：** 寄生参数极小，体积最小，射频芯片首选。

### 2. 基板类封装 (Substrate-based Packages)
*   **BGA (Ball Grid Array)：**
    *   **构造：** Substrate + Die + Flip-Chip (或 Wirebond)。
    *   **封装体 (Top)：**
        *   **Plastic BGA (PBGA)：** 使用 EMC 塑封整个顶部。
        *   **Flip-Chip BGA (FCBGA)：** 对于高性能芯片（CPU/GPU），Die 的背面通常裸露或覆盖巨大的**均热盖 (Lid/IHS)**。Die 与 Lid 之间填充导热材料 (TIM)。
    *   **底部 (Bottom)：** 植球（Ball Attach），将直径 0.3mm-0.7mm 的锡球焊接在基板底部的焊盘上。

### 3. 晶圆级芯片尺寸封装 (WLCSP / Fan-in WLP)
*   **构造：** **无载体！ (No Substrate, No Leadframe)**。
*   **工艺：** 直接在晶圆上做完 RDL 和植球，然后切割。
*   **特征：** 封装尺寸 = Die 尺寸（1:1）。
*   **外观：** 看起来就是一块裸露的硅片背面，另一面长满了球。常见于手机电源管理芯片 (PMIC) 和音频 Codec。

---

## 4. Chip on Board (COB) 与“无封装”技术
COB 是一种将裸片（Bare Die）直接安装在最终电路板（PCB）上的技术。它打破了传统封装的层级，将 Level 1 (互联) 和 Level 3 (保护) 直接转移到了 PCB 上。

### 4.1 物理实现流程
1.  **Die Attach (固晶)：** 直接将裸片用导电/不导电胶水粘在 PCB 的指定位置。
2.  **Wire Bonding (压焊)：** 使用金线或铝线，将 Die 的 Pad 直接焊接在 **PCB 的金手指 (PCB Pad)** 上。
    *   *注意：* 这对 PCB 要求极高，PCB 的焊盘必须经过电镀镍金（ENIG）处理以保证焊接可靠性。
3.  **Encapsulation (包封 / Glob-top)：** 在 Die 和金线正上方滴下一坨环氧树脂（通常是黑色的）。
    *   这就是俗称的“**牛屎芯片**”。它起到防潮、防机械损伤和遮光（防止光电效应对 Die 的干扰）的作用。

### 4.2 COB 的物理特征与优劣
*   **层级缺失：** 它跳过了 Level 2 (独立的引线框架或基板)，减少了一层电气连接，路径极短。
*   **优势：**
    *   **极低成本：** 省去了封装管壳和物流成本。
    *   **极致紧凑：** 高度极低，适合卡片、超薄设备。
    *   **热路径短：** Die 直接通过胶水贴在 PCB 铜箔上，散热路径直接。
*   **劣势：**
    *   **不可维修：** 一旦黑胶固化，无法更换单个芯片，若一个 Die 坏了，整块 PCB 报废。
    *   **KGD (Known Good Die) 挑战：** 必须确保上板前的裸片是 100% 好的，否则会大幅降低 PCB 总良率。

### 4.3 衍生技术：COG 与 COF
*   **COG (Chip on Glass)：** 将 Die 直接通过各向异性导电胶（ACF）压焊在**玻璃基板**上。
    *   *应用：* 手机屏幕的驱动 IC。你在屏幕排线末端看到的那个亮晶晶的小长条就是它。
*   **COF (Chip on Film)：** 将 Die 贴在**柔性电路板（FPC）**上。
    *   *应用：* 屏幕边缘的窄边框封装，允许芯片随排线折叠到屏幕背面。

---

### 总结：内部物理架构对比

| 特征 | **SOP / QFP / QFN** | **BGA / LGA** | **WLCSP** |
| :--- | :--- | :--- | :--- |
| **核心载体** | 引线框架 (冲压铜片) | 封装基板 (微型 PCB) | 无 (Die 本身) |
| **一级互联** | 主要是 Wire Bond | 主要是 Flip-Chip | RDL 直接扇出 |
| **扇出能力** | 仅周边 (Periphery) | 全阵列 (Area Array) | 仅 Die 面积内 |
| **信号路径** | 3D 线弧 (高电感) | 垂直过孔 + 平面 (低电感) | 最短 |
| **物理外观** | 侧面有脚 / 底部无球 | 底部全是球 / 顶部可能带盖 | 裸硅片 + 微球 |