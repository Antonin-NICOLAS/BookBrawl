import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
//images
import FullStar from '../assets/starrating.png';
import HalfStar from '../assets/halfstarrating.png';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//CSS
import './user-details.css'
//LOADER//
import LoadingAnimation from '../components/loader';

const BookDetails = () => {
    const { userId } = useParams();
    const [consultedUser, setConsultedUser] = useState(null);
    //Context
    const navigate = useNavigate();
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();

    //attendre Usercontext et book._id
    useEffect(() => {
        if (!isLoading && user && userId) {
            fetchUser();
        }
    }, [isLoading, user, userId]);

    const fetchUser = async () => {
        setIsLoading('user', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/user/userdetails/${userId}` : `/user/userdetails/${userId}`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                setConsultedUser(response.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setIsLoading('user', false);
        }
    };

    const isUserLoading = loadingStates.user;

    return (
        <div className="book-details-page">
            {isUserLoading ? (
                <LoadingAnimation />
            ) : (
                consultedUser && (
                    <>
                        <h2>{consultedUser.prenom}</h2>
                        <img src={consultedUser.avatar} alt={consultedUser.prenom} />
                        {/* Affichez d'autres détails du livre selon votre besoin */}
                    </>
                )
            )}
        </div>
    );
};

export default BookDetails;