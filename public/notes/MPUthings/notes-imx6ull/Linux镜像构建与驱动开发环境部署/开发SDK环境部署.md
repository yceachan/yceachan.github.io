![image-20251225124152722](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/image-20251225124152722.png)

- Uboot ： 编译uboot
- Linux-4.98 ：kernel源码，编译kernel镜像
- Buildroot :编译根文件系统。
- Busybox：一套构建根文件系统可以用到的linux命令集，buildroot依赖工具
- ToolChain：`arm-buildroot-linux-gnueabihf`交叉编译链。



在基于buildroot根文件系统，厂家的SDK中一般都会给出以下配置号的工程和工具链：

- 可编译出适用于开发板uboot 引导 的uboot项目
- 一份适合开发板平台，**设备树信息完善**的KERNEL 源码
- buildroot构建系统 与busybox工具集
- arm-linux-eabihf-gcc 交叉编译工具链。
- 

?> 我怎么傻乎乎地从就虚拟就上sftp down一份下来，100ask imx6ull开发板将这部分BSP 部署在git仓库<？

![image-20251225234756949](C:\Users\yceachan\AppData\Roaming\Typora\typora-user-images\image-20251225234756949.png)



获取这份buildroot 的SDK 后，配置好交叉编译链，即可将KERN源码包含到当前工作区，开始基于module 的驱动开发了



---

```make
#给出一份module 的makefile 模板
```



