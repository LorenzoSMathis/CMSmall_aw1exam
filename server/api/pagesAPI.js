"use strict";

const {check, body, validationResult} = require("express-validator");
const dayjs = require("dayjs");

const Errors = require("./Errors");
const {authenticationMiddlewares} = require("./authenticationAPI");
const dao = require("../database/dao");

/**
 * @description Middleware per l'autorizzazione alla modifica di una pagina
 * @throws Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER
 * @throws Errors.AUTHENTICATION_ERROR.GENERIC_ERROR
 * @ResponseStatus 401
 * @FailureResponseExample: {code: String, message: String }
 * @name canModifyPage
 * @function
 * @private
 */
const canModifyPage = (req, res, next) => {
    dao.getUserById(req.user.id)
        .then((user) => {
            if (user.role === "admin") {
                next();
            } else {
                dao.getPageById(req.params.id)
                    .then((page) => {
                        if (page.author === user.username) {
                            next();
                        } else {
                            res.status(401)
                                .json(Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER)
                                .end();
                        }
                    });
            }
        })
        .catch(() => {
            res.status(401)
                .json(Errors.AUTHENTICATION_ERROR.GENERIC_ERROR)
                .end();
        });
}

/**
 * @description Middleware per la validazione della modifica dell'autore
 * @throws Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER
 * @throws Errors.AUTHENTICATION_ERROR.GENERIC_ERROR
 * @throws Errors.PAGE_ERROR.PAGE_NOT_FOUND
 * @ResponseStatus 401 | 404
 * @FailureResponseExample: {code: String, message: String }
 * @name verifyAuthor
 * @function
 * @private
 */
const verifyAuthor = (req, res, next) => {
    if (req.method === "POST") {
        dao.getUserById(req.user.id)
            .then((user) => {
                if (user.username === req.body.author) {
                    next();                                 // Autore uguale all'utente
                }
                else {
                    res.status(401)                         // Autore diverso dall'utente: non autorizzato
                        .json(Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER)
                        .end();
                }
            })
            .catch(() => {
                res.status(401)
                    .json(Errors.AUTHENTICATION_ERROR.GENERIC_ERROR)
                    .end();
            });
    }
    else {
        dao.getPageById(req.params.id)
            .then((page) => {
                if (req.body.author === page.author) {
                    next();                                 // Autore non modificato
                } else {
                    dao.getUserById(req.user.id)
                        .then((user) => {
                            if (user.role === "admin") {
                                next();                     // Admin può modificare
                            } else {
                                res.status(401)
                                    .json(Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER)
                                    .end();
                            }
                        })
                        .catch(() => {
                            res.status(401)
                                .json(Errors.AUTHENTICATION_ERROR.GENERIC_ERROR)
                                .end();
                        });
                }
            })
            .catch(() => {                              // Non capita mai se il middleware è usato dopo pageExists
                res.status(404)
                    .json(Errors.PAGE_ERROR.PAGE_NOT_FOUND)
                    .end();
            });
    }
}

/**
 * @description Middleware per la validazione dei parametri di una pagina
 * @throws VALIDATION_ERROR.INVALID_VALUES
 * @ResponseStatus 400
 * @FailureResponseExample: {code: String, message: String }
 * @name pageDataValidation
 * @function
 * @private
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsList = errors.array()
            .filter((item, index, self) => {
                return self.findIndex((t) => {
                    return t.path === item.path && t.msg === item.msg;
                }) === index;
            })
            .map((item) => Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", item.path.toUpperCase(), item.msg));

        res.status(400)
            .json({errors: errorsList})
            .end();
        return;
    }
    next();
}

/**
 * @description Middleware per verifica dell'esistenza di una pagina dato il suo id
 * @throws Errors.PAGE_ERROR.PAGE_NOT_FOUND
 * @throws Errors.PAGE_ERROR.GENERIC_ERROR
 * @ResponseStatus 404 | 500
 * @FailureResponseExample: {code: String, message: String }
 * @name pageExists
 * @function
 * @private
 */
const pageExists = (req, res, next) => {
    dao.getPageById(req.params.id)
        .then(() => {
            next();
        })
        .catch((err) => {
            if (err.code === "PAGE_ERROR.PAGE_NOT_FOUND") {
                res.status(404)
                    .json(Errors.PAGE_ERROR.PAGE_NOT_FOUND(req.params.id))
                    .end();
            } else {
                res.status(500)
                    .json(Errors.PAGE_ERROR.GENERIC_ERROR)
                    .end();
            }
        });
}

