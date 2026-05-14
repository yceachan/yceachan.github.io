---
title: 04 枚举与模式匹配
tags: [rust, enum, match, pattern]
desc: enum 变体/Option/match 穷尽匹配/守卫/@绑定/if let/while let/let else
update: 2026-04-24
---


# 枚举与模式匹配

本包把 Rust 里 "enum + pattern matching" 这一整套组合拳练一遍。对初学者而言，这是 Rust 相比 C/Java 最值得学习的语言机制之一：用类型系统表达"几种可能之一"，再用 match 的穷尽性让编译器替你兜底。

## 目录结构

```
04_enums_pattern_matching/
|-- Cargo.toml
|-- DESIGN.md
`-- src/
    |-- main.rs              入口，按顺序调用各模块 demo
    |-- enum_basics.rs       enum 定义 + impl 方法派发
    |-- option_result.rs     Option<T> 为主，Result<T,E> 轻触
    |-- match_patterns.rs    字面量/范围/多值/守卫/@绑定/解构
    `-- if_while_let.rs      if let、while let、let else（edition 2024）
```

## 1. enum 定义 (`enum_basics.rs`)

- `TrafficLight`：C 风格枚举，只是一组具名常量，和 C 的 `enum` 用法最接近。
- `Message`：展示 enum 四种变体形式——
  - `Quit`（单位变体，不携带数据）
  - `Move { x, y }`（结构体型变体）
  - `Write(String)`（单值元组型变体）
  - `ChangeColor(i32, i32, i32)`（多值元组型变体）
- `impl Message { fn call(&self) }`：给 enum 写方法，内部用 `match self` 按变体派发，调用方只看到 `msg.call()` 这一个接口。

要点：Rust 的 enum 本质是 sum type / tagged union，每个变体自带标签与独立数据布局，在运行期由编译器安全地判别。

## 2. Option<T> 与 Result<T, E> (`option_result.rs`)

- `Option<T>` 是 Rust 对"可能没有值"的标准答案，用类型系统替代 null：
  - 用 `match` 穷尽处理 `Some(_)` 与 `None`。
  - 便捷方法：`unwrap_or`、`map` 浅尝一下。
- `Result<T, E>` 是"要么成功要么失败"的标准答案，这里只用 `safe_div` 做入门演示；完整的 `?` 运算符、错误转换、`thiserror` 等话题放到 06 包。

要点：不要被 `Option` / `Result` 的名字吓到，它们只是 std 里两个带泛型的普通 enum。

## 3. match 模式 (`match_patterns.rs`)

集中演示 match 的各种模式：

- 字面量 + 多值 (`|`) + 闭区间范围 (`..=`) + 通配 (`_`)。
- 守卫 (guard)：`Some(n) if n > 10 => ...`，给模式加额外条件。
- `@` 绑定：`x @ 10..=99 => ...`，"范围匹配"+"把值绑到变量"一次完成。
- struct 解构：字段重命名、忽略字段、对特定字段做字面量匹配。
- tuple 解构：`..` 忽略若干项。
- enum 变体解构 + 嵌套解构：直接把 `Shape::Circle { center: Point { x, y }, radius }` 一层层挖下去。

要点：match 是表达式，所有分支的类型必须一致；穷尽性由编译器强制，漏写任何一种情况都过不了编译。

## 4. if let / while let / let else (`if_while_let.rs`)

这三兄弟都是"只关心一种模式"时的 match 简化：

- `if let Some(v) = opt { ... } else { ... }`——比 match 少几行，但表达力一致。
- `while let Some(top) = stack.pop() { ... }`——反复从容器里取值直到为空的惯用法。
- `let else`（edition 2024 稳定特性，直接写即可，无需 feature gate）——把"失败路径"独立成必须发散的 else 块（return / continue / break / panic!），让成功路径的变量直接绑定到外层作用域，避免 happy path 一层层右漂。

要点：`let else` 是把"提前返回/提前 continue"写得更扁平的主力语法，边界检查、参数校验、guard clause 场景都很受用。

## 验证

```
cargo run -p l04_enums_pattern_matching
```

末尾应能看到 `== 全部演示结束 ==`，全程零 error、零 warning。
