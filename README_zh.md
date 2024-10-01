# qL-desktop

[**English**](https://github.com/linzxcw/qL-desktop/main/README.md)&nbsp;&nbsp;&nbsp;[**简体中文**](https://github.com/linzxcw/qL-desktop/main/README_zh.md)

qL-desktop 是一个网页就能远程控制所有设备的web客户端，让用户随时随地连接家里或公司的设备。与市面上其他远程软件相比，最大不同的是：qL-desktop使用 [noVNC](https://github.com/novnc/noVNC)开源软件实现，不用担心隐私被泄露。

qL-desktop 致力于提供最简单的操作，满足绝大部分需求。

得益于 Web 客户端的优势，你不仅可以将其用于本地计算机，还可以轻松地将它部署在路由器或 NAS 上。

项目地址：https://github.com/linzxcw/qL-desktop


## 使用方法

qL-desktop 主要提供了下述使用方法：
1. 准备工作（被控设备安装vncserver）
   
    windows：安装[UltraVNC](https://github.com/ultravnc/UltraVNC)，运行UltraVNC软件，在任务栏右下角找到UltraVNC的图标，右键点击选择Admin Properties设置密码。

    mac：进入“系统偏好设置”，然后选择“共享”，勾选“屏幕共享”选项，设置VNC连入的密码。

    Linux：安装tigervnc-server，配置用户和密码后启动vncserver服务。[详见教程](https://blog.csdn.net/u013105927/article/details/135550558)
	      
2. docker安装（推荐）

   创建docker-compose.yml文件
   `version: "3.8"
      services:
        qldesktop: 
             container_name: qL-desktop
             environment:
                   - TZ=Asia/Shanghai
             image: qldesktop
             restart: always
             ports:
                   - 9001:9001
                   - 6006:6006`

8. 从 GitHub releases 下载二进制与安装包

详见 [**qL-desktop - Docs**](https://qL-desktop.org/docs/prologue/introduction/)


## 界面截图

<img src="https://i.loli.net/2020/04/19/kp2oedPiSzVwgHJ.png" border="0">


## 注意

1. 程序不会将任何用户数据保存在云端，所有用户数据存放在用户本地配置文件中。

2. **不要将本项目用于不合法用途。**

## 感谢

[hq450/fancyss](https://github.com/hq450/fancyss)

[ToutyRater/v2ray-guide](https://github.com/ToutyRater/v2ray-guide/blob/master/routing/sitedata.md)

[nadoo/glider](https://github.com/nadoo/glider)

[Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat)

[zfl9/ss-tproxy](https://github.com/zfl9/ss-tproxy/blob/master/ss-tproxy)

## 协议

[![License: AGPL v3-only](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
