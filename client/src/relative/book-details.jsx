import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
//images
import FullStar from '../assets/starrating.png';
import HalfStar from '../assets/halfstarrating.png';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//CSS
import './book-details.css'
//LOADER//
import LoadingAnimation from '../components/loader';

const BookDetails = ({ onReadClick, onModifyClick, shouldUpdateBook, onBooksUpdate }) => {
    //Context
    const navigate = useNavigate();
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const { bookId } = useParams();
    const [book, setBook] = useState({});
    const [review, setReview] = useState({})
    //status
    const [read, setRead] = useState(false);
    const [currentRead, setCurrentRead] = useState(false);
    const [toRead, setToRead] = useState(false);

    //attendre Usercontext et book._id
    useEffect(() => {
        if (!isLoading && user && bookId) {
            fetchBook();
            fetchUserReview();
            fetchFutureBook();
            fetchCurrentBook();
        }
    }, [isLoading, user, bookId]);

    //si on modifie l'appréciation --> changer les données du livre
    useEffect(() => {
        if (shouldUpdateBook) {
            fetchBook();
            onBooksUpdate();
        }
    }, [shouldUpdateBook, onBooksUpdate]);


    ///////start//////
    //récupérer livre
    const fetchBook = async () => {
        setIsLoading('book', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/books/${bookId}` : `/books/${bookId}`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                setBook(response.data);
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
        } finally {
            setIsLoading('book', false);
        }
    };

    //récuérer review utilisateur => si réponse, livre fait partie des livres lus
    const fetchUserReview = async () => {
        setIsLoading('review', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/user/bookdetails/${bookId}` : `/user/bookdetails/${bookId}`);
            if (response.data.error) {
                console.log(response.data.error);
            } else {
                setReview(response.data);
                if (response.data.rating) {
                    setRead(true);
                }
            }
        } catch (error) {
            console.error('Error fetching your book review:', error);
        } finally {
            setIsLoading('review', false);
        }
    };

    //si réponse => livre fait partie des livres actuels
    const fetchCurrentBook = async () => {
        setIsLoading('currentbook', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/predict/${bookId}/currentbook` : `/predict/${bookId}/currentbook`);
            if (response.data.error) {
                console.log(response.data.error);
            } else {
                setCurrentRead(true)
            }
        } catch (error) {
            console.error('Error fetching your current book:', error);
        } finally {
            setIsLoading('currentbook', false);
        }
    };

    //si réponse => livre fait partie des livres futurs
    const fetchFutureBook = async () => {
        setIsLoading('futurebook', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/predict/${bookId}/futurebook` : `/predict/${bookId}/futurebook`);
            if (response.data.error) {
                console.log(response.data.error);
            } else {
                setToRead(true)
            }
        } catch (error) {
            console.error('Error fetching your future book:', error);
        } finally {
            setIsLoading('futurebook', false);
        }
    };

    //bouton ajouter aux lectures futures
    const addToFutureReadings = async () => {
        setIsLoading('addToFutureReadings', true);
        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? `/api/predict/${bookId}/future-readers` : `/predict/${bookId}/future-readers`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                toast.success('Livre ajouté à vos lectures futures');
                setToRead(true)
            }
        } catch (error) {
            console.error('Error adding book to future readings:', error);
            toast.error('Erreur lors de l\'ajout du livre à vos lectures futures');
        } finally {
            setIsLoading('addToFutureReadings', false);
        }
    };

    //bouton ajouter aux lectures actuelles
    const markAsCurrent = async () => {
        setIsLoading('markascurrent', true);
        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? `/api/predict/${bookId}/markascurrent` : `/predict/${bookId}/markascurrent`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                toast.success('Livre ajouté à vos lectures actuelles');
                setToRead(false)
                setCurrentRead(true)
                fetchFutureBook();
                fetchCurrentBook();
            }
        } catch (error) {
            console.error('Error adding book to current readings:', error);
            toast.error('Erreur lors de l\'ajout du livre à vos lectures actuelles');
        } finally {
            setIsLoading('markascurrent', false);
        }
    };

    //bouton modifier appréciation
    //ouvrir la popup
    const ModifyReview = () => {
        onModifyClick(bookId);
    };


    //bouton ajouter aux livres lus
    //ouvrir la popup
    const handleReadClick = () => {
        onReadClick(bookId);
    };

    //delete
    const deleteBook = async (bookTitle) => {
        setIsLoading('deletebook', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/books/delete` : `/books/delete`, { params: { bookTitle } });
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                toast.success('Livre supprimé avec succès');
                setRead(false)
                fetchUserReview();
                setTimeout(() => {
                    window.location.href = '/books';
                }, 1000);
            }
        } catch (error) {
            console.error('Error deleting book from readings:', error);
            toast.error('Erreur lors de la suppression du livre de vos lectures');
        } finally {
            setIsLoading('deletebook', false);
        }
    };

    const deleteFutureBook = async () => {
        setIsLoading('deletfuturebook', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/predict/delete/${bookId}` : `/predict/delete/${bookId}`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                toast.success('Livre supprimé avec succès');
                setToRead(false)
            }
        } catch (error) {
            console.error('Error deleting book from future readings:', error);
            toast.error('Erreur lors de la suppression du livre de vos lectures futures');
        } finally {
            setIsLoading('deletfuturebook', false);
        }
    };

    //retrouver couleur des themes
    const themeOptions = [
        { value: 'Action', label: '💪 Action', color: "#337EA9", backgroundcolor: "#E7F3F890", backgroundcolorhover: "#E7F3F8", selectedcolor: "#529CCA" },
        { value: 'Dystopie', label: '🧟 Dystopie', color: "#CB912F", backgroundcolor: "#FBF3DB90", backgroundcolorhover: "#FBF3DB", selectedcolor: "#FFDC49" },
        { value: 'Fantaisie', label: '✨ Fantaisie', color: "#9F6B53", backgroundcolor: "#F4EEEE90", backgroundcolorhover: "#F4EEEE", selectedcolor: "#937264" },
        { value: 'Fiction', label: '🔮 Fiction', color: "#448361", backgroundcolor: "#EDF3EC90", backgroundcolorhover: "#EDF3EC", selectedcolor: "#4DAB9A" },
        { value: 'Magie', label: '🪄 Magie', color: "#D9730D", backgroundcolor: "#FAEBDD90", backgroundcolorhover: "#FAEBDD", selectedcolor: "#FFA344" },
        { value: 'Méditation', label: '💭 Méditation', color: "#9065B0", backgroundcolor: "#F6F3F990", backgroundcolorhover: "#F6F3F9", selectedcolor: "#9A6DD7" },
        { value: 'Young Adult', label: '👶 Young Adult', color: "#787774", backgroundcolor: "#F1F1EF90", backgroundcolorhover: "#F1F1EF", selectedcolor: "#979A9B" },
        { value: 'Paranormal', label: '🧿 Paranormal', color: "#D44C47", backgroundcolor: "#FDEBEC90", backgroundcolorhover: "#FDEBEC", selectedcolor: "#FF7369" },
        { value: 'Romance', label: '❤️‍🔥 Romance', color: "#C14C8A", backgroundcolor: "#FAF1F590", backgroundcolorhover: "#FAF1F5", selectedcolor: "#E255A1" },
        { value: 'Philosophie', label: '🧐 Philosophie', color: "#337EA9", backgroundcolor: "#E7F3F890", backgroundcolorhover: "#E7F3F8", selectedcolor: "#529CCA" },
        { value: 'Science-fiction', label: '👽 Science-fiction', color: "#CB912F", backgroundcolor: "#FBF3DB90", backgroundcolorhover: "#FBF3DB", selectedcolor: "#FFDC49" },
        { value: 'Policier', label: '👮 Policier', color: "#9F6B53", backgroundcolor: "#F4EEEE90", backgroundcolorhover: "#F4EEEE", selectedcolor: "#937264" }
    ];

    const getThemeOption = (theme) => {
        return themeOptions.find(option => option.value === theme);
    };

    //average rating :
    const calculateAverageRating = (reviews = [], userReview = {}) => {
        const allReviews = Array.isArray(reviews) ? [...reviews] : [];
        if (userReview && userReview.rating) {
            allReviews.push(userReview);
        }
        if (allReviews.length === 0) return 0;

        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const average = totalRating / allReviews.length;

        // Si le calcul produit NaN, retourne 0
        return isNaN(average) ? 0 : average;
    };

    const averageRating = calculateAverageRating(book.reviews || [], review || {});
    const averageFullStars = Math.floor(averageRating);
    const averageHasHalfStar = averageRating % 1 !== 0;

    // Vérifier le rating utilisateur aussi
    const rating = review && review.rating ? review.rating : 0;
    const validRating = isNaN(rating) ? 0 : rating;
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 !== 0;

    const isBookLoading = loadingStates.book;
    const isReviewLoading = loadingStates.review;
    const isCurrentLoading = loadingStates.currentbook;
    const isFutureLoading = loadingStates.futurebook;

    const isAddingToFutureReadings = loadingStates.addToFutureReadings;
    const isMarkingAsCurrent = loadingStates.markascurrent;
    const isMarkingAsRead = loadingStates.markasread;
    const isModifyingReview = loadingStates.modifyreview;

    const isDeletingBook = loadingStates.deletebook;
    const isDeletingFutureBook = loadingStates.deletefuturebook;

    return (
        <div className="backgroundoverlay">
            <div className="book-details-page">
                {isBookLoading || isModifyingReview || isReviewLoading ? (
                    <LoadingAnimation />
                ) : (
                    <>
                        <div className="retour">
                            <button onClick={() => navigate(-1)}><i className="fa-solid fa-backward"></i>&nbsp;&nbsp;&nbsp;Retour</button>
                        </div>
                        <div className="group">
                            <div className="book-card">
                                <div className="card-left">
                                    <img src={book.image} alt={book.title} />
                                </div>
                                <div className="card-right">
                                    <div className="cartel">
                                        <h2>{book.title},</h2>
                                        <h2>{book.author}</h2>
                                    </div>
                                    <p>Langage : {book.language}</p>
                                    <p>Contient <strong>{book.wordsRead}</strong> mots</p>
                                    <div className="themes">
                                        <p>Thèmes :&nbsp;</p>
                                        <ul>
                                            {book.themes && book.themes.length > 0 ? (
                                                book.themes.map((theme, index) => {
                                                    const themeOption = getThemeOption(theme);
                                                    return (
                                                        <li
                                                            key={index}
                                                            className='thème'
                                                            style={{
                                                                color: themeOption ? themeOption.color : 'inherit',
                                                                backgroundColor: themeOption ? themeOption.backgroundcolor : 'inherit'
                                                            }}
                                                        >
                                                            {themeOption.label}
                                                        </li>
                                                    );
                                                })
                                            ) : (
                                                <li>Pas de thème associé</li>
                                            )}
                                        </ul>
                                    </div>
                                    <p>Note moyenne :</p>
                                    <div className="rating">
                                        <div className="stars">
                                            {[...Array(averageFullStars)].map((_, i) => (
                                                <img key={i} src={FullStar} alt="full star" className="star-image" />
                                            ))}
                                            {averageHasHalfStar && <img src={HalfStar} alt="half star" className="star-image" />}
                                        </div>
                                        <p>{averageRating.toFixed(1)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="reviews">
                                <h3>Mon appréciation:</h3>
                                {isReviewLoading || isDeletingBook ? (
                                    <LoadingAnimation />
                                ) : (
                                    review.user && review.description && review.rating ? (
                                        <div key={review._id} className='reader-card'>
                                            <div className="card-left">
                                                <img src={review.user.avatar} alt={`${review.user.prenom} ${review.user.nom}`} />
                                            </div>
                                            <div className="card-right">
                                                <p>
                                                    <strong>Commentaire :</strong>
                                                </p>
                                                <p>
                                                    {review.description}
                                                </p>
                                                <p>
                                                    <strong>Note finale :</strong></p>
                                                <div className="stars">
                                                    {[...Array(fullStars)].map((_, i) => (
                                                        <img key={i} src={FullStar} alt="full star" className="star-image" />
                                                    ))}
                                                    {hasHalfStar && <img src={HalfStar} alt="half star" className="star-image" />}
                                                    <p>{validRating.toFixed(1)}</p>
                                                    <button className='dangermodify' onClick={ModifyReview}>Modifier mon appréciation</button> {/* TODO: faire ca*/}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        isAddingToFutureReadings || isMarkingAsCurrent || isMarkingAsRead || isCurrentLoading || isFutureLoading || isDeletingFutureBook || isModifyingReview ?
                                            (
                                                <LoadingAnimation />
                                            ) : (
                                                <>
                                                    {currentRead === false && toRead === false && (
                                                        <>
                                                            <p>Vous n'avez pas lu ce livre.</p>
                                                            <button className='addtofuturebooks' onClick={addToFutureReadings}>Ajouter à mes lectures futures</button>
                                                        </>
                                                    )}
                                                    {currentRead === true && (
                                                        <>
                                                            <p>Ce livre fait partie de vos lectures actuelles, il faut le finir pour ajouter un avis.</p>
                                                            <button className='addtobooksread' onClick={handleReadClick}>J'ai fini le livre</button>
                                                        </>
                                                    )}
                                                    {toRead === true && (
                                                        <>
                                                            <p>Ce livre fait partie de vos lectures futures, il faut le commencer pour l'ajouter aux lectures actuelles.</p>
                                                            <button className='addtocurrentbooks' onClick={markAsCurrent}>J'ai commencé le livre</button>
                                                        </>
                                                    )}
                                                </>
                                            )
                                    ))}
                            </div>
                        </div>
                        <div className="group">
                            <div className="currentreaders">
                                <h3>Lecteurs actuels:</h3>
                                {book.currentReaders && book.currentReaders.length > 0 ? (
                                    book.currentReaders.map(reader => (
                                        <div key={reader._id} className='currentreaders-card'>
                                            <div className="readeravatar">
                                                <Link to={`/user/${reader._id}`}><img src={reader.avatar} alt={`${reader.prenom} ${reader.nom}`} /></Link>
                                            </div>
                                            <div className="readerinfos">
                                                <p>{reader.prenom}</p>
                                                <p>{reader.nom}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Pas de lecteur en ce moment{currentRead && (' à part vous')}.</p>
                                )}
                            </div>
                            <div className="futurereaders">
                                <h3>Lecteurs futurs:</h3>
                                {book.futureReaders && book.futureReaders.length > 0 ? (
                                    book.futureReaders.map(reader => (
                                        <div key={reader._id} className='currentreaders-card'>
                                            <div className="readeravatar">
                                                <img src={reader.avatar} alt={`${reader.prenom} ${reader.nom}`} />
                                            </div>
                                            <div className="readerinfos">
                                                <p>{reader.prenom}</p>
                                                <p>{reader.nom}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Pas de futur lecteur{toRead && (' à part vous')}.</p>
                                )}
                            </div>
                        </div>
                        <h3>Ce livre a été lu par :</h3>
                        {book.reviews && book.reviews.length > 0 ? (
                            <div className='pastreaders'>
                                {book.reviews.map(review => {
                                    const readerrating = review.rating || 0;
                                    const validReaderRating = isNaN(readerrating) ? 0 : readerrating;
                                    const readerfullStars = Math.floor(validReaderRating);
                                    const readerhasHalfStar = validReaderRating % 1 !== 0;

                                    return (
                                        <div key={review._id} className='pastreader-card'>
                                            <div className="card-left">
                                                <div className="readeravatar">
                                                    <Link to={`/user/${review.user._id}`}>
                                                        <img src={review.user.avatar} alt={`${review.user.prenom} ${review.user.nom}`} />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="card-right">
                                                <p>
                                                    Lu du {new Date(review.startDate).toLocaleDateString()} au {new Date(review.endDate).toLocaleDateString()} par {review.user.prenom}
                                                </p>
                                                <p><strong>Commentaire :</strong></p>
                                                <p>{review.description}</p>
                                                <p><strong>Note finale :</strong></p>
                                                <div className='rating'>
                                                    <div className="stars">
                                                        {[...Array(readerfullStars)].map((_, i) => (
                                                            <img key={i} src={FullStar} alt="full star" className="star-image" />
                                                        ))}
                                                        {readerhasHalfStar && <img src={HalfStar} alt="half star" className="star-image" />}
                                                    </div>
                                                    {review.rating}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className='noreview'>Ce livre n'a pas encore été noté.</p>
                        )}
                        {isDeletingFutureBook || isDeletingBook ? (
                            <LoadingAnimation />
                        ) : (
                            <>
                                {read && (
                                    <button className='dangerdelete' onClick={() => deleteBook(book.title)}>Supprimer de vos livres lus</button>
                                )}
                                {toRead && (
                                    <button className='dangerdelete' onClick={() => deleteFutureBook()}>Supprimer de vos livres futurs</button>
                                )}
                                {currentRead && (
                                    <button className='dangerdelete' onClick={() => deleteFutureBook()}>Supprimer de vos lectures en cours</button>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
};

export default BookDetails;