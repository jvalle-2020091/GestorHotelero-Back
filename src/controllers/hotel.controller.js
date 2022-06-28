'use strict'

const { validateData, alreadyHotel, checkUpdate, validExtension, alreadyHotelUpdated} = require('../utils/validate');
const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const fs = require('fs');
const path = require('path');

exports.testHotel = (req, res)=>{
    return res.send({message: 'Function test is running'});
}

exports.saveHotel = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            address: params.address,
            phone: params.phone,
            timesRequest: 0,
            adminHotel: params.adminHotel
        };
        const msg = validateData(data);
        if(!msg){
            let hotelExist = await alreadyHotel( data.adminHotel , data.name);
            if(hotelExist) return res.status(400).send({message: 'This hotel already exists'});
            const checkAdmin = await User.findOne({ _id: data.adminHotel });
            if(checkAdmin === null || checkAdmin._id != data.adminHotel)
            return res.send({message: 'User not exists'})
                console.log(checkAdmin);
            const hotelAlready = await Hotel.findOne({ 
                $and: [
                    {name: data.name},
                    {adminHotel: data.adminHotel}
                ]
            });
            if(hotelAlready)return res.send({message: 'This hotel already existed'});
            const hotel = new Hotel(data);
            await hotel.save();
            return res.send({message: 'Hotel saved successfully'})
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving Hotel'});
    }
}

exports.updateHotel = async(req, res)=>{
    try{
        const hotelId = req.params.id;
        const params = req.body;

        const hotelExist = await Hotel.findOne({ _id: hotelId});
        if (!hotelExist) return res.send({ message: 'Hotel not found' });

        const validateUpdate = await checkUpdate(params);
        if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        let alreadyname = await alreadyHotelUpdated(params.name);
        if(alreadyname) return res.send({message: 'This hotel already exists'});

        const updateHotel = await Hotel.findOneAndUpdate({_id: hotelId}, params, {new: true});
        if(!updateHotel) return res.send({message: 'Hotel not updated'});
        return res.send({message: 'Update Hotel', updateHotel});
    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating hotel' });
    }
}

exports.deleteHotel = async(req, res)=>{
    try{
        const hoteId = req.params.id;

        const hotelExist = await Hotel.findOne({_id: hoteId});
        if(!hotelExist) return res.send({message: 'Hotel not found'});

        const hotelDeleted = await Hotel.findOneAndDelete({ _id: hoteId });
        if(!hotelDeleted) return res.status(400).send({message: 'Hotel not deleted'});
        return res.send({ message: 'Hotel deleted successfully', hotelDeleted });
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting hotel'});
    }
}

exports.getHotels = async(req, res)=>{
    try{
        const hotels = await Hotel.find();
        return res.send(hotels);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error of get hotels'});
    }
}

exports.getHotel = async(req, res)=>{
    try{
        const hotelId = req.params.id;
        const hotel = await Hotel.findOne({_id: hotelId});
        if(!hotel) return res.send({message: 'Hotel not found'});
        return res.send({hotel});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error of get hotel'});
    }
}

exports.searchHotel = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name
        };
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        const hotels = await Hotel.find({name: {$regex: params.name, $options: 'i'}}).lean();
        return res.send({hotels});
    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error searching hotel' });
    }
}

exports.uploadImage = async(req, res)=>{
    try{
        const hotelId = req.params.id;

        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'Havent sent image'});
        const filePath = req.files.image.path;
        const fileSplit = filePath.split('\\');
        const fileName = fileSplit[2];

        const extension = fileName.split('\.');
        const fileExt = extension[1];

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send({message: 'Invalid extension'});
        const updateHotel = await Hotel.findOneAndUpdate({_id: hotelId}, {image: fileName}, {new: true}).lean();
        if(!updateHotel) return res.status(404).send({message: 'Hotel not found'});
        return res.send({message: 'Image added successfully'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error uploading immage'});
    }
}

exports.getImage = async(req, res)=>{
    try{
        const fileName = req.params.fileName;
        const pathFile = './uploads/hotels/' + fileName;

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'Image not found'});
        return res.sendFile(path.resolve(pathFile));
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error getting image'});
    }
}