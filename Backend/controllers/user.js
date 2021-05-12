'use strict'
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'secretkeyGM1234';
const User = require('../models/user');
//const refreshToken = require('../models/refresh-token.model');
var validator = require('validator');
const fs = require('fs');//file system lib
const path = require('path');//permite sacar la ruta de un archivo en el sistema de arhivos del servidor

var controllerUser = {
    login: (req, res) => {
        var params = req.body;
        //validar datos
        try {
            var validate_emp = !validator.isEmpty(params.empresa);
            var validate_user = !validator.isEmpty(params.usuario);
            var validate_pass = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(404).send({
                status: 'Error',
                message: 'Faltan datos por enviar !!'
            });
        }
        if (validate_emp && validate_user && validate_pass) {

            if (params.empresa == null || params.usuario == null || params.password == null) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'Faltan datos por enviar !!!'
                });
            }
            User.findOne({ empresa: params.empresa }, (err, user) => {
                if (err) return res.status(500).send({
                    status: 'Error',
                    message: 'Error en el servidor!!'
                });
                if (!user) {//empresa no existe
                    res.status(409).send({ message: 'Somenthing is wrong' });
                } else {
                    const resultUsuario = user.usuario;
                    if (resultUsuario && resultUsuario == (params.usuario)) {
                        var passwordIsValid = bcrypt.compareSync(
                            params.password,
                            user.password
                          );
                          if (!passwordIsValid) {
                            return res.status(401).send({
                            accessToken: null,
                            message: "Invalid Password!"
                            });
                        }else{
                            const expiresIn = 60;
                            const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: expiresIn });
                            return res.status(200).send({
                                status: 'success',
                                user: {_id: user.id, empresa: user.empresa, usuario: user.usuario},
                                expiresIn,
                                accessToken
                            });
                        }
                    } else {
                        res.status(409).send({ //usuario incorrecto
                            status: 'Error',
                            message: 'Somenthing is wrong'
                        });
                    }
                }
            });
        }
    },
    auth: (req, res) => {
        jwt.verify(req.token,SECRET_KEY,(err, authorizedData) => {
            if (err) {
                return res.status(409).send({
                    status: 'Error', 
                    message:'Ocurrió un error'});
            } else {
                //Si el token fue correctamente verificado, podemos regresar los datos autorizados
                res.json({
                    message: 'Successfull log in',
                    authorizedData
                });
                console.log('SUCCESS: Connected to protected route');
            }
        });
    }
}

module.exports = controllerUser;