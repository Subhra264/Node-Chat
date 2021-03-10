const User = require('../models/UserModel');
const { io } = require('../utils');

module.exports = () => {
    const profileNameSpaces = io.of(/^\/profile\/(\w+)$/);

    profileNameSpaces.on('connection', (socket) => {
        socket.on('sendFriendRequest', ( sender, sentTo ) => {

            User.findByIdAndUpdate(sentTo._id, {
                $push: {
                    recievedFriendRequests: sender._id
                }
            }, (err, user) => {
                if(err || !user) {
                    console.log('Error saving recieved friend requests!');
                }

                User.findByIdAndUpdate(sender._id, {
                    $push: {
                        sentFriendRequests: sentTo._id
                    }
                }, (err, user) => {
                    if(err || !user) {
                        console.log('Error saving sent friend requests!');
                    }

                    socket.to(sentTo.socketId).emit('gotFriendRequest', sender);
                    console.log('All the operations are done successfully!');
                });
            });
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