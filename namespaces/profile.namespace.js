const { io } = require('../utils');

module.exports = () => {
    const profileNameSpaces = io.of(/^\/profile\/(\w+)$/);

    profileNameSpaces.on('connection', (socket) => {
        socket.on('sendFriendRequest', ( source, target ) => {
            socket.to(target._id).emit('gotFriendRequest', source);
        });

        socket.on('acceptedFriendRequest' , friends => {

        });

        socket.on('disconnect', () => {
            console.log(`${socket.id} left!`);
        });
    });
}