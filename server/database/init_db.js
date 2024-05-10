"use strict";

/**
 *
 * @description IGNORARE QUESTO FILE
 * @description Questo file inizializza il database ai dati iniziali da init_db.json. Incluso nel repository solo per emergenze.
 * @description eseguire con il comando "node init_db.js" dalla directory server/database/
 *
 */



const sqlite = require("sqlite3");
const database_path = "./db.sqlite";

const crypto = require("crypto");
const dayjs = require("dayjs");

const data = require("./init_db.json");

const database = new sqlite.Database(database_path, (err) => {
    if (err) {
        console.log("Error opening database");
        console.log(err);
        process.exit(1);
    }
});

const init_users = async (users) => {
    const sql_drop = "DROP TABLE IF EXISTS users";
    const sql_create = `
        CREATE TABLE IF NOT EXISTS "users"
        (
            "id"       INTEGER PRIMARY KEY AUTOINCREMENT,
            "username" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "salt"     TEXT NOT NULL,
            "role"     TEXT NOT NULL
        )
    `;
    const sql_insert = "INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
        database.run(
            sql_drop,
            (err) => {
                if (err) {
                    console.log("Error dropping users table");
                    console.log(err);
                    reject(err);
                } else {
                    console.log("\n\n---Users table dropped---");
                    database.run(
                        sql_create,
                        (err) => {
                            if (err) {
                                console.log("Error creating users table");
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("\n\n---Users table created---");
                                let userCount = users.length;
                                for (let user of users) {
                                    const salt = crypto.randomBytes(16).toString("hex");
                                    crypto.scrypt(user.password, salt, 64, (err, derivedKey) => {
                                        if (err) {
                                            console.log("Error hashing password");
                                            console.log(err);
                                            reject(err);
                                        } else {
                                            const hashed_password = derivedKey.toString("hex");

                                            database.run(
                                                sql_insert,
                                                [user.username, hashed_password, salt, user.role],
                                                (err) => {
                                                    if (err) {
                                                        console.log("Error inserting user");
                                                        console.log(err);
                                                        reject(err);
                                                        users = [];
                                                    } else {
                                                        userCount--;
                                                        console.log("\n\n---User inserted---");
                                                        console.log(`Username: ${user.username}`);
                                                        console.log(`Password: ${user.password}`);
                                                        if (userCount === 0) resolve();
                                                    }

                                                }
                                            );
                                        }
                                    });

                                }

                            }
                        });
                }

            }
        );
    });
}

const init_pages = async (pages) => {
    const sql_drop = "DROP TABLE IF EXISTS pages";
    const sql_create = `
        CREATE TABLE IF NOT EXISTS "pages"
        (
            "id"              INTEGER PRIMARY KEY AUTOINCREMENT,
            "title"           TEXT NOT NULL,
            "author"          TEXT NOT NULL,
            "publicationDate" TEXT,
            "creationDate"    TEXT NOT NULL,
            "content"         TEXT NOT NULL,
            FOREIGN KEY (author) REFERENCES users (username)
        )
    `;
    const sql_insert = "INSERT INTO pages (title, author, publicationDate, creationDate, content) VALUES (?, ?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
        database.run(
            sql_drop,
            (err) => {
                if (err) {
                    console.log("Error dropping pages table");
                    console.log(err);
                    reject(err);
                } else {
                    console.log("\n\n---Pages table dropped---");
                    database.run(
                        sql_create,
                        (err) => {
                            if (err) {
                                console.log("Error creating pages table");
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("\n\n---Pages table created---");
                                let pageCount = pages.length;
                                for (let page of pages) {
                                    database.run(
                                        sql_insert,
                                        [page.title, page.author, new dayjs(page.publicationDate).format(), new dayjs(page.creationDate).format(), JSON.stringify(page.content)],
                                        (err) => {
                                            if (err) {
                                                console.log("Error inserting page");
                                                console.log(err);
                                                reject(err);
                                                pages = [];
                                            } else {
                                                pageCount--;
                                                console.log("\n\n---Page inserted---");
                                                console.log(`Title: ${page.title}`);
                                                console.log(`Author: ${page.author}`);
                                                console.log(`Publication date: ${page.publicationDate}`);
                                                console.log(`Creation date: ${page.creationDate}`);
                                                console.log(`Content: ${JSON.stringify(page.content)}`);
                                                if (pageCount === 0) resolve();
                                            }

                                        }
                                    );
                                }
                            }
                        });
                }

            }
        );
    });
}

