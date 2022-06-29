'use strict'

const express = require('express');
const api = express.Router();
const serviceController = require('../controllers/service.controller'); 
const mdAuth = require('../services/authenticated');


api.post('/addService/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.addService);
api.put('/updateService/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.updateService);
api.delete('/deleteService/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.deleteService);

module.exports = api;