/**
 * @description Middleware per la validazione dei parametri di una pagina
 * @throws Errors.VALIDATION_ERROR.INVALID_VALUES.PAGES
 * @throws Errors.PAGE_ERROR.GENERIC_ERROR
 * @ResponseStatus 400 | 500
 * @FailureResponseExample: {code: String, message: String }
 * @name pageDataValidation
 * @function
 * @private
 */
const pageDataValidation = (req, res, next) => {
    const page = req.body;
    dao.getUsersList()
        .then((users) => {
            if (page.author && !users.includes(page.author)) {
                res.status(400)
                    .json(Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", "AUTHOR", "Author not found"))
                    .end();
            } else {
                if (page.publicationDate && !dayjs(page.publicationDate).isValid()) {
                    res.status(400)
                        .json(Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", "PUBLICATIONDATE", " formato data non valido"))
                        .end();
                } else if (!dayjs(page.creationDate).isValid()) {
                    res.status(400)
                        .json(Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", "CREATIONDATE", " formato data non valido"))
                        .end();
                } else if (page.publicationDate && dayjs(page.publicationDate).isBefore(page.creationDate)) {
                    res.status(400)
                        .json(Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", "PUBLICATIONDATE", " la data di pubblicazione non può essere precedente alla data di creazione"))
                        .end();
                } else {
                    let header = 0;
                    let other = 0;
                    let error = false;
                    page.content.forEach((item) => {
                        if (item.type === "header") header++;
                        else if (item.type === "paragraph" || item.type === "image") other++;
                        else error = true;
                    });
                    if (error || header === 0 || other === 0) {
                        res.status(400)
                            .json(Errors.VALIDATION_ERROR.INVALID_VALUES("PAGES", "CONTENT", " il contenuto della pagina non è valido"))
                            .end();
                    } else {
                        next();
                    }
                }
            }
        })
        .catch(() => {
            res.status(500)
                .json(Errors.PAGE_ERROR.GENERIC_ERROR)
                .end();
        });
}


/**
 * @description Restituisce la lista delle pagine e i relativi contenuti
 * @ResponseStatus 200 | 500
 * @SuccessResponseExample: {"pages": [{id: Integer, title: String, author: String, publicationDate: String(from dayjs) | null, creationDate: String(from dayjs), content: String(from json)]}
 * @FailureResponseExample: {code: String, message: String}
 * @name getPages
 * @function
 * @private
 * @route GET /application-data/pages
 *
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.PAGE_ERROR.UNABLE_TO_GET_PAGES
 */
const getPages = (req, res) => {
    dao.getPages()
        .then((pages) => {
            res.status(200)
                .json({pages: pages})
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.PAGE_ERROR.UNABLE_TO_GET_PAGES)
                .end();
        });
}

/**
 * @description Cancella una pagina dato il suo id
 * @routeParams id
 * @ResponseStatus 204 | 400 | 401 | 404 | 500
 * @FailureResponseExample: {code: String, message: String}
 * @name deletePage
 * @function
 * @private
 * @route DELETE /application-data/pages/:id
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response: Errors.VALIDATION_ERROR.INVALID_VALUES.PAGES     // handleValidationErrors
 *
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER // loggedUser
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER    // canModifyPage
 * Error-Response: Errors.AUTHENTICATION_ERROR.GENERIC_ERROR        // canModifyPage
 *
 * ResponseStatus 404 NOT FOUND
 * Error-Response: Errors.PAGE_ERROR.PAGE_NOT_FOUND                 // pageExists
 *
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.PAGE_ERROR.UNABLE_TO_DELETE_PAGE          // deletePage
 * Error-Response: Errors.PAGE_ERROR.GENERIC_ERROR                  // pageExists
 */
const deletePage = (req, res) => {
    dao.deletePage(req.params.id)
        .then(() => {
            res.status(204)
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.PAGE_ERROR.UNABLE_TO_DELETE_PAGE(req.params.id))
                .end();
        });
}

/**
 * @description Aggiorna una pagina dato il suo id
 * @routeParams id
 * @bodyParam page
 * @ResponseStatus 204 | 400 | 401 | 404 | 500
 * @FailureResponseExample: {code: String, message: String}
 * @name updatePage
 * @function
 * @private
 * @route PUT /application-data/pages/:id
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response: Errors.VALIDATION_ERROR.INVALID_VALUES.PAGES     // handleValidationErrors
 *
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER    // isLogged
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER    // canModifyPage, verifyAuthor
 * Error-Response: Errors.AUTHENTICATION_ERROR.GENERIC_ERROR        // canModifyPage, verifyAuthor
 *
 * ResponseStatus 404 NOT FOUND
 * Error-Response: Errors.PAGE_ERROR.PAGE_NOT_FOUND                 // pageExists
 *
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.PAGE_ERROR.UNABLE_TO_UPDATE_PAGE          // updatePage
 * Error-Response: Errors.PAGE_ERROR.GENERIC_ERROR                  // pageExists, pageDataValidation
 */
const updatePage = (req, res) => {
    dao.updatePage(req.params.id, req.body)
        .then(() => {
            res.status(204)
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.PAGE_ERROR.UNABLE_TO_UPDATE_PAGE(req.params.id))
                .end();
        });
}

/**
 * @description Crea una nuova pagina
 * @bodyParam page
 * @ResponseStatus 201 | 400 | 401 | 500
 * @SuccessResponseExample: {id: Integer}
 * @FailureResponseExample: {code: String, message: String}
 * @name createPage
 * @function
 * @private
 * @route POST /application-data/pages/
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response: Errors.VALIDATION_ERROR.INVALID_VALUES.PAGES     // handleValidationErrors
 *
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER    // isLogged
 * Error-Response: Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER    // verifyAuthor
 * Error-Response: Errors.AUTHENTICATION_ERROR.GENERIC_ERROR        // verifyAuthor
 *
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.PAGE_ERROR.UNABLE_TO_UPDATE_PAGE          // createPage
 * Error-Response: Errors.PAGE_ERROR.GENERIC_ERROR                  // pageDataValidation
 */
const createPage = (req, res) => {
    dao.insertPage(req.body)
        .then((id) => {
            res.status(201)
                .json({id: id})
                .end();
        })
        .catch(() => {
            res.status(500)
                .json(Errors.PAGE_ERROR.UNABLE_TO_CREATE_PAGE)
                .end();
        });
}

/**
 * @description API per la gestione delle pagine
 * @param app {Object}:               Express app
 * @param base_route {String}:        Base route
 * @param prefix {String}:            Prefix route
 * @description GET       /api/application-data/pages/               -> Richiesta della lista delle pagine e relativi contenuti
 * @description DELETE    /api/application-data/pages/:id            -> Cancellazione della pagina con id :id
 * @description PUT       /api/application-data/pages/:id            -> Aggiornamento della pagina con id :id
 * @description POST      /api/application-data/pages/               -> Creazione di una nuova pagina
 * @name registerPageAPI
 * @function
 * @public
 */
exports.registerPageAPI = (app, base_route, prefix = "") => {
    app.get(
        base_route + prefix + "/",
        authenticationMiddlewares.noAuthentication,
        getPages
    );
    app.delete(
        base_route + prefix + "/:id",
        authenticationMiddlewares.loggedUser,
        check("id").isInt({min: 0}),
        handleValidationErrors,
        pageExists,
        canModifyPage,
        deletePage
    );
    app.put(
        base_route + prefix + "/:id",
        authenticationMiddlewares.loggedUser,
        check("id").isInt({min: 0}),
        body("title").isString().exists(),
        body("author").isString().exists(),
        body('publicationDate').optional(),         // string o null
        body("creationDate").isString().exists(),
        body("content").isArray().exists(),
        handleValidationErrors,
        pageExists,
        canModifyPage,
        verifyAuthor,
        pageDataValidation,
        updatePage
    );
    app.post(
        base_route + prefix + "/",
        authenticationMiddlewares.loggedUser,
        body("title").isString().exists(),
        body("author").isString().exists(),
        body('publicationDate').optional(),         // string o null
        body("creationDate").isString().exists(),
        body("content").isArray().exists(),
        handleValidationErrors,
        verifyAuthor,
        pageDataValidation,
        createPage
    );
}

// EOF