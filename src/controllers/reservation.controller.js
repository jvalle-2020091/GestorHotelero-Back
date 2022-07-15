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
            IVA: 0,
            subtotal: 0,
            totalPrice: 0
        }
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el hotel
        const checkHotel = await Hotel.findOne({ _id: hotel });
        if (checkHotel === null || checkHotel.id != hotel) return res.status(400).send({ message: 'hotel not exist' });

        //Verificar que la habitación si existe y esta disponible
        const checkRoom = await Room.findOne({ _id: data.room })
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
            subtotal: checkService.price + checkRoom.price,
        }
        data.IVA = reservation.subtotal * 0.12;
        data.subtotal = reservation.subtotal - data.IVA;
        data.totalPrice = reservation.subtotal; 


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
        const reservations = await Reservation.find({ hotel: hotelId })
            .lean()
            .populate('room')
            .populate('service')
        if (!reservations) return res.status(400).send({ message: 'Reservations not found' });
        return res.send({ message: 'Reservations found:', reservations });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error getting reservations by user' })
    }
}

exports.getReservation = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const reservationId = req.params.id;
        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null) {
            return res.status(404).send({ message: 'You cannot see the reservation of this hotel' });
        } else {
            const checkReservationHotel = await Reservation.findOne({ _id: reservationId, user: userId })
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
        if (checkUserHotel == null)
            return res.status(404).send({ message: 'Hotel dont exist' });
        const reservations = await Reservation.find({ hotel: hotelId, user: userId })
            .lean()
            .populate('room')
            .populate('service')
        if (!reservations)
            return res.status(400).send({ message: 'Reservations not found' });
        return res.send({ messsage: 'Reservations found:', reservations });

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error getting My Reservatiosn' })

    }
}

/*exports.addRoomsToReservation = async(req, res)=>{
    try{
        const reservationId = req.params.id;
        const params = req.body;
        const user = req.user.sub;
        const data = {
            room: params.room
        }
        const msg = validate.validateData(data);
        if(msg) return res.status(400).send(msg);
        const reserExist = await Reservation.findOne({_id: reservationId});
        const roomExist = await Room.findOne({_id: data.room})
        .lean();
        if(!roomExist) return res.status(400).send({message: 'Habitacion Inexistente'});
        if(reserExist){
            for(let room of reserExist.room){
                if(roomExist == data.room) return res.status(400).send({message: 'Ya cuentas con estas habitaciones en tu reservacion'});
            }
            const room = {
                room: params.room.toString(),
                subTotal:  roomExist.price.toString() 
            }
           
            const total1 = reserExist.rooms.map(room=>
                room.subTotal).reduce((prev, curr)=> prev + curr, 0)+ room.subTotal;
            const pushRoom = await Reservation.findOneAndUpdate(
                {_id: reserExist._id},
                { $push: {room: room}},
                {new: true}
            );
            const roomAva = await Room.findOneAndUpdate({_id: room}, {new: true});
            return res.send({message: 'Nuevas habitaciones agregadas', pushRoom});
        }else{
            const room = {
                room: params.room,
                subTotal:  roomExist.price 
            }

            data.total = room.subTotal;
            const reservation = new Reservation(data);
            await reservation.save();
            const roomAva = await Room.findOneAndUpdate({_id: room},  {new: true});
            return res.send({message: 'Habitacion/es agregadas satisfactoriamente', reservation});
        }

    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando la reservacion'});
    }
}*/

/*exports.addServicesToReservation = async(req, res)=>{
    try{    
        const reservationId = req.params.id;
        const params = req.body;
        const user = req.user.sub;
        const data = {
            service: params.service
        }
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);
        const serviceExist = await Service.findOne({_id: params.service});
        const reserExist = await Reservation.findOne({_id: reservationId});
        const roomExist = reserExist.room;

        if(serviceExist.hotel.toString() != reserExist.hotel.toString()) return res.status(400).send({message: 'no se puede agregar servicio de un hotel diferente' });
        if(reserExist){
            for(let service of reserExist.service){
                if(service.service == params.service) return res.status(400).send({message: 'Ya cuentas con este servicio en tu reservacion'});
            }
            const service = {
                service: params.service,
                subTotal:  serviceExist.price
            }
            const total2 = reserExist.service.map(service=>
                service.subTotal).reduce((prev, curr)=> prev + curr, 0) + service.subTotal;
            const pushEvent = await Reservation.findOneAndUpdate(
                {_id: reserExist._id},
                { $push: {service: service},
                    total: reserExist.total + total2},
                {new: true}
            );
            return res.send({message: 'Nuevo servicio añadido a la reservacion', pushEvent});
        }else{
            return res.status(400).send({message: 'Es necesaria iniciar la reservacion con las habitaciones, no es posible agregar servicios sin habitaciones'});
        }

    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error agregando la reservacion'});
    }
} */

exports.deleteReservation = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const reservationId = req.params.idReser;
        const params = req.body;
     

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) return res.status(400).send({ message: 'Hotel no encontrado' });
        const checkHotelReservation = await Reservation.findOne({ _id: reservationId, hotel: hotelId }).populate('hotel').lean();
        if (checkHotelReservation == null || checkHotelReservation.hotel._id != hotelId)
        return res.status(400).send({ message: 'No puedes eliminar esta reservación' })
        var updateAvailable = await Room.findOneAndUpdate({ _id:  params.room }, { available: true }, { new: true });
        const reservationDeleted = await Reservation.findOneAndDelete({ _i: reservationId, hotel: hotelId }).populate('hotel').lean()
        if (!reservationDeleted)
            return res.status(400).send({ message: 'Reservación no encontrada o ya eliminada' })
        return res.send({ message: 'Reservación eliminada correctamente', reservationDeleted,updateAvailable })
    
    } catch (err) {
        console.log(err)
        return res.status(500).send({ err, message: 'Error' });

    }
}