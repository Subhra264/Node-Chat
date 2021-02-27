const express = require("express");
const User = require("../models/UserModel");
const router = express.Router();
const auth = require("../middlewares/auth");

router.get('/help', auth, (req, res) => {
    res.render('help');
});

router.get('profile/:username', auth, (req, res) => {
    const {username} = req.params;
    
    
});

module.exports = router;
