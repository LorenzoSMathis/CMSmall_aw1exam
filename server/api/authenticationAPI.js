"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const {body, validationResult} = require("express-validator");

const Errors = require("./Errors");
const dao = require("../database/dao");

/**
 * @description Middleware per la verifica dell'autenticazione (utente generico)
 * @throws Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER
 * @ResponseStatus 401
 * @FailureResponseExample: {code: String, message: String}
 * @name loggedUser
 * @function
 * @public
 **/
const loggedUser = (req, res, next) => {
    if (req.isAuthenticated()) {        // Se esiste una sessione attiva procedi
        return next();
    }
    else {                              // Altrimenti restituisci errore
        return res.status(401)
            .json(Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER)
            .end();
    }
}

/**
 * @description Middleware per la verifica dell'autenticazione (utente amministratore)
 * @throws Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER
 * @throws Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER
 * @ResponseStatus 401
 * @FailureResponseExample: {code: String, message: String}
 * @name administratorUser
 * @function
 * @public
 */
const administratorUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "admin") {        // OK
            return next();
        }
        else {                                  // Non admin
            return res.status(401)
                .json(Errors.AUTHENTICATION_ERROR.UNAUTHORIZED_USER)
                .end();
        }
    }
    else {                                      // Non autenticato
        return res.status(401)
            .json(Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER)
            .end();
    }
}

/**
 * @description "Finto" middleware per le routes SENZA autenticazione
 * @description Serve solo per uniformare il codice e esplicitare la mancanza di autenticazione nella definizione della route
 * @name noAuthentication
 * @function
 * @public
 */
const noAuthentication = (req, res, next) => {
    next();     // Middleware vuoto.
}

/**
 * @description Middleware per impedire multiple richieste di login da parte di un utente già autenticato
 * @throws Errors.AUTHENTICATION_ERROR.ALREADY_LOGGED_IN
 * @ResponseStatus 400
 * @FailureResponseExample: {code: String, message: String}
 * @name multipleLoginPrevent
 * @function
 * @private
 */
const multipleLoginPrevent = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(400)
            .json(Errors.AUTHENTICATION_ERROR.ALREADY_LOGGED_IN)
            .end();
    }
    else {
        return next();
    }
}

/**
 * @description Login dell'utente
 * @bodyParams {username: String, password: String}
 * @ResponseStatus 200 OK | 400 BAD REQUEST | 401 UNAUTHORIZED | 500 INTERNAL SERVER ERROR
 * @SuccessResponseExample: {id: Int, username: String, role: String}
 * @FailureResponseExample: {code: String, message: String}
 * @name login
 * @function
 * @private
 * @route POST /api/authentication
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response Errors.VALIDATION_ERROR.ALREADY_LOGGED_IN | Errors.VALIDATION_ERROR.MISSING_PARAMETERS
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.INVALID_CREDENTIALS
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.AUTHENTICATION_ERROR.GENERIC_ERROR
 */
const login = (req, res, next) => {

    // Validazione dei parametri
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsList = errors.array()
            .filter((item, index, self) => {
                return self.findIndex((t) => {
                    return t.path === item.path && t.msg === item.msg;
                }) === index;
            })
            .map((item) => Errors.VALIDATION_ERROR.MISSING_PARAMETERS("LOGIN", item.path.toUpperCase(), item.msg));

        res.status(400)
            .json({errors: errorsList})
            .end();
        return;
    }

    // Autenticazione
    passport.authenticate('local', (err, user) => {
        if (err) {
            res.status(500)
                .json(Errors.AUTHENTICATION_ERROR.GENERIC_ERROR)
                .end();
        }
        else {
            req.logIn(user, (err) => {
                if (err) {
                    res.status(401)
                        .json(Errors.AUTHENTICATION_ERROR.INVALID_CREDENTIALS)
                        .end();
                }
                else {
                    const userResponse = {
                        username: user.username,
                        role: user.role
                    }

                    res.status(200)
                        .json(userResponse)
                        .end();
                }
            });
        }
    })(req, res, next);
}

/**
 * @description Logout dell'utente
 * @ResponseStatus 204 NO CONTENT | 400 BAD REQUEST
 * @SuccessResponseExample: {id: Int, username: String, role: String}
 * @FailureResponseExample: {code: String, message: String}
 * @name logout
 * @function
 * @private
 * @route DELETE /api/authentication/current
 *
 * ResponseStatus 400 BAD REQUEST
 * Error-Response: Errors.AUTHENTICATION_ERROR.NO_SESSION_ACTIVE
 */
const logout = (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(400)
            .json(Errors.AUTHENTICATION_ERROR.NO_SESSION_ACTIVE)
            .end();
    }
    else {
        req.logout(() => {
            res.status(204).end();
        })
    }
}

