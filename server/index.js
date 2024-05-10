'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require("morgan");

const {registerImageAPI} = require("./api/imagesAPI");
const {registerAuthenticationAPI, configurePassport} = require("./api/authenticationAPI");
const {registerSiteInfoAPI} = require("./api/siteInfoAPI");
const {registerUserListAPI} = require("./api/userListAPI");
const {registerPageAPI} = require("./api/pagesAPI");


// init express
const app = new express();
const port = 3001;
const basePath = '/api';

const CORS_OPTIONS = {
    origin: 'http://localhost:5173',
    credentials: true
}


// Configurazione della route per i contenuti statici
app.use('/static', express.static('./public/'));

// Attivazione CORS
app.use(cors(CORS_OPTIONS));

// Configurazione di alcuni middlewares
app.use(express.json());
app.use(morgan('dev'));

// Configurazione di passport
configurePassport(app);

// Registrazione delle routes per le API
registerImageAPI(app, basePath, "/resources/images");
registerAuthenticationAPI(app, basePath, "/authentication");
registerSiteInfoAPI(app, basePath, "/application-data/site-info");
registerUserListAPI(app, basePath, "/application-data/user-list");
registerPageAPI(app, basePath, "/application-data/pages");

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// EOF