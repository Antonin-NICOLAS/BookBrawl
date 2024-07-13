const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    language: {
        type: String,
        enum: ['Français', 'Anglais', 'Espagnol'],
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    wordsRead: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    Readingstatus: {
        type: String,
        required: true,
        enum: ['lu', 'en train de lire', 'à lire']
    },
    themes: {
        type: String,
        enum: ['Action','Dystopie','Fantaisie','Fiction','Magie','Méditation', 'Young Adult','Paranormal','Philosophie','Romance','Science-fiction']
    },
    description: {
        type: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;