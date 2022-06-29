'use strict'

const EventoController=require('../controllers/event.controller')
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');

//rutas publicas
api.get('/test', mdAuth.ensureAuth, EventoController.testEvento)
api.post('/addEvento/:id', mdAuth.ensureAuth, EventoController.addEvento);
api.put('/updateEvento/:id', EventoController.updateEvento);
api.delete('/deleteEvento/:id', mdAuth.ensureAuth, EventoController.deleteEvento);
api.get('/getEvento/:id', mdAuth.ensureAuth,EventoController.getEvento);
api.get('/getEventos',mdAuth.ensureAuth, EventoController.getEventos);

module.exports = api;