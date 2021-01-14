const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoiceChannelSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    group : {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true
    }
});

module.exports = mongoose.model('VoiceChannel', VoiceChannelSchema);