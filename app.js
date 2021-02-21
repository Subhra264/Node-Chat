const {MONGOURI} = require("./config/keys");
const mongoose = require("mongoose");
const router = require('./routes/routes');
const {io, express, app, server} = require('./utils');
const textChannelNamespace = require('./namespaces/textChannel');

const PORT = process.env.PORT || 8000;

//Middlewares
app.use(express.json());
app.set('views', './frontend/views');
app.set('view engine', 'ejs');
app.use('/frontend', express.static('./frontend/'));
app.use(router);
app.use(require('./routes/auth.route'));
// app.use(require('./routes/group.route'));

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
// const users = {};

// //listen for connections
// io.on("connection" , (socket) => {
    
// });

textChannelNamespace();
// const textChannels = io.of(/^\/(\w+)\/textchannel\/(\w+)$/);

// const users = {};

// textChannels.on('connection', (socket) => {
//     const channel = socket.nsp;
//     console.log(socket);
//     console.log(channel);
    
//     let userId = null;

//     //When an User joins the channel
//     socket.on('join', (userDetails) => {
//         //Check if the user is already connected or not
//         if(!userDetails.alreadyConnected){
//             users[userDetails._id] = {
//                 socketId: socket.id,
//                 name: userDetails.name,
//                 currentTextChannel: userDetails.currentChannelId,
//                 currentGroup: userDetails.currentGroup
//             }
//             userId = userDetails._id;
//             channel.to(socket.id).emit("token", {connected: userDetails.currentChannelId});
//         }else{
//             //If the user is already connected 
//             //then disconnect the user
//             socket.disconnect();
//         }
//     });



//     socket.on("sendMessage" , (message) => {
//         socket.broadcast.emit("receiveMessage" , 
//                             {name : users[userId].name, message});
        
//     });

//     //on sending a file
//     socket.on("fileSent", (file, filetype, fileName) => {
//         socket.broadcast.emit("receivedFile", {file, filetype, fileName, name: users[userId].name});
//     }); 

//     //On sending an image
//     socket.on("sendImage", (data) => {
//         console.log("The image data : " + data.data);
//         socket.broadcast.emit("receivedImage", {name: users[userId].name, data: data.data });
//     });

//     //On sending a video
//     socket.on("sentVideo", (data) => {
//         console.log("The video: " + data);
//         socket.broadcast.emit("receivedVideo", {name: users[userId].name, data: data});
//     });

//     //on sending a voice message
//     socket.on("sentVoiceMessage" , (chunks) => {
//         console.log("Voice message chunks: " + chunks);
//         socket.broadcast.emit("receivedVoice" , chunks , users[userId].name);
//     });

//     socket.on("disconnect" , () => {
//         socket.broadcast.emit("userLeft" , users[userId].name);
//         delete users[userId];
//         console.log(userId + " left");
//         // console.log(users);
//     });
// });


app.get('/', (req , res) => {
    // res.render('chat', {data});
    res.render('home');
});

app.get('/log-in', (req, res) => {
    res.render('login');
});



server.listen(PORT , () => {
    console.log("Express server is listening on port number 8000...");
});