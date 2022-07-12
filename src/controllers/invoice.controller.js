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
            NIT: params.NIT,
        }
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }


    
        const msg = validate.validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que no exista ya uno factura en esa reservación
        let invoiceExist = await Invoice.findOne({_id: data.reservations});
        console.log(invoiceExist);
        if(invoiceExist === reservation ) return res.send({ message: 'Ya tiene factura'});

        //Verificar que exista la reservacion
        const checkReservation = await Reservation.findOne({ _id: reservation });
        if (checkReservation === null || checkReservation.id != reservation)
            return res.status(400).send({ message: 'reservation not exist' });

        data.name = params.name;
        const invoice = new Invoice(data);
        await invoice.save();
            return res.send({ message: 'Invoice created successfully', invoice });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving invoice in Hotel' });
    }
}

exports.getInvoice = async (req, res) => {
    try {
        const reservation = req.params.idReser;
        const invoice = await Invoice.findOne({ reservations: reservation }).lean()
        .populate('reservations')
        .populate('reservations.room.name')
        if (!invoice) return res.send({ message: 'Invoice not found' });
        return res.send({message: 'Invoice Found', invoice });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error of get hotel' });
    }
}

