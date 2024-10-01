# qL-desktop

[**English**](https://github.com/linzxcw/qL-desktop/main/README.md)&nbsp;&nbsp;&nbsp;[**简体中文**](https://github.com/linzxcw/qL-desktop/main/README_zh.md)

qL-desktop is a web client that allows you to remotely control all devices via a web page, enabling users to connect to their home or office devices anytime, anywhere. Compared to other remote software on the market, the biggest difference is that qL-desktop uses the open-source software [noVNC](https://github.com/novnc/noVNC), so you don't have to worry about privacy leaks.


qL-desktop is dedicated to providing the simplest operation to meet most needs.

Thanks to the advantages of the web client, you can not only use it on your local computer but also easily deploy it on a router or NAS.

Project address: https://github.com/linzxcw/qL-desktop


## usage method

1. Preparation (install vncserver on the controlled device)
   
    Windows：Install [UltraVNC](https://github.com/ultravnc/UltraVNC), run the UltraVNC software, find the UltraVNC icon in the lower right corner of the taskbar, right-click and select Admin Properties to set the password.

    Mac：Go to "System Preferences", then select "Sharing", check the "Screen Sharing" option, and set the password for VNC access.

    Linux：Install tigervnc-server, configure the user and password, and then start the vncserver service. See detailed tutorial
	      
3. Docker installation (recommended)

>Create a docker-compose.yml file
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
   
   >Note: User data is in the /qL-desktop/data folder. If you need to map it, first extract the initial [data](https://github.com/linzxcw/qL-desktop/releases/tag/v1.0.1/data.zip) folder to the installation directory, then run the container.
```bash   
      volumes:
         - ./data:/qL-desktop/data   
```
  
  >Create the container
```bash
docker compose up -d
```

3. Download binaries and installation packages from GitHub releases

>Ensure python is installed, recommended version is python3.8. Clone the code using git or download the compressed package from the project address
```bash
git clone https://github.com/linzxcw/qL-desktop.git
```
   
   >Install numpy and flask modules
```bash   
pip install numpy flask #不换源安装
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple numpy flask #换国内源安装
```

   >Run the command
```bash   
cd /qL-desktop
python -m websockify --web ./novnc --target-config=./data/token/vnc_tokens.conf 9001 & python app.py
```

4. Log in to the web page

  Open http://127.0.0.1:9001
  The default username and password are admin and password
  The default server address is http://server_ip:6006



## Interface Screenshot

<img src="https://s2.loli.net/2024/10/01/nHivCNbOTyE6omY.png" border="0">


## Notes

1. The program will not save any user data in the cloud. All user data is stored in the user's local configuration file.

2. **Do not use this project for illegal purposes.**

## Thanks

[ultravnc/UltraVNC](https://github.com/ultravnc/UltraVNC)

[novnc/noVNC](https://github.com/novnc/noVNC)


## LicenseLicense

[![License: AGPL v3-only](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
