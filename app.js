const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.port || 8000;

//contains the users information
const users = {};

//listen for connections
io.on("connection" , (socket) => {
    console.log("A user connected!!!");
    socket.on("join" , (name) => {
        users[socket.id] = name;
        io.emit('usersAvailable', users);
        socket.broadcast.emit("userJoined" , name);
        console.log(users);
    });
    socket.on("sendMessage" , (message) => {
        socket.broadcast.emit("receiveMessage" , 
                            {name : users[socket.id] ,message});
        
    });

    //on sending a file
    socket.on("fileSent", (file, filetype, fileName) => {
        socket.broadcast.emit("receivedFile", {file, filetype, fileName, name: users[socket.id]});
    }); 

    //On sending an image
    socket.on("sendImage", (data) => {
        socket.broadcast.emit("receivedImage", {name: users[socket.id], data: data.data });
    });

    //On sending a video
    socket.on("sentVideo", (data) => {
        socket.broadcast.emit("receivedVideo", {name: users[socket.id], data: data});
    });

    //on sending a voice message
    socket.on("sentVoiceMessage" , (chunks) => {
        // console.log(blob);
        socket.broadcast.emit("receivedVoice" , chunks , users[socket.id]);
    });

    socket.on("disconnect" , () => {
        socket.broadcast.emit("userLeft" , users[socket.id]);
        delete users[socket.id];
        console.log(socket.id + " left");
        // console.log(users);
    });
});

// app.use(express.static('./frontend/home'));
app.use(express.static('./frontend/chatting'));
app.get('/', (req , res) => {
    res.sendFile(__dirname + '/frontend/chatting/chat.html');
});



// app.use(express.json());
// app.post('/chat' , (req ,res) => {
//     console.log(req);
//     res.sendFile(__dirname + '/frontend/chatting/chat.html');
// });
server.listen(PORT , () => {
    console.log("Express server is listening on port number 8000...");
});