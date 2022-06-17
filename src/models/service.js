'use strict'
const mongoose = require('mongoose')

const serviceSchema = Schema({
    hotel: { type: Schema.ObjectId, ref: 'hotel' },
    name: String,
    description: String,
    price: Number
});

module.exports = mongoose.model('service', serviceSchema)