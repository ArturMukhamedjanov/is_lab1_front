// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginContainer/LoginPage';
import RegistrationPage from './components/RegisterContainer/RegistrationPage';
import Header from './Header';
import MainPage from './components/MainPageContainer/MainPage';



const App = () => {

    const [redirectToMain, setRedirectToMain] = useState(false);
    const [redirectToRegister, setRedirectToRegister] = useState(false);
    const [redirectToLogin, setRedirectToLogin] = useState(true);

    const handleRedirectToRegister = () => {
        setRedirectToRegister(true);
        setRedirectToLogin(false);
        setRedirectToMain(false);
    };

    const handleRedirectToLogin = () => {
        setRedirectToRegister(false);
        setRedirectToLogin(true);
        setRedirectToMain(false);
    };

    const handleRedirectToMain = () => {
        setRedirectToRegister(false);
        setRedirectToLogin(false);
        setRedirectToMain(true);
    }

    const serverPort = 24750;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if(storedToken == null){
                    setLoading(false)
                    handleRedirectToLogin()
                    return
                }

                if (storedToken) {
                    // Assuming you have an API endpoint for token validation on the server
                    console.log(storedToken);
                    const response = await fetch(`http://localhost:${serverPort}/auth/checkToken`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            "Content-Type": 'application/json',
                            "Authorization": `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        // If the server response is successful, set authentication context and redirect to /main
                        setLoading(false);
                        handleRedirectToMain()
                    } else {
                        // If the server response is not successful, stay on the registration page
                        setLoading(false);
                        handleRedirectToLogin();
                    }
                } else {
                    handleRedirectToLogin();
                    // If no token is found, stay on the registration page
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false)
                handleRedirectToLogin()
                console.error('Error checking token:', error);
                setLoading(false);
            }
        };

        checkToken();
    }, []);



    if (loading) {
        // You can render a loading spinner or any other loading indicator while checking the token
        return <div>Loading...</div>;
    }

    return (
        <div className='App'>
            <Header title="Coordinate checker" />
            {redirectToMain ? (
                <MainPage
                    serverPort={serverPort}
                    redirectToLogin={handleRedirectToLogin}
                />
            ) : redirectToRegister ? (
                <RegistrationPage serverPort={serverPort} redirectToLogin = {handleRedirectToLogin} redirectToMain={handleRedirectToMain}/>
            ) : (
                <LoginPage
                    serverPort={serverPort}
                    redirectToRegister={handleRedirectToRegister}
                    redirectToMain={handleRedirectToMain}
                />
                )}
        </div>
    );
};

export default App;
