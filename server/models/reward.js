const mongoose = require('mongoose');
const { Schema } = mongoose;

const rewardSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    criteria: {
        type: String,
        enum: ['word', 'book', 'participation', 'creation'],
        required: true
    },
    threshold: {
        type: Number,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }]
});

const RewardModel = mongoose.model('Reward', rewardSchema);

module.exports = RewardModel;