import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-hot-toast';
//css
import './resetpassword.css';

function ResetPassword() {
    const navigate = useNavigate();
    const { id, token} = useParams();

    const [PasswordData, setPasswordData] = useState({
        newPassword: '',
        confirmnewPassword: ''
    });

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

    // Change password handler
    const handleChangePassword = async (event) => {
        event.preventDefault();
        const { newPassword } = PasswordData;
        try {
            const response = await axios.post(
                process.env.NODE_ENV === "production" ? `/api/change-forgot-password/${id}/${token}` : `/change-forgot-password/${id}/${token}`,
                { newPassword },
                { withCredentials: true }
            );

            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                setPasswordData({ newPassword: '', confirmnewPassword: '' });
                toast.success('Mot de passe changé avec succès');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (error) {
            toast.error('Une erreur est survenue. Réessayez plus tard.');
            console.error('Error changing password:', error);
        }
    };

    return (
        <>
            <div className="resetpassword-overlay">
                <div className="resetpassword-wrapper">
                    <div className="form-box-resetpassword">
                        <h2>Changer de mot de passe</h2>
                        <form onSubmit={handleChangePassword}>
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
                            <button type="submit" className="submit-reset">Changer le mot de passe</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;