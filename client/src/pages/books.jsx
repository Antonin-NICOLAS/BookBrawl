import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { toast } from 'react-hot-toast';
import './books.css';

const Books = () => {
    const { user, isLoading: userLoading } = useContext(UserContext);
    const [books, setBooks] = useState([]);
    const [image, setImage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [BookData, setBookData] = useState({
        title: '',
        author: '',
        language: '',
        wordsRead: '',
        startDate: new Date(),
        Readingstatus: '',
        themes: '',
        description: '',
        rating: 0
    });

    const handleBookChange = (e) => {
        setBookData({ ...BookData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (!userLoading && user) {
            fetchBooks();
        }
    }, [userLoading, user]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/userbooks' : '/books/userbooks', {
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

        const formData = new FormData();
        formData.append('title', BookData.title);
        formData.append('author', BookData.author);
        formData.append('language', BookData.language);
        formData.append('wordsRead', BookData.wordsRead);
        formData.append('startDate', BookData.startDate);
        formData.append('Readingstatus', BookData.Readingstatus);
        formData.append('themes', BookData.themes);
        formData.append('description', BookData.description);
        formData.append('rating', BookData.rating);
        formData.append('image', image);

        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/books/addbook' : '/books/addbook', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }, params: { userId: user.id }
            });

            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
                return;
            }

            toast.success('Votre livre a été ajouté');
            setImage(null);
            setShowForm(false);
            setBookData({
                title: '',
                author: '',
                language: '',
                wordsRead: '',
                startDate: new Date(),
                Readingstatus: '',
                themes: '',
                description: '',
                rating: 0
            });
            setImage(null);
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
            <div className="unauthorizeduser">
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
                            name='title'
                            value={BookData.title || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="author">Auteur :</label>
                        <input
                            type="text"
                            id="author"
                            name='author'
                            value={BookData.author || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="language">Langue :</label>
                        <input
                            type="text"
                            id="language"
                            name='language'
                            value={BookData.language || ''}
                            onChange={handleBookChange}
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
                            name='wordsRead'
                            value={BookData.wordsRead || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="startDate">Date de commencement :</label>
                        <input
                            type="date"
                            id="startDate"
                            name='startDate'
                            value={BookData.startDate || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Readingstatus">Statut du livre :</label>
                        <input
                            type="text"
                            id="Readingstatus"
                            name='Readingstatus'
                            value={BookData.Readingstatus || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="themes">Themes :</label>
                        <input
                            type="text"
                            id="themes"
                            name='themes'
                            value={BookData.themes || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description :</label>
                        <textarea
                            type="text"
                            cols="50"
                            rows="2"
                            id="description"
                            name='description'
                            value={BookData.description || ''}
                            onChange={handleBookChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rating">Appréciation :</label>
                        <input
                            type="number"
                            id="rating"
                            name='rating'
                            value={BookData.rating || ''}
                            onChange={handleBookChange}
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