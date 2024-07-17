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
    avatar: {
        type: String,
        default: 'https://book-brawl.vercel.app/assets/account-D8hsV5Dv.jpeg'
    },
    wordsRead: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        default: "Salut, je participe au BookBrawl 2024"
    },
    booksRead: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
    favoriteBooks: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
    CurrentReader: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
    FutureReader: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
    rewards: [{
        type: Schema.Types.ObjectId,
        ref: 'Reward'
    }],
})

const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel
