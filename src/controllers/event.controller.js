'use strict';

const Event = require ('../models/event.model');
const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const { validateData, checkUpdateEvent } = require('../utils/validate');


//testeo de controller Evento
exports.testEvento=(req, res)=>{
    return res.send({menssage: 'el controlador evento esta funcionando'})
}

//-----------------------------CRUD De Events--------------------------------------
exports.addEvent = async (req, res) => {
    try {
        const hotel = req.params.id;
        const userId = req.user.sub;
        const params = req.body;
        let data = {
            hotel: req.params.id,
            name: params.name,
            description: params.description,
            typeEvent: params.typeEvent,
            dateEvent: params.dateEvent
        }
        let msg = validateData(data);
        if (!msg) {

            const checkHotel = await Hotel.findOne({ _id: hotel });
            if (checkHotel === null || checkHotel.id != hotel) return res.status(400).send({ message: 'You cannot add evento to this evento' });
                if(checkHotel.adminHotel != userId) return  res.status(400).send({ message: 'This hotel does not belong to you'});

                const checkEvent = await Event.findOne({ name: data.name, hotel: hotel}).lean()
                if (checkEvent != null) return res.status(400).send({ message: 'An event with the same name already exists' });

                const event = new Event(data);
                await event.save();
                return res.send({message: 'Evento successfully created', event });
            
        }else{
            return res.status(400).send(msg);
        }
    }catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving evento' });
    }
}

exports.updateEvent = async(req, res)=>{
    try{
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const eventId = req.params.id;
        const params = req.body;

        const hotelExist = await Hotel.findOne({_id: hotelId });
        if(!hotelExist) return res.status(400).send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return  res.status(400).send({ message: 'This hotel does not belong to you'})

        const checkHotelEvent = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean()
        if (checkHotelEvent == null || checkHotelEvent.hotel._id != hotelId) return res.status(400).send({ message: 'You cant update this event' })

        const checkEventUpdated = await Event.findOne({ name: params.name, hotel: hotelId }).lean()
        if (checkEventUpdated != null) return res.status(400).send({ message: 'An event with the same name already exists' });

        const checkEvent = await checkUpdateEvent(params);
        if(checkEvent === false) return res.status(400).send({message: 'Not sending params to update or params cannot update'});

        const updateEvent = await Event.findOneAndUpdate({_id: eventId},params, {new: true})
        .lean()
        if(!updateEvent) return res.send({message: 'Event does not exist or event not updated'});
        return res.send({message: 'Event updated successfully', updateEvent});
    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating evento' });
    }
}

exports.deleteEvent = async(req, res)=>{
    try{
        const userId = req.user.sub;
        const hotelId = req.params.idHotel;
        const eventId = req.params.id;

        const hotelExist = await Hotel.findOne({_id: hotelId });
        if(!hotelExist) return res.status(400).send({message: 'Hotel not found'});
        if(hotelExist.adminHotel != userId) return  res.status(400).send({ message: 'This hotel does not belong to you'})

        const checkHotelEvent = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean()
        if (checkHotelEvent == null || checkHotelEvent.hotel._id != hotelId) return res.status(400).send({ message: 'You cant delete this event' })

        const eventoDeleted = await Event.findOneAndDelete({ _id: eventId });
        if(!eventoDeleted) return res.status(400).send({message: 'Evento not found or alredy removed'});
        return res.send({ message: 'Evento deleted successfully', eventoDeleted });
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting evento'});
    }
}

exports.getEvents = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId});
        console.log(hotelExist);
        if(!hotelExist) return res.send({ message: 'Hotel not found' });
        const events = await Event.find({ hotel: hotelId }).lean();
        if (!events) return res.staus(400).send({ message: 'Events not found' });
            return res.send({ hotel: hotelExist.name, events: events });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'error getting events' });
    }
}

exports.getEvent = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const eventId = req.params.id;
        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'You cannot see the events of this hotel' });
        } else {
            const checkEventHotel = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean();
            if (checkEventHotel == null || checkEventHotel.hotel._id != hotelId) {
                return res.status(404).send({ message: 'You cant see this event' });
            } else {
                return res.send({ message: 'Event found:', checkEventHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting event' });
    }
}


exports.getEventsByHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotelExist = await Hotel.findOne({_id: hotelId});
        if(!hotelExist) return res.send({ message: 'Hotel not found' });
        const events = await Event.find({ hotel: hotelId }).lean();
        if (!events) return res.staus(400).send({ message: 'Events not found' });
            return res.send({ hotel: hotelExist.name, events: events });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'error getting events' });
    }
}

