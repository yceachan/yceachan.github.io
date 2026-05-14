---
title: 06 错误处理
tags: [rust, error, result, panic, question-mark]
desc: panic vs Result/?/Box dyn Error/自定义错误/From 自动转换/thiserror 与 anyhow 概念
update: 2026-04-24
---


# 错误处理

> [!note]
> **Ref:** 本地代码 `src/panic_vs_result.rs`、`src/question_mark.rs`、`src/custom_error.rs`；
> 参考 [Rust Book - Ch.9 Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)。


## 1. panic! vs Result：两种错误的分层

Rust 把错误显式地分成两层：

| 类别       | 语义                           | 表达方式                                       |
| ---------- | ------------------------------ | ---------------------------------------------- |
| 可恢复错误 | 业务上可预期、调用方需要处理   | 返回 `Result<T, E>`，调用方必须用 match / `?`  |
| 不可恢复错误 | 代码 bug、逻辑不变量被违反     | `panic!` 中止当前线程（单线程程序即整个进程） |

与 Java / Python / C++ / C# 等“有异常”的语言对比：

- 那些语言里，`throw`/`raise` 一个异常后，调用栈被自动 unwind，
  直到被某个 `try { ... } catch` 捕获；没捕获就到进程顶层。
- **Rust 没有 `try` / `catch`。** 可恢复错误被编进函数签名：返回
  `Result<T, E>`。调用方如果忽略错误，编译器会直接给 warning（甚至 error，
  如果用了 `#[must_use]`）。这让“哪里会失败、失败了会怎样”完全是类型级别的事，
  没有隐形的控制流跳转。
- `panic!` 只用于“此刻继续执行没有任何意义”的情况，例如数组越界、
  `Option::unwrap()` 空值、断言失败。它不是做错误处理用的。


## 2. unwrap / expect 系列速查

针对 `Result<T, E>`（`Option<T>` 同理，Err 换成 None）：

| 方法                   | 语义                                       | 合适的使用场景                          |
| ---------------------- | ------------------------------------------ | --------------------------------------- |
| `unwrap()`             | Ok 取值，Err 直接 panic                     | demo / 原型；已经在逻辑上证明不可能 Err |
| `expect("msg")`        | 同上，但 panic 信息更清晰                    | 想让 panic 消息带上“不变量描述”时     |
| `unwrap_or(default)`   | Err 时返回传入的默认值（**已被计算**）       | 默认值是常量、创建廉价                  |
| `unwrap_or_else(\|e\|)`| Err 时用闭包**懒计算**默认值，还能读错误 e    | 默认值计算较贵，或想做降级逻辑          |
| `unwrap_or_default()`  | Err 时返回 `T::default()`（要求 T: Default）| 有合理零值（`0`、`""`、`Vec::new()`）  |

生产代码中尽量避免 `unwrap()` / `expect()`——它们是隐藏的 panic 点。
优先用 `?` 把错误上浮，或用 `unwrap_or*` 给出回退值。


## 3. `?` 运算符：错误传播的语法糖

**核心等价展开**（在返回 `Result<T, E>` 的函数里）：

```rust
let v = some_result?;
// 等价于：
let v = match some_result {
    Ok(v)  => v,
    Err(e) => return Err(From::from(e)),   // 注意：调用 From::from
};
```

在返回 `Option<T>` 的函数里：

```rust
let v = some_option?;
// 等价于：
let v = match some_option {
    Some(v) => v,
    None    => return None,
};
```

几个要点：

1. `?` **只能写在“自身返回 Result / Option / 实现 Try 的类型”的函数里**，
   它本质上是 `return` 的糖——不能跨越函数边界（所以它不是异常）。
2. 在 Result 上的 `?` 会自动调用 `From::from(e)` 进行错误类型转换，
   这是下面“自定义错误 + From” 能无缝工作的根本原因。
3. `main` 也可以写成 `fn main() -> Result<(), Box<dyn std::error::Error>>`，
   于是 main 里也能直接 `?`。但最佳实践是：把真正的工作放到子函数 `run()`，
   在 main 里用 `match run()` 决定如何呈现错误——避免 main 本身 panic、
   或者返回 Err 导致进程非零退出。本项目的 `src/main.rs` 就是这个模式。


