"use strict";

/**
 * @description L'URL del server
 * @type {string}
 */
const BASE_URL = "http://localhost:3001/";

/**
 * @description Il prefisso delle API
 * @value "api/"
 * @type {string}
 */
const API_PREFIX = "api/";

/**
 * @description Gestisce la risposta di una richiesta al server
 * @param response {Promise}        la risposta del server
 * @param resolve {Function}        la funzione di risoluzione della Promise
 * @param reject {Function}         la funzione di rigetto della Promise
 * @param contextMessage {String}   il messaggio di contesto dell'errore
 * @param expectedBody {Boolean}    indica se la risposta deve contenere un body
 */
const handleResponse = (response, resolve, reject, contextMessage, expectedBody = true) => {
    response.then(response => {
        if (expectedBody) {                                                             // Se la risposta deve contenere un body
            response.json()
                .then(data => {
                    if (response.ok) {                                                  // Se la risposta è andata a buon fine
                        resolve(data);
                    } else {
                        reject(data);                                                   // Server-side error
                    }
                })
                .catch(() => {                                                   // Errore di parsing
                    reject({
                        code: "RESPONSE_ERROR.DATA_FORMAT_ERROR",
                        message: `Formato dei dati non valido, ${contextMessage}.`
                    });
                })
        }
        else {                                                                          // Se la risposta non deve contenere un body
            if (response.ok) {                                                          // Se la risposta è andata a buon fine
                resolve(null);
            } else {                                                                    // Server-side error
                response.json()
                    .then(error => {
                        reject(error);
                    })
                    .catch(() => {                                                 // Errore di parsing
                        reject({
                            code: "RESPONSE_ERROR.DATA_FORMAT_ERROR",
                            message: `Formato dei dati non valido, ${contextMessage}.`
                        });
                    });
            }
        }

    })
        .catch(() => {                                                              // Errore di rete
            reject({
                code: "RESPONSE_ERROR.NETWORK_ERROR",
                message: `Errore di rete, ${contextMessage}.`
            });
        });
}

export {BASE_URL, API_PREFIX, handleResponse};

// EOF