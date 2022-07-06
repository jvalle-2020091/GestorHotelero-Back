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

exports.getRooms = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'You can not see the rooms of this hotel' });
        } else {
            const rooms = await Room.find({ hotel: hotelId }).lean().populate('hotel');
            if (!rooms) {
                return res.staus(400).send({ message: 'Rooms not found' });
            } else {
                return res.send({ messsage: 'Rooms found:', rooms });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting the rooms' });
    }
}

exports.getRoom = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const roomId = req.params.id;
        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'You cannot see the rooms of this hotel' });
        } else {
            const checkRoomHotel = await Room.findOne({ _id: roomId, hotel: hotelId }).populate('hotel').lean();
            if (checkRoomHotel == null || checkRoomHotel.hotel._id != hotelId) {
                return res.status(404).send({ message: 'You cant see this room' });
            } else {
                return res.send({ message: 'Room found:', checkRoomHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting room' });
    }
}


exports.saveRoom = async(req, res)=>{
    try{
        const hotel = req.params.id;
        const userId = req.user.sub;
        const params = req.body;
        let data = {
            name: params.name,
            description: params.description,
            price: params.price,
            available: true,
            dateAvalable: params.dateAvalable,
            hotel: req.params.id,
        }
        let msg = validateData(data);
        if(!msg){
            const hotelExist = await Hotel.findOne({ _id: hotel})
            if(!hotelExist) return res.status(400).send({message: 'This hotel does not exist'});
            if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'});

            const checkRoom = await Room.findOne({ name: data.name , hotel: hotel}).lean()
            if (checkRoom != null) return res.status(400).send({ message: 'An room with the same name already exists' });

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
        if(!hotelExist) return res.send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'});

        const checkHotelRoom = await Room.findOne({ _id: roomId, hotel: hotelId }).populate('hotel').lean()
        if (checkHotelRoom == null || checkHotelRoom.hotel._id != hotelId) return res.status(400).send({ message: 'You cant update this room' })

        const checkRoomUpdated = await Room.findOne({ name: params.name, hotel: hotelId }).lean()
        if (checkRoomUpdated != null) return res.status(400).send({ message: 'An room with the same name already exists' });

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
            if(!rooms) return res.staus(400).send({ message: 'Rooms not found' });
            return res.send({hotel: hotelExist.name, rooms: rooms});
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error searching rooms by hotel'});
    }
}

//--------------------VER HABITACIONES DISPONIBLES POR HOTEL----------------------------------
exports.getRoomsAvailable = async(req,res)=>{
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const hotelExist = await Hotel.findOne({_id: hotelId});
        if (!hotelExist)  return res.status(404).send({message: 'Hotel not found' });
        if (hotelExist.adminHotel != userId) return res.status(401).send({message:'This hotel does not belong to you'});
        const rooms = await Room.find({hotel: hotelId, available: true}).lean()
        if (!rooms) return res.status(400).send({message: 'Rooms not found'});
                    return res.send({message: 'Rooms found:', rooms});  
                }catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error searching rooms by hotel' });
    }
}