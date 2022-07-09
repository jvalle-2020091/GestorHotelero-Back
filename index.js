'use strict'
const app = require('./configs/app');
const mongo = require('./configs/mongoConfig');
const port = 3200;

const {  encrypt } = require('./src/utils/validate');
const User = require('./src/models/user.model');

const fs = require('fs')
const path = require('path')

mongo.init();
app.listen(port, async () => {
    console.log(`Conectado al puerto ${port}`)

    const dataAdmin = {
        name: 'ADMIN',
        surname: 'ADMIN-APP',
        username: 'ADMIN-APP',
        email: 'ADMIN',
        password: await encrypt('12345'),
        role: 'ADMIN-APP'
    };

        const verificarAdmin = await User.findOne({name:'ADMIN'}).lean();
        if (verificarAdmin)
        {console.log('Admin de la aplicación ya creado')}
        else{
        let user = new User(dataAdmin);
        await user.save();
        console.log('Se creó el Admin de la aplicación')}
});
