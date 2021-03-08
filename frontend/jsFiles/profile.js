const pathName = location.pathname;
const socket = io(pathName);

const sendFriendRequest = sender => {
    socket.emit('sendFriendRequest', (sender));
}