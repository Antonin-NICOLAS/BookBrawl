import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './book-details.css'

const BookDetails = () => {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/books/${bookId}` : `/books/${bookId}`); // Remplacez par votre endpoint API pour récupérer les détails du livre
                setBook(response.data);
            } catch (error) {
                console.error('Error fetching book details:', error);
            }
        };

        fetchBook();
    }, [bookId]);

    if (!book) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="book-details-page">
            <h2>{book.title}</h2>
            <img src={book.image} alt={book.title} />
            {/* Affichez d'autres détails du livre selon votre besoin */}
        </div>
    );
};

export default BookDetails;