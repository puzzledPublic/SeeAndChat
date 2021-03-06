
module.exports = function (io) {
    var rooms = [];
    var count = 0;
    io.sockets.on('connection', function (socket) {
        //방 접속
        socket.on('joinroom', function (data) {
            socket.join(data.room);
            var nickName;
            if(socket.request.session.passport != undefined){
                nickName = socket.request.session.passport.user[0].MEMBERID;
            }
            else{
                nickName = 'guest-' + Math.floor(Math.random() * 1000);
            }
            //방이 없으면 공간 생성
            if (rooms[data.room] == undefined) {
                rooms[data.room] = {};
            }
            //방이름, 소켓아이디를 식별자로 닉네임 저장
            rooms[data.room][socket.id.substring(1)] = nickName;
            
            //방 전체에 유저입장 메시지
            io.sockets.to(data.room).emit('broadcast_msg', {
                msg: rooms[data.room][socket.id.substring(1)] + ' 입장'
            });
            //방 유저 리스트 갱신
            io.sockets.to(data.room).emit('printUsers', {
                list: rooms[data.room]
            });
        });
        //닉네임 변경
        socket.on('changeNick', function (data) {
            let roomName = getRoomName();
            let isExsist;
            for (let id in rooms[roomName]) {
                if (rooms[roomName][id] == data.nickName) {
                    isExsist = true;
                }
            }
            if (isExsist) {
                socket.emit('toclient', {
                    msg: '존재하는 닉네임입니다.'
                });
            } else {
                rooms[roomName][socket.id.substring(1)] = data.nickName;
                io.sockets.to(roomName).emit('printUsers', {
                    list: rooms[roomName]
                });
            }
        });
        //채팅 전송
        socket.on('fromclient', function (data) {
            io.sockets.to(data.room).emit('toclient', {
                msg: data.msg,
                nickName: rooms[data.room][socket.id.substring(1)]
            });
        });
        //접속 아웃
        socket.on('disconnect', function (data) {
            let roomName;
            
            for (let i in rooms) {
                if (rooms[i][socket.id.substring(1)] != undefined) {
                    //rooms[i][socket.id.substring(1)] = undefined;
                    delete rooms[i][socket.id.substring(1)];
                    roomName = i;
                    break;
                }
            }
            //방 유저 리스트 갱신
            io.sockets.to(roomName).emit('printUsers', {
                list: rooms[roomName]
            });
        });
        //방 이름 찾기
        function getRoomName() {
            let roomName;
            for (let i in rooms) {
                if (rooms[i][socket.id.substring(1)] != undefined) {
                    roomName = i;
                    break;
                }
            }
            return roomName;
        }
    });
    return rooms;
}