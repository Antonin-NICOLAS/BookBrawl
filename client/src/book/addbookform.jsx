import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
//Context
import { useLoading } from '../context/LoadingContext';
//CSS
import './addbookform.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function BookForm({ onSuccess }) {
    //context
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [suggestions, setSuggestions] = useState([]);
    const [BookData, setBookData] = useState({
        title: '',
        author: '',
        language: '',
        themes: [],
        wordsRead: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        Readingstatus: '',
        description: '',
        rating: 0
    });
    const [ExistingBookData, setExistingBookData] = useState(null);
    const [image, setImage] = useState(null);

    //gérer les valeurs du form
    const handleBookChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'themes') {
            // Pour les sélections multiples, récupérez les options sélectionnées
            const values = Array.from(e.target.selectedOptions).map(option => option.value);
            setBookData({ ...BookData, [name]: values });
        } else {
            setBookData({ ...BookData, [name]: value });
        }

        if (e.target.name === 'title') {
            if (e.target.value.length > 2) { // Commencez à chercher après 3 caractères
                try {
                    const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/suggest' : '/books/suggest', {
                        params: { title: e.target.value }
                    });
                    if (response.data.error) {
                        console.log(response.data.error)
                    }
                    else {
                        setSuggestions(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSuggestions([]);
            }
        }
    };

    //gérer les valeurs du form si livre existe déjà
    const handleExistingBookChange = (e) => {
        setExistingBookData({ ...ExistingBookData, [e.target.name]: e.target.value });
    };

    //suggestions de titre
    const handleSuggestionClick = async (suggestion) => {
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/checkbook' : '/books/checkbook', {
                params: { title: suggestion.title }
            });

            if (response.data.error) {
                toast.error(response.data.error)
                console.log(response.data.error)
            }
            else {
                setExistingBookData({
                    title: response.data.title,
                    author: response.data.author,
                    image: response.data.image,
                    language: response.data.language,
                    themes: response.data.themes,
                    wordsRead: response.data.wordsRead,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    Readingstatus: '',
                    description: '',
                    rating: 0
                });
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching book data:', error);
        }
    };

    //soumission du form
    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading('addbook', true);
        const formData = new FormData();
        if (ExistingBookData) {
            //pour la vérification du livre
            formData.append('title', ExistingBookData.title);
            formData.append('author', ExistingBookData.author);
            formData.append('language', ExistingBookData.language);
            formData.append('wordsRead', ExistingBookData.wordsRead);
            // les nouvelles données
            formData.append('startDate', ExistingBookData.startDate);
            formData.append('endDate', ExistingBookData.endDate);
            formData.append('Readingstatus', ExistingBookData.Readingstatus);
            formData.append('description', ExistingBookData.description);
            formData.append('rating', ExistingBookData.rating);
        } else {
            formData.append('title', BookData.title);
            formData.append('author', BookData.author);
            formData.append('language', BookData.language);
            formData.append('themes', JSON.stringify(BookData.themes));
            formData.append('wordsRead', BookData.wordsRead);
            formData.append('startDate', BookData.startDate);
            formData.append('endDate', BookData.endDate);
            formData.append('Readingstatus', BookData.Readingstatus);
            formData.append('description', BookData.description);
            formData.append('rating', BookData.rating);
            formData.append('image', image); // Utiliser le fichier image téléchargé
        }

        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/books/addbook' : '/books/addbook', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
                return;
            }

            toast.success('Votre livre a été ajouté');
            setImage(null);
            onSuccess();
            setBookData({
                title: '',
                author: '',
                language: '',
                wordsRead: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                Readingstatus: '',
                themes: [],
                description: '',
                rating: 0
            });
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('addbook', false);
        }
    };

    const isNewBookLoading = loadingStates.addbook;

    return (
        <div className="book-overlay">
            {isNewBookLoading ? (
                <LoadingAnimation />
            ) : (
                <div className="wrapper-book">
                    <form onSubmit={handleSubmit} className="book-form">
                        {ExistingBookData ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="title">Titre :</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name='title'
                                        value={ExistingBookData.title}
                                        autoComplete="off"
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="title">Auteur :</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name='title'
                                        value={ExistingBookData.author}
                                        autoComplete="off"
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="image">Image :</label>
                                    <img src={ExistingBookData.image} alt={ExistingBookData.title} className="book-image" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="language">Langue :</label>
                                    <p>{ExistingBookData.language}</p>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="themes">Thèmes :</label>
                                    {ExistingBookData.themes.map(theme => (
                                        <p key={theme} value={theme}>{theme}</p>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="wordsRead">Mots lus :</label>
                                    <input
                                        type="number"
                                        id="wordsRead"
                                        name='wordsRead'
                                        value={ExistingBookData.wordsRead}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="startDate">Date de commencement :</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name='startDate'
                                        value={ExistingBookData.startDate || ''}
                                        onChange={handleExistingBookChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endDate">Date de fin :</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name='endDate'
                                        value={ExistingBookData.endDate || ''}
                                        onChange={handleExistingBookChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Readingstatus">Statut du livre :</label>
                                    <select
                                        id="Readingstatus"
                                        name='Readingstatus'
                                        value={ExistingBookData.Readingstatus || ''}
                                        onChange={handleExistingBookChange}
                                        required>
                                        <option value="">Sélectionnez un statut</option>
                                        <option value="lu">Lu</option>
                                        <option value="en train de lire">En train de lire</option>
                                        <option value="à lire">À lire</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description :</label>
                                    <textarea
                                        type="text"
                                        cols="50"
                                        rows="2"
                                        id="description"
                                        name='description'
                                        value={ExistingBookData.description || ''}
                                        onChange={handleExistingBookChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="rating">Appréciation :</label>
                                    <input
                                        type="number"
                                        id="rating"
                                        name='rating'
                                        value={ExistingBookData.rating || ''}
                                        onChange={handleExistingBookChange}
                                        min="0"
                                        max="5"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="title">Titre :</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name='title'
                                        value={BookData.title}
                                        onChange={handleBookChange}
                                        required
                                        autoComplete="off"
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="suggestions">
                                            {suggestions.map((suggestion) => (
                                                <li key={suggestion._id} onClick={() => handleSuggestionClick(suggestion)}>
                                                    {suggestion.title}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                    <label htmlFor="language">Langue :</label>
                                    <select
                                        id="language"
                                        name='language'
                                        value={BookData.language || ''}
                                        onChange={handleBookChange}
                                        required
                                    >
                                        <option value="">Sélectionnez une langue</option>
                                        <option value="Français">Français</option>
                                        <option value="Anglais">Anglais</option>
                                        <option value="Espagnol">Espagnol</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="themes">Themes :</label>
                                    <select
                                        id="themes"
                                        name='themes'
                                        value={BookData.themes || []}
                                        onChange={handleBookChange}
                                        multiple={true}
                                        size="6"
                                    >
                                        <option value="Action">Action</option>
                                        <option value="Dystopie">Dystopie</option>
                                        <option value="Fantaisie">Fantaisie</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Magie">Magie</option>
                                        <option value="Méditation">Méditation</option>
                                        <option value="Young Adult">Young Adult</option>
                                        <option value="Paranormal">Paranormal</option>
                                        <option value="Philosophie">Philosophie</option>
                                        <option value="Romance">Romance</option>
                                        <option value="Science-fiction">Science-fiction</option>
                                    </select>
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
                                    <label htmlFor="endDate">Date de fin :</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name='endDate'
                                        value={BookData.endDate || ''}
                                        onChange={handleBookChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Readingstatus">Statut du livre :</label>
                                    <select
                                        id="Readingstatus"
                                        name='Readingstatus'
                                        value={BookData.Readingstatus || ''}
                                        onChange={handleBookChange}
                                        required>
                                        <option value="">Sélectionnez un statut</option>
                                        <option value="lu">Lu</option>
                                        <option value="en train de lire">En train de lire</option>
                                        <option value="à lire">À lire</option>
                                    </select>
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
                                        min="0"
                                        max="5"
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <button type="submit" className="submit-button">Ajouter le livre</button>
                    </form>
                </div>)}
        </div>
    );
}

export default BookForm;
