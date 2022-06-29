'use strict'

const Room = require('../models/room.model');
const Hotel = require('../models/hotel.model');
const User = require('../models/user.model');
const {validateData, checkUpdateRoom} = require ('../utils/validate');

exports.test = (req, res)=>{
    try{
        return res.send({message: 'Test running'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error'})
    }
}

//--------------------------------CRUD DE ROOMS-----------------------------------------

exports.getRooms = async(req, res)=>{
    try{
        const rooms = await Room.find();
        return res.send({rooms})
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message:'Error getting rooms'})
    }
}

exports.getRoom = async(req, res)=>{
    try{
        const roomId = req.params.id;
        const room = await Room.findOne({_id: roomId})
        .lean()
        if(!room) return res.status(404).send({message: 'Room not found'});
        return res.send({message: 'Room found:', room});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message:'Error getting rooms'})
    }
}


exports.saveRoom = async(req, res)=>{
    try{
        const hotel = req.params.id;
        const userId = req.user.sub;
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            price: params.price,
            available: 1,
            dateAvalable: params.dateAvalable,
            hotel: req.params.id,
        };
        const msg = validateData(data);
        if(!msg){
            let hotelExist = await Hotel.findOne({ _id: hotel})
            if(!hotelExist) return res.status(400).send({message: 'This hotel does not exist'});
            if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'})
            const room = new Room(data);
            await room.save();
            return res.send({message: 'Room saved successfully', room});
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return err;
    }
}


exports.updateRoom = async(req, res)=>{
    try{
        const params = req.body;
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const roomId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId });
        console.log(hotelExist);
        if(!hotelExist) return res.send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'})
        const checkRoom = await checkUpdateRoom(params);
        if(checkRoom === false) return res.status(400).send({message: 'Not sending params to update or params cannot update'});
        const updateRoom = await Room.findOneAndUpdate({_id: roomId},params, {new: true})
        .lean()
       // .populate('hotel');
        if(!updateRoom) return res.send({message: 'Room does not exist or room not updated'});
        return res.send({message: 'Room updated successfully', updateRoom});
    }catch(err){
        console.log(err);
        return err;
    }
}


exports.deleteRoom = async(req, res)=> {
    try{
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const roomId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId });
        console.log(hotelExist);
        if(!hotelExist) return res.send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'})
        
        const roomDeleted = await Room.findOneAndDelete({_id: roomId});
        if(!roomDeleted)return res.status(500).send({message: 'Room not found or already deleted'});
        return res.send({roomDeleted, message: 'Room deleted sucesfully'});
    }catch(err){
        console.log(err);
        return err;
    }
}

//--------------------VER HABITACIONES POR HOTEL----------------------------------
exports.getRoomsByHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId});
        if(!hotelExist) return res.send({ message: 'Hotel not found' });
        const rooms = await Room.find({hotel: hotelId})
            .lean(); 
            return res.send({hotel: hotelExist.name, rooms: rooms});
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error searching rooms by hotel'});
    }
}