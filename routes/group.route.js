const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Group = require('../models/GroupModel');
const TextChannel = require('../models/TextChannelModel');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { INVITE_GROUP_KEY } = require('../config/keys');

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

    let groupId = null;

    if (!groupName || !channelName) {
        return res.status(404).json({ error: "Invalid params!" });
    }
    
    user.groups.forEach(element => {
        data.groups.push(element.name);
        if(element.name === groupName){
            groupId = element.reference;
        }
    });

    if(!groupId){
        return res.status(404).json({error : 'No such group exists in your profile!'});
    }

    data.currentGroup = groupName;
    data.currentGroupId = groupId;

    Group.findById(groupId, (err, result) => {
        if(err) {
            console.log("error retreiving Groups : " + err);
            return res.status(402).json({error: "Oops! something went wrong!"});
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
            return res.status(404).json({error : 'No such channel exists in your profile!'});
        }

        data.currentTextChannel = channelId;


        TextChannel.findById(channelId, (err, result) => {
            if(err){
                return res.status(402).json({error: "Oops! something went wrong!"});
            }
            data.messages = result.textMessages;

            // res.json({data});
            res.render("chat", {data});
        });
    });

});

//GET method for voice channels
router.get("/:groupName/voiceChannel/:channelName", auth, (req, res) => {
    const user = req.user;
    const { groupName, channelName } = req.params;

    if (!groupName || !channelName) {
        return res.status(401).json({ error: "Invalid params!" });
    }

    //incomplete

    res.json({user});
});

//PUT method for creating new group
router.put("/new-group", auth, (req, res) => {
    const user = req.user;
    const {name} = req.body;

    if(!name){
        return res.status(401).json({error : 'Please give a name!'});
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
            return res.status(422).json({error : 'Oops! something went wrong! 1'});
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
            if(err || !doc){
                // return res.status(422).json({err});
                return res.status(422).json({error : 'Oops! something went wrong! 2'});
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
                    return res.status(422).json({error : 'Oops! something went wrong! 3'});
                }
    
                res.json({success: 'Group created successfully!'});
            });
            
        });
    });
});

//PUT method for creating new channel
router.put("/create-new-channel", auth, (req, res) => {
    const user = req.user;
    const {name, parentGroup, parentGroupName} = req.body;

    if(!name){
        return res.status(402).json({error : 'Please give a name!'});
    }

    const newTextChannel = new TextChannel({
        name,
        parentGroup
        // user: user._id
    });

    newTextChannel.save((err, doc) => {
        if(err){
            return res.status(422).json({error : 'Oops! something went wrong!'});
        }

        Group.findByIdAndUpdate(parentGroup, {
            $push : {
                textChannels:  {
                    name: doc.name,
                    reference: doc
                }
            }
        }, (err, result) => {
            if(err){
                return res.status(422).json({error : 'Oops! something went wrong!'});
            }

            res.json({success: "Channel created succesfully!"});
        });
        
    });
});

router.put('/new-message', auth, (req,res ) => {
    const user = req.user;
    const {channelId, message, sentBy} = req.body;
    if(!channelId || !message || !sentBy){
        return res.status(402).json({error: "Invalid request!"});
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
            return res.status(422).json({error: 'Oops! something went wrong!'});
        }

        res.json({success: "Messages saved successfully!"});
    });
});

router.get('/join-group/:groupId', auth, (req, res) => {
    const user = req.user;
    const {groupId} = req.params;

    if(!groupId){
        return res.status(404).json({error: "Invalid request!"});
    }

    jwt.verify(groupId, INVITE_GROUP_KEY, (err, payload)=> {
        if(err || !payload){
            return res.status(400).json({"error": "Invalid request!"});
        }

        Group.findByIdAndUpdate(payload.groupId, {
            $push: {
                users: {
                    name: user.name,
                    reference: user._id
                }
            }
        }).then(doc => {
            User.findByIdAndUpdate(user._id, {
                $push: {
                    groups: {
                        name: doc.name,
                        reference: doc._id
                    }
                }
            }).then(doc => {
                return res.redirect(`/${doc.name}/textchannel/${welcome}`);
                // res.json({success: "Joined group successfully!"});
            })
            .catch(err => {
                return res.status(422).json({error: "Oops! something went wrong!"});
            });
        }).catch(err => {
            return res.status(422).json({error: "Oops! something went wrong!"});
        });
    });

});

module.exports = router;