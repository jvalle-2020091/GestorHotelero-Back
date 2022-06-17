'use strict'

const mongoose = require('mongoose');

const invoiceSchema = Schema({
    dateGenerate: Date,
    totalPrice: Number,
    reservation: [{type: Schema.ObjectId, ref:'reservation'}]
});

module.exports = mongoose.model('invoice', invoiceSchema)