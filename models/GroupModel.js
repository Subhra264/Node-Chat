const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    users: [
        {
            name: String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    
    name: {
        type: String,
        required: true
    },
    
    textChannels: [
        {
            name: String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: "TextChannel"
            }
        }
    ],

    voiceChannels: [
        {
            name: String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: "VoiceChannel"
            }
        }
    ]
});

module.exports = mongoose.model("Group", GroupSchema);