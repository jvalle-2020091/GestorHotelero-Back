'use strict'

const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    hotel: { type: mongoose.Schema.ObjectId, ref: 'hotel' },
    name: String,
    description: String,
    price: Number,
    available: Boolean,
    dateAvalable: String
})

module.exports = mongoose.model('room', roomSchema);