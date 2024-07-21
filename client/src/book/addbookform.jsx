import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
//rating
import StarRating from '../components/star-rating';
//Context
import { useLoading } from '../context/LoadingContext';
import { AdminContext } from "../context/adminContext";
//CSS
import './addbookform.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function BookForm({ onSuccess, showForm, setShowForm }) {
    //context
    const { setIsLoading, loadingStates } = useLoading();
    const { isAdmin } = useContext(AdminContext);
    //others
    const [suggestions, setSuggestions] = useState([]);
    const [rating, setRating] = useState(0);
    const [BookData, setBookData] = useState({
        title: '',
        author: '',
        language: '',
        themes: [],
        wordsRead: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        Readingstatus: 'Lu',
        description: '',
        rating: 0,
        imageUrl: ''
    });
    const [ExistingBookData, setExistingBookData] = useState(null);
    const [image, setImage] = useState(null);

    //gérer les valeurs du form
    //rating
    const handleRatingChange = (newRating) => {
        setRating(newRating);
        setBookData({ ...BookData, rating: newRating });
    };
    //gérer les dates
    const today = new Date().toISOString().split('T')[0];
    const minDate = '2024-07-01';

    //reste
    const handleBookChange = async (e) => {
        const { name, value } = e.target;

        setBookData({ ...BookData, [name]: value });

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
                        setSuggestions([]);
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
    //gérer les selects
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
        { value: 'Science-fiction', label: '👽 Science-fiction', color: "#CB912F", backgroundcolor: "#FBF3DB90", backgroundcolorhover: "#FBF3DB", selectedcolor: "#FFDC49" }
    ];
    const languageOptions = [
        { value: 'Français', label: 'Français', color: "#337EA9", backgroundcolor: "#E7F3F890", backgroundcolorhover: "#E7F3F8", selectedcolor: "#529CCA" },
        { value: 'Anglais', label: 'Anglais', color: "#C14C8A", backgroundcolor: "#FAF1F590", backgroundcolorhover: "#FAF1F5", selectedcolor: "#E255A1" },
        { value: 'Espagnol', label: 'Espagnol', color: "#D44C47", backgroundcolor: "#FDEBEC90", backgroundcolorhover: "#FDEBEC", selectedcolor: "#FF7369" }
    ];

    //gérer les valeurs du form si livre existe déjà
    const handleExistingBookChange = (e) => {
        setExistingBookData({ ...ExistingBookData, [e.target.name]: e.target.value });
    };

    const handleNewRatingChange = (newRating) => {
        setRating(newRating);
        setExistingBookData({ ...ExistingBookData, rating: newRating });
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
                    Readingstatus: 'Lu',
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
            //vérifier le rating
            if (!ExistingBookData.rating) {
                toast.error('Vous devez noter le livre');
                return;
            }
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
            formData.append('isAdmin', isAdmin);
        } else {
            //vérifier les images
            if (!image && !BookData.imageUrl) {
                toast.error('Vous devez fournir soit une image, soit une URL d\'image.');
                return;
            }
            //vérifier le rating
            if (!BookData.rating) {
                toast.error('Vous devez noter le livre');
                return;
            }
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
            formData.append('isAdmin', isAdmin);
            if (image) {
                formData.append('image', image); // Utiliser le fichier image téléchargé
            } else if (BookData.imageUrl) {
                formData.append('imageUrl', BookData.imageUrl); // Utiliser l'URL de l'image
            }
        }

        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/books/add' : '/books/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                params: { BookTitle: BookData.title }
            });

            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
                setBookData({
                    title: '',
                    author: '',
                    language: '',
                    wordsRead: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    Readingstatus: 'Lu',
                    themes: [],
                    description: '',
                    rating: 0,
                    imageUrl: ''
                });
                setExistingBookData(null)
            } else {
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
                    Readingstatus: 'Lu',
                    themes: [],
                    description: '',
                    rating: 0,
                    imageUrl: ''
                });
                setExistingBookData(null)
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('addbook', false);
        }
    };

    //overlay click
    const overlayBookRef = useRef(null);
    const wrapperBookRef = useRef(null);
    const handleClickOutside = (event) => {
        if (overlayBookRef.current && wrapperBookRef.current && overlayBookRef.current.contains(event.target) && !wrapperBookRef.current.contains(event.target)) {
            handleBookClose();
        }
    };
    useEffect(() => {
        if (showForm) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showForm]);

    //function close
    const handleBookClose = () => setShowForm(false)

    const isNewBookLoading = loadingStates.addbook;

    return (
        <div ref={overlayBookRef} className={`book-overlay ${showForm ? 'show' : 'hide'}`}>
            {isNewBookLoading ? (
                <LoadingAnimation />
            ) : (
                <div ref={wrapperBookRef} className="wrapper-book">
                    <span className="close-book" onClick={handleBookClose}><i className="fa-solid fa-xmark"></i></span>
                    <form onSubmit={handleSubmit} className="book-form">
                        <h2>Ajouter un livre</h2>
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
                                    <label htmlFor="author">Auteur :</label>
                                    <input
                                        type="text"
                                        id="author"
                                        name='author'
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
                                    <label htmlFor="description">Avis :</label>
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
                                    <label>Note :</label>
                                    <StarRating rating={rating} setRating={handleNewRatingChange} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="big-form-group">
                                    <div className="sub-form-group">
                                        <input
                                            type="text"
                                            id="title"
                                            name='title'
                                            placeholder='Titre'
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
                                    <div className="sub-form-group">
                                        <input
                                            type="text"
                                            id="author"
                                            name='author'
                                            placeholder='Auteur'
                                            value={BookData.author || ''}
                                            onChange={handleBookChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="image">Choisir une image parmis vos fichiers</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="url"
                                        id="imageUrl"
                                        name="imageUrl"
                                        placeholder='ou inclure un URL de la couverture'
                                        value={BookData.imageUrl}
                                        onChange={handleBookChange}
                                    />
                                </div>
                                <div className="big-form-group">
                                    <div className="sub-form-group">
                                        <Select
                                            id="themes"
                                            name="themes"
                                            placeholder="Sélectionnez un ou plusieurs thèmes"
                                            value={themeOptions.filter(option => BookData.themes.includes(option.value))}
                                            onChange={(selectedOptions) => {
                                                setBookData({
                                                    ...BookData,
                                                    themes: selectedOptions ? selectedOptions.map(option => option.value) : []
                                                });
                                            }}
                                            options={themeOptions}
                                            styles={{
                                                placeholder: (baseStyles) => ({
                                                    ...baseStyles,
                                                    color: "black"
                                                }),
                                                control: (baseStyles) => ({
                                                    ...baseStyles,
                                                    backgroundColor: "transparent",
                                                    borderRadius: "5px",
                                                    borderColor: "gray",
                                                    '&:hover': { borderColor: 'black' }
                                                }),
                                                dropdownIndicator: (baseStyles) => ({
                                                    ...baseStyles,
                                                    color: "black"
                                                }),
                                                option: (baseStyles, { data }) => ({
                                                    ...baseStyles,
                                                    color: data.color,
                                                    backgroundColor: data.backgroundcolor,
                                                    '&:hover': { backgroundColor: data.backgroundcolorhover },
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "5px",
                                                    marginBottom: "10px",
                                                    marginLeft: "10px",
                                                    marginRight: "10px",
                                                    width: "fit-content",
                                                }),
                                                multiValue: (baseStyles, { data }) => ({
                                                    ...baseStyles,
                                                    color: "#000",
                                                    '&:hover': { backgroundColor: data.selectedcolor },
                                                    backgroundColor: data.selectedcolor,
                                                }),
                                                multiValueRemove: (baseStyles, { data }) => ({
                                                    ...baseStyles,
                                                    color: "#000",
                                                    '&:hover': { backgroundColor: data.color, color: "#000" },
                                                }),
                                                menuList: (baseStyles) => ({
                                                    ...baseStyles,
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                    justifyContent: "space-around",
                                                    paddingLeft: "10px",
                                                    paddingRight: "10px",
                                                    paddingTop: "10px",
                                                    width: "fit-content",
                                                }),
                                                menu: (baseStyles) => ({
                                                    ...baseStyles,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "100%",
                                                    backgroundColor: "#FFFFFF"
                                                }),
                                            }}
                                            isMulti
                                            required
                                        />
                                    </div>
                                    <div className='sub-form-group'>
                                        <Select
                                            id="language"
                                            name="language"
                                            placeholder="-- Langue --"
                                            value={languageOptions.find(option => option.value === BookData.language)}
                                            onChange={(selectedOption) => {
                                                setBookData({ ...BookData, language: selectedOption ? selectedOption.value : '' });
                                            }}
                                            options={languageOptions}
                                            styles={{
                                                placeholder: (baseStyles) => ({
                                                    ...baseStyles,
                                                    color: "black"
                                                }),
                                                control: (baseStyles) => ({
                                                    ...baseStyles,
                                                    backgroundColor: "transparent",
                                                    borderRadius: "5px",
                                                    borderColor: "gray",
                                                    '&:hover': { borderColor: 'black' }
                                                }),
                                                dropdownIndicator: (baseStyles) => ({
                                                    ...baseStyles,
                                                    color: "black"
                                                }),
                                                option: (baseStyles, { data }) => ({
                                                    ...baseStyles,
                                                    color: data.color,
                                                    backgroundColor: data.backgroundcolor,
                                                    '&:hover': { backgroundColor: data.backgroundcolorhover },
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "5px",
                                                    marginBottom: "10px",
                                                    marginLeft: "10px",
                                                    marginRight: "10px",
                                                    width: "fit-content",
                                                }),
                                                singleValue: (baseStyles, { data }) => ({
                                                    ...baseStyles,
                                                    color: data.selectedcolor,
                                                    '&:hover': { backgroundColor: data.color },
                                                }),
                                                menuList: (baseStyles) => ({
                                                    ...baseStyles,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    paddingLeft: "10px",
                                                    paddingRight: "10px",
                                                    paddingTop: "10px",
                                                    width: "fit-content",
                                                }),
                                                menu: (baseStyles) => ({
                                                    ...baseStyles,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "100%",
                                                    backgroundColor: "#FFFFFF"
                                                }),
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="big-form-group">
                                    <div className="sub-form-group">
                                        <input
                                            type="number"
                                            id="wordsRead"
                                            name='wordsRead'
                                            placeholder='Nombre de mots lus'
                                            value={BookData.wordsRead || ''}
                                            onChange={handleBookChange}
                                            required
                                        />
                                    </div>
                                    <div className="sub-form-group">
                                        <button type="button">Calculer le nombre de mots</button>
                                    </div>
                                </div>
                                <div className="big-form-group">
                                    <div className="sub-form-group">
                                        <label htmlFor="startDate">Date de commencement :</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name='startDate'
                                            min={minDate}
                                            max={BookData.endDate || today}
                                            value={BookData.startDate || ''}
                                            onChange={handleBookChange}
                                            required
                                        />
                                    </div>
                                    <div className="sub-form-group">
                                        <label htmlFor="endDate">Date de fin :</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name='endDate'
                                            min={BookData.startDate || minDate}
                                            max={today}
                                            value={BookData.endDate || ''}
                                            onChange={handleBookChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <textarea
                                        type="text"
                                        cols="50"
                                        rows="2"
                                        id="description"
                                        name='description'
                                        placeholder='Votre ressenti concernant ce livre'
                                        value={BookData.description || ''}
                                        onChange={handleBookChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Note :</label>
                                    <StarRating rating={rating} setRating={handleRatingChange} />
                                </div>
                            </>
                        )}
                        <button type="submit" className="submitbookform">Ajouter le livre</button>
                    </form>
                </div>)}
        </div>
    );
}

export default BookForm;