/**
 * @description Restituisce l'utente corrente
 * @ResponseStatus 200 OK | 401 UNAUTHORIZED | 500 INTERNAL SERVER ERROR
 * @SuccessResponseExample: {id: Int, username: String, role: String}
 * @FailureResponseExample: {code: String, message: String}
 * @name getCurrentUser
 * @function
 * @private
 * @route GET /api/authentication/current
 *
 * ResponseStatus 401 UNAUTHORIZED
 * Error-Response: Errors.AUTHENTICATION_ERROR.CORRUPTED_SESSION} | {Errors.AUTHENTICATION_ERROR.UNAUTHENTICATED_USER
 * ResponseStatus 500 INTERNAL SERVER ERROR
 * Error-Response: Errors.AUTHENTICATION_ERROR.GENERIC_ERROR
 */
const getCurrentUser = (req, res) => {
    dao.getUserById(req.user.id)
        .then((user) => {
            const userResponse = {
                username: user.username,
                role: user.role
            }

            return res.status(200)
                .json(userResponse)
                .end();
        })
        .catch((err) => {
            if (err === Errors.USER_ERROR.USER_NOT_FOUND) {
                return res.status(401)
                    .json(Errors.AUTHENTICATION_ERROR.CORRUPTED_SESSION)
                    .end();
            }
            else {
                return res.status(500)
                    .json(Errors.AUTHENTICATION_ERROR.GENERIC_ERROR)
                    .end();
            }
        });
}

/**
 * @description Configurazione di passport
 * @param app  Express app
 * @name configurePassport
 * @function
 * @public
 */
const configurePassport = (app) => {
    // Opzioni di sessione
    const SESSION_OPTIONS = {
        secret: '2b0559b2345ca4f91900eb6f44f2a1716557ccb44d2881a363f7a2e26fd5f2f74eb3fed16ad10733478af2bccbf8a86bd703c6c176d19536151d6ec3c0c900fd',
        resave: false,
        saveUninitialized: false
    };

    // Configurazione di passport con la strategia 'local' (LocalStrategy)
    passport.use(new LocalStrategy(
        function (username, password, done) {
            // Accesso al DB per verificare le credenziali, la funzione getUser effettua un controllo sulle credenziali
            dao.getUser(username, password)
                .then((user) => {
                    return done(null, user);
                })
                .catch((err) => {
                    if ([Errors.USER_ERROR.USER_NOT_FOUND, Errors.USER_ERROR.WRONG_PASSWORD].includes(err)) {
                        return done(null, false, err);  // Errore dovuto alle credenziali
                    }
                    else {
                        return done(err, false);        // Errore generico
                    }
                });
        }
    ));

    // Configurazione di passport per la serializzazione dell'utente: viene serializzato l'id dell'utente
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Configurazione di passport per la deserializzazione dell'utente: dall'id (salvato nella sessione) viene ricavato l'utente (id, username, role)
    passport.deserializeUser(function (id, done) {
        dao.getUserById(id)
            .then((user) => {
                done(null, user);
            })
            .catch((err) => {
                done(err, null);
            });
    });

    // Registrazione di express-session
    app.use(session(SESSION_OPTIONS));

    // Registrazione di passport
    app.use(passport.initialize());
    app.use(passport.session());
}

/**
 * @description Export dell'ggetto con i middleware per la verifica dell'autenticazione
 * @name authenticationMiddlewares
 * @type Object<Function>
 * @public
 */
exports.authenticationMiddlewares = {
    loggedUser,
    administratorUser,
    noAuthentication,
};

/**
 * @description Funzione di registrazione delle API per la gestione dell'autenticazione
 * @param app {Object}:               Express app
 * @param base_route {String}:        Base route
 * @param prefix {String}:            Prefix route
 * @description POST   /api/authentication/           -> Login dell'utente [body: username, password]
 * @description GET    /api/authentication/current    -> Richiesta informazioni utente corrente
 * @description DELETE /api/authentication/current    -> Logout dell'utente
 * @name registerAuthenticationAPI
 * @function
 * @public
 */
exports.registerAuthenticationAPI = (app, base_route, prefix = "") => {
    app.post(
        base_route + prefix + '/',
        noAuthentication,
        multipleLoginPrevent,
        body('username').exists().isString(),
        body('password').exists().isString(),
        login
    );
    app.get(
        base_route + prefix + '/current',
        loggedUser,
        getCurrentUser
    );
    app.delete(
        base_route + prefix + '/current',
        noAuthentication,
        logout
    );
}

/**
 * @description Export della funzione di configurazione di passport
 * @name configurePassport
 * @function
 * @public
 */
exports.configurePassport = configurePassport;

// EOF