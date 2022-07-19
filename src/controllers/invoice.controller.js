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
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date();
        const data = {
            date: date.toLocaleDateString('es-ES', options),
            serial: invoices + 1000,
            reservations: req.params.id,
            NIT: params.NIT,
        }
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que no exista ya una factura en esa reservación
        let invoiceExist = await validate.alreadyInvoice(data.reservations);
            if (invoiceExist) return res.status(400).send({ message: 'This reservation already has an invoice' });

        //Verificar que exista la reservacion
        const checkReservation = await Reservation.findOne({ _id: reservation }).populate('hotel').populate('room').populate('service');
        if (checkReservation === null || checkReservation.id != reservation)
            return res.status(400).send({ message: 'reservation not exist' });

        data.name = params.name;

        const invoice = new Invoice(data);
        await invoice.save();
            return res.send({ message: 'Invoice created successfully', invoice, checkReservation });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving invoice in Hotel' });
    }
}

exports.getInvoice = async (req, res) => {
    try {
        const reservation = req.params.idReser;
        //Verificar que exista la reservacion
        const checkReservation = await Reservation.findOne({ _id: reservation }).populate('hotel').populate('room').populate('service');
        if (checkReservation === null || checkReservation.id != reservation)
            return res.status(400).send({ message: 'reservation not exist' });

        const invoice = await Invoice.findOne({ reservations: reservation }).lean()
        .populate('reservations')

        invoice.reservations.startDate = new Date(invoice.reservations.startDate).toISOString().split("T")[0];
        invoice.reservations.endDate = new Date(invoice.reservations.endDate).toISOString().split("T")[0];
        if (!invoice) return res.send({ message: 'Invoice not found' });
        return res.send({message: 'Invoice Found', invoice, checkReservation });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error of get hotel' });
    }
}

