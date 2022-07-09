'use strict';

const invoiceController = require('../controllers/invoice.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './pdfs'});


api.get('/test', invoiceController.test);
api.get('/getInvoice/:id', invoiceController.getInvoice);
api.post('/addInvoice/:id', invoiceController.addInvoice);


module.exports = api;