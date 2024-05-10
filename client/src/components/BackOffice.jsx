/* eslint-disable react/prop-types */
import {useContext, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {
    Button,
    ButtonGroup,
    Col,
    Container,
    Form,
    ListGroup,
    Modal,
    Row,
} from "react-bootstrap";
import {BoxArrowUpRight, CheckLg, PencilSquare, Trash3Fill, XLg} from "react-bootstrap-icons";

import dayjs from "dayjs";

import {PagesContext, StaticContentContext, UserContext} from "../context/Contexts.jsx";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import {PageSection} from "./PageSections.jsx";
import ErrorHandling from "./ErrorHandling.jsx";

/**
 * @description Calcola lo status della pagina in base alla data di pubblicazione
 * @param publicationDate {Object<dayjs>}: data di pubblicazione
 * @return {string}
 * @name calculateStatus
 * @private
 */
const calculateStatus = (publicationDate) => {
    let status = "draft";
    if (publicationDate) {
        if (!publicationDate.isBefore(new dayjs())) {
            status = "scheduled";
        } else {
            status = "published";
        }
    }

    return status;
}


/**
 * @description Bottone per modificare la pagina -> redirect alla pagina di modifica (/back-office/pages/:id/edit)
 * @param props.active booleano che indica se l'azione è attiva
 * @param props.pageId id della pagina
 * @return {JSX.Element}
 * @name ModifyPageButton
 * @private
 */
const ModifyPageButton = (props) => {
    const {active, pageId} = props;
    const navigate = useNavigate();

    return (
        <Button
            variant={active ? "warning" : "secondary"}
            disabled={!active}
            className={!active ? "button-disabled-cursor" : ""}
            onClick={() => navigate(`/pages/${pageId}/edit`)}
        >
            <PencilSquare size={"1.2rem"} color={"white"}/>
        </Button>
    );
}

/**
 * @description Bottone per cancellare la pagina -> chiamata della handleDelete passata come props
 * @param props.active {Button}: booleano che indica se l'azione è attiva
 * @param props.setActive {Function}: funzione per settare l'azione attiva o meno
 * @param props.deleteConfirm {Boolean}: booleano che indica se è stato confermato il delete
 * @param props.setDeleteConfirm {Function}: funzione per settare il delete confirm
 * @param props.pageId {int}: id della pagina da cancellare
 * @return {JSX.Element}
 * @name DeletePageButton
 * @private
 */
const DeletePageButton = (props) => {
    const {deletePage} = useContext(PagesContext);
    const {active, setActive, deleteConfirm, setDeleteConfirm, pageId} = props;

    if (deleteConfirm) {
        return (
            <ButtonGroup>
                <Button
                    variant={active ? "danger" : "secondary"}
                    disabled={!active}
                    className={!active ? "button-disabled-cursor" : ""}
                    onClick={() => {
                        setDeleteConfirm(false);
                        setActive(false);
                        deletePage(pageId);
                    }}
                >
                    <p>Conferma</p>
                </Button>
                <Button
                    variant={active ? "danger" : "secondary"}
                    disabled={!active}
                    className={!active ? "button-disabled-cursor" : ""}
                    onClick={() => {
                        setDeleteConfirm(false);
                    }}
                >
                    <XLg size={"1.2rem"} color={"white"}/>
                </Button>
            </ButtonGroup>

        )
    } else {
        return (
            <Button
                variant={active ? "danger" : "secondary"}
                disabled={!active}
                className={!active ? "button-disabled-cursor" : ""}
                onClick={() => {
                    setDeleteConfirm(true);
                }}
            >
                <Trash3Fill size={"1.2rem"} color={"white"}/>
            </Button>
        );
    }


}

/**
 * @description Bottone per aprire la pagina -> apre il modal con la preview della pagina
 * @param props.pageId {int}: id della pagina da aprire
 * @param props.openPagePreview {Function}: funzione per aprire il modal
 * @param props.pageReadable {Boolean}: booleano che indica se la pagina può essere aperta in anteprima
 * @return {JSX.Element}
 * @name OpenPageButton
 * @private
 */
const OpenPageButton = (props) => {
    const {pageId, openPagePreview, pageReadable} = props;
    return (
        <Button
            variant={pageReadable ? "success" : "secondary"}
            disabled={!pageReadable}
            onClick={() => {
                openPagePreview(pageId)
            }}
        >
            <BoxArrowUpRight size={"1.1rem"} color={"white"}/>
        </Button>
    );
}


/**
 * @description PageList component: renderizza la lista delle pagine
 * @param props.pages {Array<Object>>}: array di pagine da renderizzare
 * @param props.openPagePreview {Function}: funzione per aprire la preview di una pagina
 * @return {JSX.Element}
 * @name PageRecord
 * @private
 */
function PageRecord(props) {
    const {page, openPagePreview} = props;

    const {userList} = useContext(StaticContentContext);
    const {username, role} = useContext(UserContext);
    const {updatePage} = useContext(PagesContext);
    const {handleError} = useContext(ErrorHandling.ErrorContext);

    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [active, setActive] = useState(role === "admin" || username === page.author);
    const [editAuthor, setEditAuthor] = useState(false);
    const [newAuthor, setNewAuthor] = useState(null);

    const status = calculateStatus(page.publicationDate);

    const pageReadable = role === "admin" || username === page.author || status === "published";

    return (
        <Row id={"page" + page.id}>
            <Col className="d-flex align-items-center">
                <p>{page.title}</p>
            </Col>
            <Col className="col-3 d-flex align-items-center">
                {
                    editAuthor
                        ?
                        <>
                            <Form.Select
                                value={newAuthor}
                                onChange={(e) => setNewAuthor(e.target.value)}
                            >
                                {
                                    userList
                                        ?
                                        userList.map((user) => {
                                            return (
                                                <option
                                                    key={user}
                                                    value={user}
                                                >
                                                    {user}
                                                </option>
                                            )
                                        })
                                        :
                                        null
                                }
                            </Form.Select>
                            <Button variant={"success"} onClick={() => {
                                updatePage({...page, author: newAuthor})
                                    .catch((error) => {
                                        handleError(error);
                                    });
                                setEditAuthor(false);
                            }}>
                                <CheckLg size={"1.2rem"} color={"white"}/>
                            </Button>
                            <Button
                                variant={"danger"}
                                onClick={() => {
                                    setEditAuthor(false);
                                }}
                            >
                                <XLg size={"1.2rem"} color={"white"}/>
                            </Button>
                        </>
                        :
                        <>
                            <Form.Control
                                type="text"
                                defaultValue={page.author}
                                readOnly
                            />
                            {
                                role === "admin"
                                    ?
                                    <Button variant="secondary" onClick={() => {
                                        setNewAuthor(page.author);
                                        setEditAuthor(true);
                                    }}>
                                        <PencilSquare size={"1rem"} color={"white"}/>
                                    </Button>
                                    :
                                    null
                            }
                        </>
                }
            </Col>

            <Col className="col-1 d-flex align-items-center">
                <p>{page.creationDate.format("DD/MM/YYYY")}</p>
            </Col>
            <Col className="col-2 d-flex align-items-center">
                {
                    status === "draft"
                        ?
                        <p>Bozza</p>
                        :
                    status === "published"
                        ?
                        <p>Pubblicata il {page.publicationDate.format("DD/MM/YYYY")}</p>
                        :
                        <p>Programmata per il {page.publicationDate.format("DD/MM/YYYY")}</p>
                }
            </Col>
            <Col className="col-2 d-flex align-items-center justify-content-end">
                <ButtonGroup>
                    <ModifyPageButton
                        pageId={page.id}
                        active={active}
                    />
                    <DeletePageButton
                        pageId={page.id}
                        deleteConfirm={deleteConfirm}
                        setDeleteConfirm={setDeleteConfirm}
                        active={active}
                        setActive={setActive}
                    />
                    <OpenPageButton
                        pageId={page.id}
                        openPagePreview={openPagePreview}
                        pageReadable={pageReadable}
                    />
                </ButtonGroup>
            </Col>
        </Row>
    )
}

/**
 * @description PageList component: renderizza la lista delle pagine
 * @param props.openPagePreview {Function}: funzione per aprire la preview di una pagina
 * @return {JSX.Element}
 * @name PageList
 * @private
 */
function PageList(props) {
    const {openPagePreview} = props;
    const {pages} = useContext(PagesContext);


    return (
        <ListGroup className="backoffice-main-list">
            <ListGroup.Item key={"header_entry"} className="backoffice-mail-list-header">
                <Row>
                    <Col className="d-flex align-items-baseline justify-content-center">
                        <p>Titolo</p>
                    </Col>
                    <Col className="col-3 d-flex align-items-baseline justify-content-center">
                        <p>Autore</p>
                    </Col>
                    <Col className="col-1 d-flex align-items-baseline justify-content-center">
                        <p>Data creazione</p>
                    </Col>
                    <Col className="col-2 d-flex align-items-baseline justify-content-center">
                        <p>Stato</p>
                    </Col>
                    <Col className="col-2"></Col>
                </Row>
            </ListGroup.Item>
            {
                pages.map((page) => {
                    let record_style = "";
                    if (page.deleted) {
                        record_style = " record-deleted";
                    } else if (page.updated) {
                        record_style = " record-updated";
                    }

                    return (
                        <ListGroup.Item key={"pg" + page.id} className={"backoffice-mail-list-item" + record_style}>
                            <PageRecord
                                page={page}
                                openPagePreview={openPagePreview}
                            />
                        </ListGroup.Item>)
                })
            }
        </ListGroup>
    );
}

/**
 * @description PagePreviewModal component: modal per la preview di una pagina
 * @param props.show {Boolean}: booleano che indica se il modal è aperto
 * @param props.handleClose {Function}: funzione per chiudere il modal
 * @param props.pageId {int}: id della pagina da visualizzare
 * @return {JSX.Element}
 * @name PagePreviewModal
 * @private
 */
function PagePreviewModal(props) {
    const {show, handleClose, pageId} = props;
    const {pages} = useContext(PagesContext);
    const page = pages.find((page) => page.id === pageId);
    const navigate = useNavigate();

    const status = calculateStatus(page.publicationDate);

    return (
        <Modal
            show={show}
            onHide={handleClose}
            className="modal-xl"
        >
            <Modal.Header closeButton>
                <Modal.Title>Anteprima {page.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container fluid>
                    <Row>
                        <Col>
                            <p>Autore: <span className="bold">{page.author}</span></p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Pagina creata il <span className="bold">{page.creationDate.format("DD-MM-YYYY")}</span>
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Pagina in stato <span className="bold">{status}</span>
                                {
                                    status === "scheduled"
                                        ?
                                        ` - [Pubblicazione programmata per il ${page.publicationDate.format("DD/MM/YYYY")}]`
                                        :
                                    status === "published"
                                        ?
                                        ` - [Pubblicata il ${page.publicationDate.format("DD/MM/YYYY")}]`
                                        :
                                        null
                                }
                            </p>

                        </Col>
                    </Row>

                </Container>
                <hr/>
                <Container fluid>
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
                            );
                        })
                    }
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Chiudi
                </Button>
                <Button variant="success" onClick={() => navigate(`/pages/${pageId}?from=bo`)}>
                    Visualizzazione completa
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

