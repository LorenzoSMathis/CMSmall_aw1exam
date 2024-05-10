/* eslint-disable react/prop-types */
import {useContext, useState} from "react";
import {
    Button,
    Card,
    Col,
    Container,
    FloatingLabel,
    FormControl,
    ListGroup,
    Modal,
    OverlayTrigger,
    Row,
    Spinner,
    Tab,
    Tabs,
    Tooltip
} from "react-bootstrap";
import {
    Check2Circle,
    CheckSquareFill,
    ChevronDown,
    ChevronUp,
    ExclamationSquareFill,
    PencilSquare,
    Trash3Fill
} from "react-bootstrap-icons";

import Masonry from "react-responsive-masonry";

import dayjs from "dayjs";
import * as Yup from "yup";

import {StaticContentContext, UserContext} from "../context/Contexts.jsx";

import {PageSection} from "./PageSections.jsx";


/**
 * @description Componente per visualizzare un tooltip con un messaggio di errore
 * @param message {String}: messaggio di errore
 * @return {JSX.Element}
 * @name errorMessageTooltip
 * @private
 */
const errorMessageTooltip = (message) => {
    return message ? (
        <Tooltip>
            {message}
        </Tooltip>
    ) : <></>;
}

/**
 * @description Image card component: card per le immagini
 * @param props.image {String}: path dell'immagine
 * @param props.onClick {Function}: funzione da eseguire al click
 * @param props.selected {Boolean}: booleano che indica se l'immagine è selezionata
 * @return {JSX.Element}
 * @name ImageCard
 * @private
 */
function ImageCard(props) {
    const {image, onClick, selected} = props;

    return (
        <Card
            className={selected ? "card-checked my-card" : "my-card"}
            onClick={onClick}
        >
            <Card.Img variant="top" src={image}/>
            <Card.ImgOverlay className="d-flex justify-content-end">
                <Check2Circle size={"2rem"} className={selected ? "card-checked-icon" : "d-none"}/>
            </Card.ImgOverlay>
        </Card>
    )
}

/**
 * @description Image cards component: griglia di card per le immagini
 * @param props.onClick {Function}: funzione da eseguire al click
 * @param props.current {String}: immagine selezionata
 * @return {JSX.Element}
 * @name ImageCards
 * @private
 */
function ImageCards(props) {
    const {onClick, current} = props;

    const {imagesInfo} = useContext(StaticContentContext);

    return (
        <Masonry
            columnsCount={2}
            gutter={".3rem"}
        >
            {imagesInfo.images.map((name, index) => (
                <ImageCard
                    key={index}
                    image={imagesInfo.path + name}
                    onClick={() => onClick(name)}
                    selected={current === name}
                />
            ))}
        </Masonry>
    )
}

/**
 * @description General infos component: sezione per le informazioni generali
 * @param props.author {String}: autore della pagina (facoltativo: in assenza viene preso l'username dell'utente)
 * @param props.formik {Object}: formik object
 * @name GeneralInfos
 * @private
 */
