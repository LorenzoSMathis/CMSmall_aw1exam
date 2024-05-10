/* eslint-disable react/prop-types */
import {useContext, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Col, Container, Row} from "react-bootstrap";

import {Formik} from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";

import {PagesContext, UserContext} from "../context/Contexts.jsx";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import {PageForm} from "./PageEditingComponents.jsx";
import ErrorHandling from "./ErrorHandling.jsx";



/**
 * @description contenuto principale della pagina di modifica di una pagina
 * @param props.page {Object}: pagina da modificare
 * @return {JSX.Element}
 * @name Main
 * @private
 */
function Main(props) {
    const navigate = useNavigate();
    const {page} = props;

    const {updatePage} = useContext(PagesContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * @description Valori iniziali per il form (formik)
     * @default valori attuali della pagina (da @param props.page)
     */
    const initialValues = {
        title: page.title,
        publication_date: page.publicationDate ? page.publicationDate.format("YYYY-MM-DD") : "",
        creation_date: page.creationDate.format("YYYY-MM-DD"),
        author: page.author,
        content: page.content
    };

    /**
     * @description Funzione per la gestione dell'invio del form (formik)
     * @param values {Object}: valori del form
     */
    const onSubmit = (values) => {
        setIsSubmitting(true);
        updatePage(
            {
                id: page.id,
                title: values.title,
                author: values.author,
                creationDate: new dayjs(values.creation_date),
                publicationDate: new dayjs(values.publication_date),
                content: values.content

            }
        ).then(() => {
            navigate("/back-office");               // naviga alla pagina di back office
        }).catch(() => {
            setIsSubmitting(false);           /** In caso di errore rimuove lo stato d'invio in corso, la gestione dell'errore viene fatta dalla @see addPage in @file App.jsx **/
        });
    };

    /**
     * @description Schema di validazione per il form (formik|yup)
     */
    const validationSchema = Yup.object({
        title: Yup.string().required("Required"),
        publication_date: Yup.string().nullable().test("publication_date", "La data di pubblicazione deve essere successiva alla data di creazione", (value) => {
            if (value === "" || !value) return true;
            return !dayjs(value).isBefore(dayjs(initialValues.creation_date));
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
                                    <h2>BACK OFFICE: <span>Modifica una pagina</span></h2>
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
                                page={page}
                            />
                        </Container>
                    )
                }
            }
        </Formik>
    )
}

/**
 * @description Componente per la modifica di una pagina
 * @routeParam pageId {int}: id della pagina da modificare
 * @return {JSX.Element}
 * @name EditPage
 * @public
 */
function EditPage() {
    const {logged, username, role} = useContext(UserContext);
    const {pages} = useContext(PagesContext);

    const {pageId} = useParams();

    if (!logged) {
        return (
            <ErrorHandling.UnauthorizedDisclaimer
                message={"Autenticazione necessaria per accedere al back office."}
            />
        )
    } else {
        const requestedPage = pages.find((page) => page.id === Number(pageId));
        if (!requestedPage) {
            return (
                <ErrorHandling.NotFoundDisclaimer
                    message={`La pagina con id ${pageId} non esiste.`}
                    redirect={"/back-office"}
                    redirectTitle={"Torna al back office"}
                />
            );
        }
        if (role !== "admin" && requestedPage.author !== username) {
            return (
                <ErrorHandling.UnauthorizedDisclaimer
                    message={"Non hai i permessi per modificare questa pagina, non sei l'autore o un amministratore."}
                    noLogin
                    showBackOffice
                />
            );
        }
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

                <Main
                    page={requestedPage}
                />

                <Footer/>

                <ErrorHandling.ErrorModal />
            </>
        );
    }
}

export default EditPage;