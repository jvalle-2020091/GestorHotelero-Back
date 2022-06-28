'use strict'

const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    name: String,
    description: String,
    typeEvent: String,
    dateEvent: Date
});

module.exports = mongoose.model('event', eventSchema)