function GeneralInfos(props) {
    const {formik, author} = props;
    const {touched, errors, values, handleChange, handleBlur} = formik;

    const {username} = useContext(UserContext);

    return (
        <>
            <Row>
                <Col className="create-page-edit-section-title">
                    <h3>Informazioni generali</h3>
                </Col>
            </Row>
            <Row className="create-page-edit-section-content">
                <Col className="col-5">
                    <p>Autore</p>
                </Col>
                <Col>
                    <p>{author ? author : username}</p>
                </Col>
            </Row>
            <Row className="create-page-edit-section-content">
                <Col className="col-5">
                    <p>Data creazione</p>
                </Col>
                <Col>
                    {values.creation_date}
                </Col>
            </Row>
            <Row className="create-page-edit-section-content">
                <Col className="col-5 d-flex align-items-center">
                    <p>Titolo</p>
                </Col>
                <Col>
                    <OverlayTrigger
                        placement={"right"}
                        delay={{show: 250, hide: 400}}
                        overlay={errorMessageTooltip(errors.title)}
                        show={touched.title && errors.title}
                    >
                        <FormControl
                            type={"text"}
                            name={"title"}
                            id={"title"}
                            placeholder={"Titolo"}
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isValid={touched.title && !errors.title}
                            isInvalid={touched.title && errors.title}
                        />
                    </OverlayTrigger>
                </Col>
            </Row>
            <Row className="create-page-edit-section-content">
                <Col className="col-5 d-flex align-items-center">
                    <p>Data di pubblicazione</p>
                </Col>
                <Col>
                    <OverlayTrigger
                        placement={"right"}
                        delay={{show: 250, hide: 400}}
                        overlay={errorMessageTooltip(errors.publication_date)}
                        show={touched.publication_date && errors.publication_date}
                    >
                        <FormControl
                            type={"date"}
                            name={"publication_date"}
                            id={"publication_date"}
                            placeholder={"Data di pubblicazione"}
                            value={values.publication_date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isValid={touched.publication_date && !errors.publication_date}
                            isInvalid={touched.publication_date && errors.publication_date}
                        />
                    </OverlayTrigger>
                </Col>
            </Row>
        </>
    )
}

/**
 * @description AddNewSection component: sezione per l'aggiunta di una nuova sezione
 * @param props.formik {Object}: formik object
 * @return {JSX.Element}
 * @name AddNewSection
 * @private
 */
function AddNewSection(props) {
    const [newSection, setNewSection] = useState("header");
    const [newSectionValue, setNewSectionValue] = useState("");
    const [newSectionError, setNewSectionError] = useState(null);
    const [added, setAdded] = useState(false);

    const {formik} = props;
    const {values, setFieldValue} = formik;

    /**
     * @description Funzione per la gestione del submit della nuova sezione
     * @return {JSX.Element}
     */
    const SubmitButton = () => {
        return (
            <Container fluid className="create-page-edit-section-tabs-submit">
                <Row>
                    <Col className="col-8 d-flex align-items-center justify-content-end">
                        {
                            newSectionError
                                ?
                                <p className="error">{newSectionError}</p>
                                :
                                null
                        }
                        {
                            added
                                ?
                                <p className="success">Aggiunta</p>
                                :
                                null
                        }
                    </Col>
                    <Col className="col-4 d-flex justify-content-end submitbutton-for-addsection">
                        <Button
                            onClick={handleSectionSubmit}
                            variant={newSectionError ? "danger" : "primary"}
                            disabled={newSectionError}
                        >
                            Aggiungi
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * @description Funzione per l'aggiunta di una nuova sezione
     * @warning IMPORTANTE: per ogni sezione viene generato un id univoco, in questo caso la data di creazione. NON È UN ID PERMANENTE E RIMANE SOLO LATO CLIENT. È solo per poter accedere alla sezione in fase di modifica dato che l'indice nel vettore può cambiare a causa del riordino.
     */
    const handleSectionSubmit = () => {
        if (newSectionValue === "") {
            setNewSectionError("Required");
            setAdded(false);
        } else {
            setNewSectionError(null);
            setFieldValue("content", [...(values.content), {
                type: newSection,
                value: newSectionValue,
                id: dayjs().unix()
            }]);
            setNewSectionValue("");
            setAdded(true);
        }
    }

    return (
        <>
            <Row>
                <Col className="create-page-edit-section-title">
                    <h3>Aggiungi una sezione</h3>
                </Col>
            </Row>
            <Row>
                <Tabs
                    id="create-page-edit-section-tabs"
                    activeKey={newSection}
                    onSelect={(k) => {
                        setNewSection(k);
                        setNewSectionValue("");
                        setNewSectionError(null);
                        setAdded(false);
                    }}
                >
                    <Tab title={"Header"} eventKey={"header"}>
                        <FormControl
                            className="create-page-edit-section-tabs-header"
                            type={"text"}
                            name={"newsection-header"}
                            id={"newsection-header"}
                            placeholder={"Header"}
                            value={newSectionValue}
                            onChange={(e) => {
                                setNewSectionValue(e.target.value);
                                setAdded(false);
                                if (e.target.value.length > 0) {
                                    setNewSectionError(null);
                                } else {
                                    setNewSectionError("Required");
                                }
                            }}
                            onBlur={() => {
                                setAdded(false);
                                if (newSectionValue.length > 0) {
                                    setNewSectionError(null);
                                } else {
                                    setNewSectionError("Required");
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSectionSubmit();
                                }
                            }}
                        />
                        <SubmitButton forTab="header"/>
                    </Tab>
                    <Tab title={"Paragrafo"} eventKey={"paragraph"}>
                        <FormControl
                            className="create-page-edit-section-tabs-paragraph"
                            as={"textarea"}
                            name={"newsection-header"}
                            id={"newsection-header"}
                            placeholder={"Paragrafo"}
                            value={newSectionValue}
                            onChange={(e) => {
                                setNewSectionValue(e.target.value);
                                setAdded(false);
                                if (e.target.value.length > 0) {
                                    setNewSectionError(null);
                                } else {
                                    setNewSectionError("Required");
                                }
                            }}
                            onBlur={() => {
                                setAdded(false);
                                if (newSectionValue.length > 0) {
                                    setNewSectionError(null);
                                } else {
                                    setNewSectionError("Required");
                                }
                            }}
                        />
                        <SubmitButton forTab="paragraph"/>
                    </Tab>
                    <Tab title={"Immagine"} eventKey={"image"}>
                        <Container fluid className="create-page-edit-section-tabs-images">
                            <ImageCards
                                onClick={(value) => {
                                    setNewSectionValue(value);
                                    setNewSectionError(null);
                                }}
                                current={newSectionValue}
                            />
                        </Container>
                        <SubmitButton forTab="image"/>
                    </Tab>
                </Tabs>
            </Row>
        </>
    );
}

/**
 * @description Description component: preview della sezione
 * @param props.type {String}: tipo di sezione
 * @param props.value {String}: valore della sezione
 * @param props.sectionId {int}: id della sezione
 * @param props.handleDelete {Function}: funzione per la rimozione della sezione
 * @param props.handleUp {Function}: funzione per lo spostamento della sezione verso l'alto
 * @param props.handleDown {Function}: funzione per lo spostamento della sezione verso il basso
 * @param props.handleEdit {Function}: funzione per la modifica della sezione
 * @return {JSX.Element}
 * @name Section
 * @private
 */
function Section(props) {
    const {type, value, sectionId, handleDelete, handleUp, handleDown, handleEdit} = props;

    return (
        <>
            <Container fluid className="create-page-preview">
                <Row>
                    <Col className="col-9 create-page-preview-content">
                        <PageSection
                            type={type}
                            value={value}
                        />
                    </Col>
                    <Col className="col-2 offset-1 create-page-preview-control d-flex justify-content-end align-items-center p-0">
                        <Container fluid className="p-0">
                            <Row>
                                <Col className="d-flex justify-content-end p-0">
                                    {
                                        handleEdit
                                            ?
                                            <Button
                                                variant="warning"
                                                onClick={() => {
                                                    handleEdit(sectionId);
                                                }}
                                            >
                                                <PencilSquare size={"1rem"} color={"white"}/>
                                            </Button>
                                            :
                                            null
                                    }
                                </Col>
                                <Col>
                                    {
                                        handleUp
                                            ?
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    handleUp(sectionId);
                                                }}
                                            >
                                                <ChevronUp size={"1rem"} color={"white"}/>
                                            </Button>
                                            :
                                            null
                                    }
                                </Col>
                            </Row>
                            <Row>
                                <Col className="d-flex justify-content-end p-0">
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            handleDelete(sectionId);

                                        }}
                                    >
                                        <Trash3Fill size={"1rem"} color={"white"}/>
                                    </Button>
                                </Col>
                                <Col>
                                    {
                                        handleDown
                                            ?
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    handleDown(sectionId);
                                                }}
                                            >
                                                <ChevronDown size={"1rem"} color={"white"}/>
                                            </Button>
                                            :
                                            null
                                    }
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

