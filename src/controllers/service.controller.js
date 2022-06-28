'use strict'

const Hotel= require('../models/hotel.model');
const service= require('../models/service.model');
const validate = require('../utils/validate');

exports.addService = async (req, res) => {
    try {
        const params = req.body;
        const hotelId = req.hotel.sub;
        let data = {
            hotel: params.hotel,
            name: params.product,
            description: params.stock,
            price: 0
        }
        let msg = validate.validateData(data);
        if (!msg) {
            const checkHotel = await Hotel.findOne({ _id: data.hotel });
            if (checkHotel === null || checkHotel.hotel != hotelId) {
                return res.status(400).send({ message: 'You cannot add service to this hotel' });
            }else{
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
        const serviceId = req.params.id;
        const params = req.body;
        const hotel = await hotel.findOne({_id: req.hotel.sub});
        const checkService = await Service.findOne({ _id: serviceId })
        if (checkService) {
            const checkUpdated = await validate.checkUpdateService(params);
            if (checkUpdated) {
                const checkHotelService = await validate.findServiceOnHotel(hotel, checkService._id)
                if(checkHotelService){
                    const updateService = await Product.findOneAndUpdate({ _id: serviceId }, params, { new: true });
                    if (updateService) {
                        return res.send({ message: 'Updated :', updateService });
                    } else {
                        return res.send({ message: 'Failed to update ' });
                    }
                }else{
                    return res.send({ message: 'You are not the owner '});
                }
            } else {
                return res.status(400).send({ message: 'invalid parameters' });
            }
        } else {
            return res.status(400).send({ message: 'service not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error updating the service' });
    }
}

exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const hotel = await Hotel.findOne({_id: req.hotel.sub});
        const checkService = await Service.findOne({ _id: serviceId });
        if(checkService){
            const checkUserService = await validate.findServiceOnHotel(hotel, checkService._id);
            if(checkUserService){
                const serviceDeleted = await service.findOneAndDelete({ _id: serviceId });
                await hotel.service.pull(checkUserService);
                await hotel.save();
                return res.send({ message: 'Service removed:', serviceDeleted });
            }else{
                return res.send({ message: 'You are not the owner of this service'});
            }
        }else{
            return res.send({ message: 'Product not found or already removed' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({message: 'Failed to delete product' });
    }
}

exports.getServices = async (req, res) => {
    try {
        const hotel = await hotel.findOne({_id: req.hotel.sub}).populate('services');
        const services = hotel.services
        if(services)
            return res.send({ message: 'services found:', products })
            return res.send({ message: 'No services found' })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error looking for the sesrvices' });
    }
}