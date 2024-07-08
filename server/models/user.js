const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    prenom: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true,
        uppercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    wordsRead: {
        type: Number,
        required: true,
        default: 0
    },
})

const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel
