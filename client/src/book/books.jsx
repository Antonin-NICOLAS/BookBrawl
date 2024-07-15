import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//Form
import AddBookForm from './addbookform';
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

    //attendre Usercontext
    useEffect(() => {
        if (!isLoading && user) {
            fetchBooks();
            fetchFavoriteBooks();
        }
    }, [isLoading, user]);

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
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('books', false);
        }
    };

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
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('favoriteBooks', false);
        }
    };

    const closeForm = () => {
        fetchBooks();
        fetchFavoriteBooks();
        setShowForm(false);
    };

    if (!user) {
        return (
            <div className="unauthorizeduser">
                <h1>Vos Livres</h1>
                <p>Veuillez vous connecter pour voir vos livres.</p>
            </div>
        );
    }

    const isBooksLoading = loadingStates.books;
    const isFavoriteBooksLoading = loadingStates.favoriteBooks;

    return (
        <div className='books'>
            <div className='favorite-book-container'>
                <h1>Vos Livres Favoris</h1>
                {isFavoriteBooksLoading ? (
                    <LoadingAnimation />
                ) : (
                    <div className="books-list">
                        {favoriteBooks.length > 0 ? (
                            favoriteBooks.map((book) => (
                                <div key={book._id} className="book-item">
                                    <img src={book.image} alt={book.title} className="book-image" />
                                    <div className="book-details">
                                        <h4>{book.title}</h4>
                                        <p>Mots lus : {book.wordsRead}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>
                                <p>Aucun livre favori. Vous pouvez en ajouter un en le notant 5 étoiles</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="book-container">
                <h1>Ma bibliothèque</h1>
                {isBooksLoading ? (
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
                                <p>Aucun livre lu</p>
                            </div>
                        )}
                    </div>
                )}
                {showForm && (
                    <AddBookForm onSuccess={closeForm} />
                )}
            </div>
        </div>
    );
};

export default Books;