import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
//Context
import { useLoading } from '../context/LoadingContext';
//CSS
import './addfuturebookform.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function FutureBookForm({ onSuccess, showForm, setShowForm }) {
    //context
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [suggestions, setSuggestions] = useState([]);
    const [FutureBookData, setFutureBookData] = useState({
        title: '',
        author: '',
        language: '',
        wordsRead: '',
        Readingstatus: '',
        imageUrl: '',
        //pas obligatoire :
        themes: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [ExistingBookData, setExistingBookData] = useState(null);
    const [image, setImage] = useState(null);

    //gérer les valeurs du form

    //gérer les dates
    const today = new Date().toISOString().split('T')[0];
    const minDate = '2024-07-01';

    //reste
    const handleBookChange = async (e) => {
        const { name, value } = e.target;

        setFutureBookData({ ...FutureBookData, [name]: value });

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
    const readingOptions = [
        { value: 'À lire', label: 'À lire', color: "#337EA9", backgroundcolor: "#E7F3F890", backgroundcolorhover: "#E7F3F8", selectedcolor: "#529CCA" },
        { value: 'En train de lire', label: 'En train de lire', color: "#C14C8A", backgroundcolor: "#FAF1F590", backgroundcolorhover: "#FAF1F5", selectedcolor: "#E255A1" },
    ];

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
                    //à remplir
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    Readingstatus: ''
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

        setIsLoading('addfuturebook', true);
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
        } else {
            //vérifier les images
            if (!image && !FutureBookData.imageUrl) {
                toast.error('Vous devez fournir soit une image, soit une URL d\'image.');
                return;
            }
            formData.append('title', FutureBookData.title);
            formData.append('author', FutureBookData.author);
            formData.append('language', FutureBookData.language);
            formData.append('themes', JSON.stringify(FutureBookData.themes));
            formData.append('wordsRead', FutureBookData.wordsRead);
            formData.append('startDate', FutureBookData.startDate);
            formData.append('endDate', FutureBookData.endDate);
            formData.append('Readingstatus', FutureBookData.Readingstatus);
            if (image) {
                formData.append('image', image); // Utiliser le fichier image téléchargé
            } else if (FutureBookData.imageUrl) {
                formData.append('imageUrl', FutureBookData.imageUrl); // Utiliser l'URL de l'image
            }
        }

        try {
            const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/books/add' : '/books/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                params: { BookTitle: FutureBookData.title }
            });

            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
                setFutureBookData({
                    title: '',
                    author: '',
                    language: '',
                    wordsRead: '',
                    Readingstatus: '',
                    imageUrl: '',
                    //pas obligatoire
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    themes: [],
                });
                setExistingBookData(null)
            } else {
                toast.success('Votre livre a été ajouté');
                setImage(null);
                onSuccess();
                setFutureBookData({
                    title: '',
                    author: '',
                    language: '',
                    wordsRead: '',
                    Readingstatus: '',
                    imageUrl: '',
                    //pas obligatoire
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    themes: [],
                });
                setExistingBookData(null)
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('addfuturebook', false);
        }
    };

    //overlay click
    const overlayFutureBookRef = useRef(null);
    const wrapperFutureBookRef = useRef(null);
    const handleClickOutside = (event) => {
        if (overlayFutureBookRef.current && wrapperFutureBookRef.current && overlayFutureBookRef.current.contains(event.target) && !wrapperFutureBookRef.current.contains(event.target)) {
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

    const isNewBookLoading = loadingStates.addfuturebook;

    return (
        <div ref={overlayFutureBookRef} className={`predict-overlay ${showForm ? 'show' : 'hide'}`}>
            {isNewBookLoading ? (
                <LoadingAnimation />
            ) : (
                <div ref={wrapperFutureBookRef} className="wrapper-future-book">
                    <span className="close-book" onClick={handleBookClose}><i className="fa-solid fa-xmark"></i></span>
                    <form onSubmit={handleSubmit} className="predict-form">
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
                                    />
                                </div>
                                <div className='form-group'>
                                        <Select
                                            id="Readingstatus"
                                            name="Readingstatus"
                                            placeholder="-- Statut de la lecture --"
                                            value={readingOptions.find(option => option.value === ExistingBookData.Readingstatus)}
                                            onChange={(selectedOption) => {
                                                setExistingBookData({ ...ExistingBookData, Readingstatus: selectedOption ? selectedOption.value : '' });
                                            }}
                                            options={readingOptions}
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
                                            value={FutureBookData.title}
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
                                            value={FutureBookData.author || ''}
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
                                        value={FutureBookData.imageUrl}
                                        onChange={handleBookChange}
                                    />
                                </div>
                                <div className="big-form-group">
                                    <div className="sub-form-group">
                                        <Select
                                            id="themes"
                                            name="themes"
                                            placeholder="Sélectionnez un ou plusieurs thèmes"
                                            value={themeOptions.filter(option => FutureBookData.themes.includes(option.value))}
                                            onChange={(selectedOptions) => {
                                                setFutureBookData({
                                                    ...FutureBookData,
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
                                        />
                                    </div>
                                    <div className='sub-form-group'>
                                        <Select
                                            id="language"
                                            name="language"
                                            placeholder="-- Langue --"
                                            value={languageOptions.find(option => option.value === FutureBookData.language)}
                                            onChange={(selectedOption) => {
                                                setFutureBookData({ ...FutureBookData, language: selectedOption ? selectedOption.value : '' });
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
                                            value={FutureBookData.wordsRead || ''}
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
                                            max={FutureBookData.endDate || today}
                                            value={FutureBookData.startDate || ''}
                                            onChange={handleBookChange}
                                        />
                                    </div>
                                    <div className="sub-form-group">
                                        <label htmlFor="endDate">Date de fin :</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name='endDate'
                                            min={FutureBookData.startDate || minDate}
                                            max={today}
                                            value={FutureBookData.endDate || ''}
                                            onChange={handleBookChange}
                                        />
                                    </div>
                                </div>
                                <div className='form-group'>
                                        <Select
                                            id="Readingstatus"
                                            name="Readingstatus"
                                            placeholder="-- Statut de la lecture --"
                                            value={readingOptions.find(option => option.value === FutureBookData.Readingstatus)}
                                            onChange={(selectedOption) => {
                                                setFutureBookData({ ...FutureBookData, Readingstatus: selectedOption ? selectedOption.value : '' });
                                            }}
                                            options={readingOptions}
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
                            </>
                        )}
                        <button type="submit" className="submitpredictform">Ajouter le livre</button>
                    </form>
                </div>)}
        </div>
    );
}

export default FutureBookForm;
