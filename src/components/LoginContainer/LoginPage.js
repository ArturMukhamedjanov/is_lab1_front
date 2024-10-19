// LoginPage.js
import React from 'react';
import LoginContainer from './LoginContainer';

const LoginPage = ({ serverPort, redirectToRegister, redirectToMain}) => {
    return (
        <>
            <LoginContainer serverPort={serverPort} redirectToRegister={redirectToRegister} redirectToMain={redirectToMain} />
        </>
    );
};

export default LoginPage;