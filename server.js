const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server,{
    allowEIO3: true
});
const {v4 : uuid} = require('uuid');
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug:true
});


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use('/peerjs', peerServer);


app.get('/',(req, res)=>{
    res.status(200);
    res.redirect(`/${uuid()}`);
})

app.get('/:room', (req, res) =>{
    res.render('room',{roomId : req.params.room});
    
})

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage',(message));
        });

    socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId)
        });

    })
})

server.listen(process.env.PORT||8050);