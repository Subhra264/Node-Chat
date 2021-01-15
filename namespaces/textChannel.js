const {io} = require('../utils');


module.exports = function (){


    const textChannels = io.of(/^\/(\w+)\/textchannel\/(\w+)$/);

    const users = {};

    textChannels.on('connection', (socket) => {
        const channel = socket.nsp;
        console.log(socket);
        console.log(channel);

        let userId = null;

        //When an User joins the channel
        socket.on('join', (userDetails) => {
            //Check if the user is already connected or not
            if(!userDetails.alreadyConnected){
                users[userDetails._id] = {
                    socketId: socket.id,
                    name: userDetails.name,
                    currentTextChannel: userDetails.currentChannelId,
                    currentGroup: userDetails.currentGroup
                }
                userId = userDetails._id;
                channel.to(socket.id).emit("token", {connected: userDetails.currentChannelId});
            }else{
                //If the user is already connected 
                //then disconnect the user
                socket.disconnect();
            }
        });



        socket.on("sendMessage" , (message) => {
            socket.broadcast.emit("receiveMessage" , 
                                {name : users[userId].name, message});
            fetch('/new-message', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    channelId: users[userId].currentTextChannel,
                    sentBy: {
                        name: users[userId].name,
                        _id: userId
                    }
                }).then(response => {
                    return response.json();
                }).then(result => {
                    if(result.error){
                        console.log(result.error);
                    }
                    else{
                        console.log(result.success);
                    }
                })
            })
            
        });

        //on sending a file
        socket.on("fileSent", (file, filetype, fileName) => {
            socket.broadcast.emit("receivedFile", {file, filetype, fileName, name: users[userId].name});
        }); 

        //On sending an image
        socket.on("sendImage", (data) => {
            console.log("The image data : " + data.data);
            socket.broadcast.emit("receivedImage", {name: users[userId].name, data: data.data });
        });

        //On sending a video
        socket.on("sentVideo", (data) => {
            console.log("The video: " + data);
            socket.broadcast.emit("receivedVideo", {name: users[userId].name, data: data});
        });

        //on sending a voice message
        socket.on("sentVoiceMessage" , (chunks) => {
            console.log("Voice message chunks: " + chunks);
            socket.broadcast.emit("receivedVoice" , chunks , users[userId].name);
        });

        socket.on("disconnect" , () => {
            socket.broadcast.emit("userLeft" , users[userId].name);
            delete users[userId];
            console.log(userId + " left");
            // console.log(users);
        });
    });

}