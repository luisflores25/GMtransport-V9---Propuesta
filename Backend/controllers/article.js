'use strict'
var validator = require('validator');
const Article = require('../models/article');
const { param, search } = require('../rutas/article');
const fs = require('fs');//file system lib
const path = require('path');//permite sacar la ruta de un archivo en el sistema de arhivos del servidor

var controller = {
    info: (req, res) => {
        return res.status(200).send({
            nombre: "Luis Flores",
            Edad: 25,
            email: 'luisfrancisco2506@gmail.com'
        });
    },

    alquileres: (req, res) => {
        return res.status(200).send({
            nombre: "Thermoking"
        });
    },

    save: (req, res) => {
        //recoger parametros por post
        var params = req.body;
        //validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'Error',
                message: 'Faltan datos por enviar !!'
            });
        }
        if (validate_title && validate_content) {
            //crear el objeto a guardar
            var article = new Article();
            // asignar valores
            article.title = params.title;
            article.content = params.content;
            
            if(params.image)
            article.image=params.image;
            else
            article.image = null;
            
            //guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {

                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado!!'
                    });
                }
                //devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validos !!!'
            })
        }
    },

    getArticles: (req, res) => {

        var query = Article.find({});
        var last = req.params.last;
        if ((last || last != undefined)) {
            query.limit(2); //limite de documentos a mostrar 
        }

        // consulta
        query.sort('-_id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Los datos no son validos !!!'
                })
            }
            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar !!!'
                })
            }
            return res.status(200).send({
                status: 'Success',
                articles
            });
        })
    },
    getArticle: (req, res) => {

        // recoger el id de la url
        var articleId = req.params.id;

        //comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo !!!'
            });
        }
        // buscar el articulo y devolver respuesta json
        Article.findById(articleId, (err, article) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los datos !!!'
                });
            }
            if (!article) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el articulo !!!'
                });
            }
            //devolver el json del articulo
            return res.status(200).send({
                status: 'Success',
                article
            });
        });

    },

    update: (req, res) => {

        // recoger el id del articulo por la url
        var articleId = req.params.id;

        // recoger los datos que llegan por put
        var params = req.body;
        //validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }
        if (validate_title && validate_content) {
            //Find and update
            Article.findByIdAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {//(busca por ID: actualizar por, parametros del objeto, devolver el objeto nuevo actualizado, funcion de callback)
                if (err) {
                    status: 'error'
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error al actualizar !!!'
                    });
                }

                //devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: articleUpdated
                });
            });
        } else {
            return res.status(404).send({
                status: 'error',
                message: 'La validacion no es correcta!!!'
            });
        }
    },

    delete: (req, res) => {

        // recoger el ID de la URL
        var articleId = req.params.id;

        // Find and Delete
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar !!!'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista !!!'
                });
            }

            return res.status(200).send({
                status: 'Success',
                article: articleRemoved
            });
        });

    },

    upload: (req, res) => {

        //configurar el modulo del connect multiparty router/article.js

        // recoger el fichero de la peticion 
        var file_name = 'Imagen no subida...';

        if (!req.files) {// si no llega nada en los archivos manda un error al recibir los parametros
            return res.status(404).send({
                status: 'Error',
                message: file_name
            });
        }
        // conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var files_split = file_path.split('\\');

        // nombre del archivo

        var file_name = files_split[2];

        // * ADVERTENCIA LINUX O MAC
        // var files_split= file_path.split('/');
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];


        //comprobar la extension, solo imagenes, si no es valida borrar el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            // borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'Error',
                    message: 'La extension de la imagen no es valida !!'
                });
            });
        } else {
            //si todo es valido
            var articleID = req.params.id;

            // buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            if (articleID) {
                Article.findOneAndUpdate({ _id: articleID }, { image: file_name }, { new: true }, (err, articleUpdated) => {

                    if (err || !articleUpdated) {
                        return res.status(200).send({
                            status: 'Error',
                            message: 'Error al guardar la imagen de articulo'
                        });
                    }
                    return res.status(200).send({
                        status: 'Success',
                        article: articleUpdated
                    });
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
            }
        }
    },//end upload file

    getImage: (req, res) => {

        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(200).send({
                    status: 'Success',
                    message: 'Error al obtener imagen'
                });
            }
        });
    },// end getImage

    search: (req, res) => {

        //sacar el string a sumar
        var searchString = req.params.search;

        // find or
        Article.find({
            "$or": [ //si el searchString tiene coincidencia dentro de el titulo o de el contenido
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        }).sort([['date', 'descending']]).exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error en la peticion'
                });
            }
            if (!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No hay articulos que coincidan con el criterio de busqueda'
                });
            }
            return res.status(200).send({
                status: 'Success',
                articles
            });
        });
    },//end search

    data: (req, res) => {

    }
};// end controller

module.exports = controller;