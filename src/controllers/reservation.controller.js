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
            return res.status(400).send({ message: 'Habitación no Encontrada.' });
        if (checkRoom.available == false)
            return res.status(400).send({ message: 'Habitación no Disponible.' });

        //Verificar que exista el servicio
        const checkService = await Service.findOne({ _id: data.service })
        if (!checkService)
            return res.status(400).send({ message: 'Servicio no Encontrado.' });

        //Actualizar el estado de las habitaciones
        var updateAvailability = await Room.findOneAndUpdate({ _id: data.room }, { available: false }, { new: true });
        
        //Calcular el precio total de la reservación
        const reservation = {
            totalPrice: checkService.price + checkRoom.price,
        }
        data.totalPrice = reservation.totalPrice;

        const reservacion = new Reservation(data);
        await reservacion.save();
        return res.send({ message: 'Reservación creada Exitosamente.', reservacion });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Reservation in Hotel' });
    }
}
