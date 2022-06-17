'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'SecretKeyToExample';

exports.createToken = async (user)=>{
    try{
        const payload = {
            sub: user._id,
            name: user.name,
            username: user.username,
            email: user.emai,
            password: user.password,
            role: user.role,
            phone: user.phone,
            iat: moment().unix(),
            exp: moment().add(24, 'hour').unix()
        }
        return jwt.encode(payload, secretKey);
    }catch(err){
        console.log(err);
        return err
    }
    
}