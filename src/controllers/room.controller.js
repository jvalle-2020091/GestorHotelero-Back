'use strict'

var room = require('../models/room.model');
const {validateData, checkUpdate} = require ('../utils/validate');

exports.test = (req, res)=>{
    try{
        return res.send({message: 'Test running'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error'})
    }
}

// Ver cuartos

exports.getRooms = async(req, res)=>{
    try{
        const rooms = await room.find();
        return res.send({rooms})
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message:'Error getting rooms'})
    }
}

// Agregar Cuartos

exports.saveRooms = async(req, res)=>{
    try{
        const hotelId = req.params.id;
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            category: params.category,
            price: params.price
        };
        const msg = validateData(data);
        if(!msg){
            const room = new Room(data);
            await room.save();
            return res.send({message: 'Room Saved'});
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return err;
    }
}


// Actualizar Cuarto 

exports.updateRoom = async(req, res)=>{
    try{
        const params = req.body;
        const roomId = req.params.id;
        const check = await checkUpdate(params);
        if(check === false) return res.status(500).send({message: 'Error geting data'});
        const updateRoom = await Room.findOneAndUpdate({_id: productId},params, {new: true});
        return res.send({message: 'Room Updated', updateRoom});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.deleteRoom = async(req, res)=> {
    try{
        const roomId = req.params.id;
        const roomDeleted = await Product.findOneAndDelete({_id: roomId});
        if(!roomDeleted)return res.status(500).send({message: 'Room not found or already deleted'});
        return res.send({roomDeleted, message: 'Room Deleted'});
    }catch(err){
        console.log(err);
        return err;
    }
}