"use strict";

const Errors = require("../api/Errors");

const crypto = require('crypto');
const sqlite = require('sqlite3');
const dayjs = require("dayjs");
const DB_PATH = "./database/db.sqlite";
/**
 * Database
 * @type {Database}
 */
const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) throw Errors.DATABASE_ERROR.CONNECTION_FAILED;
});

/**
 * @description Estrazione dell'utente dal database tramite id
 * @param id {int}: id dell'utente
 * @return {Promise<{id: int, username: String, role: String}>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @throws USER_ERROR.USER_NOT_FOUND
 * @name getUserById
 * @function
 * @public
 */
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                if (row === undefined) {
                    reject(Errors.USER_ERROR.USER_NOT_FOUND);
                } else {
                    resolve({
                        id: row.id,
                        username: row.username,
                        role: row.role
                    });
                }
            }
        });
    });
}

/**
 * @description Estrazione dell'utente dal database tramite username e password
 * @param username {String}: username dell'utente
 * @param password {String}: password dell'utente
 * @return {Promise<{id: int, username: String, role: String}>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @throws USER_ERROR.USER_NOT_FOUND
 * @throws USER_ERROR.HASH_FAILED
 * @throws USER_ERROR.WRONG_PASSWORD
 * @name getUser
 * @function
 * @public
 */
exports.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                if (row === undefined) {
                    reject(Errors.USER_ERROR.USER_NOT_FOUND);
                } else {
                    crypto.scrypt(password, row.salt, 64, (err, derivedKey) => {
                        if (err) {
                            reject(Errors.USER_ERROR.HASH_FAILED);
                        } else {
                            const storedKey = Buffer.from(row.password, "hex");

                            if (!crypto.timingSafeEqual(derivedKey, storedKey)) {
                                reject(Errors.USER_ERROR.WRONG_PASSWORD);
                            } else {
                                resolve({
                                    id: row.id,
                                    username: row.username,
                                    role: row.role
                                });
                            }
                        }
                    });
                }
            }
        });
    });
}

/**
 * @description Estrazione della lista di tutti gli utenti
 * @return {Promise<Array<String>>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name getUsersList
 * @function
 * @public
 */
exports.getUsersList = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT username FROM users";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                resolve(rows.map((row) => row.username));
            }
        });
    });
}

/**
 * @description Estrazione della lista di tutte le pagine e relativi contenuti
 * @return {Promise<Array<Object<{id: int, title: String, publicationDate: Object<dayjs>|null, creationDate: Object<dayjs>, content: Object<{id: int, type: String, value: String}>}>>>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name getPages
 * @function
 * @public
 */
exports.getPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                resolve(rows.map((row) => {
                    return {
                        id: row.id,
                        title: row.title,
                        author: row.author,
                        publicationDate: row.publicationDate ? new dayjs(row.publicationDate) : null,
                        creationDate: new dayjs(row.creationDate),
                        content: JSON.parse(row.content)
                    }
                }));
            }
        });
    });
}

/**
 * @description Estrazione di una pagina dal database tramite id
 * @param id {int}: id della pagina
 * @return {Promise<Object<{id: int, title: String, publicationDate: Object<dayjs>|null, creationDate: Object<dayjs>, content: Object<{id: int, type: String, value: String}>}>>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @throws PAGE_ERROR.PAGE_NOT_FOUND
 * @name getPageById
 * @function
 * @public
 */
exports.getPageById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                if (row === undefined) {
                    reject(Errors.PAGE_ERROR.PAGE_NOT_FOUND(id));
                } else {
                    resolve({
                        id: row.id,
                        title: row.title,
                        author: row.author,
                        publicationDate: row.publicationDate ? new dayjs(row.publicationDate) : null,
                        creationDate: new dayjs(row.creationDate),
                        content: JSON.parse(row.content)
                    });
                }
            }
        });
    });
}

