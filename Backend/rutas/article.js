'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');
var UserController= require('../controllers/user');

var router = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './upload/articles'});

/*//rutas de prueba
router.get('/test-de-controlador', ArticleController.info);
router.get('/datos-info', ArticleController.alquileres);

//rutas para articulos
router.post('/save', ArticleController.save);
router.get('/articles', ArticleController.getArticles);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id?',md_upload, ArticleController.upload);
router.get('/get-image/:image',ArticleController.getImage);
router.get('/search/:search',ArticleController.search);*/
router.post('/login',UserController.login);

module.exports = router;

