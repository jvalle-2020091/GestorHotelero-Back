'use strict'

const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    date: String,
    serial: String,
    NIT: String,
    name: String,
    user: {type:mongoose.Schema.ObjectId, ref: 'user'},
    reservations: {type: mongoose.Schema.ObjectId, ref:'reservation'},
});

module.exports = mongoose.model('invoice', invoiceSchema)