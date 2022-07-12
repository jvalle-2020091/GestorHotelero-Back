'use strict'

const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const Room = require('../models/room.model');
const Reservation = require('../models/reservation.model');
const Service = require('../models/service.model');
const validate = require('../utils/validate');

exports.test = (req, res) => {
    return res.send({ message: 'The function test is running' });
};


// -------------- agregar reservaciones ---------------
exports.addReservation = async (req, res) => {
    try {
        const params = req.body;
        const hotel = req.params.idHotel;
        const data = {
            user: req.user.sub,
            hotel: req.params.idHotel,
            startDate: params.startDate,
            endDate: params.endDate,
            room: params.room,
            service: params.service,
            totalPrice: 0
        }
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el hotel
        const checkHotel = await Hotel.findOne({ _id: hotel });
        if (checkHotel === null || checkHotel.id != hotel) return res.status(400).send({ message: 'hotel not exist' });

        //Verificar que la habitación si existe y esta disponible
        const checkRoom = await Room.findOne({ _id: data.room})
        if (!checkRoom)
            return res.status(400).send({ message: 'Room not found' });
        if (checkRoom.available == false)
            return res.status(400).send({ message: 'Room not Available.' });

        //Verificar que exista el servicio
        const checkService = await Service.findOne({ _id: data.service })
        if (!checkService)
            return res.status(400).send({ message: 'Service not found' });

        //Actualizar la disponibilidad de las habitaciones
        var updateAvailable = await Room.findOneAndUpdate({ _id: data.room }, { available: false }, { new: true });
        
        //Calcular el precio total de la reservación
        const reservation = {
            totalPrice: checkService.price + checkRoom.price,
        }
        data.totalPrice = reservation.totalPrice;
        

        const reservacion = new Reservation(data);
        await reservacion.save();
        return res.send({ message: 'Reservation created successfully', reservacion });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Reservation in Hotel' });
    }
}

exports.getReservations = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const reservations = await Reservation.find({ hotel: hotelId})
        .lean()
        .populate('room')
        .populate('service')
        if (!reservations) return res.status(400).send({message: 'Reservations not found'});
                    return res.send({message: 'Reservations found:', reservations});  
    } catch (err) {
        console.log(err); 
        return res.status(500).send({err, message: 'Error getting reservations by user'})
    }
}

exports.getReservation = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const reservationId = req.params.id;
        const checkUserHotel = await Hotel.findOne({_id: hotelId }).lean()
        if (checkUserHotel == null ) {
            return res.status(404).send({ message: 'You cannot see the reservation of this hotel' });
        } else {
            const checkReservationHotel = await Reservation.findOne({ _id: reservationId, user: userId})
            .populate('room')
            .populate('service')
            .populate('user')
            .lean()
            if (checkReservationHotel == null || checkReservationHotel.hotel._id != hotelId) {
                return res.status(404).send({ message: 'You cant see this room' });
            } else {
                return res.send({ message: 'Reservation found:', checkReservationHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error getting room' });
    }
}

exports.myReservations = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null ) 
            return res.status(404).send({ message: 'Hotel dont exist' });
            const reservations = await Reservation.find({ hotel: hotelId, user: userId})
            .lean()
            .populate('room')
            .populate('service')
            if (!reservations) 
                return res.status(400).send({ message: 'Reservations not found' });
                return res.send({ messsage: 'Reservations found:', reservations });
        
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error getting My Reservatiosn'})
        
    }
}