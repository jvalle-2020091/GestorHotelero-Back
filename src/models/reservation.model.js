'use strict'

const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
  startDate: Date,
  endDate: Date,
  subtotal: Number,
  IVA: Number,
  totalPrice: Number,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  hotel: { type: mongoose.Schema.ObjectId, ref: 'hotel' },
  room: [{ 
    room: {type: mongoose.Schema.ObjectId, ref: 'room'},
    subTotal: Number
   }],
  service:[{ 
    service: {type: mongoose.Schema.ObjectId, ref: 'service'},
    subTotal: Number
   }],
});

module.exports = mongoose.model('reservation', reservationSchema)