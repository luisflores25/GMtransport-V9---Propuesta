'use strict'
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var config = require('../config.json');
const User = require('../models/user');
const refreshT = require('../models/refresh-token.model');
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
                        } else {
                            const expiresIn = 60;
                            const accessToken = jwt.sign({ id: user.id }, config.SECRET_KEY, { expiresIn: expiresIn });
                            return res.status(200).send({
                                status: 'success',
                                user: { _id: user.id, empresa: user.empresa, usuario: user.usuario },
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
        jwt.verify(req.token, config.SECRET_KEY, (err, authorizedData) => {
            if (err) {
                return res.status(409).send({
                    status: 'Error',
                    message: 'Ocurrió un error'
                });
            } else {
                //Si el token fue correctamente verificado, podemos regresar los datos autorizados
                res.json({
                    message: 'Successfull log in',
                    authorizedData
                });
                console.log('SUCCESS: Connected to protected route');
            }
        });
    },
    authenticateSchema: (req, res, next) => {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        });
        validateRequest(req, next, schema);
    },
    authenticate: (req, res, next) => {
        const { username, password } = req.body;
        const ipAddress = req.ip;
        userService.authenticate({ username, password, ipAddress })
            .then(({ refreshToken, ...user }) => {
                setTokenCookie(res, refreshToken);
                res.json(user);
            })
            .catch(next);
    },
    refreshToken: (req, res, next) => {
        const { username, password } = req.body;
        const ipAddress = req.ip;
        userService.authenticate({ username, password, ipAddress })
            .then(({ refreshToken, ...user }) => {
                setTokenCookie(res, refreshToken);
                res.json(user);
            })
            .catch(next);
    },
    revokeTokenSchema: (req, res, next) => {
        const schema = Joi.object({
            token: Joi.string().empty('')
        });
        validateRequest(req, next, schema);
    },
    revokeToken: (req, res, next) => {
        // accept token from request body or cookie
        const token = req.body.token || req.cookies.refreshToken;
        const ipAddress = req.ip;

        if (!token) return res.status(400).json({ message: 'Token is required' });

        // users can revoke their own tokens and admins can revoke any tokens
        if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        userService.revokeToken({ token, ipAddress })
            .then(() => res.json({ message: 'Token revoked' }))
            .catch(next);
    },
    getById: (req, res, next) => {
        // accept token from request body or cookie
        const token = req.body.token || req.cookies.refreshToken;
        const ipAddress = req.ip;

        if (!token) return res.status(400).json({ message: 'Token is required' });

        // users can revoke their own tokens and admins can revoke any tokens
        if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        userService.revokeToken({ token, ipAddress })
            .then(() => res.json({ message: 'Token revoked' }))
            .catch(next);
    },
    getRefreshTokens: (req, res, next) => {
        // users can get their own refresh tokens and admins can get any user's refresh tokens
        if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        userService.getRefreshTokens(req.params.id)
            .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
            .catch(next);
    },
    setTokenCookie: (res, token) => {
        // create http only cookie with refresh token that expires in 7 days
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        res.cookie('refreshToken', token, cookieOptions);
    }

}




module.exports = controllerUser;