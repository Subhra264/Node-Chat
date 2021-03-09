const pathName = location.pathname;
const socket = io(pathName);
const friendRequestContainer = document.getElementById('friend-req-container');
let peerSocket;

socket.on('connected', otherUser => {
    peerSocket = otherUser.socketId;
});

const sendFriendRequest = (button) => {
    const sender = {
        name: thisUserName,
        _id: thisUserId,
        socketId: socket.id
    };

    const sentTo = {
        name: thatUserName,
        _id: thatUserId,
        socketId: peerSocket
    }
    socket.emit('sendFriendRequest', sender, sentTo);

    button.innerText = 'Request Sent';
    button.disabled = true;
};

const createFriendReqCards = sender => {
    const friendRequest = document.createElement('div');
    const nameOfSender = document.createElement('div');
    const acceptReqButton = document.createElement('button');

    nameOfSender.innerText = sender.name;
    acceptReqButton.innerText = 'Accept Request';
    acceptReqButton.onclick = () => {
        socket.emit('acceptedFriendRequest', {
            sender,
            sentTo: {
                name: thisUserName,
                _id: thisUserId,
                socketId: socket.id
            }
        });
    };

    friendRequest.append([nameOfSender, acceptReqButton]);

    return friendRequest;
};

socket.on('gotFriendRequest', sender => {
    friendRequestContainer.append(createFriendReqCards(sender));
});

