import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Toaster } from 'react-hot-toast'
import Navbar from '../src/components/navbar';
import Home from '../src/pages/home';
import APropos from '../src/pages/a-propos';
import ErrorPage from '../src/pages/error'
import LoginPopup from '../src/components/popup-login';

axios.defaults.baseURL = https://book-brawl-backend.vercel.app
axios.defaults.withCredentials = true

export default function App() {
    const [ButtonPopup, setButtonPopup] = useState(false);
    const [formType, setFormType] = useState('login');
    const [initialPath, setInitialPath] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const background = location.state && location.state.background;

    const handleLoginClick = () => {
        setButtonPopup(true);
        setFormType('login');
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        setInitialPath(currentPath);
        navigate(`${currentPath}/login`, { state: { background: location } });
    };

    const handlePopupClose = () => {
        setButtonPopup(false);
        navigate(initialPath);
        setInitialPath(null);
    };

    return (
        <>
            <Navbar onLoginClick={handleLoginClick} />
            <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />
            <Routes location={background || location}>
                <Route exact path="/" element={<Home />} />
                <Route path="/about" element={<APropos />} />
                <Route path="*" element={<ErrorPage />} />
            </Routes>
            {ButtonPopup && (
                <Routes>
                    <Route path="/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                    <Route path="/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                    <Route path="/about/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                    <Route path="/about/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                </Routes>
            )}
        </>
    );
}
