'use strict'

const hotelController = require('../controllers/hotel.controller');
const express = require('express');
const mdAuth = require('../services/authenticated');
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/hotels'});
const api = express.Router();

api.get('/test', hotelController.testHotel);
api.post('/saveHotel', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.saveHotel);
api.put('/updateHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.updateHotel);
api.get('/getHotels', mdAuth.ensureAuth,hotelController.getHotels);
api.get('/getHotel/:id', mdAuth.ensureAuth,hotelController.getHotel);
api.delete('/deleteHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.deleteHotel);
api.post('/searchHotel', mdAuth.ensureAuth, hotelController.searchHotel);
api.post('/uploadImage/:id', [mdAuth.ensureAuth, upload], hotelController.uploadImage);
api.get('/getImage/:fileName', upload, hotelController.getImage);

module.exports = api;