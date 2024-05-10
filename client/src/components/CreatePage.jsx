/* eslint-disable react/prop-types */
import {useContext, useState} from 'react';
import {Button, Col, Container, Row,} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

import * as Yup from "yup";
import {Formik} from "formik";
import dayjs from "dayjs";

import {PagesContext, UserContext} from "../context/Contexts.jsx";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ErrorHandling from "./ErrorHandling.jsx";
import {PageForm} from "./PageEditingComponents.jsx";

/**
 * @description Main component: contenuto principale della pagina di creazione di una pagina
 * @return {JSX.Element}
 * @constructor
 */
function Main() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {addPage} = useContext(PagesContext);
    const {username} = useContext(UserContext);

    /**
     * @description Valori iniziali per il form (formik)
     */
    const initialValues = {
        title: "",
        publication_date: "",
        content: [],
        creation_date: dayjs().format("YYYY-MM-DD"),
    };

    /**
     * @description Funzione per la gestione dell'invio del form (formik)
     * @param values {Object}: valori del form
     */
    const onSubmit = (values) => {
        setIsSubmitting(true);

        addPage({
            title: values.title,
            author: username,
            creationDate: new dayjs(values.creation_date),
            publicationDate: values.publication_date === "" ? null : dayjs(values.publication_date),
            content: values.content
        }).
            then(() => {
                navigate('/back-office');           // In caso di successo reindirizzamento a back office
            })
            .catch(() => {
                setIsSubmitting(false);       /** In caso di errore rimuove lo stato d'invio in corso, la gestione dell'errore viene fatta dalla @see addPage in @file App.jsx **/
            });
    };

    /**
     * @description Schema di validazione per il form (formik|yup)
     */
    const validationSchema = Yup.object({
        title: Yup.string().required("Required"),
        publication_date: Yup.string().nullable().optional().test("publication_date", "La data di pubblicazione deve essere successiva alla data di creazione", (value) => {
            if (value === "" || !value) return true;
            return dayjs(value).isAfter(dayjs(initialValues.creation_date)) || dayjs(value).isSame(dayjs(initialValues.creation_date));
        }),
        content: Yup.array().test("content-requirements", "La pagina deve contenere almeno una sezione Header e una sezione Paragrafo o Immagine", (value) => {
            let others = 0;
            let header = 0;
            value.forEach((section) => {
                if (section.type === "header") {
                    header++;
                } else {
                    others++;
                }
            });
            return header > 0 && others > 0;
        })
    });

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            {
                (formik) => {
                    return (
                        <Container fluid className="create-page-main">
                            <Row>
                                <Col className="create-page-main-title">
                                    <h2>BACK OFFICE: <span>Crea una nuova pagina</span></h2>
                                </Col>
                                <Col className="col-3 create-page-main-go-back d-flex align-items-center">
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate("/back-office")}
                                    >
                                        Torna al back office
                                    </Button>
                                </Col>
                            </Row>
                            {/**
                             * @description Form per la creazione/modifica di una nuova pagina
                             * @see PageForm in @file PageEditingComponents.jsx
                             **/
                            }
                            <PageForm
                                formik={formik}
                                isSubmitting={isSubmitting}
                                username={username}
                            />
                        </Container>
                    )
                }
            }
        </Formik>
    )
}

/**
 * @description Description component: pagina di creazione di una pagina
 * @return {JSX.Element}
 * @name CreatePage
 * @public
 */
function CreatePage() {
    const {logged} = useContext(UserContext);

    if (!logged) { // Solo utenti autenticati possono accedere al back office
        return (
            <ErrorHandling.UnauthorizedDisclaimer
                message={"Autenticazione necessaria per accedere al back office"}
            />
        )
    } else {
        return (
            <>
                <Header
                    className="fixed-header"
                    officeInfo={{
                        title: "Front Office",
                        route: "/"
                    }}
                    showUserSection
                />

                <Main />

                <Footer />

                <ErrorHandling.ErrorModal />
            </>
        );
    }
}




export default CreatePage;