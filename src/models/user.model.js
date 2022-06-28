'use strict'

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    password: String,
    email: String,
    image: String,
    role: String,
    phone: String,
    reservations: [{type: mongoose.Schema.ObjectId, ref: "reservation"}],
    history: [{type: mongoose.Schema.ObjectId, ref: "hotel"}],
    invoice: [{type: mongoose.Schema.ObjectId, ref: 'invoice'}]
});

module.exports = mongoose.model('user', userSchema)

