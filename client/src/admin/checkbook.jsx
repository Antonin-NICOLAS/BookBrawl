import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './checkbook.css';

const AdminPage = () => {
  const [unverifiedBooks, setUnverifiedBooks] = useState([]);

  useEffect(() => {
    const fetchUnverifiedBooks = async () => {
      try {
        const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/admin/unverified' : '/admin/unverified');
        setUnverifiedBooks(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des livres en attente de vérification:', error);
      }
    };

    fetchUnverifiedBooks();
  }, []);

  const handleVerifyBook = async (bookId) => {
    try {
      await axios.put(process.env.NODE_ENV === "production" ? `/api/admin/verify/${bookId}` : `/admin/verify/${bookId}`);
      setUnverifiedBooks(unverifiedBooks.filter(book => book._id !== bookId));
    } catch (error) {
      console.error('Erreur lors de la vérification du livre:', error);
    }
  };

  return (
    <div className="admin-page">
      <h1>Livres en attente de vérification</h1>
      {unverifiedBooks.length === 0 ? (
        <p>Aucun livre en attente de vérification.</p>
      ) : (
        <ul>
          {unverifiedBooks.map(book => (
            <li key={book._id} className="book-item">
              <h2>{book.title}</h2>
              <p>Auteur: {book.author}</p>
              <p>Langue: {book.language}</p>
              <p>Nombre de mots: {book.wordsRead}</p>
              <button onClick={() => handleVerifyBook(book._id)}>Vérifier</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPage;
