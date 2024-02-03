const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        min: 3,
        max: 256
    },
    topic: {
        type: String,
        require: true,
        enum: {
            values: ['politics', 'health', 'sport', 'tech'],
            message: '{VALUE} is not a valid topic'
        }
    },
    username: {
        type: String,
        require: true,
        min: 3,
        max: 256
    },
    location: {
        type: String,
        min: 3,
        max: 256
    },
    message: {
        type: String,
        min: 2,
        max: 2048
    },
    expiration: {
        type: Date,
        expires: {
            default: 10000
        }
    },
    status: {
        type: String,
        default: 'live'
    },
    likesUser: [{
        type: String
    }],
    like: {
        type: Number,
        default: 0
    },
    dislikesUser: [{
        type: String
    }],
    dislike: {
        type: Number,
        default: 0
    },
    commentsUser: [{
        type: String
    }],
    comments: [{
        type: String,
        min: 2
    }],
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Post', postSchema)