"use strict";

import {API_PREFIX, BASE_URL, handleResponse} from "./internals.js";

/**
 * @description Richiede l'autenticazione al server
 * @route /api/authentication
 * @method POST
 * @param credentials {{username: string, password: string}}
 * @return {Promise<{id: int, username: String, role: String}>}
 */
const login = (credentials) => {
    return new Promise((resolve, reject) => {
        if (credentials.username === undefined || credentials.password === undefined) {                     // Controllo che username e password siano stati specificati
            reject({
                code: "CLIENT_SIDE.EMPTY_CREDENTIALS",
                message: "Username e password devono essere specificati"
            });
        }
        else {
            const response = fetch(new URL(API_PREFIX + "authentication/", BASE_URL), {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
            });
            handleResponse(response, resolve, reject, "impossibile effettuare il login");
        }
    });
}

/**
 * @description Richiede il logout al server
 * @route /api/authentication/current
 * @method DELETE
 * @return {Promise<null>}
 * @throws {Promise<{code: String, message: String}>}
 */
const logout = () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "authentication/current", BASE_URL), {
            method: "DELETE",
            credentials: "include"
        });
        handleResponse(response, resolve, reject, "impossibile effettuare il logout", false);
    });
}

/**
 * @description Richiede le informazioni dell'utente autenticato al server
 * @route /api/authentication/current
 * @method GET
 * @return {Promise<{id: int, username: String, role: String}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const getUserInfo = () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "authentication/current", BASE_URL), {
            credentials: "include"
        });
        handleResponse(response, resolve, reject, "impossibile ottenere le informazioni dell'utente");
    });
}

/**
 * @description Richiede la lista degli utenti al server
 * @route /api/application-data/user-list
 * @method GET
 * @return {Promise<{users: Array<String>}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const getUsersList = () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "application-data/user-list", BASE_URL), {
            credentials: "include"
        });
        handleResponse(response, resolve, reject, "impossibile ottenere la lista degli utenti");
    });
}

/**
 * User API
 */
const userAPI = {
    login,
    logout,
    getUserInfo,
    getUsersList
}

export default userAPI;

// EOF