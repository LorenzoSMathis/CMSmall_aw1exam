/* eslint-disable react/prop-types */
import {useContext, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {Button, ButtonGroup, Col, Container, Form, Modal, Row} from "react-bootstrap";
import {PencilSquare, PersonCircle} from "react-bootstrap-icons";

import {Formik} from "formik";
import * as Yup from "yup";

import {SiteInfoContext, UserContext} from "../context/Contexts.jsx";

/**
 * @description UserSection component: sezione utente.
 * @description     Se l'utente è autenticato, mostra il suo nome e un'icona, altrimenti mostra "Anonimo".
 * @description     Nel dropdown menu mostra "Login" se l'utente non è autenticato, "Logout" se l'utente è autenticato.
 * @return {JSX.Element}
 * @name UserSection
 * @private
 */
function UserSection() {
    const {logged, username, role, logout} = useContext(UserContext);
    const navigate = useNavigate();

    /**
     * Ottiene la stringa del ruolo dell'utente
     * @param role {String}
     * @return {string}
     */
    const getRoleString = (role) => {
        switch (role) {
            case "admin":
                return "Amministratore";
            case "user":
                return "Utente";
        }
    }

    return (
        <Container fluid>
            <Row className="d-flex align-items-center">
                {
                    logged
                        ?
                        <Col className="col-10">
                            <ButtonGroup>
                                <Button variant="outline-light" className="usersection-rolebutton" disabled>
                                    {getRoleString(role)}
                                </Button>
                                <Button variant="outline-light" className="usersection-userbutton" disabled>
                                    {username}
                                </Button>
                                <Button variant="outline-light" className="usersection-actionbutton-logout"
                                        onClick={logout}>
                                    {"Logout"}
                                </Button>
                            </ButtonGroup>
                        </Col>
                        :
                        <Col className="col-5 offset-5">
                            <Button variant="outline-light" className="usersection-actionbutton-login"
                                    onClick={() => navigate("/login")}>
                                {"Login"}
                            </Button>
                        </Col>
                }
                <Col className="col-2">
                    {
                        logged
                            ?
                            <PersonCircle className="usersection-usericon" size={"3rem"}/>
                            :
                            null
                    }
                </Col>
            </Row>
        </Container>
    );
}

/**
 * @description ChangeOffice component: bottone per cambiare ufficio
 * @param props.destinationRoute {String}: route di destinazione (compatibile con react-router-dom)
 * @param props.destinationTitle {String}: titolo del bottone
 * @return {JSX.Element}
 * @name ChangeOffice
 * @private
 */
function ChangeOffice(props) {
    const {destinationRoute, destinationTitle} = props;

    const {logged} = useContext(UserContext);

    if (logged || ["/login", "/"].includes(destinationRoute)) {
        return (
            <Link to={destinationRoute}>
                <Button className="changeoffice-button" variant="outline-light">
                    {destinationTitle}
                </Button>
            </Link>
        );
    }
}

/**
 * @description SiteName component: prompt per cambiare il nome del sito
 * @param props.updateName {Function}: funzione per aggiornare il nome del sito
 * @param props.show {Boolean}: booleano che indica se mostrare il prompt
 * @param props.onHide {Function}: funzione per nascondere il prompt
 * @return {JSX.Element}
 * @name SiteNameModal
 * @private
 */
function SiteNameModal(props) {
    const { updateName, show, onHide } = props;

    return (
        <Formik
            initialValues={{
                newSiteName: ""
            }}
            onSubmit={(values, {resetForm}) => {
                updateName(values.newSiteName);
                resetForm();
                onHide();
            }}
            validationSchema={Yup.object({
                newSiteName: Yup.string().required("Il nuovo valore è obbligatorio")
            })}>
            {
                (formik) => {
                    const {handleSubmit, handleChange, handleBlur, values, errors, touched, resetForm} = formik;
                    return (
                        <Modal
                            show={show}
                            onHide={onHide}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Modifica nome sito</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group controlId="newSiteName">
                                    <Form.FloatingLabel
                                        controlId="newSiteName"
                                        label="Nuovo nome sito"
                                    >
                                        <Form.Control
                                            type="text"
                                            placeholder="Nuovo nome sito"
                                            value={values.newSiteName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.newSiteName && errors.newSiteName}
                                            isValid={touched.newSiteName && !errors.newSiteName}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSubmit();
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.newSiteName}
                                        </Form.Control.Feedback>
                                    </Form.FloatingLabel>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="success" onClick={handleSubmit}>
                                    Aggiorna
                                </Button>
                                <Button variant="danger" onClick={() => {
                                    resetForm();
                                    onHide();
                                }}>
                                    Annulla
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    )
                }
            }
        </Formik>
    )
}

/**
 * @description Header component
 * @param props.className {String}: classi aggiuntive per il componente
 * @param props.showUserSection {Boolean}: booleano che indica se mostrare la sezione utente
 * @param props.officeInfo {Object<{route: String, title: String}>}: informazioni ufficio
 * @param props.modifyEnabled {Boolean}: booleano che indica se mostrare il bottone per modificare il nome sito
 * @return {JSX.Element}
 * @name Header
 * @public
 */
function Header(props) {
    const { className, showUserSection, officeInfo, modifyEnabled } = props;
    const { siteInfo, updateSiteInfo } = useContext(SiteInfoContext);
    const { logged, username, role, logout } = useContext(UserContext);

    const [ modifyModal, setModifyModal ] = useState(false);

    return (
        <>
            <Container fluid className={(className ? className : "") + " header"}>
                <Row>
                    <Col className="col-2">
                        {
                            officeInfo
                                ?
                                <ChangeOffice destinationRoute={officeInfo.route} destinationTitle={officeInfo.title}/>
                                :
                                null
                        }
                    </Col>
                    <Col className="d-flex align-items-center">
                        <h1 className="header-title">{siteInfo.siteName}</h1>
                        {
                            modifyEnabled && logged && role === "admin"
                                ?
                                <Button
                                    variant="outline-light"
                                    onClick={() => setModifyModal(true)}
                                >
                                    <PencilSquare size={"1.5rem"} color={"white"}/>
                                </Button>
                                :
                                null
                        }
                    </Col>
                    <Col className="col-4 d-flex align-items-center">
                        {
                            showUserSection
                                ?
                                <UserSection
                                    logged={logged}
                                    username={username}
                                    role={role}
                                    logout={logout}
                                />
                                :
                                null
                        }
                    </Col>
                </Row>
            </Container>
            <SiteNameModal
                updateName={(newSiteName) => {
                    updateSiteInfo({...siteInfo, siteName: newSiteName});
                }}
                show={modifyModal}
                onHide={() => setModifyModal(false)}
            />
        </>
    );
}

export default Header;