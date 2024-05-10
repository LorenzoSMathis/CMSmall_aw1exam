import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import {BrowserRouter, Route, Routes} from "react-router-dom";
import {useEffect, useState} from "react";

import dayjs from "dayjs";

import {PagesContext, SiteInfoContext, StaticContentContext, UserContext} from "./context/Contexts.jsx";

import Login from "./components/Login.jsx";
import FrontOffice from "./components/FrontOffice.jsx";
import BackOffice from "./components/BackOffice.jsx";
import CreatePage from "./components/CreatePage.jsx";
import EditPage from "./components/EditPage.jsx";
import Loading from "./components/Loading.jsx";
import PageView from "./components/PageView.jsx";
import ErrorHandling from "./components/ErrorHandling.jsx";

import userAPI from "./api/user.js";
import dataAPI from "./api/data.js";

function Main() {
    const [loading, setLoading] = useState(10);                  // Numero di risorse da caricare (sono solo 4, ma dato che react in modalita dev esegue le useEffect 2 volte devo mettere8)

    const [error, setError] = useState(null);

    const [pages, setPages] = useState([]);
    const [dirtyPages, setDirtyPages] = useState(true);

    const [siteInfo, setSiteInfo] = useState({});
    const [dirtySiteInfo, setDirtySiteInfo] = useState(true);

    const [images, setImages] = useState([]);
    const [path, setPath] = useState("");

    const [userList, setUserList] = useState([]);

    const [loggedUser, setLoggedUser] = useState({logged: false});

    const handleError = (err) => {
        setError(err);
    }

    // Caricamento lista delle immagini e degli utenti, logout se ci sono sessioni pendenti
    useEffect(() => {
        dataAPI.images.get()
            .then((data) => {
                setImages(data.images);
                setPath(data.path);
                setLoading((oldLoading) => oldLoading - 1);
            })
            .catch((err) => {
                handleError(err);
            });

        userAPI.getUsersList()
            .then((users) => {
                setUserList(users.users);
                setLoading((oldLoading) => oldLoading - 1);
            })
            .catch((err) => {
                handleError(err);
            });

        userAPI.getUserInfo()
            .then((user) => {
                setLoggedUser({logged: true, username: user.username, role: user.role});
                setLoading((oldLoading) => oldLoading - 1);
            })
            .catch((err) => {
                if (err.code === "AUTHENTICATION_ERROR.UNAUTHENTICATED_USER") {
                    setLoggedUser({logged: false});
                    setLoading((oldLoading) => oldLoading - 1);
                } else {
                    handleError(err);
                }
            });
    }, []);

    // Caricamento lista delle pagine (e rilativi dati)
    useEffect(() => {
        if (dirtyPages) {
            dataAPI.pages.get()
                .then((pages) => {
                    setPages(pages.pages.map((page) => {
                        return {
                            id: page.id,
                            title: page.title,
                            author: page.author,
                            creationDate: new dayjs(page.creationDate),
                            publicationDate: page.publicationDate ? new dayjs(page.publicationDate) : null,
                            content: page.content
                        }
                    }));
                    setDirtyPages(false);
                    setLoading((oldLoading) => oldLoading - 1);
                })
                .catch((err) => {
                    handleError(err);
                });
        }
    }, [dirtyPages]);

    // Caricamento dati del sito
    useEffect(() => {
        if (dirtySiteInfo) {
            dataAPI.siteInfo.get()
                .then((siteInfo) => {
                    setSiteInfo(siteInfo);
                    setDirtySiteInfo(false);
                    setLoading((oldLoading) => oldLoading - 1);
                })
                .catch((err) => {
                    handleError(err);
                });
        }
    }, [dirtySiteInfo]);


    /**
     * @function login
     * @description Effettua il login dell'utente
     * @param username {String} : Username dell'utente
     * @param password {String} : Password dell'utente
     * @return {Promise<true>}
     * @throws {Promise<Object<{code: String, message: String}>>}
     */
    const login = (username, password) => {
        return new Promise((resolve, reject) => {
            userAPI.login({username: username, password: password})
                .then((user) => {
                    setLoggedUser({logged: true, username: user.username, role: user.role});
                    resolve(true);
                })
                .catch((err) => {
                    handleError(err);
                    setLoggedUser({logged: false});
                    reject(err);
                });

            // In caso di login ricarico le pagine e i dati del sito
            setDirtyPages(true);
            setDirtySiteInfo(true);
        });
    }

    /**
     * @function resetUser
     * @description Resetta l'utente autenticato, utilizzata a seguito di una failure del server: il client vede ancora un utente autenticato anche se la sessione non è più valida sul server
     */
    const resetUser = () => {
        setLoggedUser({logged: false});
        setDirtyPages(true);
        setDirtySiteInfo(true);
    }

    /**
     * @function logout
     * @description Effettua il logout dell'utente
     * @return {void}
     */
    const logout = () => {
        userAPI.logout()
            .then(() => {
                setLoggedUser({logged: false});
            })
            .catch((err) => {
                handleError(err);
            });

        // In caso di logout ricarico le pagine e i dati del sito
        setDirtyPages(true);
        setDirtySiteInfo(true);
    }

    /**
     * @function addPage
     * @description Aggiunge una pagina al sito, in caso di errore viene gestito dalla handleError (mostra il prompt) ma la promise viene comunque rigettata (per permettere di non effettuare il redirect dalla route di aggiunta a quella del backoffice)
     * @param page {Object} : Oggetto contenente i dati della pagina da aggiungere
     * @return {Promise<true>}
     * @throws {Promise<Object<{code: String, message: String}>>}
     */
    const addPage = (page) => {
        return new Promise((resolve, reject) => {
            setPages((oldPages) => [...oldPages, page]);
            dataAPI.pages.add(page)
                .then(() => {
                    setDirtyPages(true);
                    resolve(true);
                })
                .catch((err) => {
                    handleError(err);
                    reject(err);
                });
        });
    }

    /**
     * @function updatePage
     * @description Aggiorna una pagina del sito, in caso di errore viene gestito dalla handleError (mostra il prompt) ma la promise viene comunque rigettata (per permettere di non effettuare il redirect dalla route di modifica a quella del backoffice)
     * @param newPage {Object} : Oggetto contenente i dati della pagina da aggiornare
     * @return {Promise<true>}
     * @throws {Promise<Object<{code: String, message: String}>>}
     */
    const updatePage = (newPage) => {
        return new Promise((resolve, reject) => {
            setPages((oldPages) => oldPages.map((p) => p.id === newPage.id ? {...newPage, updated: true} : p));
            dataAPI.pages.update(newPage)
                .then(() => {
                    setDirtyPages(true);
                    resolve(true);
                })
                .catch((err) => {
                    handleError(err);
                    reject(err);
                });
        });
    }

    /**
     * @function deletePage
     * @description Elimina una pagina del sito, in caso di errore viene gestito dalla handleError (mostra il prompt)
     * @param id {int}: ID della pagina da eliminare
     * @return {void}
     */
    const deletePage = (id) => {
        setPages((oldPages) => oldPages.map((page) => page.id === id ? {...page, deleted: true} : page));
        dataAPI.pages.delete(id)
            .then(() => setDirtyPages(true))
            .catch((err) => {
                handleError(err);
            });
    }

    /**
     * @function updateSiteInfo
     * @description Aggiorna i dati del sito, in caso di errore viene gestito dalla handleError (mostra il prompt)
     * @param newSiteInfo {Object} : Oggetto contenente i dati del sito da aggiornare
     * @return {Promise<true>}
     */
    const updateSiteInfo = (newSiteInfo) => {
        return new Promise((resolve) => {
            setSiteInfo({...newSiteInfo});
            dataAPI.siteInfo.update(newSiteInfo)
                .then(() => {
                    setDirtySiteInfo(true);
                    resolve(true);
                })
                .catch((err) => {
                    handleError(err);
                });
        });
    }

    return (
        <>
            <ErrorHandling.ErrorContext.Provider value={{error: error, handleError: handleError}}>
                <UserContext.Provider value={{...loggedUser, login: login, logout: logout, reset: resetUser}}>

                    {
                        loading > 0
                            ?
                            <>
                                <Loading/>
                                <ErrorHandling.ErrorModal/>
                            </>
                            :
                            <StaticContentContext.Provider value={{
                                imagesInfo: {images: images, path: path},
                                userList: userList
                            }}>
                                <PagesContext.Provider
                                    value={{
                                        pages: pages,
                                        addPage: addPage,
                                        updatePage: updatePage,
                                        deletePage: deletePage,
                                        setDirty: () => setDirtyPages(true)
                                    }}>
                                    <SiteInfoContext.Provider
                                        value={{siteInfo: siteInfo, updateSiteInfo: updateSiteInfo}}>
                                        <Routes>
                                            <Route path="/" element={<FrontOffice/>}/>
                                            <Route path="/back-office" element={<BackOffice/>}/>
                                            <Route path="/pages/new/" element={<CreatePage/>}/>
                                            <Route path="/pages/:pageId" element={<PageView/>}/>
                                            <Route path="/pages/:pageId/edit" element={<EditPage/>}/>
                                            <Route path="/login" element={<Login/>}/>
                                        </Routes>
                                    </SiteInfoContext.Provider>
                                </PagesContext.Provider>
                            </StaticContentContext.Provider>
                    }
                </UserContext.Provider>

            </ErrorHandling.ErrorContext.Provider>
        </>
    )

}

function App() {

    return (
        <>
            <BrowserRouter>
                <Main/>
            </BrowserRouter>
        </>
    )
}

export default App
