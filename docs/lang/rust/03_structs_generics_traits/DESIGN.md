---
title: 03 结构体、泛型、Trait
tags: [rust, struct, generics, trait, impl]
desc: 三种结构体/元组/impl 方法/泛型/trait 与 trait 对象/derive
update: 2026-04-24
---


# 结构体、泛型、Trait

> [!note]
> **Ref:** 本包源码 `src/structs_basics.rs`、`src/generics.rs`、`src/traits_static.rs`、`src/traits_dyn.rs`

本包是学习路线中 **数据建模 + 行为抽象** 的一站，目标是把面向对象语言里
"class / interface" 的直觉重新映射到 Rust 的 struct / trait 模型上。

## 模块组织

| 文件 | 主题 |
| --- | --- |
| `src/main.rs` | 声明 4 个子模块并依次 `demo()` |
| `src/structs_basics.rs` | 三种 struct、元组、impl 方法、关联函数 |
| `src/generics.rs` | 泛型 struct、泛型函数、`where` 子句 |
| `src/traits_static.rs` | trait 定义、默认方法、trait bound（静态派发） |
| `src/traits_dyn.rs` | `Box<dyn Trait>` 异构容器（动态派发） |

## 1. 三种结构体 + 元组

Rust 的"结构体"家族有三种形态：

```rust
// 1) 普通 struct —— 字段有名字
struct Point { x: f64, y: f64 }

// 2) 元组结构体 —— 字段匿名，按下标访问；常用于 newtype 模式
struct Wrapper(i32, i32);
struct Meters(f64);
struct Seconds(f64);   // 和 Meters 编译期就区分开，防止混用

// 3) 单元结构体 —— 没有字段，纯类型标记
struct Marker;
```

原生元组 `(i32, &str, bool)` 和元组结构体的关键区别：元组 **没有名字**，
而元组结构体是一个 **具名新类型**，因此可以给它挂 impl、trait。

## 2. impl 方法与 self 三态

```rust
impl Point {
    pub fn new(x: f64, y: f64) -> Self { Self { x, y } } // 关联函数（构造器）
    pub fn distance(&self, other: &Point) -> f64 { /* 只读借用 */ }
    pub fn translate(&mut self, dx: f64, dy: f64) { /* 可变借用 */ }
    pub fn into_tuple(self) -> (f64, f64) { /* 消耗 self */ }
}
```

- `&self` 只读借用，最常见。
- `&mut self` 可变借用，修改字段。
- `self` 按值消耗，调用后原变量不可再用，通常用于"转换"。
- **关联函数**不带 `self`，通过 `Point::new(...)` 调用，习惯上作为构造器。

## 3. 泛型与单态化

```rust
struct Pair<T> { a: T, b: T }

impl<T: Clone> Pair<T> {
    fn cloned_pair(&self) -> (T, T) { (self.a.clone(), self.b.clone()) }
}

impl<T: PartialOrd + Copy> Pair<T> {
    fn larger(&self) -> T { if self.a >= self.b { self.a } else { self.b } }
}
```

Rust 的泛型是 **单态化（monomorphization）**：
编译期为每个具体 `T` 生成一份专属代码，因此 **零运行时开销**，
但会造成二进制体积膨胀。这是"以空间换时间"的经典取舍。

## 4. Trait：接口 + 默认方法

```rust
trait Greet {
    fn name(&self) -> &str;
    fn hello(&self) -> String {            // 默认实现
        format!("Hello, {}!", self.name())
    }
}
```

两种使用方式：

- **静态派发（泛型 bound）**：`fn announce<T: Greet>(x: &T)`，
  编译期按具体类型展开，零开销。
- **动态派发（trait 对象）**：`fn print_shape(s: &dyn Shape)`，
  通过 vtable 间接调用，支持异构集合。

## 5. Trait 对象 `dyn Trait`

```rust
let shapes: Vec<Box<dyn Shape>> = vec![
    Box::new(Circle { r: 1.5 }),
    Box::new(Square { side: 3.0 }),
];
```

- `dyn Trait` 本身是 `!Sized`，不能按值持有，必须走胖指针：
  `&dyn Trait` / `&mut dyn Trait` / `Box<dyn Trait>` / `Rc<dyn Trait>`。
- 胖指针 = 数据指针 + vtable 指针。
- **object-safety**：若 trait 里某个方法返回 `Self`，或带泛型参数，
  该 trait 就做不成 trait object；只能继续用泛型。

## 6. 静态派发 vs 动态派发

| 维度 | 泛型 + bound（static） | `dyn Trait`（dynamic） |
| --- | --- | --- |
| 派发方式 | 编译期直接 call | 运行时 vtable 跳转 |
| 性能 | 最佳，可内联 | 多一次指针间接 |
| 二进制体积 | 按 T 膨胀 | 一份代码复用 |
| 异构容器 | 不支持 | `Vec<Box<dyn Trait>>` 天然支持 |
| 典型场景 | 热路径、库函数 | 插件式架构、运行期选型 |

## 7. derive 宏

`#[derive(Debug, Clone, Copy, PartialEq)]` 让编译器自动生成对应 trait 的 impl。
例如 `Debug` 大致展开为：

```rust
impl std::fmt::Debug for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Point")
         .field("x", &self.x)
         .field("y", &self.y)
         .finish()
    }
}
```

使用时可以 `println!("{:?}", p)`，更美观则 `{:#?}`。

## 8. `impl` 关键词全景

