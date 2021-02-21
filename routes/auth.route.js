const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { SECRET_KEY } = require('../config/keys');

router.get('/log-in', (req, res) => {
    res.render('login');
});

//POST method for sign up
router.post("/sign-up", (req, res) => {
    //Get the User name, email and password
    const { name, email, password } = req.body;
    //Check if name, password and email are given 
    if (!name || !email || !password) {
        return res.status(401).json({ "error": "Please fill all the details!" });
    }

    User.findOne({ email }, (err, doc) => {
        if (doc) {
            return res.status(409).json({ "error": "User already exists!" });
        }
        if(err){
            return res.status(422).json({"error": "Oops something wrong!"});
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
                        console.log('Saved doc!');
                        return res.json({success: 'Signed up successfully!'});
                    }).catch((err) => {
                        return res.status(422).json({ "error": err });
                    });
                }).catch(err => {
                    return res.status(422).json({ error: "Oops! something went wrong!" });
                });


        }
    });

});


//POST method for log in
router.post("/log-in", (req, res) => {
    // extracting the email and the password
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).json({ "error": "Please add all the fields!" });
    }

    User.findOne({ email }, (err, doc) => {
        //If no such user exists
        if (err || !doc) {
            return res.status(401).json({ "error": "Invalid username or password!" });
        }

        bcrypt.compare(password, doc.password, (err, success) => {
            if (err || !success) {
                return res.status(401).json({ "error": "Invalid username or password!" });
            }

            const token = jwt.sign({ _id: doc._id, name: doc.name }, SECRET_KEY);

            res.cookie('token', token, { httpOnly: true });
            // res.json({ "token": token });
            res.json({ "success": "Log in successful" });

        });

    });
});

module.exports = router;