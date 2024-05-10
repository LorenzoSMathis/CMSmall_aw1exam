/* eslint-disable react/prop-types */
import {useContext} from "react";
import {Image, Spinner} from "react-bootstrap";

import {StaticContentContext} from "../context/Contexts.jsx";

/**
 * @description PageHeader component: titolo di una pagina
 * @param props.value {String}: valore del titolo
 * @return {JSX.Element}
 * @name PageHeader
 * @private
 */
function PageHeader(props) {
    const {value} = props;
    return (
        <h1 className="cms-h1">{value}</h1>
    )
}

/**
 * @description PageParagraph component: paragrafo di una pagina
 * @param props.value {String}: valore del paragrafo
 * @return {JSX.Element}
 * @name PageParagraph
 * @private
 */
function PageParagraph(props) {
    const {value} = props;
    return (
        <p className="cms-p">{value}</p>
    )
}

/**
 * PageImage component: immagine di una pagina
 * @param props.value {String}: nome dell'immagine
 * @return {JSX.Element}
 * @name PageImage
 * @private
 */
function PageImage(props) {
    const {value} = props;
    const {imagesInfo} = useContext(StaticContentContext);
    return (
        <div className="cms-image d-flex align-items-center justify-content-center">
            { imagesInfo.path ? <Image src={imagesInfo.path + value} fluid/> : <Spinner /> }
        </div>
    )
}

/**
 * @description PageSection component: sezione di una pagina (interfaccia ai componenti privati)
 * @param props.type {String}: tipo di sezione
 * @param props.value {String}: valore della sezione
 * @return {JSX.Element|null}
 * @name PageSection
 * @public
 */
function PageSection(props) {
    const {type, value} = props;
    switch (type) {
        case "header":
            return <PageHeader value={value}/>;
        case "paragraph":
            return <PageParagraph value={value}/>;
        case "image":
            return <PageImage value={value}/>;
        default:
            return null;
    }
}

export {PageSection};