`impl` 是 Rust 里语法承载量最大的关键字之一——既是**类型扩展点**，又是
**trait 实现入口**，还能在类型位置当作**存在类型**用。
理解它能"插"哪些原语，等于把 trait 系统的边界一次性看清。

### 8.1 两种语法位置

```rust
// (a) 项级 impl —— 块声明
impl Type { ... }
impl Trait for Type { ... }

// (b) 类型级 impl Trait —— 类型位置（存在类型 / 泛型糖）
fn foo() -> impl Iterator<Item = i32>     // RPIT
fn bar(x: impl Display)                    // APIT
type Fut  = impl Future<Output = ()>;      // TAIT (1.75+)
trait X { fn f() -> impl Send; }           // RPITIT (1.75+)
```

这两种 `impl` **是不同的语法类别**，不要混为一谈：前者是"挂载行为"，
后者是"匿名类型 + 一组约束"。

### 8.2 项级 `impl` 的可组合原语

| 维度 | 形态 | 例子 |
| --- | --- | --- |
| 类型参数 | `<T>` | `impl<T> Vec<T> { }` |
| 生命周期 | `<'a>` | `impl<'a> Foo<'a> { }` |
| const 泛型 | `<const N: usize>` | `impl<const N: usize> Buf<N> { }` |
| 行内 bound | `:` | `impl<T: Clone + Send> Foo<T> { }` |
| `where` 子句 | `where ...` | `impl<T> Foo<T> where T::Item: Debug { }` |
| HRTB | `for<'a>` | `where F: for<'a> Fn(&'a str)` |
| `?Sized` | 解除 Sized 默认 | `impl<T: ?Sized> Foo for Box<T> { }` |
| `unsafe impl` | unsafe trait 必须 | `unsafe impl Send for MyType { }` |
| 负向 impl | `!Trait`（主要 auto trait） | `impl !Send for MyType { }` |
| 关联项 | `const` / `type` / `fn` | 见下例 |

```rust
impl Foo {
    const N: usize = 10;          // 关联常量
    type Alias = Vec<i32>;         // 关联类型（trait impl 内）
    async fn op(&self) { }         // async fn（AFIT 已稳定）
    const fn build() -> Self { /* ... */ } // const fn
    unsafe fn raw(&self) { }       // unsafe fn
}
```

### 8.3 能被 `impl` 的"接收者"

`impl Trait for X` 中的 `X` 不止是自定义 struct/enum，还可以是：

```rust
impl MyTrait for i32 { }                          // 原语类型
impl MyTrait for (A, B) { }                       // 元组
impl<T, const N: usize> MyTrait for [T; N] { }    // 定长数组
impl<T> MyTrait for &T { }                        // 引用类型
impl MyTrait for fn(i32) -> i32 { }               // 函数指针
impl<F: Fn()> MyTrait for F { }                   // 闭包族（blanket impl）
impl dyn Error + Send + 'static { /* 固有方法 */ } // trait 对象本身
```

最后一个有点反直觉：**`dyn Trait` 也是一个类型**，可以有自己的固有方法
（标准库 `dyn Error` 的 `downcast_ref` 就是这么挂的）。

### 8.4 类型级 `impl Trait` 的组合

```rust
fn iter<'a>(v: &'a Vec<i32>)
    -> impl Iterator<Item = &'a i32> + Clone + Send + 'a + use<'a>
//                                                          ^^^^^^^^
//                                       precise capturing (1.82+ 稳定)
```

可叠加：多个 trait（`+`）、生命周期约束（`'a` / `'static`）、
关联类型绑定（`Item = T`）、`use<...>` 精准捕获泛型/生命周期。

| 出现位置 | 状态 |
| --- | --- |
| 函数返回 (RPIT) | ✅ 稳定 |
| 函数参数 (APIT) | ✅ 稳定（等价 `<T: Trait>`） |
| 类型别名 (TAIT) | ✅ 1.75+ |
| trait 方法返回 (RPITIT) | ✅ 1.75+ |
| `let` 绑定 / 结构体字段 | ❌ 不允许 |

### 8.5 三件「`impl Trait`」其实是不同的事

| 写法 | 本质 | 派发 |
| --- | --- | --- |
| `impl Trait for T { }` | 实现声明 | —— |
| `fn f() -> impl Trait` | 存在类型，编译期单一具体类型 | 静态 |
| `fn f(x: impl Trait)` | 泛型糖（≡ `<T: Trait>`） | 静态（单态化） |
| `&dyn Trait` / `Box<dyn Trait>` | trait 对象（**对照**，非 `impl Trait`） | 动态（vtable） |

注意：`fn f(x: dyn Trait)` **不能编译**——`dyn Trait` 是 `!Sized`，
必须套一层指针/容器（`&` / `Box` / `Rc` / `&mut`）才能作为值传递。

### 8.6 硬约束：孤儿规则与一致性

```rust
impl ForeignTrait for ForeignType { }   // ❌ orphan rule
```

`impl Trait for Type` 必须满足：trait 或 type 至少一个在本 crate 内定义。
配合"同一 `(Trait, Type)` 全局唯一实现"的一致性（coherence）规则，
Rust 在编译期消灭了 C++ 多重特化和 Haskell 孤儿实例的二义性问题。

### 8.7 一句话收束

> `impl` 永远是"把一组能力挂载到一个类型上"——
> 类型可以是命名的、匿名的、动态的；能力可以是固有方法、trait 实现、
> 甚至 trait 对象的固有扩展。所有变体的差异，只是**挂载点的位置**不同。

## 9. 运行

```bash
cargo run -p l03_structs_generics_traits
```

预期零 error。
