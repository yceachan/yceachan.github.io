---
title: 01 基础：语句、表达式、类型、所有权
tags: [rust, ownership, basics]
desc: 演示 Rust 的语句/表达式差异、标量与复合类型、所有权与借用规则
update: 2026-04-24
---


# 基础：语句、表达式、类型、所有权

> [!note]
> **Ref:**
> - 《The Rust Programming Language》第 3、4 章
> - Rust Reference：[Expressions](https://doc.rust-lang.org/reference/expressions.html)、[Ownership](https://doc.rust-lang.org/reference/destructors.html)
> - 本包源码：
>   - `src/main.rs`
>   - `src/statements_expressions.rs`
>   - `src/scalar_and_compound.rs`
>   - `src/ownership.rs`
>   - `src/borrow_and_slice.rs`
>   - `src/lifetimes.rs`

本子包覆盖 Rust 初学者绕不开的五个基础主题。每个主题都对应一个独立模块，`main.rs`
只负责按顺序调用 `mod::demo()` 并打印分节标题，方便在控制台逐段阅读。

运行：

```bash
cargo run -p l01_basics_ownership
```


## 1. 语句 vs 表达式

源码：`src/statements_expressions.rs`

- **语句 (Statement)** 不产生值，典型代表是 `let x = 5;`。
- **表达式 (Expression)** 产生值；块 `{ ... }`、`if`、函数调用都是表达式。
- 分号 `;` 的作用是把一个表达式降级成语句，**丢弃** 它的值；块如果以分号结尾，
  整块的值会变成 `()`（unit）。

关键代码：

```rust
let y = {
    let a = 1;
    a + 1      // 无分号，值是 2
};

let unit_val = {
    let a = 1;
    a + 1;     // 有分号，块的值变成 ()
};
```

反例（文件内以注释形式给出）演示了 "函数体最后一行加分号导致返回类型不匹配" 的
`E0308`，帮助理解 Rust "隐式返回" 是怎么来的。


## 2. 标量与复合类型

源码：`src/scalar_and_compound.rs`

标量类型：

- 整数：`i8/i16/i32/i64/i128/isize` 与对应的 `u*`；默认字面量类型为 `i32`。
- 浮点：`f32` / `f64`，默认 `f64`。
- `bool`：1 字节。
- `char`：**4 字节 Unicode Scalar Value**，能直接装下汉字与 emoji 码点。

字面量支持 `_` 分隔符、`0x/0o/0b` 前缀与 `42i64` 类型后缀。溢出行为：

- debug 构建：panic。
- release 构建：two's-complement wrap。

为了能在 debug 下稳定演示，源码里使用 `wrapping_add`、`checked_add`、
`saturating_add`、`overflowing_add` 四种显式策略。

复合类型只演示 tuple 与数组 `[T; N]`：

- tuple 长度固定，元素可异构，`.0 / .1 / ...` 索引，或用解构一次性取出。
- 数组 `[T; N]` 长度在 **类型里**，栈上，同类型元素；与后面模块的 `Vec<T>`
  （堆、可增长）对比。


## 3. 所有权、`const` / `static`、`mut` 与 shadowing

源码：`src/ownership.rs`

所有权三条规则（代码里反复用注释强调）：

1. 每个值在任意时刻只有一个所有者。
2. 所有者离开作用域时，值被 `Drop`。
3. 赋值 / 传参 / 返回默认为 **Move**（对非 `Copy` 类型）。

`Copy` vs `Move`：

```rust
let n1: i32 = 100;
let n2 = n1;                       // Copy，n1 仍可用

let s1 = String::from("你好");
let s2 = s1;                       // Move，s1 失效
// println!("{s1}");               // ❌ borrow of moved value
```

修复 "借用已被移动的值" 的两个标准套路：

- `clone()` 深拷贝（显式付出成本）。
- 借用（传 `&s5` 而不是 `s5`）—— 最常用、零成本，下一小节展开。

`const` 与 `static` 的区别：

- `const`：编译期内联，无固定地址，可在任意作用域声明。
- `static`：全局静态变量，地址稳定，整个程序生命周期存在。
- 两者都要显式类型，命名惯例为 `SCREAMING_SNAKE_CASE`。

`mut` vs shadowing：

- `let mut b = 10; b += 1;` —— 值可改、类型不能换。
- `let s = "42"; let s: i32 = s.parse().unwrap();` —— shadowing，可以换类型，
  且新绑定本身依然不可变。


## 4. 借用与切片

源码：`src/borrow_and_slice.rs`

借用检查器规则（"aliasing XOR mutation"）：

- 同一时刻：**多个 `&T`** 或 **唯一一个 `&mut T`**，二者不能共存。
- 借用不能比被借用的值活得更久。

得益于 NLL（Non-Lexical Lifetimes），下面这段是合法的：

```rust
let mut s = String::from("rust");
let r1 = &s;
let r2 = &s;
println!("{r1} {r2}");   // r1/r2 到这里用完，借用结束
let r3 = &mut s;         // 现在可以拿到独占借用
r3.push_str("!!");
```

切片部分：

- `&str` 是对 `String` 内部 UTF-8 字节的一段借用，字节索引而非字符索引；
  如果切在多字节字符中间会 panic（文件内给出了错误信息注释）。
- `&[T]` 是对数组 / `Vec` 的连续视图；写函数签名时优先用 `&[T]` 以兼容两者。


## 5. 生命周期入门

源码：`src/lifetimes.rs`

生命周期省略规则（简化版）：

- E1：每个输入引用参数各获一个独立生命周期。
- E2：只有一个输入引用参数时，其生命周期被赋给所有输出引用。
- E3：方法的 `&self` 生命周期被赋给输出。

显式标注的典型场景 —— 两个输入引用 + 一个引用返回：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}
```

`'a` 是编译器取的 x、y 两者作用域的 **交集**，返回值只能在这个交集里使用。
源码里给出了 "把 `result` 带出 `s2` 作用域" 的悬垂引用反例，并展示编译器的
`E0597` 错误。


## 验证

本包编译零 warning（仅 `statements_expressions.rs` 里为了演示 "分号丢弃值" 显式
`#[allow(unused_must_use)]`，该宏紧贴 demo 所在的 `let` 绑定并写了原因）。

`cargo run -p l01_basics_ownership` 末尾输出为：

```
-- 悬垂引用 (仅概念演示) --
正确做法是返回所有权：owned, not borrowed

==== 全部 demo 结束 ====
```
