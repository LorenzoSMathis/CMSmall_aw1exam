"use strict";

import {API_PREFIX, BASE_URL, handleResponse} from "./internals.js";

/**
 * @description Richiede le informazioni del sito al server
 * @route /api/application-data/site-info
 * @method GET
 * @return {Promise<{siteName: String}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const getSiteInfo = () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "application-data/site-info", BASE_URL), {
            credentials: "include"
        });

        handleResponse(response, resolve, reject, "impossibile ottenere le informazioni del sito");
    });
}

/**
 * @description Aggiorna le informazioni del sito
 * @route /api/application-data/site-info
 * @method PUT
 * @param info {{siteName: String}}: le nuove informazioni del sito
 * @return {Promise<null>}
 * @throws {Promise<{code: String, message: String}>}
 */
const updateSiteInfo = (info) => {
    return new Promise((resolve, reject) => {
        if (info === undefined || info.siteName === undefined) {                // Se il nome del sito non è specificato
            reject({
                code: "CLIENT_SIDE.EMPTY_SITE_INFO",
                message: "Il nome del sito non può essere vuoto"
            });
        }
        else {
            const response = fetch(new URL(API_PREFIX + "application-data/site-info", BASE_URL), {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(info)
            });

            handleResponse(response, resolve, reject, "impossibile aggiornare le informazioni del sito", false);
        }
    });
}

/**
 * @description Richiede tutte le pagine al server
 * @route /api/application-data/pages
 * @method GET
 * @return {Promise<{pages: Array<Object>}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const getPages = async () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "application-data/pages", BASE_URL), {
            credentials: "include"
        });

        handleResponse(response, resolve, reject, "impossibile ottenere la lista delle pagine");
    });
}

/**
 * @description Richiede la cancellazione di una pagina al server
 * @route /api/application-data/pages/:id
 * @method DELETE
 * @param id{int}: l'id della pagina da cancellare
 * @return {Promise<null>}
 * @throws {Promise<{code: String, message: String}>}
 */
const deletePage = async (id) => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "application-data/pages/" + id, BASE_URL), {
            method: "DELETE",
            credentials: "include"
        });

        handleResponse(response, resolve, reject, "impossibile eliminare la pagina con id " + id, false);
    });
}

/**
 * @description Richiede l'aggiornamento di una pagina al server
 * @route /api/application-data/pages/:id
 * @method PUT
 * @param page {{pageObject}} l'oggetto pagina con i nuovi dati
 * @return {Promise<null>}
 * @throws {Promise<{code: String, message: String}>}
 */
const updatePage = async (page) => {
    return new Promise((resolve, reject) => {
        if (page === undefined || page.id === undefined) {
            reject({
                code: "CLIENT_SIDE.PAGE_ID_NOT_SPECIFIED",
                message: "Id della pagina non specificato"
            });
        }
        else {
            const response = fetch(new URL(API_PREFIX + "application-data/pages/" + page.id, BASE_URL), {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(page)
            });

            handleResponse(response, resolve, reject, "impossibile aggiornare la pagina con id " + page.id, false);
        }
    });
}

/**
 * @description Richiede l'aggiunta di una pagina al server
 * @route /api/application-data/pages
 * @method POST
 * @param page {{pageObject}} l'oggetto pagina da aggiungere
 * @return {Promise<{id: int}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const addPage = (page) => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "application-data/pages", BASE_URL), {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(page)
        });

        handleResponse(response, resolve, reject, "impossibile aggiungere la pagina");
    });
}

/**
 * @description Richiede la lista delle immagini al server.
 * @route /api/resources/images
 * @method GET
 * @return {Promise<{images: Array<String>, path: String}>}
 * @throws {Promise<{code: String, message: String}>}
 */
const getImages = () => {
    return new Promise((resolve, reject) => {
        const response = fetch(new URL(API_PREFIX + "resources/images", BASE_URL), {
            credentials: "include"
        });

        handleResponse(response, resolve, reject, "impossibile ottenere la lista delle immagini");
    });
}


/**
 * @description Export delle funzioni per l'accesso ai dati
 */
const dataAPI = {
    siteInfo: {
        get: getSiteInfo,
        update: updateSiteInfo
    },
    pages: {
        get: getPages,
        delete: deletePage,
        update: updatePage,
        add: addPage
    },
    images: {
        get: getImages
    }
}

export default dataAPI;

// EOF