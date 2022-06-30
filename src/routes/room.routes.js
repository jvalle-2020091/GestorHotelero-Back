'use strict'

const roomController = require('../controllers/room.controller');
const express = require('express');
const mdAuth = require('../services/authenticated');
const api = express.Router();

api.get('/test', roomController.test);
//--------------ADMIN-HOTEL------------------------
api.post('/saveRoom/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.saveRoom);
api.put('/updateRoom/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.updateRoom);
api.delete('/deleteRoom/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.deleteRoom);

//---------------CLIENTS-------------------------------
api.get('/getRoomsByHotel/:id', mdAuth.ensureAuth, roomController.getRoomsByHotel);
api.get('/getRoomsAvailable/:idHotel',mdAuth.ensureAuth, roomController.getRoomsAvailable);
api.get('/getRooms/:idHotel', mdAuth.ensureAuth, roomController.getRooms);
api.get('/getRoom/:idHotel/:id', mdAuth.ensureAuth, roomController.getRoom);

module.exports = api;