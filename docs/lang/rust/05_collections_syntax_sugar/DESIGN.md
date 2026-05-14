---
title: 05 容器、集合与语法糖
tags: [rust, collections, vec, string, hashmap, iterator]
desc: Vec/String/HashMap/HashSet/BTreeMap/VecDeque/迭代器/range/?/宏
update: 2026-04-24
---


# 容器、集合与语法糖

本模块 `l05_collections_syntax_sugar` 覆盖 Rust 标准库中最常用的容器类型，
以及初学者最容易困惑的几类“语法糖”。目标：看完并运行 `cargo run` 以后，
对 `Vec / String / HashMap / 迭代器链 / range / ? / 宏` 有一套可直接动手的心智模型。

## 目录结构

```
05_collections_syntax_sugar/
├── Cargo.toml
├── DESIGN.md
└── src/
    ├── main.rs                    # 串起 5 个 demo
    ├── vec_string.rs              # Vec<T> + String/&str
    ├── maps_sets.rs               # HashMap / HashSet / BTreeMap / BTreeSet / VecDeque
    ├── ranges_and_underscore.rs   # `..` / `..=` / `_` / `?` 一瞥
    ├── iterators.rs               # 迭代器链 + turbofish
    └── macros_and_desugar.rs      # 宏一览 + for-in 脱糖
```

每个模块均暴露 `pub fn demo()`，在 `main.rs` 中按顺序调用。

## 核心要点

### 1. `Vec<T>`

- 构造：`Vec::new()` / `vec![1,2,3]`（宏，编译期展开）
- 变更：`push / pop`；`pop` 返回 `Option<T>`
- 访问：`v[i]` 越界 panic；`v.get(i)` 返回 `Option<&T>`，更安全
- 迭代三形态：
  - `v.iter()`      → `Item = &T`，只读
  - `v.iter_mut()`  → `Item = &mut T`，就地改
  - `v.into_iter()` → `Item = T`，move 掉 `v`
- 切片：`&v[1..3]` / `&v[..3]` / `&v[3..]` / `&v[..]`，类型都是 `&[T]`

### 2. `String` vs `&str`

| 项目 | `String` | `&str` |
|---|---|---|
| 所有权 | 拥有 | 借用 |
| 堆分配 | 是（可变长度） | 否（指向已有内存） |
| 可变 | 可以 push / 扩容 | 不可（不可变借用视图） |
| 典型来源 | `String::from(..)`、`.to_string()`、`.to_owned()` | 字符串字面量、`&s`、`s.as_str()` |

经验法则：**函数形参优先写 `&str`，不要写 `&String`**。`&str` 同时接受字面量、
`String` 的借用、其它切片，兼容面最广。

拼接的坑：

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world");
let s3 = s1 + &s2; // 左边 String 被 move，右边必须是 &str
```

`+` 的签名约为 `fn add(self, other: &str) -> String`，所以 `s1` 会被 move 掉，
而 `s2` 必须通过 `&s2` 借用为 `&str`。若嫌麻烦，`format!("{}{}", s1, s2)` 不 move
任何参数，更直观。

### 3. `HashMap` / `HashSet` / `BTreeMap` / `BTreeSet` / `VecDeque`

选型速查：

| 容器 | 复杂度 | 顺序 | 何时用 |
|---|---|---|---|
| `HashMap<K,V>`  | 平均 O(1) | 无序 | 最通用的键值映射 |
| `BTreeMap<K,V>` | O(log n) | 按 key 有序 | 需要有序遍历 / 范围查询 |
| `HashSet<T>`    | 平均 O(1) | 无序 | 去重 / 成员测试 |
| `BTreeSet<T>`   | O(log n) | 有序 | 有序集合 |
| `VecDeque<T>`   | 两端均摊 O(1) | 插入顺序 | 双端队列 / BFS 队列 |

特别推荐掌握 `HashMap` 的 **`entry` API**：

```rust
*counter.entry(word).or_insert(0) += 1;
```

这是 Rust 里写计数器最地道的一行。

### 4. 语法糖速览

- **`a..b` / `a..=b`**：半开 / 闭区间。既可用于 `for i in 0..n`，也可用于
  切片下标 `&v[..3]`、`&v[1..=3]`。
- **`_`**：
  - 丢弃绑定：`let _ = some_expr;`
  - 模式忽略：`let (a, _, c) = tup;`
  - 推断类型：`Vec<_>`
  - match 默认分支：`_ => ...`
  - 抑制 unused 警告：`let _name = ...;`
- **`?`**：对 `Result` 是“是 `Ok(v)` 取出 `v`，是 `Err(e)` 直接 return `Err(e.into())`”；
  对 `Option` 类似，`None` 时提前 return `None`。要求当前函数返回 `Result` / `Option`。
  详细版在 06 模块里讲。
- **turbofish `::<>`**：当编译器无法从上下文推断泛型参数时用它。
  最常见：`"42".parse::<i32>()`、`collect::<Vec<_>>()`。

### 5. 迭代器链

Rust 迭代器是惰性的：`.map / .filter / .take` 只是把一个迭代器包成另一个。
真正驱动循环的是 **终结子 (consumer)**：`collect / sum / count / fold / for_each / ...`。

一条典型链：

```rust
let even_squares: Vec<i32> = xs.iter()
    .filter(|x| **x % 2 == 0)   // Item = &i32
    .map(|x| x * x)             // Item = i32
    .collect();                 // 把迭代器“物化”成 Vec<i32>
```

`fold(init, f)` 是最通用的规约，`sum()` / `product()` 本质都是它的特例。

### 6. `for x in xs` 的脱糖

```rust
for x in xs { body }

// 概念等价于：
match IntoIterator::into_iter(xs) {
    mut __it => loop {
        match __it.next() {
            Some(x) => { body }
            None    => break,
        }
    }
}
```

三种写法差别只在 `IntoIterator` 调的哪个 impl：

- `for x in xs`      → `IntoIterator for Vec<T>`，move，`Item = T`
- `for x in &xs`     → `IntoIterator for &Vec<T>`，借用，`Item = &T`
- `for x in &mut xs` → `IntoIterator for &mut Vec<T>`，可变借用，`Item = &mut T`

### 7. 宏不是函数

`println!` / `format!` / `vec!` / `write!` 后面都带 `!`。它们在**编译期展开**，
因此能做普通函数做不到的事：

- 接受可变数量 / 异质类型的参数
- 对格式字符串做编译期检查（参数数量、类型不匹配会报错）
- 生成任意代码片段（`vec![1,2,3]` 展开成若干 `push`）

## 验证

```bash
cargo run -p l05_collections_syntax_sugar
```

所有 demo 按顺序打印，无 error、无 warning。
