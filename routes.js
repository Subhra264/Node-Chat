const express = require("express");
const User = require("./models/UserModel");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./config/keys');
const auth = require("./middlewares/auth");
const Group = require("./models/GroupModel");
const TextChannel = require("./models/TextChannelModel");
const mongoose = require("mongoose");
const { io } = require("./utils");

// //GET method for home
// router.get("/", (req,  res) => {
//     res.sendFile(__dirname + "/frontend/home/home.html");
// });

//POST method for sign up
router.post("/signup", (req, res) => {
    //Get the User name, email and password
    const { name, email, password } = req.body;

    //Check if name, password and email are given 
    if (!name || !email || !password) {
        res.json({ "error": "Please fill all the details!" });
    }

    User.findOne({ email }, (err, doc) => {
        if (doc) {
            res.json({ "error": "User already exists!" });
        }
        else {
            bcrypt.hash(password, 12)
                .then(hashedPassword => {

                    const user = new User({
                        name,
                        email,
                        password: hashedPassword
                    });

                    //Save the User
                    user.save().then((doc) => {
                        res.json(doc);
                    }).catch((err) => {
                        res.json({ "error": err });
                    });
                }).catch(err => {
                    res.status(422).json({ err: "Oops! something went wrong!" });
                });


        }
    });

});

//POST method for signin
router.post("/signin", (req, res) => {
    // extracting the email and the password
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(402).json({ "error": "Please add all the fields!" });
    }

    User.findOne({ email }, (err, doc) => {
        //If no such user exists
        if (err) {
            return res.status(404).json({ "error": "Invalid username or password!" });
        }

        bcrypt.compare(password, doc.password, (err, success) => {
            if (err || !success) {
                return res.status(404).json({ "error": "Invalid username or password!" });
            }

            const token = jwt.sign({ _id: doc._id, name: doc.name }, SECRET_KEY);

            // res.cookie('token', token, { httpOnly: true });
            res.json({ "token": token });
            // res.json({ "success": "Log in successful" });

        });

    });
});

//GET method for 
router.get("/:groupName/textchannel/:channelName", auth, (req, res) => {
    const user = req.user;
    const { groupName, channelName } = req.params;
    let data = {
        user: {
            name: user.name,
            _id: user._id
        },
        groups: [],
        friends: user.friends,
        textChannels: []
    };

    data.user = {
        name: user.name,
        _id: user._id
    };

    let groupId = null;

    if (!groupName || !channelName) {
        return res.status(402).json({ err: "Invalid params!" });
    }
    
    user.groups.forEach(element => {
        data.groups.push(element.name);
        if(element.name === groupName){
            groupId = element.reference;
        }
    });

    if(!groupId){
        return res.status(402).json({err : 'No such group exists in your profile!'});
    }

    data.currentGroup = groupName;

    Group.findById(groupId, (err, result) => {
        if(err) {
            console.log("error retreiving Groups : " + err);
            return res.status(402).json({err: "Oops! something went wrong!"});
        }

        data.users = result.users;
        let channelId = null;

        result.textChannels.forEach(element => {
            data.textChannels.push(element.name);
            if(element.name === channelName){
                channelId = element.reference;
            }

        });

        if(!channelId){
            return res.status(402).json({err : 'No such channel exists in your profile!'});
        }

        // data.currentTextChannel = channelId;


        TextChannel.findById(channelId, (err, result) => {
            if(err){
                return res.status(402).json({err: "Oops! something went wrong!"});
            }
            data.messages = result.textMessages;

            const namespace = io.of(`/${groupName}/textchannel/${channelName}`);
            
            

            res.json({data});
            // res.render("home", {data});
        });
    });

});

router.get("/:groupName/voiceChannel/:channelName", auth, (req, res) => {
    const user = req.user;
    const { groupName, channelName } = req.params;

    if (!groupName || !channelName) {
        return res.status(402).json({ err: "Invalid params!" });
    }


    res.json(user);
});

//PUT method for creating new group
router.put("/new-group", auth, (req, res) => {
    const user = req.user;
    const {name} = req.body;

    if(!name){
        return res.status(402).json({err : 'Please give a name!'});
    }
    const parentGroupId = new mongoose.Types.ObjectId();

    const welcome = new TextChannel({
        name: "welcome",
        parentGroup: parentGroupId
    });

    welcome.save((err, result) => {
        if(err) {
            // return res.status(422).json({err});
            console.log("error saving welcome channel " + err);
            return res.status(422).json({err : 'Oops! something went wrong! 1'});
        }

        const newGroup = new Group({
            _id: parentGroupId,
            name,
            users: [{
                name: user.name,
                reference: user._id
            }],
            textChannels: [{
                name: result.name,
                reference: result
            }]
        });

        newGroup.save((err, doc) => {
            if(err){
                // return res.status(422).json({err});
                return res.status(422).json({err : 'Oops! something went wrong! 2'});
            }
    
    
            User.findByIdAndUpdate(user._id, {
                $push : {
                    groups: {
                        name: doc.name,
                        reference: doc
                    }
                }
            }, (err, result) => {
                if(err){
                    // return res.status(422).json({err});
                    return res.status(422).json({err : 'Oops! something went wrong! 3'});
                }
    
                res.json({success: 'Group created successfully!'});
            });
            
        });


    });

    

    
});

//PUT method for creating new channel
router.put("/create-new-channel", auth, (req, res) => {
    const user = req.user;
    const {name, parentGroup} = req.body;

    if(!name){
        return res.status(402).json({err : 'Please give a name!'});
    }

    const newTextChannel = new TextChannel({
        name,
        parentGroup
        // user: user._id
    });

    newTextChannel.save((err, doc) => {
        if(err){
            return res.status(422).json({err : 'Oops! something went wrong!'});
        }

        Group.findByIdAndUpdate(parentGroup, {
            $push : {textChannels:  {
                name: doc.name,
                reference: doc
            }}
        }, (err, res) => {
            if(err){
                return res.status(422).json({err : 'Oops! something went wrong!'});
            }

            res.json({success: 'Text Channel created successfully!'});
        })
        
    });
});

router.put('/new-message', auth, (req,res ) => {
    const user = req.user;
    const {channelId, message, sentBy} = req.body;
    if(!channelId || !message || !sentBy){
        return res.status(402).json({err: "Invalid request!"});
    }

    TextChannel.findByIdAndUpdate(channelId, {
        $push: {textMessages : {
            message,
            sender: {
                name: sentBy.name,
                reference: sentBy._id
            }
        }}
    }, (err, result) => {
        if(err) {
            return res.status(402).json({err: 'Oops! something went wrong!'});
        }

        res.json({success: "Messages saved successfully!"});
    });
});

//GET method for help 
router.get("/help", auth, (req, res) => {
    res.render('help');
});

module.exports = router;
