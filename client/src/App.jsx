import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Toaster } from 'react-hot-toast'
//Context
import { UserContextProvider } from './context/userContext'
import { LoadingProvider, useLoading } from './context/LoadingContext';
//Componenets
import LoadingAnimation from './components/loader';
import Navbar from './components/navbar';
import LoginPopup from './components/popup-login';
import PasswordPopup from './components/popup-changepassword'
//pages
import BookDetails from './relative/book-details';
import UserDetails from './relative/user-details'
import Home from '../src/pages/home';
import Classement from './classement/classement';
import Books from './book/books';
import News from './news/news'
import APropos from './a-propos/a-propos';
import Accounts from './account/accounts';
import ErrorPage from '../src/pages/error';

axios.defaults.baseURL = process.env.NODE_ENV === "production" ? '' : process.env.BACKEND_SERVER, //ne rien mettre sur github
    axios.defaults.withCredentials = true

export default function App() {
    //LOADING//
    const { isLoading } = useLoading();
    //popup login
    const [ButtonPopup, setButtonPopup] = useState(false);
    const [formType, setFormType] = useState('login');
    //popup change password
    const [ButtonPasswordPopup, setButtonPasswordPopup] = useState(false);
    //default
    const [initialPath, setInitialPath] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const background = location.state && location.state.background;

    //popup login
    const handleLoginClick = () => {
        setButtonPopup(true);
        setFormType('login');
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        setInitialPath(currentPath);
        navigate(`${currentPath}/login`, { state: { background: location } });
    };
    const handleRegistrationClick = () => {
        setButtonPopup(true);
        setFormType('login');
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        const newPath = currentPath.replace(/\/register$/, '');
        setInitialPath(newPath);
        navigate(`${newPath}/login`, { state: { background: location } });
    };

    const handlePopupClose = () => {
        setButtonPopup(false);
        navigate(initialPath);
        setInitialPath(null);
    };

    //popup change password
    const handlePasswordClick = () => {
        setButtonPasswordPopup(true);
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        setInitialPath(currentPath);
        navigate(`/accounts/changepassword`, { state: { background: location } });
    };

    const handlePopupPasswordClose = () => {
        setButtonPasswordPopup(false);
        navigate(initialPath);
        setInitialPath(null);
    };

    return (
        <LoadingProvider>
            <UserContextProvider>
                {isLoading && <LoadingAnimation />}
                <Navbar onLoginClick={handleLoginClick} onLoginClickWhenOnRegister={handleRegistrationClick} />
                <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />
                <Routes location={background || location}>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/ranking" element={<Classement />} />
                    <Route path="/user/:userId" element={<UserDetails />} />
                    <Route exact path="/books" element={<Books />} />
                    <Route path="/book/:bookId" element={<BookDetails />} />
                    <Route exact path="/news" element={<News />} />
                    <Route path="/about" element={<APropos />} />
                    <Route path="/accounts" element={<Accounts onPasswordClick={handlePasswordClick} />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
                {ButtonPopup && (
                    <Routes>
                        <Route path="/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/ranking/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/ranking/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/books/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/books/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/predict/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/predict/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/about/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        <Route path="/about/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                    </Routes>
                )}
                {ButtonPasswordPopup && (
                    <Routes>
                        <Route path="/accounts/changepassword" element={<PasswordPopup trigger={ButtonPasswordPopup} setTrigger={handlePopupPasswordClose} location={location} />} />
                    </Routes>
                )}
            </UserContextProvider>
        </LoadingProvider>
    );
}
