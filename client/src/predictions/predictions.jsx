import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//Form
import AddFutureBookForm from './addfuturebookform';
//CSS
import './predictions.css';
//LOADER//
import LoadingAnimation from '../components/loader';

const Predictions = () => {
    //Context
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [Futurebooks, setFutureBooks] = useState([]);
    const [CurrentBooks, setCurrentBooks] = useState([]);
    const [showFutureForm, setShowFutureForm] = useState(false);

    //attendre Usercontext
    useEffect(() => {
        if (!isLoading && user) {
            fetchFutureBooks();
            fetchCurrentBooks();
        }
    }, [isLoading, user]);

    //livres
    const fetchFutureBooks = async () => {
        setIsLoading('futurebooks', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/predict/userfuturebooks' : '/predict/userfuturebooks');
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                setFutureBooks(response.data);
            }
        } catch (error) {
            console.error('Error fetching future books:', error);
            toast.error('Un problème est survenu lors de la récupération des livres. Réessayez plus tard.');
        } finally {
            setIsLoading('futurebooks', false);
        }
    };

    //livres favoris
    const fetchCurrentBooks = async () => {
        setIsLoading('currentbooks', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/predict/usercurrentbooks' : '/predict/usercurrentbooks');
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                setCurrentBooks(response.data);
            }
        } catch (error) {
            console.error('Error fetching current books:', error);
            toast.error('Un problème est survenu lors de la récupération des livres actuels. Réessayez plus tard.');
        } finally {
            setIsLoading('currentbooks', false);
        }
    };

    //supprimer un livre
    const deleteBook = async (bookTitle) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce livre ? Cette action est irréversible.")) {
            setIsLoading('deletebook', true);
            try {
                const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/predict/delete' : '/predict/delete', { params: { bookTitle } });
                if (response.data.error) {
                    toast.error(response.data.error);
                } else {
                    toast.success('Livre supprimé avec succès');
                    fetchFutureBooks();
                    fetchCurrentBooks();
                }
            } catch (error) {
                console.error('Error deleting book:', error);
                toast.error('Un problème est survenu lors de la suppression du livre. Réessayez plus tard.');
            } finally {
                setIsLoading('deletebook', false);
            }
        }
    };

    const closeFutureForm = () => {
        fetchFutureBooks();
        fetchCurrentBooks();
        setShowFutureForm(false);
    };

    if (!user) {
        return (
            <div className="unauthorizeduser">
                <h1>Vos lectures, actuelles ou prochaines</h1>
                <p>Veuillez vous connecter pour voir vos lectures.</p>
            </div>
        );
    }

    const isFutureBooksLoading = loadingStates.futurebooks;
    const isBooksDeleting = loadingStates.deletebook;
    const isCurrentBooksLoading = loadingStates.currentbooks;

    return (
        <div className='predict'>
            <div className='current-book-container'>
                <h1>Mes lectures en cours</h1>
                {isCurrentBooksLoading ? (
                    <LoadingAnimation />
                ) : (
                    <div className={`books-list ${CurrentBooks.length > 0 ? '' : 'fornobook'}`}>
                        {CurrentBooks.length > 0 ? (
                            CurrentBooks.map((book) => (
                                <div key={book._id} className="book-item">
                                    <button className="delete-button" onClick={() => deleteBook(book.title)}>x</button>
                                    <Link to={`/book/${book._id}`}>
                                        <img src={book.image} alt={book.title} className="book-image" />
                                    </Link>
                                    <div className="book-details">
                                        <h4>{book.title}</h4>
                                        <p>{book.wordsRead} mots</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='nofavoritebook'>
                                <p>Aucun livre actuel.</p>
                            </div>
                        )}
                    </div >
                )}
            </div>
            <div className="future-book-container">
                <h1>Mes futures lectures</h1>
                {isFutureBooksLoading || isBooksDeleting ? (
                    <LoadingAnimation />
                ) : (
                    <div className={`books-list ${Futurebooks.length > 0 ? '' : 'fornobook'}`}>
                        <button type='button' className="add-book-button" onClick={() => setShowFutureForm(!showFutureForm)}>
                            <i className="fa-solid fa-circle-plus"></i>
                            Ajouter un livre
                        </button>
                        {Futurebooks.length > 0 ? (
                            Futurebooks.map((book) => (
                                <div key={book._id} className="book-item">
                                    <button className="delete-button" onClick={() => deleteBook(book.title)}><i className="fa-solid fa-xmark"></i></button>
                                    <Link to={`/book/${book._id}`}>
                                        <img src={book.image} alt={book.title} className="book-image" />
                                    </Link>
                                    <div className="book-details">
                                        <h4>{book.title}</h4>
                                        <p>{book.wordsRead} mots</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='nobook'>
                                <p>Aucun livre dans ma bibliothèque</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <AddFutureBookForm
                showForm={showFutureForm}
                setShowForm={setShowFutureForm}
                onSuccess={closeFutureForm}
            />
        </div>
    );
};

export default Predictions;
