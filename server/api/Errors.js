"use strict";

/**
 * Errori di autenticazione
 * @type Object
 * */
exports.AUTHENTICATION_ERROR = {
    UNAUTHORIZED_USER: {
        code: "AUTHENTICATION_ERROR.UNAUTHORIZED_USER",
        message: "Accesso non autorizzato: l'utente non ha i permessi per accedere alla risorsa richiesta"
    },
    UNAUTHENTICATED_USER: {
        code: "AUTHENTICATION_ERROR.UNAUTHENTICATED_USER",
        message: "Autenticazione richiesta: l'utente deve aver effettuato il login"
    },
    GENERIC_ERROR: {
        code: "AUTHENTICATION_ERROR.AUTHENTICATION_FAILED",
        message: "Autenticazione fallita: errore generico"
    },
    INVALID_CREDENTIALS: {
        code: "AUTHENTICATION_ERROR.INVALID_CREDENTIALS",
        message: "Autenticazione fallita: username o password errati"
    },
    ALREADY_LOGGED_IN: {
        code: "AUTHENTICATION_ERROR.ALREADY_LOGGED_IN",
        message: "Autenticazione fallita: esiste già un utente autenticato"
    },
    NO_SESSION_ACTIVE: {
        code: "AUTHENTICATION_ERROR.NO_SESSION_ACTIVE",
        message: "Impossibile effettuare il logout: non esiste una sessione attiva"
    },
    CORRUPTED_SESSION: {
        code: "AUTHENTICATION_ERROR.CORRUPTED_SESSION",
        message: "Impossibile recuperare i dati di sessione: la sessione è corrotta"
    }
}

/**
 * Errori del database
 * @type Object
 */
exports.DATABASE_ERROR = {
    CONNECTION_FAILED: {
        code: "DATABASE_ERROR.CONNECTION_FAILED",
        message: "Connessione al database fallita, impossibile aprire il database."
    },
    QUERY_FAILED: (query = "") => ({
        code: "DATABASE_ERROR.QUERY_FAILED",
        message: `Errore durante l'esecuzione della query${query !== "" ? `: ${query}.` : "."}`
    })
}

/**
 * Errori legati all'utente
 * (nota: USER_NOT_FOUND e WRONG_PASSWORD sono errori interni, vengono restituiti al client entrambi
 * come AUTHENTICATION_ERROR.INVALID_CREDENTIALS)
 * @type Object
 */
exports.USER_ERROR = {
    USER_NOT_FOUND: {
        code: "USER_ERROR.USER_NOT_FOUND",
        message: "Utente non trovato."
    },
    HASH_FAILED: {
        code: "USER_ERROR.HASH_FAILED",
        message: "Errore durante il calcolo della funzione di hash sulla password."
    },
    WRONG_PASSWORD: {
        code: "USER_ERROR.WRONG_PASSWORD",
        message: "Password errata."
    },
    GENERIC_ERROR: {
        code: "USER_ERROR.GENERIC_ERROR",
        message: "Errore generico."
    }
}

/**
 * Errori legati alla validazione dei parametri
 * @type Object
 */
exports.VALIDATION_ERROR = {
    MISSING_PARAMETERS: (scope, paramiter, message) => {
        return {
            code: `VALIDATION_ERROR.${scope}.${paramiter}`,
            message: message
        }
    },
    INVALID_VALUES: (scope, paramiter, message) => {
        return {
            code: `VALIDATION_ERROR.${scope}.${paramiter}`,
            message: message
        }
    }
}

/**
 * Errori legati alle pagine
 * @type Object
 */
exports.PAGE_ERROR = {
    UNABLE_TO_GET_PAGES: {
        code: "PAGE_ERROR.UNABLE_TO_GET_PAGES",
        message: "Impossibile recuperare le pagine dal database."
    },
    PAGE_NOT_FOUND: (id) => ({
        code: "PAGE_ERROR.PAGE_NOT_FOUND",
        message: `La pagina con id = ${id} non è presente nel database.`
    }),
    UNABLE_TO_DELETE_PAGE: (id) => ({
        code: "PAGE_ERROR.UNABLE_TO_DELETE_PAGE",
        message: `Non è stato possible cancellare la pagina con id ${id}.`
    }),
    UNABLE_TO_UPDATE_PAGE: (id) => ({
        code: "PAGE_ERROR.UNABLE_TO_UPDATE_PAGE",
        message: `Non è stato possible aggiornare la pagina con id ${id}.`
    }),
    UNABLE_TO_CREATE_PAGE: {
        code: "PAGE_ERROR.UNABLE_TO_CREATE_PAGE",
        message: "Non è stato possible creare la pagina."
    },
    GENERIC_ERROR: {
        code: "PAGE_ERROR.GENERIC_ERROR",
        message: "Errore generico."
    }
}

/**
 * Errori legati alle informazioni del sito
 * @type Object
 */
exports.SITE_INFO_ERROR = {
    SITE_INFO_NOT_FOUND: {
        code: "SITE_INFO_ERROR.SITE_INFO_NOT_FOUND",
        message: "Le informazioni del sito non sono presenti nel database."
    },
    UPDATE_FAILED: {
        code: "SITE_INFO_ERROR.UPDATE_FAILED",
        message: "Errore durante l'aggiornamento delle informazioni del sito."
    },
    GENERIC_ERROR: {
        code: "SITE_INFO_ERROR.GENERIC_ERROR",
        message: "Errore generico."
    }
}

/**
 * Errori legati alla lista degli utenti
 * @type Object
 */
exports.USER_LIST_ERROR = {
    GENERIC_ERROR: {
        code: "USER_LIST_ERROR.GENERIC_ERROR",
        message: "Errore generico."
    }
}

// EOF