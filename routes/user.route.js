const express = require("express");
const User = require("../models/UserModel");
const router = express.Router();
const auth = require("../middlewares/auth");

router.get('/help', auth, (req, res) => {
    res.render('help');
});

router.get('profile/:userId', auth, (req, res) => {
    const { userId } = req.params;
    
    User.findById( userId, (err, user) => {
        if(err){
            return res.status(422).render('error', {
                status: 422,
                message: "Oops something went wrong!"
            });
        }

        if(!user) {
            return res.status(404).render('error', {
                status: 404,
                message: "Not Found!"
            });
        }

        res.render('user', {
            name: user.name
        });
    });
});

module.exports = router;
