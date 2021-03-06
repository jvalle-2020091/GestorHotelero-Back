'use strict'

const EventoController=require('../controllers/event.controller')
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');

//rutas publicas
api.get('/test', mdAuth.ensureAuth, EventoController.testEvento)
//--------------ADMIN-HOTEL------------------------

api.post('/addEvent/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], EventoController.addEvent);
api.put('/updateEvent/:idHotel/:id',[mdAuth.ensureAuth, mdAuth.isAdmin],  EventoController.updateEvent);
api.delete('/deleteEvent/:idHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdmin],  EventoController.deleteEvent);
//-----------------Clients-------------------------

api.get('/getEvent/:idHotel/:id', mdAuth.ensureAuth,EventoController.getEvent);
api.get('/getEvents/:id',mdAuth.ensureAuth, EventoController.getEvents);

module.exports = api;