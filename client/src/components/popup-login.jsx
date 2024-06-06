import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios'
import { toast } from 'react-hot-toast'

//css
import './popup-login.css';

function LoginPopup(props) {
    const [closing, setClosing] = useState(false);
    const navigate = useNavigate();

    const [data, setData] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            props.setTrigger(false);
            props.setFormType('login');
            props.setFormType(null);
        }, 300);
    };

    const registerLink = () => {
        props.setFormType('register');
        const currentPath = props.location.pathname.replace(/\/login$/, '');
        navigate(`${currentPath}/register`, { state: { background: props.location.state.background } }); // Conserver l'état d'arrière-plan
    };

    const loginLink = () => {
        props.setFormType('login');
        const currentPath = props.location.pathname.replace(/\/register$/, '');
        navigate(`${currentPath}/login`, { state: { background: props.location.state.background } }); // Conserver l'état d'arrière-plan
    };

    const handleRegisterChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        handleRegisterChange(e);
        validatePassword();
    };

    //overlay click
    const overlayRef = useRef(null);
    const wrapperRef = useRef(null);
    const handleClickOutside = (event) => {
        if (overlayRef.current && wrapperRef.current && overlayRef.current.contains(event.target) && !wrapperRef.current.contains(event.target)) {
            handleClose();
        }
    };

    useEffect(() => {
        if (props.trigger) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [props.trigger]);

    //check both password
    const validatePassword = () => {
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm_password");
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Les mots de passe diffèrent");
        } else {
            confirmPassword.setCustomValidity('');
        }
    };

    //register
    const handleRegister = async (event) => {
        event.preventDefault();
        const { prenom, nom, email, password } = data
        try {
            const { data } = await axios.post('/register', {
                prenom, nom, email, password,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            })
            if (data.error) {
                toast.error(data.error)
            } else {
                setData({})
                toast.success('Bienvenue !')
                handleClose();
            }
        } catch (error) {
            console.log(error)
        }
    };

    //login
    const handleLogin = async (event) => {
        event.preventDefault();
        const { email, password } = loginData
        try {
            const { data } = await axios.post('/login', {
                email, password,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            })
            if (data.error) {
                toast.error(data.error)
            } else {
                setLoginData({});
                localStorage.setItem('prenom', data.prenom); // Stocke le prénom dans localStorage
                toast.success('Vous êtes connectés !');
                handleClose();
                window.location.reload();
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (props.trigger) ? (
        <>
            <div ref={overlayRef} className={`login-overlay ${closing ? "animate-popup-close" : "animate-popup"} ${props.formType === 'register' ? "active" : ""}`}>
                <div ref={wrapperRef} className="wrapper">
                    <span className="close-login" onClick={handleClose}><i className="fa-solid fa-xmark"></i></span>
                    {props.formType === 'login' ? (
                        <div className="form-box-login">
                            <h2>Login</h2>
                            <form onSubmit={handleLogin} method="POST">
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-signature"></i></span>
                                    <input type="email" id="email" name="email" value={loginData.email} onChange={handleLoginChange} required autoComplete="off" />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-key"></i></span>
                                    <input type="password" id="password" name="password" value={loginData.password} onChange={handleLoginChange} required autoComplete="off" />
                                    <label htmlFor="password">Mot de passe</label>
                                </div>
                                <div className="remember-forgot">
                                    <label><input type="checkbox" />Me le rappeler</label>
                                    <a href="#">J'ai oublié mon mot de passe</a>
                                </div>
                                <button type="submit" className="submit-login">Login</button>
                                <div className="login-register">
                                    <p>Pas de compte ?&nbsp;&nbsp;&nbsp;<a onClick={registerLink} className="register">Créez en un</a></p>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="form-box-register">
                            <h2>Registration</h2>
                            <form onSubmit={handleRegister} method="POST">
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-font"></i></span>
                                    <input type="text" id="prenom" name="prenom" value={data.prenom} onChange={handleRegisterChange} required autoComplete="off" />
                                    <label htmlFor="prenom">Prénom</label>
                                </div>
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-signature"></i></span>
                                    <input type="text" id="nom" name="nom" value={data.nom} onChange={handleRegisterChange} required autoComplete="off" />
                                    <label htmlFor="nom">Nom</label>
                                </div>
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-envelope"></i></span>
                                    <input type="email" id="email" name="email" value={data.email} onChange={handleRegisterChange} required autoComplete="off" />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-key"></i></span>
                                    <input type="password" id="password" name="password" value={data.password} onChange={handlePasswordChange} required autoComplete="off" />
                                    <label htmlFor="password">Mot de passe</label>
                                </div>
                                <div className="input-box">
                                    <span className="icon"><i className="fa-solid fa-key"></i></span>
                                    <input type="password" id="confirm_password" name="confirmPassword" value={data.confirmPassword} onChange={handlePasswordChange} required autoComplete="off" />
                                    <label htmlFor="confirm_password">Confirmer mot de passe</label>
                                </div>
                                <div className="remember-forgot">
                                    <label>&nbsp;&nbsp;<input type="checkbox" required /><a target="_blank" href="/src/assets/conditions.pdf">Accepter les conditions d'utilisation</a></label>
                                </div>
                                <button type="submit" className="submit-login">Register</button>
                                <div className="login-register">
                                    <p>Vous avez déjà un compte ?&nbsp;&nbsp;&nbsp;<a onClick={loginLink} className="login-link">Se connecter</a></p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    ) : "";
}

export default LoginPopup;
