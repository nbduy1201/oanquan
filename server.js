const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os'); // Thêm thư viện hệ điều hành để quét IP

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Hàm tự động lấy IP mạng LAN (Wi-Fi)
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const rooms = {};

io.on('connection', (socket) => {
    // 1. TẠO PHÒNG
    socket.on('createRoom', (playerName) => {
        // Tạo mã 4 số ngẫu nhiên (từ 1000 đến 9999)
        let roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        // Đảm bảo không trùng mã cũ
        while(rooms[roomCode]) {
            roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        }

        rooms[roomCode] = { 
            p1: { id: socket.id, name: playerName || "Chủ phòng" }, 
            p2: null 
        };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    // 2. VÀO PHÒNG
    socket.on('joinRoom', (data) => {
        const { code, name } = data;
        const room = rooms[code];

        if (room) {
            if (!room.p2) {
                room.p2 = { id: socket.id, name: name || "Khách" };
                socket.join(code);
                socket.emit('roomJoined', 'p2');
                
                // Báo cho cả phòng biết game bắt đầu và gửi tên 2 người chơi
                io.to(code).emit('gameStart', {
                    p1Name: room.p1.name,
                    p2Name: room.p2.name
                });
            } else {
                socket.emit('roomError', 'Phòng này đã đủ người chơi!');
            }
        } else {
            socket.emit('roomError', 'Mã phòng không đúng!');
        }
    });

    // 3. XỬ LÝ NƯỚC ĐI
    socket.on('makeMove', (data) => {
        socket.to(data.roomCode).emit('receiveMove', data);
    });

    // 4. NGẮT KẾT NỐI
    socket.on('disconnect', () => {
        for (const code in rooms) {
            const room = rooms[code];
            if (room.p1 && room.p1.id === socket.id || room.p2 && room.p2.id === socket.id) {
                io.to(code).emit('opponentDisconnected');
                delete rooms[code];
            }
        }
    });
});

const PORT = 3000;
const HOST_IP = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\nSERVER ĐÃ CHẠY THÀNH CÔNG!`);
    console.log(`- Để chơi trên máy này: Mở trình duyệt vào http://localhost:${PORT}`);
    console.log(`- Để mời bạn bè cùng WiFi: Mở trình duyệt vào http://${HOST_IP}:${PORT}\n`);
});