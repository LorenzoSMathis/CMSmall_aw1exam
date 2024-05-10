/* eslint-disable react/prop-types */
import {useContext} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Modal} from "react-bootstrap";

import {ErrorContext, PagesContext, UserContext} from "../context/Contexts.jsx";

/**
 * @description Flag per la visualizzazione delle informazioni di debug (mostra anche il codice errore e non solo il messaggio)
 * @type {boolean}
 */
const DEBUG = false;

/**
 * @description ErrorModal: modal per la visualizzazione degli errori.
 * @return {JSX.Element}
 * @name ErrorModal
 * @public
 */
function ErrorModal() {
    const {error, handleError} = useContext(ErrorContext);
    const {reset} = useContext(UserContext);
    const pageContextContent = useContext(PagesContext);

    const navigate = useNavigate();

    // Chiude il modal
    const onClose = () => {
        handleError(null);
    }

    // Chiude il modal e resetta lo stato dell'utente lato client (non esegue il logout poiché la sessione lato server non esiste più)
    const onCloseAndLogout = () => {
        handleError(null);
        reset();
    }
                                // Problemi di autenticazione dovuti a sessioni scadute
    if (error && error.code && error.code.split(".")[0] === "AUTHENTICATION_ERROR" && error.code.split(".")[1] !== "INVALID_CREDENTIALS") {
        return (
            <Modal
                show={error}
                onHide={onCloseAndLogout}
            >
                <Modal.Header>
                    <Modal.Title>Errore</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="no-margin">{error ? error.message : null}</p>
                    {
                        DEBUG
                            ?
                            <p className="no-margin">{error ? error.code : null}</p>
                            :
                            null
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onCloseAndLogout();
                            navigate("/");
                        }}
                    >
                        Vai al front office
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onCloseAndLogout();
                            navigate("/login");
                        }}
                    >
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
    else if (error && error.code && error.code.split(".")[0] === "PAGE_ERROR" && error.code.split(".")[1] === "PAGE_NOT_FOUND") {
        return (
            <Modal
                show={error}
                onHide={onCloseAndLogout}
            >
                <Modal.Header>
                    <Modal.Title>Errore</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="no-margin">{error ? error.message : null}</p>
                    {
                        DEBUG
                            ?
                            <p className="no-margin">{error ? error.code : null}</p>
                            :
                            null
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onClose();
                            pageContextContent.setDirty();
                            navigate("/back-office");
                        }}
                    >
                        Torna al back office
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
    else {                      // Altri errori e problemi di autenticazione dovuti a credenziali errate
        return (
            <Modal
                show={error}
                onHide={onClose}
            >
                <Modal.Header>
                    <Modal.Title>Errore</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="no-margin">{error ? error.message : null}</p>
                    {
                        DEBUG
                            ?
                            <p className="no-margin">{error ? error.code : null}</p>
                            :
                            null
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={onClose}
                    >
                        Chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

/**
 * @description UnauthorizedDisclaimer component: disclaimer per accesso negato. Mostra un messaggio di errore e due bottoni: "Login" e "Front Office"
 * @param props.message {String}: messaggio di errore
 * @param props.noLogin {Boolean}: booleano che indica se mostrare il bottone "Login"
 * @param props.showBackOffice {Boolean}: booleano che indica se mostrare il bottone "Back Office"
 * @return {JSX.Element}
 * @name UnauthorizedDisclaimer
 * @public
 */
function UnauthorizedDisclaimer(props) {
    const {message, noLogin, showBackOffice} = props;
    const navigate = useNavigate();

    return (
        <Modal
            show={true}
        >
            <Modal.Header>
                <Modal.Title>Accesso negato</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                {
                    !noLogin
                        ?
                        <Button
                            variant="primary"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                        :
                        null
                }
                {
                    showBackOffice
                        ?
                        <Button
                            variant="primary"
                            onClick={() => navigate("/back-office")}
                        >
                            Back Office
                        </Button>
                        :
                        null
                }
                <Button
                    variant="primary"
                    onClick={() => navigate("/")}
                >
                    Front Office
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * @description NotFoundDisclaimer component: disclaimer per risorsa non trovata. Mostra un messaggio di errore e due bottoni: @param props.redirect e "Front Office"
 * @param props.message {String}: messaggio di errore
 * @param props.redirect {String}: route a cui reindirizzare l'utente (deve essere compatibile con la navigate())
 * @param props.redirectTitle {String}: titolo del bottone di reindirizzamento
 * @return {JSX.Element}
 * @name NotFoundDisclaimer
 * @public
 */
function NotFoundDisclaimer(props) {
    const {message, redirect, redirectTitle} = props;
    const navigate = useNavigate();

    return (
        <Modal
            show={true}
        >
            <Modal.Header>
                <Modal.Title>Risorsa non trovata</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={() => navigate(redirect)}
                >
                    {redirectTitle}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => navigate("/")}
                >
                    Front Office
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * @description Componenti e contesto per la gestione degli errori
 */
const ErrorHandling = {
    ErrorModal,
    UnauthorizedDisclaimer,
    NotFoundDisclaimer,
    ErrorContext
}

export default ErrorHandling;