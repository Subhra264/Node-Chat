const {MONGOURI} = require("./config/keys");
const mongoose = require("mongoose");
const router = require('./routes');
const {io, express, app, server} = require('./utils');

const PORT = process.env.PORT || 8000;

//Middlewares
app.use(express.json());
app.set('views', './frontend/views');
app.set('view engine', 'ejs');
app.use(express.static('./frontend/'));
app.use(router);

//Connect to the Mongodb
mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Check if the connection has been established
mongoose.connection.on("connected", () => {
    console.log("Connected to Mongodb atlas!");
});

//But if an error is there 
mongoose.connection.on("error", (err) => {
    console.log("Error connecting mongodb : " + err);
});

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
        console.log("The image data : " + data.data);
        socket.broadcast.emit("receivedImage", {name: users[socket.id], data: data.data });
    });

    //On sending a video
    socket.on("sentVideo", (data) => {
        console.log("The video: " + data);
        socket.broadcast.emit("receivedVideo", {name: users[socket.id], data: data});
    });

    //on sending a voice message
    socket.on("sentVoiceMessage" , (chunks) => {
        console.log("Voice message chunks: " + chunks);
        socket.broadcast.emit("receivedVoice" , chunks , users[socket.id]);
    });

    socket.on("disconnect" , () => {
        socket.broadcast.emit("userLeft" , users[socket.id]);
        delete users[socket.id];
        console.log(socket.id + " left");
        // console.log(users);
    });
});

const data = {
    user: {
        name: "Subhendu Adhikari",
        _id: "5ff15d79e616970f4ce031fb"
    },
    groups: [
        "MyFirstGroup",
        "MySecondGroup",
        "MyThirdGroup"
    ],
    friends: [],
    textChannels: [
        "welcome"
    ],
    currentGroup: "MyThirdGroup",
    users: [
        {
            _id: "5ff15dd3e616970f4ce0320b",
            name: "Subhendu Adhikari",
            reference: "5ff15d79e616970f4ce031fb"
        }
    ],
    messages: [
        {
            sender: {
                name: "Subhendu Adhikari",
                reference: "5ff15d79e616970f4ce031fb"
            },
            _id: "5ff168dfe0ff013230061c43",
            message: "Hello world!"
        }
    ]
}

app.get('/', (req , res) => {
    res.render('chat', {data});
});

server.listen(PORT , () => {
    console.log("Express server is listening on port number 8000...");
});