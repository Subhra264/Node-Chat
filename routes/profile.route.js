const express = require("express");
const User = require("../models/UserModel");
const router = express.Router();
const auth = require("../middlewares/auth");
const { getProfile } = require('../controllers/profile.controller');

router.get('/help', auth, (req, res) => {
    res.render('help');
});

router.get('/profile/:userId', auth, getProfile);

module.exports = router;