## 4. `Box<dyn std::error::Error>`：统一错误类型的“通用胶水”

`Box<dyn std::error::Error>` 是“任何实现了 `std::error::Error` trait 的类型”
的 trait object。作用：

- 一个函数内部可能返回多种具体错误（`io::Error`、`ParseIntError`、`MyError` ……）。
- 如果把签名写成 `Result<T, Box<dyn Error>>`，`?` 会自动把任何 `impl Error`
  的错误装箱（boxed）进 trait object 返回。
- 代价：丢失了具体类型，调用方只能按 trait 方法（`Display`、`source()`、
  `downcast_ref::<T>()`）处理；优点：写起来极简，非常适合应用层 / main。

写库时，推荐暴露**具体的、有判别力的错误 enum**（见下）；写应用、脚本、main 时，
`Box<dyn Error>` 或 `anyhow::Error` 更实用。


## 5. 自定义错误类型：enum + Display + Error + From

一个典型的库级错误类型：

```rust
#[derive(Debug)]
pub enum MyError {
    Io(std::io::Error),
    Parse(std::num::ParseIntError),
    NotFound,
}
```

它需要三件套：

1. **Display**：面向最终用户的简短描述。`println!("{err}")` 走的是 Display。
   —— 对比 **Debug**（通常 `#[derive(Debug)]`）：面向开发者，
   `{:?}`/`{:#?}` 打印内部结构，用于日志 / 调试。
2. **`std::error::Error`**：把自己变成“合法的标准错误”，
   可被 `Box<dyn Error>` 接住；`source()` 暴露底层原因，形成错误链。
3. **`From<源错误> for MyError`**：这是 `?` 能自动把 `io::Error` /
   `ParseIntError` 等转换成 `MyError` 的原理（因为 `?` 内部会调用 `From::from`）。

具体实现见 `src/custom_error.rs`。


## 6. thiserror 与 anyhow（概念，不引入依赖）

本项目**刻意只用 std** 演示原理；真实工程里通常二选一：

- **thiserror**：**写库**的推荐方案。
  它只是一组派生宏：`#[derive(thiserror::Error, Debug)]` 配合 `#[error("...")]`、
  `#[from]`，把上面手写的 Display / Error / From 一把生成。
  对外仍然暴露**具体的 enum 错误类型**，调用方可以精确匹配变体。
  概念对照（**注释形式**，本仓库不真的依赖）：

  ```text
  #[derive(thiserror::Error, Debug)]
  pub enum MyError {
      #[error("IO 错误: {0}")]        Io(#[from] std::io::Error),
      #[error("解析失败: {0}")]       Parse(#[from] std::num::ParseIntError),
      #[error("找不到指定键")]        NotFound,
  }
  ```

- **anyhow**：**写应用 / 脚本 / main** 的推荐方案。
  它提供一个万能错误类型 `anyhow::Error`（类似强化版 `Box<dyn Error>`），
  以及 `anyhow::Result<T> = Result<T, anyhow::Error>`。任何 `impl Error` 的
  错误都能直接 `?`，还能用 `.context("读取配置文件失败")` 追加上下文。
  缺点：对外不能让调用方精确匹配错误变体（所以不适合做公共库的对外错误）。

一句话：**库用 thiserror，应用用 anyhow，学习阶段先用 std 理解原理。**


## 7. 代码结构

```
06_error_handling/
├── Cargo.toml              # 无外部依赖
├── DESIGN.md               # 本文
└── src/
    ├── main.rs             # 入口：run() + match，不让 main panic
    ├── panic_vs_result.rs  # panic 与 Result 的对比 + unwrap_or 系列
    ├── question_mark.rs    # ? 在 Result / Option 上的用法 + 等价展开
    └── custom_error.rs     # MyError enum + Display + Error + From
```


## 8. 运行

```bash
cargo run -p l06_error_handling
```

预期：零 error、零 warning，进程正常退出（exit code 0）。
输出会看到 `解析失败：invalid digit found in string`（被 `?` 传上来并转换成
`MyError::Parse`）和 `找不到指定键`（`MyError::NotFound`）等信息。
