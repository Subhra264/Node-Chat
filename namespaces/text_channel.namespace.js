const {io} = require('../utils');
const jwt = require('jsonwebtoken');
const { INVITE_GROUP_KEY } = require('../config/keys');

module.exports = function (){

    const textChannels = io.of(/^\/(\w+)\/textchannel\/(\w+)$/);

    const users = {};

    textChannels.on('connection', (socket) => {
        const channel = socket.nsp;
        // console.log(socket);
        // console.log(channel);

        let userId = null;

        //When an User joins the channel
        socket.on('join', (userDetails) => {
            //Check if the user is already connected or not
            // if(!userDetails.alreadyConnected){
                users[userDetails._id] = {
                    socketId: socket.id,
                    name: userDetails.name,
                    currentTextChannel: userDetails.currentChannelId,
                    currentGroup: userDetails.currentGroup,
                    currentGroupId: userDetails.currentGroupId
                }
                userId = userDetails._id;
                channel.to(socket.id).emit("token", {connected: userDetails.currentChannelId});
                console.log("Users in this channel ", users[userId]);
            // }else{
            //     //If the user is already connected
            //     //then disconnect the user
            //     socket.disconnect();
            // }
        });



        socket.on("sendMessage" , (message) => {
            socket.broadcast.emit("receiveMessage" , 
                                {name : users[userId].name, userId, message});
                        
        });

        //on sending a file
        socket.on("fileSent", (file, filetype, fileName) => {
            socket.broadcast.emit("receivedFile", {file, filetype, fileName, name: users[userId].name});
        }); 

        //On sending an image
        socket.on("sendImage", (data) => {
            socket.broadcast.emit("receivedImage", {name: users[userId].name, data: data.data });
        });

        //On sending a video
        socket.on("sentVideo", (data) => {
            socket.broadcast.emit("receivedVideo", {name: users[userId].name, data: data});
        });

        //on sending a voice message
        socket.on("sentVoiceMessage" , (chunks) => {
            socket.broadcast.emit("receivedVoice" , chunks , users[userId].name);
        });

        socket.on('inviteFriends', () => {
            const currentGroupId = users[userId].currentGroupId;

            const token = jwt.sign({groupId: currentGroupId}, INVITE_GROUP_KEY);
            channel.to(socket.id).emit('inviteLink', {token});
        });

        socket.on("disconnect" , () => {
            socket.broadcast.emit("userLeft" , users[userId].name);
            delete users[userId];
            console.log(userId + " left");
            // console.log(users);
        });
    });

}