const init_siteInfo = async (info) => {
    const sql_drop = "DROP TABLE IF EXISTS siteInfo";
    const sql_create = `
        CREATE TABLE IF NOT EXISTS "siteInfo"
        (
            "id"         INTEGER PRIMARY KEY AUTOINCREMENT,
            "fieldName"  TEXT NOT NULL UNIQUE,
            "fieldValue" TEXT NOT NULL
        )
    `;
    const sql_insert = "INSERT INTO siteInfo (fieldName, fieldValue) VALUES (?, ?)";

    return new Promise((resolve, reject) => {
        database.run(
            sql_drop,
            (err) => {
                if (err) {
                    console.log("Error dropping siteInfo table");
                    console.log(err);
                    reject(err);
                } else {
                    console.log("\n\n---Pages siteInfo dropped---");
                    database.run(
                        sql_create,
                        (err) => {
                            if (err) {
                                console.log("Error creating siteInfo table");
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("\n\n---Pages SiteInfo created---");
                                let infoCount = info.length;
                                for (let i of info) {
                                    database.run(
                                        sql_insert,
                                        [i.fieldName, i.fieldValue],
                                        (err) => {
                                            if (err) {
                                                console.log("Error inserting siteInfo");
                                                console.log(err);
                                                reject(err);
                                                info = [];
                                            } else {
                                                infoCount--;
                                                console.log("\n\n---SiteInfo inserted---");
                                                console.log(`${i.fieldName}: ${i.fieldValue}`);
                                                if (infoCount === 0) resolve();
                                            }
                                        }
                                    );
                                }
                            }
                        });
                }

            }
        );
    });
}

const init_images = async (images) => {
    const sql_drop = "DROP TABLE IF EXISTS images";
    const sql_create = `
        CREATE TABLE IF NOT EXISTS "images"
        (
            "id"   INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT NOT NULL UNIQUE
        )
    `;
    const sql_insert = "INSERT INTO images (name) VALUES (?)";

    return new Promise((resolve, reject) => {
        database.run(
            sql_drop,
            (err) => {
                if (err) {
                    console.log("Error dropping images table");
                    console.log(err);
                    reject(err);
                } else {
                    console.log("\n\n---Images table dropped---");
                    database.run(
                        sql_create,
                        (err) => {
                            if (err) {
                                console.log("Error creating images table");
                                console.log(err);
                                reject(err);
                            } else {
                                console.log("\n\n---Images table created---");
                                let imageCount = images.length;
                                for (let i of images) {
                                    database.run(
                                        sql_insert,
                                        [i],
                                        (err) => {
                                            if (err) {
                                                console.log("Error inserting image");
                                                console.log(err);
                                                reject(err);
                                                images = [];
                                            } else {
                                                imageCount--;
                                                console.log("\n\n---Image inserted---");
                                                console.log(`${i.name}`);
                                                if (imageCount === 0) resolve();
                                            }
                                        }
                                    );
                                }
                            }
                        });
                }

            }
        );
    });
}

const init = () => {
    init_users(data.users).then(() => {
        console.log("\n\n -------------------")
        init_pages(data.pages).then(() => {
            console.log("\n\n -------------------")
            init_siteInfo(data.siteInfo).then(() => {
                console.log("\n\n -------------------")
                init_images(data.images).then(() => {
                    console.log("\n\n -------------------")
                    console.log("\n\n---Database initialized---\n\n");
                });
            });
        });
    });
}

init();

// EOF