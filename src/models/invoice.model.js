'use strict'

const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    date: String,
    serial: String,
    NIT: String,
    IVA: Number,
    startDate: Date,
    endDate: Date,
    user: {type:mongoose.Schema.ObjectId, ref: 'user'},
    reservations: {type: mongoose.Schema.ObjectId, ref:'reservation'},
    totalPrice: Number,
});

module.exports = mongoose.model('invoice', invoiceSchema)