import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { toast } from 'react-hot-toast';
import './books.css';

const Books = () => {
    const { user, isLoading: userLoading } = useContext(UserContext);
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [wordsRead, setWordsRead] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userLoading && user) {
            fetchBooks();
        }
    }, [userLoading, user]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/userbooks' : '/userbooks', {
                params: { userId: user.id }
            });

            if (response.data.error) {
                toast.error(response.data.error);
                setIsLoading(false);
                return;
            }

            setBooks(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
            setIsLoading(false);
        }
    };

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user) {
            toast.error('Veuillez vous connecter pour ajouter un livre');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', image);
        formData.append('wordsRead', wordsRead);
        formData.append('userId', user.id);

        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/addbook' : '/addbook', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
                return;
            }

            toast.success('Votre livre a été ajouté');
            setTitle('');
            setImage(null);
            setWordsRead('');
            setShowForm(false);
            setBooks([...books, response.data]);
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        }
    };

    if (userLoading) {
        return <p>Chargement...</p>;
    }

    if (!user) {
        return (
            <div className="book-container">
                <h1>Vos Livres</h1>
                <p>Veuillez vous connecter pour voir vos livres.</p>
            </div>
        );
    }

    return (
        <div className="book-container">
            <h1>Vos Livres</h1>
            {isLoading ? (
                <p>Chargement...</p>
            ) : (
                <div className="books-list">
                    {books.map((book) => (
                        <div key={book._id} className="book-item">
                            <img src={book.image} alt={book.title} className="book-image" />
                            <div className="book-details">
                                <h2>{book.title}</h2>
                                <p>Mots lus : {book.wordsRead}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <button className="add-book-button" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Masquer le formulaire' : 'Ajouter un livre'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="book-form">
                    <div className="form-group">
                        <label htmlFor="title">Titre :</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Image :</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="wordsRead">Mots lus :</label>
                        <input
                            type="number"
                            id="wordsRead"
                            value={wordsRead}
                            onChange={(e) => setWordsRead(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Ajouter un livre</button>
                </form>
            )}
        </div>
    );
};

export default Books;