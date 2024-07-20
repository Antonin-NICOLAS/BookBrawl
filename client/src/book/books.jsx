import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/footer'
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//Form
import AddBookForm from './addbookform';
import AddFutureBookForm from './addfuturebookform';
//CSS
import './books.css';
//LOADER//
import LoadingAnimation from '../components/loader';

const Books = () => {
    //Context
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [books, setBooks] = useState([]);
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    //future
    const [Futurebooks, setFutureBooks] = useState([]);
    const [CurrentBooks, setCurrentBooks] = useState([]);
    const [showFutureForm, setShowFutureForm] = useState(false);

    //attendre Usercontext
    useEffect(() => {
        if (!isLoading && user) {
            fetchBooks();
            fetchFavoriteBooks();
            fetchFutureBooks();
            fetchCurrentBooks();
        }
    }, [isLoading, user]);

    //livres
    const fetchBooks = async () => {
        setIsLoading('books', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/userbooks' : '/books/userbooks');
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                setBooks(response.data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Un problème est survenu lors de la récupération des livres. Réessayez plus tard.');
        } finally {
            setIsLoading('books', false);
        }
    };

    //livres favoris
    const fetchFavoriteBooks = async () => {
        setIsLoading('favoriteBooks', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/userfavoritebooks' : '/books/userfavoritebooks');
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                setFavoriteBooks(response.data);
            }
        } catch (error) {
            console.error('Error fetching favorite books:', error);
            toast.error('Un problème est survenu lors de la récupération des livres favoris. Réessayez plus tard.');
        } finally {
            setIsLoading('favoriteBooks', false);
        }
    };

    //livres futurs
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

    //livres actuels
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
                const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/delete' : '/books/delete', { params: { bookTitle } });
                if (response.data.error) {
                    toast.error(response.data.error);
                } else {
                    toast.success('Livre supprimé avec succès');
                    fetchBooks();
                    fetchFavoriteBooks();
                }
            } catch (error) {
                console.error('Error deleting book:', error);
                toast.error('Un problème est survenu lors de la suppression du livre. Réessayez plus tard.');
            } finally {
                setIsLoading('deletebook', false);
            }
        }
    };

    //supprimer un livre futur
    const deleteFutureBook = async (bookTitle) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce livre ? Cette action est irréversible.")) {
            setIsLoading('futuredeletebook', true);
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
                setIsLoading('futuredeletebook', false);
            }
        }
    };

    const closeForm = () => {
        fetchBooks();
        fetchFavoriteBooks();
        setShowForm(false);
    };

    const closeFutureForm = () => {
        fetchFutureBooks();
        fetchCurrentBooks();
        setShowFutureForm(false);
    };

    if (!user) {
        return (
            <div className="unauthorizeduser">
                <h1>Vos Livres et lectures actuelles ou futures</h1>
                <p>Veuillez vous connecter pour voir vos livres.</p>
            </div>
        );
    }

    const isBooksLoading = loadingStates.books;
    const isBooksDeleting = loadingStates.deletebook;
    const isFavoriteBooksLoading = loadingStates.favoriteBooks;
    const isFutureBooksLoading = loadingStates.futurebooks;
    const isFutureBooksDeleting = loadingStates.futuredeletebook;
    const isCurrentBooksLoading = loadingStates.currentbooks;

    return (
        <>
            <div className='books'>
                <div className="nowbooks">
                    <div className='favorite-book-container'>
                        <h1>Vos Livres Favoris</h1>
                        {isFavoriteBooksLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <div className={`books-list ${favoriteBooks.length > 0 ? '' : 'fornobook'}`}>
                                {favoriteBooks.length > 0 ? (
                                    favoriteBooks.map((book) => (
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
                                        <p>Aucun livre favori. Vous pouvez en ajouter un en le notant 5 étoiles</p>
                                    </div>
                                )}
                            </div >
                        )}
                    </div>
                    <div className="book-container">
                        <h1>Ma bibliothèque</h1>
                        {isBooksLoading || isBooksDeleting ? (
                            <LoadingAnimation />
                        ) : (
                            <div className={`books-list ${books.length > 0 ? '' : 'fornobook'}`}>
                                <button type='button' className="add-book-button" onClick={() => setShowForm(!showForm)}>
                                    <i className="fa-solid fa-circle-plus"></i>
                                    Ajouter un livre
                                </button>
                                {books.length > 0 ? (
                                    books.map((book) => (
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
                </div>
                <div className="futurebooks">
                    <div className='current-book-container'>
                        <h1>Mes lectures en cours</h1>
                        {isCurrentBooksLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <div className={`books-list ${CurrentBooks.length > 0 ? '' : 'fornobook'}`}>
                                {CurrentBooks.length > 0 ? (
                                    CurrentBooks.map((book) => (
                                        <div key={book._id} className="book-item">
                                            <button className="delete-button" onClick={() => deleteFutureBook(book.title)}>x</button>
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
                                    <div className='nocurrentbook'>
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
                                            <button className="delete-button" onClick={() => deleteFutureBook(book.title)}><i className="fa-solid fa-xmark"></i></button>
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
                    </div>
                <AddBookForm
                    showForm={showForm}
                    setShowForm={setShowForm}
                    onSuccess={closeForm}
                />
                <AddFutureBookForm
                    showForm={showFutureForm}
                    setShowForm={setShowFutureForm}
                    onSuccess={closeFutureForm}
                />
            </div>

            <Footer />
        </>
    );
};

export default Books;