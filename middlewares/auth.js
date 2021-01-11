const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/keys');
const User = require('../models/UserModel');


module.exports = (req, res, next) => {
    // let token = req.header.token;
    const {authorization} = req.headers;//

    if(!authorization) {//
        return res.status(402).json({err : 'Invalid request!1'});//
    }//

    const token = authorization.replace("Bearer ", "");//

    if(!token) {
        return res.status(402).json({err : 'Invalid request!2'});
    }

    // token = token.replace("cookie=", "");

    // if(!token){
    //     return res.status(402).json({err : 'Invalid request!'});
    // }

    jwt.verify(token, SECRET_KEY, (err, payload) => {
        if(err) {
            return res.status(402).json({err : 'Invalid request!3'});
        }

        User.findById(payload._id, (err, doc) => {
            if(err) {
                return res.status(422).json({err : 'Oops! something went wrong!'});
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