document.addEventListener('DOMContentLoaded', function() {
    loadAssets();


    // 显示新建主机的弹窗
    document.getElementById('addButton').addEventListener('click', function() {
        clearForm();  // 清除表单内容
        showModalForm();
    });

    // 处理下拉菜单显示与隐藏
    const dropdownButton = document.getElementById('dropdownMenuButton');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // 点击按钮时，显示或隐藏下拉菜单
    dropdownButton.addEventListener('click', function() {
        dropdownMenu.classList.toggle('show');
    });

    // 点击页面其他部分时，隐藏下拉菜单
    document.addEventListener('click', function(event) {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 提交新建或编辑主机表单
    document.getElementById('hostForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const editingHostId = document.getElementById('editingHostId').value;
        const hostData = {
            name: document.getElementById('hostName').value,
            protocol: 'vnc',
            network: document.getElementById('hostAddress').value + ':' + document.getElementById('hostPort').value,
            owner: 'admin',
            password: document.getElementById('password').value,    // 新增密码字段
            serverAddress: document.getElementById('serverAddress').value  // 新增服务器地址字段
        };

        // 检查名称重复
        fetch('/api/assets')
            .then(response => response.json())
            .then(data => {
                if (!editingHostId && data.some(host => host.name === hostData.name)) {
                    // 显示错误信息而不是弹窗提醒
                    alert("主机名称重复，无法创建");
                    return;
                }

                if (editingHostId) {
                    updateHost(editingHostId, hostData);
                } else {
                    addNewHost(hostData);
                }
            });

        closeModalForm();
    });

    // 批量删除主机
    document.getElementById('deleteSelectedButton').addEventListener('click', function() {
        const selectedHosts = Array.from(document.querySelectorAll('.selectHost:checked')).map(checkbox => checkbox.value);
        selectedHosts.forEach(hostName => {
            deleteHost(hostName);
        });
    });

    // 全选/取消全选功能
    document.getElementById('selectAll').addEventListener('click', function(event) {
        const checkboxes = document.querySelectorAll('.selectHost');
        checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
    });

    // 关闭弹窗按钮功能
    document.getElementById('closeModalButton').addEventListener('click', function() {
        closeModalForm();
    });
});

// 加载主机列表
function loadAssets() {
    fetch('/api/assets')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('hostTable');
            tbody.innerHTML = '';
            data.forEach(asset => {
                const row = `
                    <tr>
                        <td><input type="checkbox" class="selectHost" value="${asset.name}"></td>
                        <td>${asset.name}</td>
                        <td>${asset.protocol}</td>
                        <td>${asset.network}</td>
                        <td>${asset.status}</td>
                        <td>${asset.owner}</td>
                        <td>${asset.create_time}</td>
                        <td>
                            <button class="btn btn-success" onclick="connectHost('${asset.name}', '${asset.password}', '${asset.serverAddress}')">连接</button> 
                            <button class="btn btn-primary" onclick="editHost('${asset.name}')">编辑</button>
                            <button class="btn btn-danger" onclick="deleteHost('${asset.name}')">删除</button>
                        </td>
                    </tr>`;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        });
}

// 新建主机
function addNewHost(hostData) {
    fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostData)
    })
    .then(loadAssets);
}

// 更新主机信息
function updateHost(hostName, hostData) {
    fetch(`/api/assets/${hostName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostData)
    })
    .then(loadAssets);
}

// 删除主机
function deleteHost(hostName) {
    fetch(`/api/assets/${hostName}`, { method: 'DELETE' })
    .then(loadAssets);
}

// 编辑主机
function editHost(hostName) {
    fetch(`/api/assets/${hostName}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('hostName').value = data.name;
            document.getElementById('hostAddress').value = data.network.split(':')[0];
            document.getElementById('hostPort').value = data.network.split(':')[1];
            document.getElementById('password').value = data.password;  // 填充密码字段
            document.getElementById('serverAddress').value = data.serverAddress;  // 填充服务器地址字段
            document.getElementById('editingHostId').value = data.name;  // 设置编辑中的主机名称
            showModalForm();
        });
}

// 连接主机
function connectHost(hostName, password, serverAddress) {
    // 生成目标 URL
    const url = `http://${serverAddress}/vnc.html?path=websockify/?token=${hostName}&password=${password}`;
    console.log(`连接到主机 ${hostName}: ${url}`);
    
    // 在新标签页中打开该 URL
    window.open(url, '_blank');
}


// 清除表单内容
function clearForm() {
    document.getElementById('hostName').value = '';
    document.getElementById('hostAddress').value = '';
    document.getElementById('hostPort').value = '';
    document.getElementById('password').value = '';  // 清空密码字段
    document.getElementById('serverAddress').value = '';  // 清空服务器地址字段
    document.getElementById('editingHostId').value = '';  // 清除编辑ID
}

// 显示弹窗
function showModalForm() {
    document.getElementById('modalForm').style.display = 'block';
}

// 关闭弹窗
function closeModalForm() {
    document.getElementById('modalForm').style.display = 'none';
}
