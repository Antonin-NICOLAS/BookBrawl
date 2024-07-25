import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
//Context
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//css
import './changepassword.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function ChangePassword() {
    //context
    const { setIsLoading, loadingStates } = useLoading();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    // Change password handler
    const handleResetPassword = async (event) => {
        event.preventDefault();
        setIsLoading('resetpassword', true);
        try {
            const response = await axios.post(
                process.env.NODE_ENV === "production" ? '/api/forgotpassword' : '/forgotpassword',
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.error) {
                console.log(response.data.error);
                toast.error(response.data.error);
            } else {
                setEmail('');
                toast.success('Email de réinitialisation de mot de passe envoyé');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe :", error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('resetpassword', false);
        }
    };

    const isEmailBeingSend = loadingStates.resetpassword;

    return (
        <>
            {isEmailBeingSend ? (
                <LoadingAnimation />
            ) : (
                <div className="changepassword-overlay">
                    <div className="changepassword-wrapper">
                        <div className="form-box-changepassword">
                            <h2>Réinitialiser le mot de passe</h2>
                            <form onSubmit={handleResetPassword}>
                                <div className="input-box">
                                    <span className="icon">
                                        <i className="fa-solid fa-signature"></i>
                                    </span>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        autoComplete="off"
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <button className="submitchangeforgotpasswordform" type="submit">Envoyer un email</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChangePassword;