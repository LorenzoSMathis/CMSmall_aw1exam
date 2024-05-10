/* eslint-disable react/prop-types */
import {useContext} from 'react';
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ErrorHandling from "./ErrorHandling.jsx";
import {useParams, useSearchParams} from "react-router-dom";
import {PagesContext, UserContext} from "../context/Contexts.jsx";
import {Col, Container, Row} from "react-bootstrap";
import dayjs from "dayjs";
import {PageSection} from "./PageSections.jsx";

/**
 * @description Calcola lo status della pagina in base alla data di pubblicazione
 * @param publicationDate {Object<dayjs>}: data di pubblicazione
 * @return {string}
 */
const calculateStatus = (publicationDate) => {
    let status = "draft";
    if (publicationDate) {
        if (publicationDate.isBefore(new dayjs())) {
            status = "published";
        }
        else {
            status = "scheduled";
        }
    }

    return status;
}

/**
 * @description Componente che mostra il contenuto della pagina
 * @param props.page {Object}: oggetto che rappresenta la pagina
 * @return {JSX.Element}
 * @name Main
 * @private
 */
function Main(props) {
    const {page} = props;
    const status = calculateStatus(page.publicationDate);

    return (
        <Container fluid className="page-view-main">
            <Row>
                <Col className="col-2">
                    <p>Autore: <span className="bold">{page.author}</span></p>
                </Col>
                <Col className="col-2">
                    <p>Stato <span className="bold">{status}</span></p>
                </Col>
                <Col className="col-7 d-flex justify-content-end">
                    {
                        status === "scheduled"
                            ? <p>{`Pubblicazione prevista il ${page.publicationDate.format("DD/MM/YYYY")}`}</p>
                            :
                        status === "published"
                            ? <p>{`Pubblicato il ${page.publicationDate.format("DD/MM/YYYY")}`}</p>
                            :
                            null
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2 className="page-view-page-title">{page.title}</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Container fluid className="page-view-content">
                        {
                            page.content.map((section) => {
                                return (
                                    <Row key={section.id}>
                                        <Col>
                                            <PageSection
                                                type={section.type}
                                                value={section.value}
                                            />
                                        </Col>
                                    </Row>
                                )
                            })
                        }
                    </Container>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-end">
                    <p>Pagina creata il il {page.creationDate.format("DD/MM/YYYY")}</p>
                </Col>
            </Row>
        </Container>
    )
}

/**
 * @description Componente che mostra la pagina richiesta, effettua i controlli di autorizzazione e di esistenza della pagina richiesta
 * @routeParam pageId {int}: id della pagina richiesta (passato come parametro della route)
 * @queryParam searchParams {Object<URLSearchParams>}: parametri della query string (?from=bo facoltativo per indicare che si arriva dal back office)
 * @return {JSX.Element}
 * @name PageView
 * @public
 */
function PageView() {
    const {pageId} = useParams();
    const [searchParams] = useSearchParams();

    const {pages} = useContext(PagesContext);
    const {logged, username, role} = useContext(UserContext);

    const requestedPage = pages.find((page) => page.id === Number(pageId));

    if (!requestedPage) {
        return (
            <ErrorHandling.NotFoundDisclaimer
                message={`La pagina con id ${pageId} non esiste`}
                redirect={"/back-office"}
                redirectTitle={"Torna al back office"}
            />
        );
    }

    // Utente non autenticato e pagina non pubblicata
    if (!logged) {
        if (calculateStatus(requestedPage.publicationDate) !== "published") {
            return (
                <ErrorHandling.UnauthorizedDisclaimer
                    message={"La pagina non è pubblica"}
                    noLogin
                />
            )
        }
    }

    // Pagina non pubblicata
    if (calculateStatus(requestedPage.publicationDate) !== "published") {
        // Utente autenticato ma non admin e pagina non sua
        if (logged && role !== "admin" && requestedPage.author !== username) {
            return (
                <ErrorHandling.UnauthorizedDisclaimer
                    message={"Non hai i permessi necessari per accedere a questa pagina"}
                    noLogin
                />
            )
        }
    }


    return (
        <>
            <Header
                className="fixed-header"
                showUserSection
                officeInfo={searchParams.get("from") === "bo" ?
                    {
                    title: "Back office",
                    route: "/back-office"
                    }
                    :
                    {
                        title: "Front office",
                        route: "/"
                    }
                }
            />

            <Main
                page={requestedPage}
            />

            <Footer />
        </>
    );
}

export default PageView;