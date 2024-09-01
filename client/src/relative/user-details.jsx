import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
//images
import defaultaccountimage from "../assets/account.jpeg";
import FullStar from '../assets/starrating.png';
import HalfStar from '../assets/halfstarrating.png';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
//CSS
import './user-details.css'
//LOADER//
import LoadingAnimation from '../components/loader';

const BookDetails = () => {
    const { userId } = useParams();
    const [consultedUser, setConsultedUser] = useState({});
    //Context
    const navigate = useNavigate();
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //sections
    const [activeSection, setActiveSection] = useState('status');

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

      //convertir date en date lisible
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  };

    //animations
    const menuanim = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    //sections
    const renderSection = () => {
        switch (activeSection) {
            case 'status':
                return (
                    <div className="status section-content">
                        {isUserLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <>
                                <h3>Statut</h3>
                                <p>{consultedUser.status || "Aucun statut défini"}</p>
                            </>
                        )}
                    </div>
                );
            case 'words':
                return (
                    <div className="words section-content">
                        <h3>Mots lus</h3>
                        {isUserLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <p>{consultedUser.wordsRead}</p>
                        )}
                        <h3>Derniers livres lus</h3>
                        {isUserLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <table className="books-table">
                                <tbody>
                                    {consultedUser.booksRead.length > 0 ? (
                                        consultedUser.booksRead.map((book) => {
                                            const rating = book.reviews[0].rating;
                                            const fullStars = Math.floor(rating);
                                            const hasHalfStar = rating % 1 !== 0;

                                            return (
                                                <React.Fragment key={book._id}>
                                                    <tr>
                                                        <td className='column1' rowSpan="3">
                                                            <Link to={`/book/${book._id}`} className="recentbooklink">
                                                                <img src={book.image} alt={book.title} className="book-image" />
                                                            </Link>
                                                        </td>
                                                        <td className="column2">
                                                            <p>
                                                                <span>{book.title}</span>, {book.author}
                                                            </p>
                                                        </td>
                                                        <td className="column3">
                                                            <p>{formatDate(book.reviews[0].endDate)}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="column2">{book.wordsRead}</td>
                                                        <td className="column3" rowSpan="2">
                                                            <button>See more</button>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="column2 rating">
                                                            <div className="stars">
                                                                {[...Array(fullStars)].map((_, i) => (
                                                                    <img key={i} src={FullStar} alt="full star" className="star-image" />
                                                                ))}
                                                                {hasHalfStar && <img src={HalfStar} alt="half star" className="star-image" />}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="3">Aucun livre récent disponible.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case 'rewards':
                return (
                    <div className="rewards section-content">
                        {isUserLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <>
                                <div className="reward-category">
                                    <h3>Mots</h3>
                                    {consultedUser.rewards.filter(reward => reward.criteria === 'word').length > 0 ? (
                                        <div className="reward-section">
                                            {consultedUser.rewards.filter(reward => reward.criteria === 'word').map(reward => (
                                                <img key={reward._id} src={reward.icon} alt={reward.name} />
                                            ))}
                                        </div>
                                    ) : (
                                        <ul>
                                            <p>Aucune récompense pour les mots</p>
                                        </ul>
                                    )}
                                </div>
                                <div className="reward-category">
                                    <h3>Livres</h3>
                                    {consultedUser.rewards.filter(reward => reward.criteria === 'book').length > 0 ? (
                                        <div className="reward-section">
                                            {consultedUser.rewards.filter(reward => reward.criteria === 'book').map(reward => (
                                                <img key={reward._id} src={reward.icon} alt={reward.name} />
                                            ))}
                                        </div>
                                    ) : (
                                        <ul>
                                            <p>Aucune récompense pour les livres</p>
                                        </ul>
                                    )}
                                </div>
                                <div className="reward-category">
                                    <h3>Participation</h3>
                                    {consultedUser.rewards.filter(reward => reward.criteria === 'participation').length > 0 ? (
                                        <div className="reward-section">
                                            {consultedUser.rewards.filter(reward => reward.criteria === 'participation').map(reward => (
                                                <img key={reward._id} src={reward.icon} alt={reward.name} />
                                            ))}
                                        </div>
                                    ) : (
                                        <ul>
                                            <p>Aucune récompense pour la participation</p>
                                        </ul>
                                    )}
                                </div>
                                <div className="reward-category">
                                    <h3>Création</h3>
                                    {consultedUser.rewards.filter(reward => reward.criteria === 'creation').length > 0 ? (
                                        <div className="reward-section">
                                            {consultedUser.rewards.filter(reward => reward.criteria === 'creation').map(reward => (
                                                <img key={reward._id} src={reward.icon} alt={reward.name} />
                                            ))}
                                        </div>
                                    ) : (
                                        <ul>
                                            <p>Aucune récompense pour la création</p>
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const isUserLoading = loadingStates.user;

    return (
        <div className="backgroundoverlay">
            <div className="user-details-page">
                <div className="account1">
                    <div className="identity-card">
                        <div className="identity-const">
                            {isUserLoading ? (
                                <LoadingAnimation />
                            ) : (
                                <div className="identity-left">
                                    <img src={consultedUser.avatar || defaultaccountimage} alt={consultedUser.prenom} className="avatar" />
                                </div>
                            )}
                            <div className="identity-right">
                                {isUserLoading ? (
                                    <LoadingAnimation />
                                ) : (
                                    <>
                                        <span>{consultedUser.prenom}</span>
                                        <span>{consultedUser.nom}</span>
                                        <span>{consultedUser.email}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="account2" >
                    <div className="renderSection">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1, transition: { duration: 0.5 } }}
                            className="accountnav">
                            <motion.button onClick={() => setActiveSection('status')}
                                initial="hidden"
                                animate="visible"
                                variants={menuanim}
                                className={activeSection === 'status' ? 'active' : ''}>
                                <span className="icon">
                                    <i className="fa-solid fa-circle-user"></i>
                                </span>
                                <span className="text">Statut</span>
                            </motion.button>
                            <motion.button onClick={() => setActiveSection('words')}
                                initial="hidden"
                                animate="visible"
                                variants={menuanim}
                                className={activeSection === 'words' ? 'active' : ''}>
                                <span className="icon">
                                    <i className="fa-solid fa-chart-simple"></i>
                                </span>
                                <span className="text">Statistiques</span>
                            </motion.button>
                            <motion.button onClick={() => setActiveSection('rewards')}
                                initial="hidden"
                                animate="visible"
                                variants={menuanim}
                                className={activeSection === 'rewards' ? 'active' : ''}>
                                <span className="icon">
                                    <i className="fa-solid fa-award"></i>
                                </span>
                                <span className="text">Récompenses</span>
                            </motion.button>
                        </motion.div>
                        {renderSection()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails