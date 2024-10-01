# 使用 Python基础镜像
FROM python:3.8-slim

# 设置工作目录为 a 文件夹
WORKDIR /qL-desktop

# 复制当前目录内容到镜像中的工作目录
COPY . /qL-desktop

# 安装所需的 Python 模块
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple numpy flask

# 暴露需要使用的端口
EXPOSE 9001
EXPOSE 6006
# 容器启动时执行的命令
CMD ["bash", "-c", "python -m websockify --web ./novnc --target-config=./data/token/vnc_tokens.conf 9001 & python app.py"]
