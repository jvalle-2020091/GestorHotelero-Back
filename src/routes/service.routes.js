'use strict'

const express = require('express');
const api = express.Router();
const serviceController = require('../controllers/service.controller'); 

api.post('/addService', mdAuth.ensureAuth, serviceController.addService);
api.put('/updateService/:id', mdAuth.ensureAuth, serviceController.updateService);
api.delete('/deleteService/:id', mdAuth.ensureAuth, serviceController.deleteService);

module.exports = api;