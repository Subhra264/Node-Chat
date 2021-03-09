const User = require('../models/UserModel');

module.exports = {
    getProfile: (req, res) => {
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
    
            res.render('profile', {
                name: user.name,
                userId: user._id,
                thisUser: {
                    _id: req.user._id,
                    name: req.user.name
                }
            });
        });
    }
}