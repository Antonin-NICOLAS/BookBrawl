import React, { useState, useRef, useEffect } from 'react';
import './wordcalculator.css';
import { motion } from 'framer-motion';

function WordsCalculator({ showWordCountMenu, setShowWordCountMenu, BookData, setBookData }) {
    const [pages, setPages] = useState('');
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [line3, setLine3] = useState('');
    const [page1, setPage1] = useState('');
    const [page2, setPage2] = useState('');

    const overlayBookRef = useRef(null);
    const wrapperBookRef = useRef(null);

    const handleClickOutside = (event) => {
        if (overlayBookRef.current && wrapperBookRef.current && overlayBookRef.current.contains(event.target) && !wrapperBookRef.current.contains(event.target)) {
            handleWordClose();
        }
    };

    useEffect(() => {
        if (showWordCountMenu) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showWordCountMenu]);

    const handleWordClose = () => {
        setShowWordCountMenu(false);
        setLine1('');
        setLine2('');
        setLine3('');
        setPage1('');
        setPage2('');
        setPages('');
    };

    const calculateWordCount = () => {
        const avgWordsPerLine = (parseInt(line1) + parseInt(line2) + parseInt(line3)) / 3;
        const avgLinesPerPage = (parseInt(page1) + parseInt(page2)) / 2;
        const totalWords = Math.ceil(avgWordsPerLine * avgLinesPerPage * parseInt(pages));
        setBookData({ ...BookData, wordsRead: totalWords });
    };

    return (
        <div ref={overlayBookRef} className={`word-overlay ${showWordCountMenu ? 'show' : 'hide'}`}>
            <div ref={wrapperBookRef} className="word-count-menu">
                <span className="close-word" onClick={handleWordClose}><i className="fa-solid fa-xmark"></i></span>
                <h3>Calculer le nombre de mots</h3>
                <div className="form-group">
                    <label htmlFor="line1">Nombre de mots dans la première ligne :</label>
                    <input
                        type="number"
                        id="line1"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="line2">Nombre de mots dans la deuxième ligne :</label>
                    <input
                        type="number"
                        id="line2"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="line3">Nombre de mots dans la troisième ligne :</label>
                    <input
                        type="number"
                        id="line3"
                        value={line3}
                        onChange={(e) => setLine3(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="page1">Nombre de lignes sur la première page :</label>
                    <input
                        type="number"
                        id="page1"
                        value={page1}
                        onChange={(e) => setPage1(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="page2">Nombre de lignes sur la deuxième page :</label>
                    <input
                        type="number"
                        id="page2"
                        value={page2}
                        onChange={(e) => setPage2(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pages">Nombre de pages :</label>
                    <input
                        type="number"
                        id="pages"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        required
                    />
                </div>
                <button className='submitwords' type="button" onClick={calculateWordCount}>Calculer</button>
                {BookData.wordsRead && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        style={{
                            marginTop: 'calc(3px + 2vh)',
                            fontSize: 'calc(6px + 2vh)',
                            color: 'var(--3)',
                            fontWeight: '800'
                        }}
                    >
                        {BookData.wordsRead}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default WordsCalculator;