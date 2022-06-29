'use strict';

const Evento= require ('../models/evento.model');
const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const { validateData, checkUpdate } = require('../utils/validate');


//testeo de controller Evento
exports.testEvento=(req, res)=>{
    return res.send({menssage: 'el controlador evento esta funcionando'})
}

exports.addEvento = async (req, res) => {
    try {
        const hotel = req.params.id;
        const params = req.body;
        let data = {
            name: params.name,
            description: params.description,
            dateEvento: params.dateEvento,
            hotel: params.hotel,
        }
        let msg = validateData(data);
        if (!msg) {
            const checkHotel = await Hotel.findOne({ _id: hotel });
            console.log(checkHotel);
            if (checkHotel === null || checkHotel.id != hotel) 
                return res.status(400).send({ message: 'You cannot add evento to this evento' });
            
                const evento = new Evento(data);
                await evento.save();
                return res.send({message: 'Evento successfully created', evento });
            
        }else{
            return res.status(400).send(msg);
        }
    }catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving evento' });
    }
}

exports.updateEvento = async(req, res)=>{
    try{
        const eventoId = req.params.id;
        const params = req.body;

        const eventoExist = await Evento.findOne({ _id: eventoId});
        if (!eventoExist) return res.send({ message: 'Evento not found' });

        const validateUpdate = await checkUpdate(params);
        if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        //let alreadyname = await alreadyEvento(params.name);
        //if(alreadyname) return res.send({message: 'This evento already exists'});

        const updateEvento = await Evento.findOneAndUpdate({_id: eventoId}, params, {new: true});
        if(!updateEvento) return res.send({message: 'Evento not updated'});
        return res.send({message: 'Update Evento', updateEvento});
    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating evento' });
    }
}

exports.deleteEvento = async(req, res)=>{
    try{
        const eventoId = req.params.id;

        const eventoExist = await Evento.findOne({_id: eventoId});
        if(!eventoExist) return res.send({message: 'Evento not found'});

        const eventoDeleted = await Evento.findOneAndDelete({ _id: eventoId });
        if(!eventoDeleted) return res.status(400).send({message: 'Evento not deleted'});
        return res.send({ message: 'Evento deleted successfully', eventoDeleted });
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting evento'});
    }
}

exports.getEventos = async(req, res)=>{
    try{
        const eventos = await Evento.find();
        return res.send ({eventos});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error of get eventos'});
    }
}

exports.getEvento = async(req, res)=>{
    try{
        const eventoId = req.params.id;
        const evento = await Evento.findOne({_id: eventoId});
        if(!evento) return res.send({message: 'Evento not found'});
        return res.send({evento});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error of get evento'});
    }
}

