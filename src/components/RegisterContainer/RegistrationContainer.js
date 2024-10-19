import React, {useRef} from 'react';
import Title from '../Title';
import { useForm } from "react-hook-form";
import {Link, useNavigate} from 'react-router-dom';

const RegistrationContainer = ({serverPort, redirectToLogin, redirectToMain} ) => {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();


    const onSubmit = (data) => {
        console.log("Attempt entered by user:");
        tryToSendAddAttemptRequest(serverPort, data.login, data.password, "register").then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Login already in used');
            }
        })
        .then((responseData) => {
            localStorage.setItem('token', responseData.token);
            console.log("Got token: " + responseData.token);
            redirectToMain();
        })
        .catch((error) => {
            alert('Login already in used');
        });
    };

    const onSubmitAdmin = (data) => {
        console.log("Attempt entered by admin:");
        tryToSendAddAttemptRequest(serverPort, data.login, data.password, "register/admin").then((response) => {
                if (response.status == 200) {
                    return response.json();
                } else if(response.status == 202){
                    alert("Registration request successfuly was sent. Wait till admin approves it");
                    return null;
                } else {
                    alert("Login already in used");
                    return null;
                }
            })
            .then((responseData) => {
                if(responseData == null){
                    return;
                }else{
                    localStorage.setItem('token', responseData.token);
                    console.log("Got token: " + responseData.token);
                    redirectToMain();
                }
            })
    };

    return (
        <form className="register_box container" onSubmit={handleSubmit(onSubmit)}>
            <Title text='Register Here'/>
            <label>Login</label>
            <input placeholder='Login: more than 8 chars'
                   {...register("login", {required: true, pattern: /^[A-Za-z0-9]+$/i, })} />
            {errors?.login?.type === "pattern" && ( <p className='error'>Latin leters and numbers</p>)}
            {errors?.login?.type === "required" && <p className='error'>This field is required</p>}

            <label>Password</label>
            <input
                type="password"
                placeholder="Password: more than 8 chars"
                {...register('password', { required: true, pattern: /^[A-Za-z0-9]+$/i, minLength: 8 })}
            />
            {errors?.password?.type === 'pattern' && <p className="error">Latin letters and numbers</p>}
            {errors?.password?.type === 'minLength' && <p className="error">At least 8 chars</p>}
            {errors?.password?.type === 'required' && <p className="error">This field is required</p>}


            <input type="submit" value="Register as user" className='btn-block btn' />

            <button type="button" className='btn-block btn' onClick={handleSubmit(onSubmitAdmin)}>
                Register as Admin
            </button>

            <button className="btn btn-block" onClick={redirectToLogin}>
                Log in
            </button>
        </form>
    );
};

export default RegistrationContainer;

let tryToSendAddAttemptRequest = async (port, username, password, endpoint) => {
    let url = "http://localhost:"+ port +"/auth/" + endpoint;
    console.log("Sending POST request to url: " + url + ". With body: " + JSON.stringify({ username, password }));
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
    });
    let res = await response;
    return response; 
}


