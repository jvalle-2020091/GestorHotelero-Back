'use strict'

const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const Room = require('../models/room.model');
const Reservation = require('../models/reservation.model');
const Service = require('../models/service.model');
const Validate = require('../utils/validate');

exports.test = (req, res) => {
    return res.send({ message: 'The function test is running' });
};


// -------------- agregar reservaciones ---------------
exports.addReservation = async (req, res) => {
    try {
        const params = req.body;
        const hotelId = req.params.id;
        const data = {
            room: params.room,
            service: params.service,
            startDate: params.startDate,
            endDate: params.endDate,
        }

        let msg = Validate.validateData(data);
        if (!msg) {
            const chekroom = await Room.findOne({ _id: data.room });
            if (chekroom === null || chekroom.id != hotelId) {
                return res.status(400).send({ message: 'You cannot add reservations to this room' });
            } else {
                const hotel = await Hotel.findOne({ _id: hotelId });
                const reservationAlready = await Reservation.findOne({
                    $and: [
                        { room: data.room }
                    ]
                });
                if (reservationAlready) return res.send({ message: 'Reservation already created on this date' });
                const dataAlready = await Reservation.findOne({
                    $and: [
                        { room: data.room },
                        { startDate: data.date },
                        { endDate: params.date },
                    ]
                });
                if (dataAlready) return res.send({ message: 'Reservation already create on this dates' });
                const reservation = new Reservation(data);
                await reservation.save();
                return res.send({ message: 'Reservation created successfully' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Reservation in Hotel' });
    }
}