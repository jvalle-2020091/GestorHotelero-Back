'use strict'

const Hotel= require('../models/hotel.model');
const Service= require('../models/service.model');
const validate = require('../utils/validate');

//--------------------CRUD de Services---------------------------

exports.addService = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const userId = req.user.sub;
        const params = req.body;
        let data = {
            hotel: req.params.id,
            name: params.name,
            description: params.description,
            price: params.price
        }
        let msg = validate.validateData(data);
        if (!msg) {
            const checkHotel = await Hotel.findOne({ _id: hotelId });
            if (checkHotel === null || checkHotel.id != hotelId) {
                console.log(checkHotel);
                return res.status(400).send({ message: 'You cannot add service to this hotel' });
            }else{
                if(checkHotel.adminHotel != userId) return  res.status(400).send({ message: 'This hotel does not belong to you'})
                const service = new Service(data);
                await service.save();
                return res.send({ message: 'Service successfully created', service });
            }
        }else{
            return res.status(400).send(msg);
        }
    }catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving service' });
    }
}


exports.updateService = async (req, res) => {
    try {
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const serviceId = req.params.id;
        const params = req.body;
        const hotelExist = await Hotel.findOne({_id: hotelId });
        console.log(hotelExist);
        if(!hotelExist) return res.status(400).send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return  res.status(400).send({ message: 'This hotel does not belong to you'})
        const checkService = await validate.checkUpdateService(params);
        if(checkService === false) return res.status(400).send({message: 'Not sending params to update or params cannot update'});
        const updateService = await Service.findOneAndUpdate({_id: serviceId},params, {new: true})
        .lean()
       // .populate('hotel');
        if(!updateService) return res.send({message: 'Service does not exist or service not updated'});
        return res.send({message: 'Service updated successfully', updateService});
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating the service' });
    }
}

exports.deleteService = async (req, res) => {
    try {
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const serviceId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId });

        if(!hotelExist) return res.send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return res.send({ message: 'This hotel does not belong to you'})
        
        const serviceDeleted = await Service.findOneAndDelete({_id: serviceId});
        if(!serviceDeleted)return res.status(500).send({message: 'Service not found or already deleted'});

        return res.send({serviceDeleted, message: 'Service deleted sucesfully'});
    } catch (err) {
        console.log(err);
        return res.status(500).send({message: 'Failed to delete service' });
    }
}

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();
        return res.send({services})
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error looking for the services' });
    }
}

exports.getService = async(req,res)=>{
    try{
        const serviceId = req.params.id
        const service = await Service.findOne({_id: serviceId});
        if(!service)return res.send({message: 'Service not found'})
        return res.send({message: 'Service found', service});
    }catch(err){
        console.log(err)
        return res.status(500).send({ message: 'Error looking for the service' });

    }
}

exports.getServiceByHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId});
        if(!hotelExist) return res.send({ message: 'Hotel not found' });
        const services = await Service.find({hotel: hotelId})
            .lean(); 
            return res.send({hotel: hotelExist.name, services: services});
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error searching services by hotel'});
    }
}