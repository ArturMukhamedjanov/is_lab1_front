import React from 'react';
import RegistrationContainer from './RegistrationContainer';

const RegistrationPage = ({serverPort,redirectToLogin,redirectToMain}) => {
    return <>
        <RegistrationContainer serverPort={serverPort} redirectToLogin = {redirectToLogin} redirectToMain={redirectToMain}/>

    </>;
};

export default RegistrationPage;