/**
 * @description Main component: componente principale del back office
 * @return {JSX.Element}
 * @name Main
 * @private
 */
function Main() {
    const navigate = useNavigate();
    const [previewPageId, setPreviewPageId] = useState(null);
    const [previewModalShow, setPreviewModalShow] = useState(false);

    const showPreviewModal = (pageId) => {
        setPreviewPageId(pageId);
        setPreviewModalShow(true);
    }

    const hidePreviewModal = () => {
        setPreviewPageId(null);
        setPreviewModalShow(false);
    }

    return (
        <>
            <Container fluid className="backoffice-main">
                <Row>
                    <Col className="backoffice-main-title ">
                        <h2>BACK OFFICE</h2>
                    </Col>
                    <Col className="col-3 create-page-main-go-back d-flex align-items-center">
                        <Button
                            variant="success"
                            onClick={() => navigate("/pages/new")}
                        >
                            Crea una nuova pagina
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col className="">
                        <h3 className="backoffice-main-subtitle">Pages</h3>
                    </Col>

                </Row>
                <Row>
                    <Col>
                        <PageList openPagePreview={showPreviewModal}/>
                    </Col>
                </Row>
            </Container>
            {
                previewPageId !== null
                    ?
                    <PagePreviewModal
                        show={previewModalShow}
                        handleClose={hidePreviewModal}
                        pageId={previewPageId}
                    />
                    :
                    null
            }
        </>
    )

}

/**
 * @description BackOffice component: pagina back office
 * @return {JSX.Element}
 * @name BackOffice
 * @public
 */
function BackOffice() {
    const {logged} = useContext(UserContext)

    if (!logged) {
        return (
            <ErrorHandling.UnauthorizedDisclaimer
                message="Autenticazione necessaria per accedere al back office."
            />
        )
    } else {
        return (
            <>
                <Header
                    showUserSection
                    officeInfo={{
                        route: "/",
                        title: "Front Office"
                    }}
                    className="fixed-header"
                    modifyEnabled
                />

                <Main/>

                <Footer/>

                <ErrorHandling.ErrorModal/>
            </>
        );
    }
}

export default BackOffice;