"use strict";

const {authenticationMiddlewares} = require("./authenticationAPI");
const dao = require("../database/dao");

/**
 * @description Restituisce la lista delle immagini e il path dove trovarle
 * @ResponseStatus 200 OK
 * @SuccessResponseExample: {"images": [String], "path": String}
 * @FailureResponseExample: none
 * @name getImages
 * @function
 * @private
 * @route GET /api/resources/images
 */
const getImages = (req, res) => {
    dao.getImages()
        .then((images) => {
            res.status(200).json({
                "images": images,
                "path": "http://localhost:3001/static/images/"
            });
        });
};

/**
 * @description API per la gestione dell'autenticazione
 * @param app {Object}:               Express app
 * @param base_route {String}:        Base route
 * @param prefix {String}:            Prefix route
 * @description GET    /api/resources/images          -> Richiesta informazioni utente corrente
 * @name registerImageAPI
 * @function
 * @public
 */
exports.registerImageAPI = (app, base_route, prefix = "") => {
    app.get(
        base_route + prefix + '/',
        authenticationMiddlewares.noAuthentication,
        getImages
    );
}

// EOF