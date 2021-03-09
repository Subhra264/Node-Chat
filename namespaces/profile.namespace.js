const User = require('../models/UserModel');
const { io } = require('../utils');

module.exports = () => {
    const profileNameSpaces = io.of(/^\/profile\/(\w+)$/);

    profileNameSpaces.on('connection', (socket) => {
        socket.on('sendFriendRequest', ( sender, sentTo ) => {
            socket.to(sentTo.socketId).emit('gotFriendRequest', sender);
        });

        socket.on('acceptedFriendRequest' , friends => {
            const { sender, sentTo } = friends;
            
            User.findByIdAndUpdate(sentTo._id, {
                $push: {
                    friends: sender._id
                }
            },
            (err, doc) => {
                if(err || !doc) {
                    console.log('Oops something went wrong!');
                }
                
                User.findByIdAndUpdate(sender._id, {
                    $push: {
                        friends: sentTo._id
                    }
                },
                (err, user) => {
                    if(err) {
                        console.log('Oops something went wrong!');
                    }
                    console.log(`${sender.name} and ${sentTo.name} are now friends`);
                });
            });
        });

        socket.on('disconnect', () => {
            console.log(`${socket.id} left!`);
        });
    });
}