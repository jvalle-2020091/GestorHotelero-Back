'use strict'

const { alreadyHotelUser, validateData, alreadyHotel, checkUpdate, validExtension, alreadyHotelUpdated } = require('../utils/validate');
const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
const fs = require('fs');
const path = require('path');

exports.testHotel = (req, res) => {
    return res.send({ message: 'Function test is running' });
}

//---------------------Funciones del ADMIN-APP-------------------------------
exports.saveHotelByAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            adminHotel: params.adminHotel,
            name: params.name,
            address: params.address,
            phone: params.phone,
            timesRequest: 0,
        };
        const msg = validateData(data);
        if (!msg) {
            let hotelExist = await alreadyHotel(data.name);
            if (hotelExist) return res.status(400).send({ message: 'This hotel already exists' });
            let userExist = await alreadyHotelUser(data.adminHotel);
            if (userExist) return res.status(400).send({ message: 'A user can only create one hotel' });
            const checkAdmin = await User.findOne({ _id: data.adminHotel });
            if (checkAdmin === null || checkAdmin._id != data.adminHotel)
                return res.send({ message: 'User not exists' })
            const hotel = new Hotel(data);
            await hotel.save();
            return res.send({ message: 'Hotel saved successfully' })
        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Hotel' });
    }
}

exports.updateHotelByAdmin = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const params = req.body;

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) return res.send({ message: 'Hotel not found' });

        const validateUpdate = await checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'Cannot update this information or invalid params' });

        let alreadyname = await alreadyHotelUpdated(params.name);
        if (alreadyname) return res.send({ message: 'This hotel already exists' });

        const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, params, { new: true });
        if (!updateHotel) return res.send({ message: 'Hotel not updated' });
        return res.send({ message: 'Update Hotel', updateHotel });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating hotel' });
    }
}

exports.deleteHotelByAdmin = async (req, res) => {
    try {
        const hoteId = req.params.id;

        const hotelExist = await Hotel.findOne({ _id: hoteId });
        if (!hotelExist) return res.send({ message: 'Hotel not found' });

        const hotelDeleted = await Hotel.findOneAndDelete({ _id: hoteId });
        if (!hotelDeleted) return res.status(400).send({ message: 'Hotel not deleted' });
        return res.send({ message: 'Hotel deleted successfully', hotelDeleted });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting hotel' });
    }
}

//---------------------Role ADMIN-HOTEL pueda agregar su hotel-----------------------------------
exports.saveHotel = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            adminHotel: req.user.sub,
            name: params.name,
            address: params.address,
            phone: params.phone,
         
        };
        let msg = validateData(data);
        if (!msg) {
            let hotelExist = await alreadyHotel(data.name);
            if (hotelExist) return res.status(400).send({ message: 'This hotel already exists' });
            let userExist = await alreadyHotelUser(data.adminHotel);
            if (userExist) return res.status(400).send({ message: 'A user can only create one hotel' });
            const checkAdmin = await User.findOne({ _id: data.adminHotel });
            if (checkAdmin === null || checkAdmin._id != data.adminHotel)
                return res.send({ message: 'User not exists' })
            const hotel = new Hotel(data);
            await hotel.save();
            return res.send({ message: 'Hotel saved successfully' })
        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error saving Hotel' });
    }
}

exports.updateHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const params = req.body;
        const userId = req.user.sub

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) return res.send({ message: 'Hotel not found' });
        if (hotelExist.adminHotel != userId) return res.send({ message: 'You cant upgrade this hotel because it doesnt belong to you' });
        const validateUpdate = await checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'Cannot update this information or invalid params' });

        let alreadyname = await alreadyHotelUpdated(params.name);
        if (alreadyname) return res.send({ message: 'This hotel already exists' });

        const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, params, { new: true });
        if (!updateHotel) return res.send({ message: 'Hotel not updated' });
        return res.send({ message: 'Update Hotel successfully', updateHotel });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error updating hotel' });
    }
}

exports.deleteHotel = async (req, res) => {
    try {
        const hoteId = req.params.id;
        const userId = req.user.sub

        const hotelExist = await Hotel.findOne({ _id: hoteId });
        if (!hotelExist) return res.send({ message: 'Hotel not found' });
        if (hotelExist.adminHotel != userId) return res.send({ message: 'You cant delete this hotel because it doesnt belong to you' });

        const hotelDeleted = await Hotel.findOneAndDelete({ _id: hoteId });
        if (!hotelDeleted) return res.status(400).send({ message: 'Hotel not deleted' });
        return res.send({ message: 'Hotel deleted successfully', hotelDeleted });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error deleting hotel' });
    }
}

exports.myHotel = async (req, res) => {
    try {
        const userId = req.user.sub;
        if (!userId) return res.send({ message: 'Creé un hotel' })
        const hotel = await Hotel.findOne({ adminHotel: userId }).lean().populate('adminHotel')
        if (!hotel) {
            return res.send({ message: 'The entered user could not be found' })
        } else {
            return res.send({ message: 'Hotel:  ', hotel });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error getting hotel' });
    }
}; 

//----------------------Funciones para todos los usuarios------------------------------------
exports.getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('adminHotel').lean();
        return res.send({ message: 'Hotels:', hotels })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error of get hotels' });
    }
}

exports.getHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel.findOne({ _id: hotelId });
        if (!hotel) return res.send({ message: 'Hotel not found' });
        return res.send({ hotel });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error of get hotel' });
    }
}

exports.searchHotel = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        };
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);
        const hotels = await Hotel.find({ name: { $regex: params.name, $options: 'i' } }).lean();
        return res.send({ hotels });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error searching hotel' });
    }
}


exports.uploadImageHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId })
        if (checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes subir una imagen a este hotel' })
        } else {
            const alreadyImage = await Hotel.findOne({ _id: hotelId });
            let pathFile = './uploads/hotels/';

            if (alreadyImage.image) {
                fs.unlinkSync(pathFile + alreadyImage.image);
            }

            if (!req.files.image || !req.files.image.type) {
                return res.status(400).send({ message: 'No se ha enviado una imagen' });
            } else {
                //ruta en la que llega la imagen
                const filePath = req.files.image.path; // \uploads\users\file_name.ext

                //separar en jerarquía la ruta de la imágen (linux o MAC: ('\'))
                const fileSplit = filePath.split('\\');// fileSplit = ['uploads', 'users', 'file_name.ext']
                const fileName = fileSplit[2];// fileName = file_name.ext

                const extension = fileName.split('\.'); // extension = ['file_name', 'ext']
                const fileExt = extension[1]; // fileExt = ext;

                const validExt = await validExtension(fileExt, filePath);

                if (validExt === false) {
                    return res.status(400).send({ message: 'Extensión inválida' });
                } else {
                    const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, { image: fileName }, { new: true });
                    if (!updateHotel) {
                        return res.status(404).send({ message: 'Hotel no encontrado' });
                    } else {
                        return res.status(200).send({ message: 'Imagen añadida', updateHotel });
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error subiendo imagen' });
    }
}

exports.getImageHotel = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const pathFile = './uploads/hotels/' + fileName;

        const image = fs.existsSync(pathFile);
        if (!image) {
            return res.status(404).send({ message: 'Imagen no encontrada' });
        } else {
            return res.sendFile(path.resolve(pathFile));
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo la imagen' });
    }
}