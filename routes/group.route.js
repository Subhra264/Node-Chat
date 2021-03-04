const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Group = require('../models/GroupModel');
const TextChannel = require('../models/TextChannelModel');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { INVITE_GROUP_KEY } = require('../config/keys');
const { 
    accessTextChannel, 
    accessVoiceChannel, 
    createNewTextChannel, 
    createNewGroup,
    saveNewMessage, 
    joinGroup
} = require('../controllers/group.controller');

//GET method for 
router.get("/:groupName/textchannel/:channelName", auth, accessTextChannel );

//GET method for voice channels
router.get("/:groupName/voiceChannel/:channelName", auth, accessVoiceChannel );

//PUT method for creating new group
router.put("/new-group", auth, createNewGroup );

//PUT method for creating new channel
router.put("/create-new-channel", auth, createNewTextChannel );

router.put('/new-message', auth, saveNewMessage );

router.get('/join-group/:groupId', auth, joinGroup);

module.exports = router;