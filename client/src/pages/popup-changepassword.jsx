import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
//Context
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast'
//CSS
import './popup-changepassword.css'
//LOADER//
import LoadingAnimation from '../components/loader';

function CPPopup(props) {
    //Context
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [closing, setClosing] = useState(false);
    const [PasswordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmnewPassword: ''
    });

    //fermeture
    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            props.setTrigger(false);
        }, 300);
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

    //password change
    const handlePasswordChange = (e) => {
        setPasswordData({ ...PasswordData, [e.target.name]: e.target.value });
    };

    const validatePassword = () => {
        const password = document.getElementById("newpassword");
        const confirmPassword = document.getElementById("confirmnewpassword");
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Les mots de passe diffèrent");
        } else {
            confirmPassword.setCustomValidity('');
        }
    };

    const handleNewPasswordChange = (e) => {
        handlePasswordChange(e);
        validatePassword();
    };

    //axios request onsubmit
    const changePassword = async (event) => {
        event.preventDefault();
        setIsLoading('changepassword', true);
        const { oldPassword, newPassword } = PasswordData;
        try {
            const response = await axios.post(
                process.env.NODE_ENV === "production" ? '/api/change-password' : '/change-password',
                { oldPassword, newPassword },
                { withCredentials: true }
            );

            if (response.data.error) {
                toast.error(response.data.error);
            } else if (response.data.success) {
                setPasswordData({ oldPassword: '', newPassword: '', confirmnewPassword: '' });
                toast.success(response.data.success);
                handleClose()
            }
        } catch (error) {
            toast.error('Une erreur est survenue. Réessayez plus tard.');
            console.error('Error changing password:', error);
        } finally {
            setIsLoading('changepassword', false);
        }
    };

    const isPasswordBeingChanged = loadingStates.changepassword;

    return (
        <>
            {isPasswordBeingChanged ? (
                <LoadingAnimation />
            ) : (
                <div ref={overlayRef} className="password-overlay">
                    <div ref={wrapperRef} className={`wrapper-password ${closing ? "animate-password-popup-close" : "animate-password-popup"}`}>
                        <span className="close-password" onClick={handleClose}><i className="fa-solid fa-xmark"></i></span>
                        <div className="form-box-password">
                            <h2>Changer le mot de passe</h2>
                            <form onSubmit={changePassword} method="POST">
                                <div className="input-password-box">
                                    <input
                                        type="password"
                                        id="oldpassword"
                                        name="oldPassword"
                                        value={PasswordData.oldPassword || ''}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <label htmlFor="oldpassword">Ancien mot de passe</label> {/*TODO rajouter les icones*/}
                                </div>
                                <div className="input-password-box">
                                    <input
                                        type="password"
                                        id="newpassword"
                                        name="newPassword"
                                        value={PasswordData.newPassword || ''}
                                        onChange={handleNewPasswordChange}
                                        required
                                    />
                                    <label htmlFor="newpassword">Nouveau mot de passe</label>
                                </div>
                                <div className="input-password-box">
                                    <input
                                        type="password"
                                        id="confirmnewpassword"
                                        name="confirmnewPassword"
                                        value={PasswordData.confirmnewPassword || ''}
                                        onChange={handleNewPasswordChange}
                                        required
                                    />
                                    <label htmlFor="confirmnewpassword">Confirmer le nouveau mot de passe</label>
                                </div>
                                <button type="submit" className="submitchangepasswordform">Changer le mot de passe</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CPPopup;