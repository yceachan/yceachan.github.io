拉普拉斯变换

- 本章核心：

  >  ![image-20251227175156543](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227175156543.png)

# $e^x 的定义 和e^{st} 的推广$

1. $e^{x}$  的微积分定义为，一阶导等于原函数的函数模式，其泰勒展开的描述为

   ![image-20251227163420805](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227163420805.png)

2. 推广到位置矢量与速度矢量的，速度矢量总等于位置矢量，$\frac{d}{dt}e^{xt}$ 描述在一维坐标下的指数增长/衰减模型。

3. 考虑引入`s=a+bi` 的复平面位置矢量描述；$\frac{d}{dt}e^{it} = ie^{it}；i(a+bi)= -b+ai$ ，**对复平面位矢乘i 的几何意义是逆时针旋转90度。** 故而，推广到$\frac{d}{dt}e^{it}$ ,一阶导速度矢量，总与位置矢量垂直，**故而运动轨迹是圆**

4. 推广到$e^{st}=e^{at}e^{bit}$ ，这引入了一个实数项的衰减因子，在s平面上考虑$e^{st}$

# s平面

应考虑在`s=a+bi` 平面上，每个点都表征了一个$e^{st}$ 函数。他**的实数项描述了模长，虚数项描述了在实数域的投影**，即：

$e^{st} = e^{at}e^{bjt}$   **实数项描述衰减因子，叙述项描述振荡（旋转）因子**    

![image-20251227162244919](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227162244919.png)

# $\frac{d}{dt}e^{st}=se^{st} 微分方程$

- 考虑弹簧微分方程模型：

  ![image-20251227164219524](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227164219524.png)
  $$
  F=mx''(t) = -kx(t) - ux'(t) \\
  k：胡克常数，表明与位置矢量一阶相关的阻力； \\
  u：表明速度越快，阻尼抵抗力约强,对运动阻力的一阶近似
  $$

  > **x，v不同初值条件的解:**
  >
  > ![image-20251227165237039](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227165237039.png)
  >
  > - **对于这样一群解，找出一个通用的解模式是必要的**
  >
  > sovle trick： 猜想解函数的模式为:
  >
  >  <img src="https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227165440149.png" alt="image-20251227165440149" style="zoom:25%;" />

## $x=e^{st} 的函数模式对微分方程的贡献$

 <img src="https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227165625539.png" alt="image-20251227165625539" style="zoom: 33%;" />

$e^{st} !=0 , ms^2 + us + k =0$ 考虑简化的无阻尼模型,$s=\pm\sqrt{-k/m} ,m，k>0，故s=\pm i\sqrt{k/m}$

 **旋转因子i 已经入局。** ,$x=e^{st}=e^{\pm iwt},w=\frac{k}{m}$

- Q：显然弹簧的位移需要有个实函数解？

- A: $e^{iwt}描述的旋转/震荡 符合期望的结果$ 。

  > <img src="https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227170315048.png" alt="image-20251227170315048" style="zoom:25%;" />

- 直觉1： **复函数解的实步部分，就是我们期望的实函数解，**$x(t)=Re[e^{iwt}] $  事实上是一个余弦函数，且角速度为w

- 注意力惊人1：对于旋转因子$e^{iwt} +e^{-iwt} =2coswt$

  即，将此**线性微分方程的两个复函数解叠加（推广到线性组合），得出了一个实函数解**

  **即，$x(t)=Ae^{jwt}  + Be^{-jwt}$ 是函数的通解**

  

  > 描述1： $e^{jwt} 和e^{-jwt}$ 线性无关/正交，可以作为解空间的一个基
  >
  > 描述2 ： 线性方程的解可叠加原理不再赘述
  >
  > 描述3： A=B时，两个**正交**的s平面位矢叠加，组成了了在**实数轴上震荡**的**实数位矢**
  >
  > - ![image-20251227171604636](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227171604636.png)
  >
  > 描述4 ： 引入$x= e^{st} 的 solve \ trick$  的依据：
  >
  > **尝试`x=coswt` 的解模式是有依据的，而$e^{jwt}和e^{=jwt}$ 恰好能线性组合为三角函数**
  >
  > ![image-20251227171907487](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227171907487.png)
  >
  > 
  >
  > 描述5 ： 三角函数的解模式足够应付所有实数解，**而引入复函数解，则可以处理阻尼存在的情景，来描述x=运动/振幅 的衰减**

## 阻尼u存在时的解模式

![ ](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227172458296.png)

![image-20251227172620565](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227172620565.png)

**这样的复函数解的实部模式符合我们的期望**

# $x=e^{st} 模式在高阶微分方程的推广$

![](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227172859401.png)

![image-20251227172921775](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227172921775.png)

- 将$s=sn$的解带入x ，我们得到了一系列的解空间的基， 他们可以乘任意的实数或复数 系数，再线性组合为x的任意解

  >  **c1,c2,c...是我们可以任意操控的实数/复数旋钮**
  >
  > ![image-20251227173414857](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227173414857.png)

- 对微分方程的如此研究表明，现实世界的复杂函数可以被分解为 $e^{st} $ 的线性组合

  >  <img src="https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227173839840.png" alt="image-20251227173839840" style="zoom: 33%;" />
  >
  > - 甚至s的取值范围时s平面上连续的轨迹，把情景推广到积分——他的强大无以言喻
  >
  >  <img src="https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251227173925923.png" alt="image-20251227173925923" style="zoom:33%;" />
  >
  > 