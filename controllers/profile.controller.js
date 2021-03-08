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

            const isSameUser = JSON.stringify(req.user._id) === JSON.stringify(user._id);
    
            res.render('profile', {
                name: user.name,
                isSameUser 
            });
        });
    }
}