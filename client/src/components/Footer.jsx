/* eslint-disable react/prop-types */
import {Col, Container, Row} from "react-bootstrap";

/**
 * @description Footer component: footer
 * @param props.className {String}: classi aggiuntive per il componente
 * @return {JSX.Element}
 * @name Footer
 * @public
 */
function Footer(props) {
    const {className} = props;

    return (
        <Container fluid className={(className ? className : "") + " footer"}>
            <Row>
                <Col>
                    <p>CMSmall</p>
                </Col>
                <Col className="d-flex justify-content-center">
                    <p>Applicazioni Web I - 2022/2023</p>
                </Col>
                <Col className="d-flex justify-content-end">
                    <p>Esame #1 - Lorenzo Sebastiano Mathis</p>
                </Col>
            </Row>
        </Container>
    );
}

export default Footer;