import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
//rating
import StarRating from '../components/star-rating';
//Context
import { UserContext } from '../context/userContext'
import { useLoading } from '../context/LoadingContext';
//CSS
import './markasread.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function BookReadPopup(props) {
    //context
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [closing, setClosing] = useState(false);
    //form
    const [rating, setRating] = useState(0);
    const [newThemes, setNewThemes] = useState([]);
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
        image: ''
    });

    //fermer la popup
    const handleBookClose = () => {
        setBookData({
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
            image: ''
        });
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            props.setTrigger(false);
        }, 300);
    }
    //overlay click
    const overlayBookRef = useRef(null);
    const wrapperBookRef = useRef(null);
    const handleClickOutside = (event) => {
        if (overlayBookRef.current && wrapperBookRef.current && overlayBookRef.current.contains(event.target) && !wrapperBookRef.current.contains(event.target)) {
            handleBookClose();
        }
    };
    useEffect(() => {
        if (props.trigger) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [props.trigger]);

    /////////start/////////
    useEffect(() => {
        if (!isLoading && user && props.bookId) {
            fetchBook();
        }
    }, [isLoading, user, props.bookId]);

    //récupérer livre
    const fetchBook = async () => {
        setIsLoading('book', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/books/${props.bookId}` : `/books/${props.bookId}`);
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                const book = response.data;
                setBookData({
                    title: book.title,
                    author: book.author,
                    language: book.language,
                    themes: book.themes,
                    wordsRead: book.wordsRead,
                    startDate: book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    endDate: book.endDate ? new Date(book.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    Readingstatus: 'Lu',
                    description: book.description,
                    rating: book.rating,
                    image: book.image
                });
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
        } finally {
            setIsLoading('book', false);
        }
    };
    //gérer les valeurs du form
    //rating
    const handleRatingChange = (newRating) => {
        setRating(newRating);
        setBookData({ ...BookData, rating: newRating });
    };
    //themes
    const handleThemeChange = (selectedOptions) => {
        setNewThemes(selectedOptions.map(option => option.value));
    };
    //gérer les dates
    const today = new Date().toISOString().split('T')[0];
    const minDate = '2024-07-01';

    //reste
    const handleBookChange = async (e) => {
        setBookData({ ...BookData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        setIsLoading('markasread', true);
        const formData = new FormData();
    
        if (!BookData.rating) {
            toast.error('Vous devez noter le livre');
            setIsLoading('markasread', false);
            return;
        }
    
        formData.append('startDate', BookData.startDate);
        formData.append('endDate', BookData.endDate);
        formData.append('description', BookData.description);
        formData.append('rating', BookData.rating);
    
        // Récupérer les thèmes si le livre n'en avait pas (créé dans le cadre d'une lecture future)
        const themes = BookData.themes.length > 0 ? BookData.themes : newThemes;
        formData.append('themes', JSON.stringify(themes));
        console.log('FormData:', ...formData.entries());
    
        try {
            console.log(props.bookId)
            const response = await axios.post(
                process.env.NODE_ENV === "production" ? `/api/predict/${props.bookId}/markasread` : `/predict/${props.bookId}/markasread`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
    
            if (response.data.error) {
                toast.error(response.data.error);
                console.log(response.data.error);
            } else {
                toast.success('Votre livre a été ajouté');
                handleBookClose();
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Un problème est survenu. Réessayez plus tard.');
        } finally {
            setIsLoading('markasread', false);
        }
    };

    const isNewBookLoading = loadingStates.markasread;

    return (
        <div ref={overlayBookRef} className="book-overlay">
            {isNewBookLoading ? (
                <LoadingAnimation />
            ) : (
                <div ref={wrapperBookRef} className={`wrapper-book ${closing ? "animate-bookpopup-close" : "animate-bookpopup"}`}>
                    <span className="close-book" onClick={handleBookClose}><i className="fa-solid fa-xmark"></i></span>
                    <form onSubmit={handleSubmit} className="book-form">
                        <h2>Ajouter un livre lu</h2>
                        <div className="big-form-group">
                            <div className="sub-form-group">
                                <input
                                    type="text"
                                    id="title"
                                    name='title'
                                    placeholder='Titre'
                                    value={BookData.title}
                                    onChange={handleBookChange}
                                    readOnly
                                />
                            </div>
                            <div className="sub-form-group">
                                <input
                                    type="text"
                                    id="author"
                                    name='author'
                                    placeholder='Auteur'
                                    value={BookData.author || ''}
                                    onChange={handleBookChange}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <input
                                type="url"
                                id="image"
                                name="image"
                                placeholder='ou inclure un URL de la couverture'
                                value={BookData.image || ''}
                                onChange={handleBookChange}
                                readOnly
                            />
                        </div>
                        <div className="big-form-group">
                            <div className="sub-form-group">
                                <Select
                                    id="themes"
                                    name="themes"
                                    placeholder="Sélectionnez un ou plusieurs thèmes"
                                    value={themeOptions.filter(option => BookData.themes.includes(option.value))}
                                    onChange={handleThemeChange}
                                    isDisabled={BookData.themes.length > 0}
                                    isMulti
                                    options={themeOptions}
                                    styles={{
                                        placeholder: (baseStyles) => ({
                                            ...baseStyles,
                                            color: 'var(--color-text-body)'
                                        }),
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            backgroundColor: "transparent",
                                            borderRadius: "5px",
                                            borderColor: "var(--color-text-body)",
                                            '&:hover': { borderColor: 'gray' }
                                        }),
                                        dropdownIndicator: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "var(--color-text-body)"
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
                                            color: "var(--color-text-body)"
                                        }),
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            backgroundColor: "transparent",
                                            borderRadius: "5px",
                                            borderColor: "var(--color-text-body)",
                                            '&:hover': { borderColor: 'gray' }
                                        }),
                                        dropdownIndicator: (baseStyles) => ({
                                            ...baseStyles,
                                            color: "var(--color-text-body)"
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
                                    isDisabled
                                />
                            </div>
                        </div>
                        <div className="big-form-group">
                            <div className="sub-form-group">
                                <input
                                    type="number"
                                    id="wordsRead"
                                    name='wordsRead'
                                    min="0"
                                    placeholder='Nombre de mots lus'
                                    value={BookData.wordsRead || ''}
                                    onChange={handleBookChange}
                                    readOnly
                                />
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
                        <button type="submit" className="submitbookform">Ajouter le livre</button>
                    </form>
                </div>)
            }
        </div >
    );
}

export default BookReadPopup;