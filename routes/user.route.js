const express = require("express");
const User = require("../models/UserModel");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY, INVITE_GROUP_KEY } = require('../config/keys');
const auth = require("../middlewares/auth");
const Group = require("../models/GroupModel");
const TextChannel = require("../models/TextChannelModel");
const mongoose = require("mongoose");
const { io } = require("../utils");

router.get('/help', auth, (req, res) => {
    res.render('help');
});

router.get('profile/:username', auth, (req, res) => {
    const {username} = req.params;
    
    
});

module.exports = router;