/**
 * @description Lista delle sezioni della pagina, preview e controlli
 * @param props.formik {Object}: formik del form
 * @param props.handleEdit {Function}: funzione per la modifica della sezione
 * @return {JSX.Element}
 * @name SectionList
 * @private
 */
function SectionList(props) {
    const {formik, handleEdit} = props;
    const {values, setFieldValue} = formik;

    /**
     * @description Rimuove una sezione
     * @param id {int}: id della sezione da rimuovere
     */
    const handleDelete = (id) => {
        setFieldValue("content", values.content.filter((section) => section.id !== id));
    }

    /**
     * @description Sposta una sezione verso l'alto
     * @param id {int}: id della sezione da spostare
     */
    const handleUp = (id) => {
        const index = values.content.findIndex((section) => section.id === id);
        if (index > 0) {
            const newContent = [...values.content];
            const temp = newContent[index];
            newContent[index] = newContent[index - 1];
            newContent[index - 1] = temp;
            setFieldValue("content", newContent);
        }
    }

    /**
     * @description Sposta una sezione verso il basso
     * @param id {int}: id della sezione da spostare
     */
    const handleDown = (id) => {
        const index = values.content.findIndex((section) => section.id === id);
        if (index < values.content.length - 1) {
            const newContent = [...values.content];
            const temp = newContent[index];
            newContent[index] = newContent[index + 1];
            newContent[index + 1] = temp;
            setFieldValue("content", newContent);
        }
    }

    return (
        <>
            <ListGroup>
                {
                    values.content.map((section, index) => {
                        return (
                            <ListGroup.Item key={index}>
                                <Section
                                    type={section.type}
                                    value={section.value}
                                    sectionId={section.id}
                                    handleDelete={handleDelete}
                                    handleUp={index !== 0 ? handleUp : undefined}
                                    handleDown={index !== values.content.length - 1 ? handleDown : undefined}
                                    handleEdit={handleEdit}
                                />
                            </ListGroup.Item>
                        )
                    })
                }
            </ListGroup>
        </>
    )
}

