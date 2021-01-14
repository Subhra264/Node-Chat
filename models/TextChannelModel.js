const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TextChannelSchema = new Schema({
    parentGroup: {
        type: Schema.Types.ObjectId,
        ref: "Group"
        // required: true
    },
    
    name: {
        type: String,
        required: true
    },

    textMessages : [
        {
            message: {
                type: String || Buffer,
                required: true
            },
            sender : {
                name: String,
                reference: {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                }
            }
        }
    ]
});

module.exports = mongoose.model("TextChannel", TextChannelSchema);