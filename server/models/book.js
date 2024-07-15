const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    Readingstatus: {
        type: String,
        required: true,
        enum: ['lu', 'en train de lire', 'à lire']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
});

const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['Français', 'Anglais', 'Espagnol'],
        required: true
    },
    wordsRead: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    themes: [{
        type: String,
        enum: ['Action','Dystopie','Fantaisie','Fiction','Magie','Méditation', 'Young Adult','Paranormal','Philosophie','Romance','Science-fiction']
    }],
    reviews: [reviewSchema],
    futureReaders: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    currentReaders: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pastReaders: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;