/**
 * @description Footer della sezione di creazione della pagina
 * @param props.isValid {Boolean}: true se il formik è valido
 * @param props.values {Object}: valori del formik
 * @param props.handleSubmit {Function}: funzione di submit del formik
 * @param props.handleReset {Function}: funzione di reset del formik
 * @param props.isSubmitting {Boolean}: true se il formik è in fase di submit
 * @return {JSX.Element}
 * @name EditSectionFooter
 * @private
 */
function EditSectionFooter(props) {
    const {isValid, values, handleSubmit, handleReset, isSubmitting} = props;

    /**
     * @description Conteggi delle sezioni e validazione dei requisiti della pagina
     * @description headerCount > 0 && (paragraphCount + imageCount) > 0
     * @type {number}
     */
    let headerCount = 0;
    let paragraphCount = 0;
    let imageCount = 0;

    values.forEach((section) => {
        if (section.type === "header") {
            headerCount++;
        } else if (section.type === "paragraph") {
            paragraphCount++;
        } else if (section.type === "image") {
            imageCount++;
        }
    });

    /**
     * @description Renderizza il tooltip
     * @param props {Object}: props del tooltip
     * @param props.message {String}: messaggio del tooltip
     * @return {JSX.Element}
     */
    const renderTooltip = (props) => {
        const {message, ...others} = props;
        return (<Tooltip {...others}>{message}</Tooltip>);
    }

    return (
        <>
            <Col className="offset-1 col-8 d-flex align-items-center">
                <Container fluid>
                    <Row>
                        <Container fluid className="create-page-stats">
                            <Row>
                                <Col className="col-3 d-flex align-items-center">
                                    <p>Sezioni Header: {headerCount}</p>
                                    {
                                        headerCount > 0
                                            ?
                                            <CheckSquareFill size={"1rem"} color={"#198754FF"}/>
                                            :
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={(others) => renderTooltip({message: "Inserire almeno un header", ...others})}
                                            >
                                                <ExclamationSquareFill size={"1rem"} color={"#DC3545FF"}/>
                                            </OverlayTrigger>
                                    }
                                </Col>
                                <Col className="col-6 d-flex align-items-center">
                                    <p>Altre sezioni: {paragraphCount + imageCount} <span>[Paragrafo: {paragraphCount}, Immagine: {imageCount}]</span>
                                    </p>
                                    {
                                        paragraphCount + imageCount > 0
                                            ?
                                            <CheckSquareFill size={"1rem"} color={"#198754FF"}/>
                                            :
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={(others) => renderTooltip({message: "Inserire almeno una sezione di tipo paragrafo o immagine", ...others})}
                                            >
                                                <ExclamationSquareFill size={"1rem"} color={"#DC3545FF"}/>
                                            </OverlayTrigger>

                                    }
                                </Col>
                            </Row>
                        </Container>
                    </Row>
                </Container>
            </Col>
            <Col className="create-page-edit-submit d-flex justify-content-end">
                <Button
                    variant="danger"
                    onClick={handleReset}
                >
                    Reset
                </Button>
            </Col>
            <Col className="create-page-edit-submit d-flex justify-content-end">
                <Button
                    variant={isValid && !isSubmitting ? "primary" : "secondary"}
                    disabled={!(isValid && !isSubmitting)}
                    onClick={handleSubmit}
                >
                    {
                        isSubmitting
                            ?
                            <Spinner size="sm"/>
                            :
                            "Salva"
                    }
                </Button>
            </Col>
        </>
    );
}

/**
 * @description Form di creazione/modifica della pagina
 * @param props.formik {Object}: formik del form
 * @param props.isSubmitting {Boolean}: booleano che indica se il form è in fase di submit
 * @param props.page {Object}: pagina da modificare (facoltativo)
 * @return {JSX.Element}
 * @name PageForm
 * @public
 */
