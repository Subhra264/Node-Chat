const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/keys');
const User = require('../models/UserModel');


module.exports = (req, res, next) => {
    let cookie = req.headers.cookie;
    let logInUrl = '/log-in';
    if(req.url !== '/' || req.url !== '/log-in' ) {
        logInUrl = logInUrl + "?target=" + req.url;
    }

    console.log(logInUrl, req.url);
    //Check if there is authorization in the req headers
    if(!cookie){
        return res.redirect(logInUrl);
    }

    //Get all the cookie items
    cookie = cookie.split("; ");

    let jwtToken = null;
    cookie.forEach(element => {
        if(element.startsWith("token")){
            jwtToken = element;
        }
    });

    if(!jwtToken) {
        return res.redirect(logInUrl);
        // return res.status(402).json({error : 'Invalid request!'});
    }

    const token = jwtToken.replace('token=','');

    if(!token){
        return res.redirect(logInUrl);
        // return res.status(402).json({error : 'Invalid request!'});
    }

    jwt.verify(token, SECRET_KEY, (err, payload) => {
        if(err) {
            return res.redirect(logInUrl);
            // return res.status(402).json({error : 'Invalid request!3'});
        }

        User.findById(payload._id, (err, doc) => {
            if(err) {
                return res.status(422).json({error : 'Oops! something went wrong!'});
            }

            req.user = {
                _id: doc._id,
                name: doc.name,
                groups: doc.groups,
                friends: doc.friends
            };
            next();
        })
    });

}