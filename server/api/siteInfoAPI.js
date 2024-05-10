"use strict";

const Errors = require("./Errors");
const dao = require("../database/dao");
const {authenticationMiddlewares} = require("./authenticationAPI");
const {body, validationResult} = require("express-validator");

/**
 * @description Restituisce le informazioni del sito
 * @ResponseStatus 200 | 404 | 500
 * @SuccessResponseExample: {"siteName": String}
 * @FailureResponseExample: {code: String, message: String}
 * @name getSiteInfo
 * @function
 * @private
 * @route GET /api/application-data/site-info/
 *
 * ResponseStatus 404 NOT FOUND
 * Error-Response: Errors.SITE_INFO_ERROR.SITE_INFO_NOT_FOUND
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.SITE_INFO_ERROR.GENERIC_ERROR
 */
const getSiteInfo = (req, res) => {
    dao.getSiteInfo()
        .then((siteInfo) => {
            res.status(200)
                .json(siteInfo)
                .end();
        })
        .catch((err) => {
            if (err.code === "SITE_INFO_ERROR.SITE_INFO_NOT_FOUND") {
                res.status(404)
                    .json(err)
                    .end();
            }
            else {
                res.status(500)
                    .json(Errors.SITE_INFO_ERROR.GENERIC_ERROR)
                    .end();
            }
        });
}

/**
 * @description Modifica le informazioni del sito
 * @ResponseStatus 204 | 400 | 401 | 500
 * @FailureResponseExample: {code: String, message: String}
 * @name updateSiteInfo
 * @function
 * @private
 * @route PUT /api/application-data/site-info/
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response: [Errors.VALIDATION_ERROR.INVALID_VALUES.SITE_INFO]
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.SITE_INFO_ERROR.UPDATE_FAILED
 */
const updateSiteInfo = (req, res) => {
    dao.updateSiteInfo(req.body)
        .then(() => {
            res.status(204)
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.SITE_INFO_ERROR.UPDATE_FAILED)
                .end();
        });
}

/**
 * @description Middleware per la gestione degli errori di validazione dei parametri
 * @throws Errors.VALIDATION_ERROR.INVALID_VALUES.SITE_INFO
 * @ResponseStatus 400
 * @FailureResponseExample: Array<{code: String, message: String}>
 * @name handleValidation
 * @function
 * @private
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400)
            .json(errors.array()
                            .filter((item, index, self) => {
                                return self.findIndex((t) => {
                                    return t.path === item.path && t.msg === item.msg;
                                }) === index;
                            })
                            .map((item) => Errors.VALIDATION_ERROR.INVALID_VALUES("SITE_INFO", item.path.toUpperCase(), item.msg))
            ).end();
    }
    else {
        next();
    }
}

/**
 * @description API per la gestione delle informazioni del sito
 * @param app {Object}:               Express app
 * @param base_route {String}:        Base route
 * @param prefix {String}:            Prefix route
 * @description GET    /api/application-data/site-info/           -> Richiesta delle informazioni del sito
 * @description PUT    /api/application-data/site-info/           -> Modificare le informazioni del sito
 * @name registerSiteInfoAPI
 * @function
 * @public
 */
exports.registerSiteInfoAPI = (app, base_route, prefix = "") => {
    app.get(
        base_route + prefix + '/',
        authenticationMiddlewares.noAuthentication,
        getSiteInfo
    );
    app.put(
        base_route + prefix + '/',
        authenticationMiddlewares.administratorUser,
        body("siteName").exists().isString().isLength({min: 1}),
        handleValidation,
        updateSiteInfo
    );
}

// EOF