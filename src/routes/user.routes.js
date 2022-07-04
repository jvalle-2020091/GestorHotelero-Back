'use strict'

const express = require('express');
const userController = require('../controllers/user.controller');
const api = express.Router();
const mdAuth = require('../services/authenticated');
const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/users'});

//FUNCIÓN PÚBLICA
api.get('/test', userController.test);

//FUNCIONES PRIVADAS
//CLIENT
api.post('/register', userController.register);
api.post('/login', userController.login);
api.put('/update', mdAuth.ensureAuth, userController.update);
api.delete('/delete', mdAuth.ensureAuth, userController.delete);
api.get('/myProfile', mdAuth.ensureAuth, userController.myProfile);


//FUNCIONES PRIVADAS
//ADMIN-HOTEL
api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.saveUser);
api.put('/updateUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.updateUser);
api.delete('/deleteUser/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], userController.deleteUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.getUsers);
api.get('/getUser/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.getUser);

//FUNCIONES PRIVADAS
//ADMIN-APP
api.post('/saveUserHotel', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.saveAdminHotel);
api.put('/updateUserHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.updateAdminHotel);
api.delete('/deleteUserHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.deleteAdminHotel);
api.get('/getUsersHotel', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.getAdminsHotel);
api.get('/getUserHotel/:id', [mdAuth.ensureAuth, mdAuth.isAdminAPP], userController.getAdminHotel);

api.post('/uploadImage/:id', [mdAuth.ensureAuth, upload], userController.uploadImage);
api.get('/getImage/:fileName', upload, userController.getImage);



module.exports = api; 