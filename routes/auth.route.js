const express = require('express');
const router = express.Router();
const { createAccount, authenticateUser } = require('../controllers/auth.controller');

router.get('/log-in', (req, res) => {
    res.render('login');
});

//POST method for sign up
router.post("/sign-up", createAccount );

//POST method for log in
router.post("/log-in", authenticateUser );

module.exports = router;