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
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
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
        enum: ['Français', 'Anglais', 'Espagnol', 'Allemand'],
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
        enum: ['Action','Dystopie','Fantaisie','Fiction','Magie','Méditation', 'Young Adult','Paranormal','Philosophie','Romance','Science-fiction', 'Policier']
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
    }],
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    }
});

const BookModel = mongoose.model('Book', bookSchema);

module.exports = BookModel;