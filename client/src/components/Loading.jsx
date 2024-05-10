/* eslint-disable react/prop-types */
import {Col, Container, Row, Spinner} from "react-bootstrap";

/**
 * @description Loading component
 * @return {JSX.Element}
 * @name Loading
 * @public
 */
function Loading() {
    return (
        <Container fluid className="data-loading-container">
            <Row>
                <Col>
                    <h2>Loading data</h2>
                </Col>
                <Col className="col-2">
                    <Spinner />
                </Col>
            </Row>
        </Container>
    );
}

export default Loading;