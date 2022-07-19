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
        const userId = req.user.sub
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

        const userExist = await User.findOne({ _id: userId });
        if (!userExist) return res.status(400).send({ message: 'User not found' });
        //Verificar que exista el hotel
        const checkHotel = await Hotel.findOne({ _id: hotel });
        if (checkHotel === null || checkHotel.id != hotel) return res.status(400).send({ message: 'hotel not exist' });

        //Verificar que la habitación si existe y esta disponible
        const checkRoom = await Room.findOne({ _id: data.room, hotel: hotel })
        if (!checkRoom)
            return res.status(400).send({ message: 'Room not found' });
        if (checkRoom.available == false)
            return res.status(400).send({ message: `This room is reserved until ${checkRoom.dateAvalable}` });

        //validación de fechas
        let date1 = new Date(data.startDate)
        let date2 = new Date(data.endDate)
        if (date1 == 'Invalid Date' || date2 == 'Invalid Date') {
            return res.status(400).send({ message: 'The dates are not valid' })
        } else {
            let today = new Date().toISOString().split("T")[0]
            today = new Date(today)
            let differenceToday = date1.getTime() - today.getTime()
            if (differenceToday < 0) {
                return res.status(400).send({ message: 'You can no longer add on this date, Please enter a start date greater than the current one' })
            } else {
                let difference = date2.getTime() - date1.getTime();
                if (difference < 0) {
                    return res.status(400).send({ message: 'Enter a departure date greater than the start date' })
                } else {
                    if (difference == 0) {
                        return res.status(400).send({ message: 'You cant set the same dates' })
                    }

                    //Verificar que exista el servicio
                    const checkService = await Service.findOne({ _id: data.service })
                    if (!checkService)
                        return res.status(400).send({ message: 'Service not found' });
                    let totalDays = Math.ceil(difference / (1000 * 3600 * 24));
                    const reservation = {
                        subtotal: (checkRoom.price + checkService.price) * totalDays
                    }

                    data.IVA = reservation.subtotal * 0.12;
                    data.subtotal = reservation.subtotal - data.IVA;
                    data.totalPrice = reservation.subtotal;
                    data.status = 'In progress'


                    const reservacion = new Reservation(data);
                    await reservacion.save();


                    let getTimesRequested = checkHotel.timesRequest + 1

                    await Hotel.findOneAndUpdate({ _id: hotel }, { timesRequest: getTimesRequested }, { new: true }).lean()
                    await Room.findOneAndUpdate({ _id: data.room, hotel: hotel }, { available: false, dateAvalable: date2.toISOString().split("T")[0] }, { new: true }).lean()
                    await User.findOneAndUpdate({ _id: req.user.sub }, { $push: { reservations: reservation._id, history: hotel } }, { new: true }).lean();

                    return res.send({ message: 'Reservation created successfully', reservacion });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Reservation in Hotel' });
    }
}


//---------------------Reservaciones del usuario logueado-------------------------
exports.getReservations = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const reservations = await Reservation.find({ hotel: hotelId, user: userId })
            .lean()
            .populate('room')
            .populate('service')
        if (!reservations) return res.status(400).send({ message: 'Reservations not found' });
        for (let i = 0; i < reservations.length; i++) {
            delete reservations[i].user.password
            delete reservations[i].user.role

            reservations[i].startDate = new Date(reservations[i].startDate).toISOString().split("T")[0];
            reservations[i].endDate = new Date(reservations[i].endDate).toISOString().split("T")[0];
        }
        return res.send({ message: 'Reservations found:', reservations });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error getting reservations by user' })
    }
}

//------------------------------------Ver reservaciones por hotel---------------------------------

exports.getReservationsByHotel = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const reservations = await Reservation.find({ hotel: hotelId })
            .lean()
            .populate('hotel')
            .populate('user')
            .populate('room')
            .populate('service')
        if (!reservations) return res.status(400).send({ message: 'Reservations not found' });
        for (let i = 0; i < reservations.length; i++) {
            delete reservations[i].user.password
            delete reservations[i].user.role

            reservations[i].startDate = new Date(reservations[i].startDate).toISOString().split("T")[0];
            reservations[i].endDate = new Date(reservations[i].endDate).toISOString().split("T")[0];
        }
        
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
        return res.status(500).send({ message: 'Error getting reservation' });
    }
}

exports.myReservationsByHotel = async (req, res) => {
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
            for (let i = 0; i < reservations.length; i++) {
                delete reservations[i].user.password
                delete reservations[i].user.role
    
                reservations[i].startDate = new Date(reservations[i].startDate).toISOString().split("T")[0];
                reservations[i].endDate = new Date(reservations[i].endDate).toISOString().split("T")[0];
            }
            
        return res.send({ messsage: 'Reservations found:', reservations });

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error getting My Reservatiosn' })

    }
}

exports.myReservations = async (req, res) => {
    try {
        const userId = req.user.sub;
        const reservations = await Reservation.find({user: userId })
            .lean()
            .populate('room')
            .populate('service')
        if (!reservations)
            return res.status(400).send({ message: 'Reservations not found' });
            for (let i = 0; i < reservations.length; i++) {
                delete reservations[i].user.password
                delete reservations[i].user.role
    
                reservations[i].startDate = new Date(reservations[i].startDate).toISOString().split("T")[0];
                reservations[i].endDate = new Date(reservations[i].endDate).toISOString().split("T")[0];
            }
            
        return res.send({ messsage: 'Reservations found:', reservations });

    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error getting My Reservatiosn' })

    }
}


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
        const hotelId = req.params.idHotel
        const reservationId = req.params.idReservation;
        const userId = req.user.sub

       
        const checkReservationHotel = await Reservation.findOne({ _id: reservationId, hotel: hotelId, user: userId })
        .populate('hotel')
        .populate('room')
        .populate('service')
        .lean();
        if (checkReservationHotel == null || checkReservationHotel.hotel._id != hotelId)
            return res.status(400).send({ message: 'No puedes ver esta reservación' });

        if (checkReservationHotel.status == 'Cancelada')
            return res.status(400).send({ message: 'Esta reservación ya fue cancelada' });

        if (checkReservationHotel.status == 'Facturada')
            return res.status(400).send({ message: 'Esta reservación ya fue facturada' });

        await User.findOneAndUpdate({ _id: checkReservationHotel.user }, { new: true }).lean();
        await Room.findOneAndUpdate({ _id: checkReservationHotel.room._id }, { available: true, dateAvalable: 'Disponible' }, { new: true }).lean();
        await Reservation.findOneAndUpdate({ _id: reservationId }, { status: 'Cancelada' }, { new: true }).lean()

        return res.send({ message: 'Reservación cancelada' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error cancelando la reservación' });
    }
}