/**
 * @description Cancellazione della pagina con id specificato
 * @param id {int}: id della pagina da cancellare
 * @return {Promise<null>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name deletePage
 * @function
 * @public
 */
exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM pages WHERE id = ?";
        db.run(sql, [id], (err) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * @description Aggiornamento di una pagina
 * @param id {int}: id della pagina da aggiornare
 * @param updatedPage {Object<{id: int, title: String, publicationDate: Object<dayjs>|null, creationDate: Object<dayjs>, content: Object<{id: int, type: String, value: String}>}>} : pagina aggiornata
 * @return {Promise<null>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name updatePage
 * @function
 * @public
 */
exports.updatePage = (id, updatedPage) => {
    const pageContent = updatedPage.content.map((content, index) => {       // lato client, quando viene creata una nuova sezione, viene generato un id univoco
        return {...content, id: index}                                                        // (all'interno della singola pagina) utilizzando un timestamp, lato server viene sostituito
    });                                                                                       // con quello permanente
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET title = ?, author = ?, publicationDate = ?, creationDate = ?, content = ? WHERE id = ?";
        db.run(sql, [updatedPage.title, updatedPage.author, updatedPage.publicationDate, updatedPage.creationDate, JSON.stringify(pageContent), id], (err) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * @description Inserimento di una nuova pagina
 * @param newPage
 * @return {Promise<int>} id della pagina appena inserita
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name insertPage
 * @function
 * @public
 */
exports.insertPage = (newPage) => {
    const pageContent = newPage.content.map((content, index) => {           // lato client, quando viene creata una nuova sezione, viene generato un id univoco
        return {...content, id: index}                                                        // (all'interno della singola pagina) utilizzando un timestamp, lato server viene sostituito
    });                                                                                       // con quello permanente
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO pages (title, author, publicationDate, creationDate, content) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [newPage.title, newPage.author, newPage.publicationDate, newPage.creationDate, JSON.stringify(pageContent)], function (err) {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                resolve(this.lastID);
            }
        });
    });
}

/**
 * @description Estrazione delle informazioni del sito
 * @return {Promise<Object<{siteName: String}>>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @throws SITE_INFO_ERROR.SITE_INFO_NOT_FOUND
 * @name getSiteInfo
 * @function
 * @public
 */
exports.getSiteInfo = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM siteInfo";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                let siteInfo = {};
                if (rows === undefined || rows.length === 0) {
                    reject(Errors.SITE_INFO_ERROR.SITE_INFO_NOT_FOUND);
                } else {
                    for (const entry of rows) {
                        siteInfo[entry.fieldName] = entry.fieldValue;
                    }
                    resolve(siteInfo);
                }
            }
        });
    });
}

/**
 * @description Aggiornamento delle informazioni del sito
 * @param siteInfo informazioni del sito da aggiornare
 * @return {Promise<null>}
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @name updateSiteInfo
 * @function
 * @public
 */
exports.updateSiteInfo = (siteInfo) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT OR REPLACE INTO siteInfo (fieldName, fieldValue) VALUES (?, ?)";
        db.run(
            sql,
            ["siteName", siteInfo.siteName],
            (err) => {
                if (err) {
                    reject(Errors.DATABASE_ERROR.QUERY_FAILED());
                } else {
                    resolve(null);
                }
            }
        );
    });
}

/**
 * @description Estrazione delle immagini presenti nel database
 * @throws DATABASE_ERROR.QUERY_FAILED
 * @return {Promise<Array<String>>}
 * @name getImages
 * @function
 * @public
 */
exports.getImages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM images";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(Errors.DATABASE_ERROR.QUERY_FAILED());
            } else {
                let images = [];
                if (rows === undefined || rows.length === 0) {
                    resolve(images);
                } else {
                    for (const entry of rows) {
                        images.push(entry.name);
                    }
                    resolve(images);
                }
            }
        });
    });
}

// EOF