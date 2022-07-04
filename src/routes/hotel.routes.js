'use strict'

const hotelController = require('../controllers/hotel.controller');
const express = require('express');
const mdAuth = require('../services/authenticated');
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/hotels'});
const api = express.Router();

api.get('/test', hotelController.testHotel);

// Funciones ADMIN-HOTEL
api.post('/saveHotel', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.saveHotel);
api.put('/updateHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.updateHotel);
api.delete('/deleteHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.deleteHotel);

// Funciones ADMIN-APP
api.post('/saveHotelByAdmin', [mdAuth.ensureAuth, mdAuth.isAdminAPP], hotelController.saveHotelByAdmin);
api.put('/updateHotelByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], hotelController.updateHotelByAdmin);
api.delete('/deleteHotelByAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], hotelController.deleteHotelByAdmin);

//Carga de imagenes
api.post('/uploadImage/:id', [mdAuth.ensureAuth, upload], hotelController.uploadImage);
api.get('/getImage/:fileName', upload, hotelController.getImage);

//Funciones publicas
api.get('/getHotels',  hotelController.getHotels);
api.get('/getHotel/:id', mdAuth.ensureAuth, hotelController.getHotel);
api.post('/searchHotel', mdAuth.ensureAuth, hotelController.searchHotel);

api.get('/myHotel',  [mdAuth.ensureAuth, mdAuth.isAdmin], hotelController.myHotel)

module.exports = api;