'use strict'
const mongoose = require('mongoose')

const hotelSchema = mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    image: String,
    timesRequest: Number,
    adminHotel: { type: mongoose.Schema.ObjectId, ref: 'user' }
})

module.exports = mongoose.model('hotel', hotelSchema)