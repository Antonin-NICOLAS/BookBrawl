import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { toast } from 'react-hot-toast';
import './books.css';

const Books = () => {
    const { user } = useContext(UserContext);
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [wordsRead, setWordsRead] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            if (!user) return;
            if (user) {
                try {
                    const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/userbooks' : '/userbooks', {
                        params: { userId: user.id }
                    });
                    setBooks(response.data);

                    if (response.error) {
                        console.log(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error('Error fetching books:', error);
                    toast.error('Un problème est survenu. Réessayez plus tard.');
                }
            };
        }

        fetchBooks();
    }, [user]);

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user) {
            toast.error('Veuillez vous connectez pour ajouter un livre');
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

            toast.success('Votre livre a été ajouté');
            // Reset form
            setTitle('');
            setImage(null);
            setWordsRead('');
            setShowForm(false);
            setBooks([...books, response.data]);

            if (response.error) {
                console.log(response.error)
                toast.error(response.error)
            }

        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. réessayez plus tard.');
        }
    };

    return (
        <div className="book-container">
            <h1>Your Books</h1>
            {!user ? (
                <div>Vous n'êtes pas connecté</div>
            ) : (
            <div className="books-list">
                {books.map((book) => (
                    <div key={book._id} className="book-item">
                        <img src={book.image} alt={book.title} className="book-image" />
                        <div className="book-details">
                            <h2>{book.title}</h2>
                            <p>Words Read: {book.wordsRead}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
            <button className="add-book-button" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Hide Form' : 'Add a Book'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="book-form">
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Image:</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="wordsRead">Words Read:</label>
                        <input
                            type="number"
                            id="wordsRead"
                            value={wordsRead}
                            onChange={(e) => setWordsRead(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Add Book</button>
                </form>
            )}
        </div>
    );
};

export default Books;