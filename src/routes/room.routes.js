'use strict'

const roomController = require('../controllers/room.controller');
const express = require('express');
const mdAuth = require('../services/authenticated');
const api = express.Router();

api.get('/test', roomController.test);
api.post('/saveRoom/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.saveRoom);
api.put('/updateRoom/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.updateRoom);
api.delete('/deleteRoom/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], roomController.deleteRoom);
api.get('/getRoomsByHotel/:id', mdAuth.ensureAuth, roomController.getRoomsByHotel);
api.get('/getRooms', mdAuth.ensureAuth, roomController.getRooms);
api.get('/getRoom/:id', mdAuth.ensureAuth, roomController.getRoom);

module.exports = api;