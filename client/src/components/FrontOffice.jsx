/* eslint-disable react/prop-types */
import {useContext, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, ButtonGroup, Col, Container, ListGroup, Row} from "react-bootstrap";
import {BoxArrowUpRight, SortDown, SortUp} from "react-bootstrap-icons";

import dayjs from "dayjs";

import {PagesContext} from "../context/Contexts.jsx";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ErrorHandling from "./ErrorHandling.jsx";


/**
 * @description PageRecord component: renderizza il record della singola pagina
 * @param props.page {Object}: oggetto della pagina da renderizzare
 * @return {JSX.Element}
 * @name PageRecord
 * @private
 */
function PageRecord(props) {
    const {page} = props;

    const navigate = useNavigate();

    return (
        <Row id={"page" + page.id}>
            <Col className="d-flex align-items-center">
                <p>{page.title}</p>
            </Col>
            <Col className="col-2 d-flex align-items-center">
                <p>{page.author}</p>
            </Col>
            <Col className="col-2 d-flex align-items-center">
                <p>{page.creationDate.format("DD/MM/YYYY")}</p>
            </Col>
            <Col className="col-2 d-flex align-items-center">
                <p>{page.publicationDate.format("DD/MM/YYYY")}</p>
            </Col>
            <Col className="col-1 d-flex align-items-center justify-content-end">
                <ButtonGroup>
                    <Button
                        variant="primary"
                        onClick={() => {
                            navigate("pages/" + page.id);
                        }}
                    >
                        <BoxArrowUpRight size={"1.1rem"} color={"white"}/>
                    </Button>
                </ButtonGroup>
            </Col>
        </Row>
    )
}

/**
 * @description PageList component: renderizza la lista delle pagine
 * @return {JSX.Element}
 * @name PageList
 * @private
 */
function PageList() {
    const {pages} = useContext(PagesContext);

    const [asc, setAsc] = useState(true);

    return (
        <ListGroup className="frontoffice-main-list">
            <ListGroup.Item key={-1} className="frontoffice-mail-list-header">
                <Row>
                    <Col className="d-flex align-items-baseline justify-content-center">
                        <p>Titolo</p>
                    </Col>
                    <Col className="col-2 d-flex align-items-baseline justify-content-center">
                        <p>Autore</p>
                    </Col>
                    <Col className="col-2 d-flex align-items-baseline justify-content-center">
                        <p>Data Creazione</p>
                    </Col>
                    <Col className="col-2">
                        <Container fluid>
                            <Row>
                                <Col className="d-flex align-items-baseline justify-content-center">
                                    <p>Data Pubblicazione</p>
                                </Col>
                                <Col className="col-2 frontoffice-main-list-sort">
                                    <Button
                                        variant="outline-light"
                                        onClick={() => setAsc((old) => !old)}
                                    >
                                        {
                                            asc
                                                ?
                                                <SortUp size={"1.2rem"} color={"dark"}/>
                                                :
                                                <SortDown size={"1.2rem"} color={"dark"}/>
                                        }
                                    </Button>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col className="col-1"></Col>
                </Row>
            </ListGroup.Item>
            {
                pages
                    .filter((page) =>{          // escludo le pagine in stato scheduled o draft
                        return page.publicationDate && dayjs(page.publicationDate).isBefore(dayjs());
                    })
                    .sort((a, b) => {           // ordino le pagine per data di pubblicazione (asc o desc a seconda dello stato)
                        return dayjs(b.publicationDate).diff(dayjs(a.publicationDate)) * (asc ? -1 : 1)
                    })
                    .map((page) => {            // renderizzo le pagine
                        return (
                            <ListGroup.Item key={page.id} className={"frontoffice-mail-list-item"}>
                                <PageRecord
                                    page={page}
                                />
                            </ListGroup.Item>)
                    })
            }
        </ListGroup>
    );
}

/**
 * @description Main component: componente che renderizza il main della pagina
 * @return {JSX.Element}
 * @name Main
 * @private
 */
function Main() {

    return (
        <Container fluid className="frontoffice-main">
            <Row>
                <Col className="frontoffice-main-title ">
                    <h2>FRONT OFFICE</h2>
                </Col>
            </Row>
            <Row>
                <Col className="">
                    <h3 className="frontoffice-main-subtitle">Pages</h3>
                </Col>
                <Row>
                    <Col>
                        <PageList />
                    </Col>
                </Row>
            </Row>
        </Container>
    );
}

/**
 * @description FrontOffice component: componente che renderizza la pagina del front office
 * @return {JSX.Element}
 * @name FrontOffice
 * @public
 */
function FrontOffice() {

    return (
        <>
            <Header
                showUserSection
                officeInfo={{
                    route: "/back-office",
                    title: "Back Office"
                }}
            />

            <Main />

            <Footer/>

            <ErrorHandling.ErrorModal />
        </>
    );
}

export default FrontOffice;