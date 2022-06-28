'use strict'

const roomController = require('../controllers/room.controller');
const express = require('express');
const api = express.Router();

api.get('/test', roomController.test);
api.post('/saveRoom', roomController.saveRooms);
api.put('/updateRoom', roomController.updateRoom);
api.delete('/deleteRoom', roomController.deleteRoom);

module.exports = api;