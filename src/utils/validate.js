'use strict'

const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const bcrypt = require('bcrypt-nodejs');
const fs = require('fs');
const { crossOriginResourcePolicy } = require('helmet');

exports.validateData = (data) =>{
    let keys = Object.keys(data), msg = '';

    for(let key of keys){
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `The params ${key} es obligatorio\n`
    }
    return msg.trim();
}

exports.alreadyUser = async (username)=>{
   try{
    let exist = User.findOne({username:username}).lean()
    return exist;
   }catch(err){
       return err;
   }
}

exports.encrypt = async (password) => {
    try{
        return bcrypt.hashSync(password);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash)=>{
    try{
        return bcrypt.compareSync(password, hash);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (userId, sub)=>{
    try{
        if(userId != sub){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkUpdate =  async(user)=>{
    try{
        if(user.password || Object.entries(user).length === 0 || user.role)
        return false;
        else 
        return true;
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkUpdateAdmin = async(params)=>{
    try {
        if (Object.entries(params).length === 0 || params.password) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

 exports.deleteSensitiveData = async(data)=>{
    try{
        delete data.user.password;
        delete data.user.role;
        return data;
    }catch(err){
        console.log(err);
        return err;
    }
}

//------------------------------------ HOTELES------------------------

exports.alreadyHotel = async (  name)=>{
    try{
     let exist = Hotel.findOne({   name:name}).lean()
     return exist;
    }catch(err){
        return err;
    }
}
exports.alreadyHotelUser = async ( adminHotel)=>{
    try{
     let exist = Hotel.findOne({  adminHotel:adminHotel }).lean()
     return exist;
    }catch(err){
        return err;
    }
}

exports.alreadyHotelUpdated = async ( name)=>{
    try{
     let exist = Hotel.findOne({ name:name}).lean()
     return exist;
    }catch(err){
        return err;
    }
}

exports.validExtension = async (ext, filePath)=>{
    try{
        if( ext == 'png' ||
            ext == 'jpg' ||
            ext == 'jpeg' ||
            ext == 'gif'){
            return true;
        }else{
            fs.unlinkSync(filePath);
            return false;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}



//---------------------------- Rooms -------------------------------------------------------------------


exports.checkUpdateRoom = async(room)=>{
    if( room.hotel ||
        Object.entries(room).length === 0){
          return false;
      }else{
          return true;
      }
}

//------------------------Services--------------------------------------------------------
exports.checkUpdateService = async(service)=>{
    if( service.hotel ||
        Object.entries(service).length === 0){
          return false;
      }else{
          return true;
      }
}

//------------------------Event--------------------------------------------------------


exports.checkUpdateEvent = async(event)=>{
    if( 
        Object.entries(event).length === 0 || event.hotel ){
          return false;
      }else{
          return true;
      }
}