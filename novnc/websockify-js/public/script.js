document.getElementById('connect').addEventListener('click', function () {
    const host = document.getElementById('host').value;
    const port = document.getElementById('port').value;

    // 生成 WebSocket URL
    const vncUrl = `ws://${window.location.hostname}:9005/websockify?target=${host}:${port}`;

    // 创建 WebSocket 连接
    const socket = new WebSocket(vncUrl);

    socket.onopen = function () {
        console.log('Connected to the VNC server via WebSocket.');
        // 在这里可以进行后续操作，比如初始化 noVNC
    };

    socket.onmessage = function (event) {
        console.log('Message from server:', event.data);
        // 处理服务器消息
    };

    socket.onerror = function (error) {
        console.error('WebSocket Error:', error);
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed.');
    };
});
