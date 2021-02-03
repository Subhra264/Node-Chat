const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const GroupModel = require('./GroupModel');

const userSchema = new Schema({
    name : {
        required: true,
        type: String
    },

    username:{
        type: String,
        unique:true,
        required: true
    },

    email : {
        required: true,
        unique: true,
        type: String
    },

    password: {
        required: true,
        type: String
    },

    image: {
        type: String
    },

    groups: [
        {
            name: String,
            reference :  {
                type: Schema.Types.ObjectId,
                ref: "Group"
            }
            
        }
    ],
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref : "User"
        }
    ]
});


module.exports = mongoose.model("User", userSchema);