'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const userRoutes = require('../src/routes/user.routes');
const hotelRoutes = require('../src/routes/hotel.routes');
const roomRoutes = require('../src/routes/room.routes');
const eventRoutes = require('../src/routes/event.routes');
const serviceRoutes = require('../src/routes/service.routes');

const app = express(); //instancia

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());

app.use('/user', userRoutes);
app.use('/hotel', hotelRoutes);
app.use('/room', roomRoutes);
app.use('/event', eventRoutes);
app.use('/service', serviceRoutes);

module.exports = app;