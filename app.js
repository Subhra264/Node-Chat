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
// const users = {};

//listen for connections
io.on("connection" , (socket) => {
    console.log("A user connected!!!");
    
});


app.get('/', (req , res) => {
    // res.render('chat', {data});
    res.render('home');
});

server.listen(PORT , () => {
    console.log("Express server is listening on port number 8000...");
});