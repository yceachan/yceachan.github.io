---
title: 07 闭包
tags: [rust, closure, fn, fnmut, fnonce, move]
desc: 闭包语法 / 三种 Fn trait / 捕获方式 / 作参数和返回值 / 与迭代器和线程配合
update: 2026-04-24
---


# 闭包

本节讲 Rust 的**闭包（closure）**——可以捕获当前作用域变量的匿名函数。闭包是 Rust 里函数式风格（迭代器链）和并发编程（`thread::spawn`）的关键黏合剂。

## 模块结构

| 文件 | 主题 |
| --- | --- |
| `src/main.rs` | 入口，按顺序串联 4 个 demo |
| `src/closure_basics.rs` | 闭包语法 3 种写法 + 捕获方式 3 种（借用 / 可变借用 / move） |
| `src/fn_traits.rs` | `Fn` / `FnMut` / `FnOnce` 三种 trait 的区分演示 |
| `src/as_param_return.rs` | 闭包作参数（静态/动态派发）、作返回值、`Box<dyn Fn>` |
| `src/with_iterator_and_thread.rs` | 迭代器链 + `thread::spawn(move || ...)` |

## 核心知识点

### 1. 语法三种写法

```rust
let f1 = |x| x + 1;                 // 最短，靠类型推断
let f2 = |x: i32| -> i32 { x + 1 }; // 完整标注
let f3 = || println!("hi");         // 无参
```

### 2. 闭包 vs `fn`

普通 `fn` 是全局符号，没有词法作用域，不能访问外层变量；闭包可以**捕获**外层环境变量。这是它存在的根本理由。

### 3. 三种 Fn trait（核心中的核心）

编译器根据闭包体里如何使用捕获变量，自动推导实现哪几个 trait：

| trait | 对环境的用法 | 调用次数 | 调用时 `self` |
| --- | --- | --- | --- |
| `Fn` | 不可变借用 | 任意多次 | `&self` |
| `FnMut` | 可变借用 | 任意多次，独占 | `&mut self` |
| `FnOnce` | 消耗 / 移动 | 仅一次 | `self` |

包含关系：`FnOnce ⊇ FnMut ⊇ Fn`。写 API 时应**要求最弱的那一个**（比如只读回调就写 `Fn`，既能接受只读闭包，也能接受函数指针）。

### 4. 三种捕获方式

- **按不可变引用**（默认，若闭包体里只读）。
- **按可变引用**（闭包体里修改了它 → 编译器自动按 `&mut` 捕获，此时原变量需声明 `mut`）。
- **按 move**（使用 `move` 关键字，转移所有权）。

> `move` 转移的是**所有权**而非"拷贝"。对 `Copy` 类型（如 `i32`），语义上就是复制一份进闭包，外部仍能用；对非 `Copy` 类型（如 `String`、`Vec`），move 之后外部就无法再访问原变量。

### 5. 闭包作参数

- **静态派发**：`fn apply<F: Fn(i32)->i32>(f: F, x: i32)` 或等价的 `fn apply(f: impl Fn(i32)->i32, x: i32)`。编译期单态化，零运行期开销。
- **动态派发**：`&dyn Fn(i32)->i32` 或 `Box<dyn Fn(i32)->i32>`。有一次虚表跳转，换来"不单态化"和"能存异构闭包"。

### 6. 闭包作返回值

```rust
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}
```

**为什么返回类型必须写 `impl Fn` 而不是具体类型？**
每个闭包都是编译器合成的**独立匿名类型**，你无法把它的名字写出来；`impl Trait` 就是"这里藏了一个实现 Fn 的具体匿名类型"。

**为什么必须 `move`？**
不加 `move`，闭包会按引用借用参数 `n`；可是函数一旦返回，`n` 所在的栈帧就销毁了，借用悬垂 —— 编译器直接拒绝。加了 `move` 把 `n` 拷/搬进闭包，闭包和它一起被返回给调用者，生命周期安全。

**什么时候必须用 `Box<dyn Fn>` 作返回值？**
当不同分支返回的是**不同的闭包类型**时（例如 `match` 里每个 arm 返回不同的闭包），`impl Fn` 要求所有分支返回**同一个具体类型**，这时就做不到，只能用 `Box<dyn Fn>` 把它们统一成 trait object。把多个异构闭包放入 `Vec` 也是同理。

### 7. 闭包 + 迭代器

迭代器上几乎所有适配器都吃闭包：`map` / `filter` / `fold` / `for_each` / `any` / `all`。迭代器是**惰性**的，只有遇到 `collect` / `sum` / `for` 等消费端才真正执行。

```rust
let v: Vec<_> = (1..=5).map(|x| x * x)
                       .filter(|x| x % 2 == 1)
                       .collect();
```

### 8. move 闭包 + `thread::spawn`

```rust
let data = vec![1, 2, 3];
let h = std::thread::spawn(move || {
    println!("{:?}", data);
});
h.join().unwrap();
```

子线程寿命可能**超过**父函数栈，所以 `thread::spawn` 要求闭包是 `'static + Send`——即闭包内部不能借用调用者栈上的东西。把所有权 `move` 进子线程，让子线程独立持有这些数据，是跨线程最常见的必要条件。`join().unwrap()` 用来等子线程结束，并在子线程 panic 时把错误暴露出来。

## 运行

```bash
cargo run -p l07_closures
```

输出会依次显示 4 个章节的 demo：基础语法、三种 trait、作参数/返回值、迭代器与线程。
