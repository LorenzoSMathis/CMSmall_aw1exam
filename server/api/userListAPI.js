"use strict";

const Errors = require("../api/Errors");
const dao = require("../database/dao");
const {authenticationMiddlewares} = require("./authenticationAPI");

/**
 * @description Restituisce la lista di tutti gli utenti
 * @ResponseStatus 200 |
 * @SuccessResponseExample: {"users": [String]}
 * @FailureResponseExample: {code: String, message: String}
 * @name getUsersList
 * @function
 * @private
 * @route GET /api/application-data/user-list/
 *
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.USER_LIST_ERROR.GENERIC_ERROR
 */
const getUsersList = (req, res) => {
    dao.getUsersList()
        .then((users) => {
            res.status(200)
                .json({users: users})
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.USER_LIST_ERROR.GENERIC_ERROR)
                .end();
        });
}

/**
 * @description API per la gestione delle informazioni del sito
 * @param app {Object}:               Express app
 * @param base_route {String}:        Base route
 * @param prefix {String}:            Prefix route
 * @description GET    /api/application-data/user-list/           -> Richiesta delle informazioni del sito
 * @name registerUserListAPI
 * @function
 * @public
 */
exports.registerUserListAPI = (app, base_route, prefix = "") => {
    app.get(
        base_route + prefix + "/",
        authenticationMiddlewares.noAuthentication,
        getUsersList
    );
}

// EOF