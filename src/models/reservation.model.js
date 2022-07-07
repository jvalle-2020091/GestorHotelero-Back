'use strict'

const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  hotel: { type: mongoose.Schema.ObjectId, ref: 'hotel' },
  room: [{ type: mongoose.Schema.ObjectId, ref: 'room' }],
  service:[{ type: mongoose.Schema.ObjectId, ref: 'service' }],
});

module.exports = mongoose.model('reservation', reservationSchema)