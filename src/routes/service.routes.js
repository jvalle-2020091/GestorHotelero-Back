'use strict'

const express = require('express');
const api = express.Router();
const serviceController = require('../controllers/service.controller'); 
const mdAuth = require('../services/authenticated');

//--------------ADMIN-HOTEL------------------------

api.post('/addService/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.addService);
api.put('/updateService/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.updateService);
api.delete('/deleteService/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.deleteService);
api.get('/getServices/:idHotel',[mdAuth.ensureAuth, mdAuth.isAdmin],serviceController.getServices);
api.get('/getService/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], serviceController.getService);

//---------------CLIENTS-------------------------------

api.get('/getServicesByHotel/:id', mdAuth.ensureAuth, serviceController.getServiceByHotel);
module.exports = api;