import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import axios from 'axios';
import { Toaster } from 'react-hot-toast'
// Contexts
import { UserContextProvider } from './context/userContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { AdminContextProvider } from './context/adminContext';
//Componenets
import LoadingAnimation from './components/loader';
import Navbar from './components/navbar';
import Footer from './components/footer'
//auth
import LoginPopup from './pages/popup-login';
import PasswordPopup from './pages/popup-changepassword'
import ForgotPassword from './pages/changepassword'
import ResetPassword from './pages/resetpassword'
//relative
import BookDetails from './relative/book-details';
import UserDetails from './relative/user-details';
//pages
import Home from './home/home';
import Classement from './classement/classement';
import Books from './book/books';
import News from './news/news'
import APropos from './a-propos/a-propos';
import Accounts from './account/accounts';
//popups
import BookPopup from './book/addbookform'
import FutureBookPopup from './book/addfuturebookform'
//error
import ErrorPage from './pages/error';
//admin
import AdminPage from './admin/checkbook';

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
    //popup future book
    const [ButtonFutureBookPopup, setButtonFutureBookPopup] = useState(false);
    //popup book
    const [ButtonBookPopup, setButtonBookPopup] = useState(false);
    //fetch in books when popups close
    const [updateBooks, setUpdateBooks] = useState(false);
    const [updateFavoriteBooks, setUpdateFavoriteBooks] = useState(false);
    const [updateFutureBooks, setUpdateFutureBooks] = useState(false);
    const [updateCurrentBooks, setUpdateCurrentBooks] = useState(false);
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

    //popup past book
    const handleNewBookClick = () => {
        setButtonBookPopup(true);
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        setInitialPath(currentPath);
        navigate(`/books/addbook`, { state: { background: location } });
    };

    const handlePopupBookClose = () => {
        setButtonBookPopup(false);
        navigate(initialPath);
        setInitialPath(null);
        setUpdateBooks(true);
        setUpdateFavoriteBooks(true);
    };

    //update books
    const handleBooksUpdate = () => {
        // Vous pouvez déclencher les fetchs ici ou les passer comme props
        setUpdateBooks(false);
        setUpdateFavoriteBooks(false);
        setUpdateFutureBooks(false);
        setUpdateCurrentBooks(false);
    };

    //popup future book
    const handleNewFutureBookClick = () => {
        setButtonFutureBookPopup(true);
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        setInitialPath(currentPath);
        navigate(`/books/addfuturebook`, { state: { background: location } });
    };
    const handlePopupFutureBookClose = () => {
        setButtonFutureBookPopup(false);
        navigate(initialPath);
        setInitialPath(null);
        setUpdateFutureBooks(true);
        setUpdateCurrentBooks(true);
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
                <AdminContextProvider>
                    {isLoading && <LoadingAnimation />}
                    <Navbar onLoginClick={handleLoginClick} onLoginClickWhenOnRegister={handleRegistrationClick} />
                    <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />
                    <Routes location={background || location} key={location.pathname}>
                        <Route exact path="/" element={
                            <Home />
                        }
                        />
                        <Route exact path="/ranking" element={
                            <Classement />
                        }
                        />
                        <Route path="/user/:userId" element={
                            <UserDetails />
                        }
                        />
                        <Route exact path="/books" element={
                            <Books onFutureBookClick={handleNewFutureBookClick}
                                onBookClick={handleNewBookClick}
                                shouldUpdateBooks={updateBooks}
                                shouldUpdateFavoriteBooks={updateFavoriteBooks}
                                shouldUpdateFutureBooks={updateFutureBooks}
                                shouldUpdateCurrentBooks={updateCurrentBooks}
                                onBooksUpdate={handleBooksUpdate} />
                        }
                        />
                        <Route path="/book/:bookId" element={
                            <BookDetails />
                        }
                        />
                        <Route exact path="/news" element={
                            <News />
                        }
                        />
                        <Route path="/about" element={
                            <APropos />
                        }
                        />
                        <Route path="/accounts" element={
                            <Accounts onPasswordClick={handlePasswordClick} />
                        }
                        />
                        <Route path="/forgot-password" element={
                            <ForgotPassword />
                        }
                        />
                        <Route path="/reset-password/:id/:token" element={
                            <ResetPassword />
                        }
                        />
                        <Route path="*" element={
                            <ErrorPage />
                        }
                        />
                        <Route path="/admin" element={
                            <AdminPage />
                        }
                        />
                        {/*redirects*/}
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/register" element={<Navigate to="/" replace />} />
                        <Route path="/ranking/login" element={<Navigate to="/ranking" replace />} />
                        <Route path="/ranking/register" element={<Navigate to="/ranking" replace />} />
                        <Route path="/books/login" element={<Navigate to="/books" replace />} />
                        <Route path="/books/register" element={<Navigate to="/books" replace />} />
                        <Route path="/books/addbook" element={<Navigate to="/books" replace />} />
                        <Route path="/books/addfuturebook" element={<Navigate to="/books" replace />} />
                        <Route path="/news/login" element={<Navigate to="/news" replace />} />
                        <Route path="/news/register" element={<Navigate to="/news" replace />} />
                        <Route path="/about/login" element={<Navigate to="/about" replace />} />
                        <Route path="/about/register" element={<Navigate to="/about" replace />} />
                        <Route path="/accounts/changepassword" element={<Navigate to="/accounts" replace />} />
                    </Routes>
                    <Footer />
                    {ButtonPopup && (
                        <Routes>
                            <Route path="/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/ranking/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/ranking/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/books/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/books/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/news/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/news/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/about/login" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                            <Route path="/about/register" element={<LoginPopup trigger={ButtonPopup} setTrigger={handlePopupClose} formType={formType} setFormType={setFormType} location={location} />} />
                        </Routes>
                    )}
                    {ButtonPasswordPopup && (
                        <Routes>
                            <Route path="/accounts/changepassword" element={<PasswordPopup trigger={ButtonPasswordPopup} setTrigger={handlePopupPasswordClose} location={location} />} />
                        </Routes>
                    )}
                    {ButtonBookPopup && (
                        <Routes>
                            <Route path="/books/addbook" element={<BookPopup trigger={ButtonBookPopup} setTrigger={handlePopupBookClose} location={location} />} />
                        </Routes>
                    )}
                    {ButtonFutureBookPopup && (
                        <Routes>
                            <Route path="/books/addfuturebook" element={<FutureBookPopup trigger={ButtonFutureBookPopup} setTrigger={handlePopupFutureBookClose} location={location} />} />
                        </Routes>
                    )}
                </AdminContextProvider>
            </UserContextProvider>
        </LoadingProvider>
    );
}
