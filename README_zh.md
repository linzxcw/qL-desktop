# qL-desktop

[**English**](https://github.com/linzxcw/qL-desktop/main/README.md)&nbsp;&nbsp;&nbsp;[**简体中文**](https://github.com/linzxcw/qL-desktop/main/README_zh.md)

qL-desktop 是一个网页就能远程控制所有设备的web客户端，让用户随时随地连接家里或公司的设备。与市面上其他远程软件相比，最大不同的是：qL-desktop使用 [noVNC](https://github.com/novnc/noVNC)开源软件实现，不用担心隐私被泄露。

qL-desktop 致力于提供最简单的操作，满足绝大部分需求。

得益于 Web 客户端的优势，你不仅可以将其用于本地计算机，还可以轻松地将它部署在路由器或 NAS 上。

项目地址：https://github.com/linzxcw/qL-desktop


## 使用方法

1. 准备工作（被控设备安装vncserver）
   
    windows：安装[UltraVNC](https://github.com/ultravnc/UltraVNC)，运行UltraVNC软件，在任务栏右下角找到UltraVNC的图标，右键点击选择Admin Properties设置密码。

    mac：进入“系统偏好设置”，然后选择“共享”，勾选“屏幕共享”选项，设置VNC连入的密码。

    Linux：安装tigervnc-server，配置用户和密码后启动vncserver服务。[详见教程](https://blog.csdn.net/u013105927/article/details/135550558)
	      
2. docker安装（推荐）

>创建docker-compose.yml文件
```bash
version: "3.8"
  services:
    qldesktop:
      container_name: qL-desktop
      environment:
         - TZ=Asia/Shanghai
      image: qldesktop
      restart: always
      ports:
         - 9001:9001
         - 6006:6006
```
   
   >注：用户数据在/qL-desktop/data文件夹中，如果需要映射，先解压初始data文件夹到安装目录，再运行容器。
```bash   
      volumes:
         - ./data:/qL-desktop/data   
```
  
  >创建容器
```bash
docker compose up -d
```

3. 从 GitHub releases 下载二进制与安装包

>确保安装了python，推荐版本python3.8，git拉取代码或项目地址下载压缩包
```bash
git clone https://github.com/linzxcw/qL-desktop.git
```
   
   >安装numpy和flask模块
```bash   
pip install numpy flask #不换源安装
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple numpy flask #换国内源安装
```

   >运行命令
```bash   
cd /qL-desktop
python -m websockify --web ./novnc --target-config=./data/token/vnc_tokens.conf 9001 & python app.py
```

4. 登录网页

  打开http://127.0.0.1:9001,用户名和密码默认是admin、password，服务器地址默认是 http://服务器ip:6006



## 界面截图

<img src="https://s2.loli.net/2024/10/01/nHivCNbOTyE6omY.png" border="0">


## 注意

1. 程序不会将任何用户数据保存在云端，所有用户数据存放在用户本地配置文件中。

2. **不要将本项目用于不合法用途。**

## 感谢

[ultravnc/UltraVNC](https://github.com/ultravnc/UltraVNC)

[novnc/noVNC](https://github.com/novnc/noVNC)


## 协议

[![License: AGPL v3-only](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
