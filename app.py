from flask import Flask, jsonify, request, send_from_directory
import os
import json
from datetime import datetime

app = Flask(__name__)
DATA_FILE = './data/vnc.conf'
TOKENS_FILE = './data/token/vnc_tokens.conf'
USER_FILE = './data/user.conf'

# 确保 data 文件夹和 vnc.conf 文件存在
if not os.path.exists('./data'):
    os.makedirs('./data')
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as file:
        json.dump([], file)  # 初始化为空 JSON 数组
if not os.path.exists(TOKENS_FILE):
    with open(TOKENS_FILE, 'w') as file:
        pass  # 初始化为空文件
# 初始化 user.conf
if not os.path.exists(USER_FILE):
    with open(USER_FILE, 'w') as file:
        json.dump({'username': 'admin', 'password': 'password'}, file)  # 初始用户信息

# 读取用户信息
def load_user():
    try:
        with open(USER_FILE, 'r') as file:
            return json.load(file)
    except json.JSONDecodeError:
        return {'username': 'admin', 'password': 'password'}  # 处理 JSON 错误

# 读取所有主机信息
def load_hosts():
    with open(DATA_FILE, 'r') as file:
        return json.load(file)

# 保存主机信息到 vnc.conf
def save_hosts(hosts):
    with open(DATA_FILE, 'w') as file:
        json.dump(hosts, file, ensure_ascii=False, indent=4)

# 保存主机名称、主机地址和端口到 vnc_tokens.conf
def save_tokens(hosts):
    with open(TOKENS_FILE, 'w') as file:
        for host in hosts:
            token = f"{host['name']}: {host['network']}\n"
            file.write(token)
# 登录路由
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = load_user()
    if data['username'] == user['username'] and data['password'] == user['password']:
        return jsonify({'message': '登录成功'}), 200
    return jsonify({'message': '登录失败：密码错误'}), 401

# 修改密码路由
@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    user = load_user()
    
    if data['oldPassword'] != user['password']:
        return jsonify({'message': '原密码错误'}), 400

    if data['newPassword'] != data['repeatPassword']:
        return jsonify({'message': '新密码与重复密码不一致'}), 400

    user['password'] = data['newPassword']  # 更新密码
    with open(USER_FILE, 'w') as file:
        json.dump(user, file)  # 保存到文件

    return jsonify({'message': '密码已更改'}), 200

# 提供登录页面
@app.route('/')
def login_page():
    return send_from_directory('.', 'login.html')

# 提供主机列表页面
@app.route('/hosts')
def hosts_page():
    return send_from_directory('.', 'index.html')  # 确保这里指向主机列表页面

# 获取主机列表
@app.route('/api/assets', methods=['GET'])
def get_assets():
    hosts = load_hosts()
    return jsonify(hosts)

# 新建主机
@app.route('/api/assets', methods=['POST'])
def add_asset():
    data = request.get_json()
    data['create_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data['status'] = '运行中'

    hosts = load_hosts()
    
    # 检查是否有重复的主机名称
    if any(host['name'] == data['name'] for host in hosts):
        return jsonify({'message': '主机名称重复，无法创建'}), 400

    hosts.append(data)
    save_hosts(hosts)
    save_tokens(hosts)  # 保存到 vnc_tokens.conf 文件

    return jsonify({'message': '主机已添加', 'data': data})

# 更新主机信息
@app.route('/api/assets/<name>', methods=['PUT'])
def update_asset(name):
    hosts = load_hosts()
    for host in hosts:
        if host['name'] == name:
            host.update(request.json)  # 更新主机信息
            save_hosts(hosts)
            save_tokens(hosts)  # 保存到 vnc_tokens.conf 文件
            return jsonify({'message': '主机信息已更新'})
    return jsonify({'message': '主机未找到'}), 404

# 获取单个主机信息
@app.route('/api/assets/<name>', methods=['GET'])
def get_asset(name):
    hosts = load_hosts()
    host = next((host for host in hosts if host['name'] == name), None)
    if host:
        return jsonify(host)
    return jsonify({'message': '主机未找到'}), 404

# 删除主机
@app.route('/api/assets/<name>', methods=['DELETE'])
def delete_asset(name):
    hosts = load_hosts()
    hosts = [host for host in hosts if host['name'] != name]
    save_hosts(hosts)
    save_tokens(hosts)  # 保存到 vnc_tokens.conf 文件
    return jsonify({'message': f'主机 {name} 已删除'})



# 提供静态文件 (JS)
@app.route('/static/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6006, debug=True)
