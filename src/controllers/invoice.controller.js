' use strict '

const Invoice = require('../models/invoice.model');
const Reservation = require('../models/reservation.model');
const validate = require('../utils/validate');


exports.test = (req, res) => {
    return res.send({ message: 'The function test is running.' });
}

exports.addInvoice = async (req, res) => {
    try {
        const params = req.body;
        const reservation = req.params.id;
        const invoices = await Invoice.count().lean();
        const date = new Date();
        const data = {
            date: date.toISOString().split('T')[0],
            serial: invoices + 1000,
            reservations: req.params.id,
        }
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }
    
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista la reservacion
        const checkReservation = await Reservation.findOne({ _id: reservation });
        if (checkReservation === null || checkReservation.id != reservation)
            return res.status(400).send({ message: 'reservation not exist' });


        const invoice = new Invoice(data);
        await invoice.save();
            return res.send({ message: 'Invoice created successfully', invoice });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Reservation in Hotel' });
    }
}

exports.getInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await Invoice.findOne({ _id: invoiceId }).lean()
        .populate('reservations')
        .populate('reservations.room.name')
        if (!invoice) return res.send({ message: 'Hotel not found' });
        return res.send({ invoice });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error of get hotel' });
    }
}

