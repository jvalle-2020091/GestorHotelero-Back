'use strict'

const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    dateGenerate: Date,
    totalPrice: Number,
    reservation: [{type: mongoose.Schema.ObjectId, ref:'reservation'}]
});

module.exports = mongoose.model('invoice', invoiceSchema)