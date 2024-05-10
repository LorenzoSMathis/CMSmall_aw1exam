/* eslint-disable react/prop-types */
import {useContext, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {Eye, EyeSlash} from "react-bootstrap-icons";

import {Formik} from "formik";
import * as Yup from "yup";

import {UserContext} from "../context/Contexts.jsx";

import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ErrorHandling from "./ErrorHandling.jsx";


/**
 * @description Login form component: form per il login (blocco centrale)
 * @return {JSX.Element}
 * @name LoginForm
 * @private
 */
function LoginForm() {
    const {logged, username, login, logout} = useContext(UserContext);
    const {handleError} = useContext(ErrorHandling.ErrorContext)
    const navigate = useNavigate();

    const [visible, setVisible] = useState(false);

    /**
     * @description Valori iniziali del form
     * @type {{password: string, username: string}}
     */
    const initialValues = {
        username: "user1",
        password: "user1"
    };

    /**
     * @description Funzione di submit del form
     * @param values {Object<{username: String, password: String}>}
     */
    const onSubmit = (values) => {
        login(values.username, values.password)
            .then(() => {
                navigate("/");
            })
            .catch((err) => {
                handleError(err);
            });
    };

    /**
     * @description Schema di validazione del form
     */
    const validationSchema = Yup.object({
        username: Yup.string().required("Required"),
        password: Yup.string().required("Required")
    });


    return (
        <Container fluid className="login-form">
            <Row>
                <Col className="login-form-title">
                    <h2>Login</h2>
                </Col>
            </Row>
            <Row className="login-form-form">
                <Col>
                    {
                        logged
                            ?
                            <Container fluid>
                                <Row>
                                    <Col>
                                        <h5>Sei già autenticato come &quot;{username}&quot;</h5>
                                        <p>Se vuoi cambiare utente, clicca su Logout</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button variant="primary" onClick={logout}>Logout</Button>
                                    </Col>
                                </Row>
                            </Container>
                            :
                            <Formik
                                initialValues={initialValues}
                                onSubmit={onSubmit}
                                validationSchema={validationSchema}
                            >
                                {
                                    (formik) => {
                                        const {
                                            handleSubmit,
                                            handleChange,
                                            handleBlur,
                                            values,
                                            touched,
                                            errors
                                        } = formik;

                                        return (
                                            <Form onSubmit={handleSubmit} noValidate>
                                                <Form.Group controlId="username" className="login-form-input">
                                                    <Form.FloatingLabel label={"Username"}>
                                                        <Form.Control
                                                            type={"text"}
                                                            name={"username"}
                                                            id={"username"}
                                                            placeholder={"Username"}
                                                            value={values.username}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            isValid={touched.username && !errors.username}
                                                            isInvalid={touched.username && errors.username}
                                                        />
                                                        <Form.Control.Feedback type={"invalid"}>
                                                            {errors.username}
                                                        </Form.Control.Feedback>
                                                    </Form.FloatingLabel>
                                                </Form.Group>
                                                <Form.Group controlId="password" className="login-form-input">
                                                    <InputGroup>
                                                        <Form.FloatingLabel label={"Password"}>
                                                            <Form.Control
                                                                type={visible ? "text" : "password"}
                                                                name={"password"}
                                                                id={"password"}
                                                                placeholder={"Password"}
                                                                value={values.password}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                isValid={touched.password && !errors.password}
                                                                isInvalid={touched.password && errors.password}
                                                            />
                                                            <Form.Control.Feedback type={"invalid"}>
                                                                {errors.password}
                                                            </Form.Control.Feedback>
                                                        </Form.FloatingLabel>
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => {setVisible((prev) => !prev)}}
                                                        >
                                                            {
                                                                visible
                                                                    ?
                                                                    <EyeSlash size={"1.5rem"} />
                                                                    :
                                                                    <Eye size={"1.5rem"} />
                                                            }
                                                        </Button>
                                                    </InputGroup>
                                                </Form.Group>
                                                <Button type={"submit"} className="login-form-submit">Login</Button>
                                            </Form>
                                        );
                                    }
                                }
                            </Formik>
                    }
                </Col>
            </Row>
        </Container>
    );
}

/**
 * @description Login component: pagina di login
 * @return {JSX.Element}
 * @name Login
 * @public
 */
function Login() {
    return (
        <>
            <Header
                className="fixed-header"
                officeInfo={{
                    title: "Front Office",
                    route: "/"
                }}
            />

            <Container fluid className="login-container d-flex align-items-center">
                <LoginForm />
            </Container>

            <Footer className="fixed-footer"/>

            <ErrorHandling.ErrorModal />
        </>
    );
}

export default Login;