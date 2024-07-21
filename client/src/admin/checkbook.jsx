import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { AdminContext } from "../context/adminContext";
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//CSS
import './checkbook.css';

const AdminPage = () => {
  //Context
  const { user, isLoading } = useContext(UserContext);
  const { isAdmin } = useContext(AdminContext);
  const { setIsLoading, loadingStates } = useLoading();
  const [unverifiedBooks, setUnverifiedBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [updatedBook, setUpdatedBook] = useState({
    title: '',
    author: '',
    wordsRead: ''
  });
  const [editFormPosition, setEditFormPosition] = useState({ top: 0, left: 0 });
  const editFormRef = useRef(null);
  const bookRefs = useRef({});


  //attendre Usercontext
  useEffect(() => {
    if (!isLoading && user && isAdmin === true) {
      fetchUnverifiedBooks();
    }
  }, [isLoading, user, isAdmin]);


  const fetchUnverifiedBooks = async () => {
    setIsLoading('books', true)
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/admin/unverified' : '/admin/unverified');
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setUnverifiedBooks(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des livres en attente de vérification:', error);
      toast.error('Un problème est survenu lors de la récupération des livres. Réessayez plus tard.');
    }
  };


  //livre vérifié
  const handleVerifyBook = async (bookId) => {
    try {
      const response = await axios.put(process.env.NODE_ENV === "production" ? `/api/admin/verify/${bookId}` : `/admin/verify/${bookId}`);
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setUnverifiedBooks(unverifiedBooks.filter(book => book._id !== bookId));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du livre:', error);
      toast.error('Un problème est survenu lors de l\'envoi du livre. Réessayez plus tard.');
    }
  };

  //si besoin, il faut éditer
  const handleEditClick = (bookId) => {
    const book = unverifiedBooks.find(book => book._id === bookId);
    setSelectedBook(book);
    setUpdatedBook({
      title: book.title,
      author: book.author,
      wordsRead: book.wordsRead
    });

    const rect = bookRefs.current[bookId].getBoundingClientRect();
    setEditFormPosition({ top: rect.bottom + window.scrollY, left: rect.left + 50 });
  };

  const CloseForm = () => {
    setSelectedBook(null)
    setUpdatedBook({
      title: '',
      author: '',
      wordsRead: ''
    });
  }
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBook((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (bookId) => {
    console.log(bookId)
    try {
      const response = await axios.put(process.env.NODE_ENV === "production" ? `/api/admin/update/${bookId}` : `/admin/update/${bookId}`, updatedBook);
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        toast.success('Livre mis à jour avec succès');
        setSelectedBook(null);
        setUpdatedBook({
          title: '',
          author: '',
          wordsRead: ''
        });
        fetchUnverifiedBooks();
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Erreur lors de la mise à jour du livre');
    }
  };

  if (isAdmin === false) {
    return (
      <div className="unauthorizeduser">
        <h1>Ceci est une page Administrateur</h1>
        <p>Vous devez avoir une promotion par l'administrateur réseau.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Livres en attente de vérification</h1>
      {unverifiedBooks.length === 0 ? (
        <p>Aucun livre en attente de vérification.</p>
      ) : (
        <>
          <div id="grid">
            {unverifiedBooks.map(book => (
              <div className='unverifiedbook' key={book._id} ref={el => bookRefs.current[book._id] = el}>
                <table className="card-layout">
                  <tbody>
                  <tr>
                      <th rowSpan="3"><img src={book.image} alt={book.title} /></th>
                      <th>Auteur</th>
                      <th>Nombre de mots</th>
                      <th>Langue</th>
                      <th>Soumis par</th>
                    </tr>
                    <tr>
                      <td>{book.author}</td>
                      <td>{book.wordsRead}</td>
                      <td>{book.language}</td>
                      <td>{book.pastReaders[0].prenom}</td>
                    </tr>
                    <tr>
                      <td colSpan="2"><button onClick={() => handleEditClick(book._id)}>Éditer</button></td>
                      <td colSpan="2"><button onClick={() => handleVerifyBook(book._id)}>Vérifier</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedBook && (
        <div className='bookmodification'
        ref={editFormRef} 
        style={{ position: 'absolute', top: editFormPosition.top, left: editFormPosition.left, zIndex: 1000 }}>
          <button className='closeform' onClick={() => CloseForm()}>X</button>
          <h2>Éditer le Livre</h2>
          <input
            type="text"
            name="title"
            value={updatedBook.title}
            onChange={handleInputChange}
            placeholder="Titre"
          />
          <input
            type="text"
            name="author"
            value={updatedBook.author}
            onChange={handleInputChange}
            placeholder="Auteur"
          />
          <input
            type="number"
            name="wordsRead"
            value={updatedBook.wordsRead}
            onChange={handleInputChange}
            placeholder="Nombre de mots"
          />
          <button className='update' onClick={() => handleUpdate(selectedBook._id)}>Mettre à Jour</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;