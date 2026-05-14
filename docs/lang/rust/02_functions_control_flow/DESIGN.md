---
title: 02 函数与控制流
tags: [rust, functions, control-flow]
desc: 函数定义/发散函数/if 表达式/loop 与 for/控制流与所有权交互
update: 2026-04-24
---


# 函数与控制流

本包（`l02_functions_control_flow`）是 Rust 学习 workspace 的第二站，承接 `01_basics_ownership`，开始接触「控制流」与「函数」这两个最日常的语法单元。

与很多语言不同，Rust 把 **if、match、loop、块 `{}`** 都设计成**表达式**，整体会产出一个值。理解这一点是写出简洁 Rust 代码的关键。

---

## 文件结构

```
02_functions_control_flow/
├── Cargo.toml
├── DESIGN.md           （本文件）
└── src/
    ├── main.rs         入口，按顺序调用各子模块的 demo()
    ├── functions.rs    函数定义 & 发散函数
    ├── branching.rs    if / if let / match
    └── loops.rs        loop / while / while let / for
```

`main.rs` 顶部用 `mod` 声明子模块，`fn main()` 顺序调用三个 `pub fn demo()`。

---

## 1. 函数定义

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b   // 尾表达式（无分号）即返回值
}
```

要点：

- 函数名使用 **snake_case**（蛇形命名）。
- 每个参数都必须显式标注类型；局部 `let` 可以省略类型推断，函数签名不行。
- 返回值由 `->` 指定类型，函数体**最后一个表达式**（不带分号）即返回值。
- 需要中途返回时使用 `return expr;`，这是语句，通常带分号。
- 省略 `-> R` 等价于 `-> ()`（unit 类型）。

**表达式 vs 语句**：

- `a + b`        是表达式，有值。
- `a + b;`       加了分号变成语句，语句的值是 `()`。
- 在需要返回 `i32` 的函数末尾写 `a + b;`，编译器会报 `expected i32, found ()`。

---

## 2. 发散函数 `-> !`

形如：

```rust
fn diverges_by_panic() -> ! {
    panic!("never return");
}

fn diverges_by_loop() -> ! {
    loop { /* 无 break */ }
}
```

- `!` 叫 **never type**，表示“永远不会正常返回到调用处”。
- `!` 可以被强制转换为**任意类型**，这让下面的写法合法：

  ```rust
  let x: i32 = panic!("oops");     // 合法
  let v: u32 = match opt {
      Some(v) => v,
      None    => panic!("no value"), // 这一支类型是 !，与 u32 协调
  };
  ```

- 常见的返回 `!` 的宏：`panic!`、`todo!()`、`unimplemented!()`、`unreachable!()`，以及 `std::process::exit`。

**本 demo 的安全做法**：真的调用 `diverges_by_panic()` 会让程序崩掉，所以用 `if false { ... }` 守护仅做类型演示，并用 `{:p}` 打印函数指针地址证明它存在。

---

## 3. if / if let / match 作为表达式

### 3.1 if 作为表达式

```rust
let x = if cond { 1 } else { 2 };
```

- 条件必须是 `bool`，Rust 没有“非零即真”。
- 每个分支的**类型必须一致**，否则 `if` and `else` have incompatible types。
- 尾表达式无分号 = 分支返回值。

### 3.2 if let 语法糖

```rust
if let Some(v) = opt {
    println!("got {v}");
} else {
    println!("none");
}
```

等价的 match：

```rust
match opt {
    Some(v) => { println!("got {v}"); }
    _       => { println!("none"); }
}
```

**糖衣意义**：当只关心“匹配某一种模式”时，`if let` 比 `match` 更简洁；代价是不再强制穷尽所有可能。

### 3.3 match 作为表达式（04 会深入）

```rust
let label = match n {
    0       => "zero",
    1..=9   => "single digit",
    _       => "other",
};
```

- 要求**穷尽**（exhaustive），用 `_` 兜底。
- 所有手臂返回值类型必须一致。

---

## 4. loop / while / while let / for

### 4.1 loop + break 返回值

```rust
let result = loop {
    if cond { break 42; }  // break 后的值 = loop 表达式的值
};
```

- `loop` 是少数可以“返回值”的循环，靠 `break expr;`。
- `while` 和 `for` 整体类型固定是 `()`，不能 `break value`。

### 4.2 循环标签

```rust
'outer: for i in 0..5 {
    for j in 0..5 {
        if i * j == 6 { break 'outer; }
    }
}
```

- 标签以单引号开头（和生命周期同形但含义不同）。
- 可用 `break 'label` / `continue 'label` 跨层跳转。

### 4.3 while let 糖衣

```rust
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    // 只要 pop() 返回 Some 就继续，返回 None 时退出
}
```

等价于用 `loop + match` 手写“匹配失败就 break”。

### 4.4 for-in 与 Range

- `0..5` 是半开区间 `[0,5)`。
- `0..=5` 是闭区间 `[0,5]`。
- 带索引遍历：`for (i, v) in xs.iter().enumerate() { ... }`。

---

## 5. 控制流与所有权

`for` 循环是最容易踩所有权坑的地方：

| 写法                  | 元素类型     | 容器之后是否可用 |
| --------------------- | ------------ | ---------------- |
| `for x in v`          | `T`（move）  | 不可用（已 move）|
| `for x in &v`         | `&T`         | 可用             |
| `for x in &mut v`     | `&mut T`     | 可用，可修改元素 |
| `for x in v.iter()`   | `&T`         | 可用             |
| `for x in v.iter_mut()` | `&mut T`  | 可用，可修改元素 |
| `for x in v.into_iter()` | `T`      | 不可用（等价 move）|

经验法则：

- 只读访问 → `&v` 或 `v.iter()`。
- 需要修改元素 → `&mut v` 或 `v.iter_mut()`。
- 想要获得每个元素的所有权（比如把 `Vec<String>` 拆成若干 `String`）→ `for s in v`。

---

## 6. 运行方式

在 workspace 根执行：

```bash
cargo run -p l02_functions_control_flow
```

程序会依次执行 `functions::demo()`、`branching::demo()`、`loops::demo()`，最后打印 `== 02_functions_control_flow: all demos finished ==`。

发散函数不会被真实调用，程序正常结束不会 panic。
