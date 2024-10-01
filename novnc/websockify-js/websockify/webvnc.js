#!/usr/bin/env node

// A WebSocket to TCP socket proxy
// Copyright 2012 Joel Martin
// Licensed under LGPL version 3 (see docs/LICENSE.LGPL-3)

// Known to work with node 0.8.9
// Requires node modules: ws and optimist
//     npm install ws optimist


var argv = require('optimist').argv,
    net = require('net'),
    http = require('http'),
    https = require('https'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('mime-types'),

    Buffer = require('buffer').Buffer,
    WebSocketServer = require('ws').Server,

    webServer, wsServer,
    source_host, source_port, target_host, target_port,
    web_path = null;


// Handle new WebSocket client
new_client = function(client, req) {
    var clientAddr = client._socket.remoteAddress, log;
    var start_time = new Date().getTime();

    // 从 WebSocket 请求的 URL 中解析 target 参数
    var targetParam = url.parse(req.url, true).query.target;
    if (!targetParam) {
        console.log("No target specified in the request URL");
        client.close();
        return;
    }

    // 将 targetParam 分解为目标主机和端口
    var idx = targetParam.indexOf(":");
    if (idx < 0) {
        console.log("Invalid target format, must be host:port");
        client.close();
        return;
    }
    var target_host = targetParam.slice(0, idx);
    var target_port = parseInt(targetParam.slice(idx + 1), 10);

    if (isNaN(target_port)) {
        console.log("Invalid target port");
        client.close();
        return;
    }

    log = function (msg) {
        console.log(' ' + clientAddr + ': ' + msg);
    };
    log('WebSocket connection to target ' + target_host + ':' + target_port);
    log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

    var target = net.createConnection(target_port, target_host, function() {
        log('connected to target');
    });
    
    target.on('data', function(data) {
        try {
            client.send(data);
        } catch (e) {
            log("Client closed, cleaning up target");
            target.end();
        }
    });

    target.on('end', function() {
        log('target disconnected');
        client.close();
    });

    target.on('error', function() {
        log('target connection error');
        target.end();
        client.close();
    });

    client.on('message', function(msg) {
        target.write(msg);
    });

    client.on('close', function(code, reason) {
        log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        target.end();
    });

    client.on('error', function(a) {
        log('WebSocket client error: ' + a);
        target.end();
    });
};

function decodeBuffer(buf) {
  var returnString = '';
  for (var i = 0; i < buf.length; i++) {
    if (buf[i] >= 48 && buf[i] <= 90) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] === 95) {
      returnString += String.fromCharCode(buf[i]);
    } else if (buf[i] >= 97 && buf[i] <= 122) {
      returnString += String.fromCharCode(buf[i]);
    } else {
      var charToConvert = buf[i].toString(16);
      if (charToConvert.length === 0) {
        returnString += '\\x00';
      } else if (charToConvert.length === 1) {
        returnString += '\\x0' + charToConvert;
      } else {
        returnString += '\\x' + charToConvert;
      }
    }
  }
  return returnString;
}

// Send an HTTP error response
http_error = function (response, code, msg) {
    response.writeHead(code, {"Content-Type": "text/plain"});
    response.write(msg + "\n");
    response.end();
    return;
}

// Process an HTTP static file request
http_request = function (request, response) {
    if (!argv.web) {
        return http_error(response, 403, "403 Permission Denied");
    }

    // 解析请求的 URL 和查询参数
    const uri = url.parse(request.url, true); // 第二个参数为 true，可以解析查询参数
    const target = uri.query.target; // 从查询参数中获取 target 参数

    // 检查是否提供了 target 参数
    if (!target) {
        return http_error(response, 400, "400 Bad Request: Missing target parameter");
    }

    // 将 target 拆分为 host 和 port
    const [target_host, target_port] = target.split(":");
    if (!target_port || isNaN(parseInt(target_port, 10))) {
        return http_error(response, 400, "400 Bad Request: Invalid target port");
    }

    // 日志输出目标信息（可选）
    console.log(`Connecting to target VNC server at ${target_host}:${target_port}`);

    // 处理静态文件请求
    var filename = path.join(argv.web, uri.pathname);
    fs.exists(filename, function (exists) {
        if (!exists) {
            return http_error(response, 404, "404 Not Found");
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                return http_error(response, 500, err);
            }

            var headers = {};
            var contentType = mime.contentType(path.extname(filename));
            if (contentType !== false) {
                headers['Content-Type'] = contentType;
            }

            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });
    });
};

// parse source and target arguments into parts
try {
    source_port = parseInt(argv._[0], 10);
    if (isNaN(source_port)) {
        throw("illegal port");
    }
} catch (e) {
    console.error("websockify.js [--web web_dir] [--cert cert.pem [--key key.pem]] [--record dir] [source_addr:]source_port");
    process.exit(2);
}

var target_host = null;
var target_port = null;
console.log("WebSocket settings: ");
console.log("    - proxying from " + source_host + ":" + source_port +
            " to " + target_host + ":" + target_port);
if (argv.web) {
    console.log("    - Web server active. Serving: " + argv.web);
}

if (argv.cert) {
    argv.key = argv.key || argv.cert;
    var cert = fs.readFileSync(argv.cert),
        key = fs.readFileSync(argv.key);
    console.log("    - Running in encrypted HTTPS (wss://) mode using: " + argv.cert + ", " + argv.key);
    webServer = https.createServer({cert: cert, key: key}, http_request);
} else {
    console.log("    - Running in unencrypted HTTP (ws://) mode");
    webServer = http.createServer(http_request);
}
webServer.listen(source_port, function() {
    wsServer = new WebSocketServer({server: webServer});
    wsServer.on('connection', new_client);
});