function PageForm(props) {
    const {formik, isSubmitting, page} = props;

    const [editSectionId, setEditSectionId] = useState(-1);
    const [submittedOnEnter, setSubmittedOnEnter] = useState(false);

    return (
        <>
            <Row className="create-page-edit">
                <Col className="col-4 create-page-edit-section">
                    <Container fluid>
                        <GeneralInfos
                            formik={formik}
                            author={page ? page.author : undefined}
                        />
                        <hr/>
                        <AddNewSection
                            formik={formik}
                        />
                    </Container>
                </Col>
                <Col className="col-8 create-page-edit-section">
                    <SectionList
                        formik={formik}
                        handleEdit={(sectionId) => {
                            if (!submittedOnEnter) setEditSectionId(sectionId)
                            else setSubmittedOnEnter(false);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <EditSectionFooter
                    values={formik.values.content}
                    handleSubmit={formik.handleSubmit}
                    handleReset={formik.resetForm}
                    isSubmitting={isSubmitting}
                    isValid={formik.isValid}
                />
            </Row>
            {
                editSectionId !== -1
                    ?
                    <EditSectionModal
                        show={editSectionId !== -1}
                        onHide={() => setEditSectionId(-1)}
                        setSubmittedOnEnter={setSubmittedOnEnter}
                        updateSection={(section) => {
                            formik.setFieldValue("content", formik.values.content.map((s) => {
                                if (s.id === section.id) {
                                    return section;
                                } else {
                                    return s;
                                }
                            }));
                        }}
                        section={formik.values.content.find((section) => section.id === editSectionId)}
                    />
                    :
                    null
            }
        </>
    )
}

/**
 * @description Modal per la modifica di una sezione
 * @param props.show {Boolean}: booleano che indica se il modal è visibile
 * @param props.onHide {Function}: funzione da eseguire quando il modal viene chiuso
 * @param props.updateSection {Function}: funzione per aggiornare la sezione
 * @param props.setSubmittedOnEnter {Boolean}: booleano che indica se il form è stato sottomesso con il tasto invio
 * @return {JSX.Element|null}
 * @name EditSectionModal
 * @public
 */
function EditSectionModal(props) {
    const {show, section, onHide, updateSection, setSubmittedOnEnter} = props;

    const [newValue, setNewValue] = useState(section.value);
    const [error, setError] = useState(null);

    const validator = Yup.object().shape({
        value: Yup.string().required("Inserire un valore non vuoto")
    });

    const handleSubmit = () => {
        validator.validate({value: newValue})
            .then(() => {
                setError(null)
                updateSection({...section, value: newValue});
                onHide();
            })
            .catch((err) => setError(err.errors[0]));
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header closeButton>
                <Modal.Title>Modifica sezione</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Container fluid>
                    <Row>
                        <Col>
                            <p>Tipo sezione: <span className="bold">{section.type}</span></p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {
                                section.type === "header"
                                    ?
                                    <FloatingLabel label="Header">
                                        <FormControl
                                            type="text"
                                            placeholder="h"
                                            value={newValue}
                                            onChange={(e) => {
                                                setNewValue(e.target.value);
                                                validator.validate({value: newValue})
                                                    .then(() => setError(null))
                                                    .catch((err) => setError(err.errors[0]));
                                            }}
                                            onBlur={() => {
                                                validator.validate({value: newValue})
                                                    .then(() => setError(null))
                                                    .catch((err) => setError(err.errors[0]));
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setSubmittedOnEnter(true);
                                                    handleSubmit();
                                                }
                                            }}
                                            isInvalid={error}
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {error}
                                        </FormControl.Feedback>
                                    </FloatingLabel>
                                    :
                                    section.type === "paragraph"
                                        ?
                                        <FloatingLabel label="Paragrafo">
                                            <FormControl
                                                as="textarea"
                                                placeholder="p"
                                                value={newValue}
                                                className="create-page-edit-section-textarea"
                                                onChange={(e) => {
                                                    setNewValue(e.target.value);
                                                    validator.validate({value: newValue})
                                                        .then(() => setError(null))
                                                        .catch((err) => setError(err.errors[0]));
                                                }}
                                                onBlur={() => {
                                                    validator.validate({value: newValue})
                                                        .then(() => setError(null))
                                                        .catch((err) => setError(err.errors[0]));
                                                }}
                                                isInvalid={error}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {error}
                                            </FormControl.Feedback>
                                        </FloatingLabel>
                                        :
                                        section.type === "image"
                                            ?
                                            <ImageCards
                                                onClick={(value) => {
                                                    setNewValue(value);
                                                }}
                                                current={newValue}
                                            />
                                            :
                                            null
                            }
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onHide}>
                    Annulla
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    Salva
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

export {PageForm};