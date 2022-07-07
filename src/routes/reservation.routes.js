'use strict'

const reservationController = require('../controllers/reservation.controller');
const express = require('express');
const mdAuth = require('../services/authenticated');
const api = express.Router();

api.post('/addReservation/:idHotel', mdAuth.ensureAuth ,reservationController.addReservation );


module.exports = api;