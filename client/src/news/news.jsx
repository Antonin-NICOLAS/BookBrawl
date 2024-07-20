import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/footer'
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//CSS
import './news.css';
//LOADER//
import LoadingAnimation from '../components/loader';

const News = () => {
    //Context
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();

    return (
        <>
            <div className='news'>
                <div className="coming">
                    <p>Coming soon</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default News;