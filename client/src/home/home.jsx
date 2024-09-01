import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
//LOADER//
import LoadingAnimation from '../components/loader';
//CSS
import './home.css'

function Home() {
  //Context
  const { user, isLoading } = useContext(UserContext);
  const { setIsLoading, loadingStates } = useLoading();
  const [recentbooks, setRecentBooks] = useState([]);

  //attendre Usercontext
  useEffect(() => {
    if (!isLoading && user) {
      fetchRecentBooks();
    }
  }, [isLoading, user]);

  //livres
  const fetchRecentBooks = async () => {
    setIsLoading('recentbooks', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/home/last-read-books' : '/home/last-read-books');
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setRecentBooks(response.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Un problème est survenu lors de la récupération des livres. Réessayez plus tard.');
    } finally {
      setIsLoading('recentbooks', false);
    }
  };

  //retrouver couleur des themes
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
    { value: 'Science-fiction', label: '👽 Science-fiction', color: "#CB912F", backgroundcolor: "#FBF3DB90", backgroundcolorhover: "#FBF3DB", selectedcolor: "#FFDC49" },
    { value: 'Policier', label: '👮 Policier', color: "#9F6B53", backgroundcolor: "#F4EEEE90", backgroundcolorhover: "#F4EEEE", selectedcolor: "#937264" }
  ];

  const getThemeOption = (theme) => {
    return themeOptions.find(option => option.value === theme);
  };

  // Trier les livres par date de fin décroissante
  const sortedBooks = recentbooks.sort((a, b) => {
    const dateA = new Date(a.reviews[a.reviews.length - 1].endDate);
    const dateB = new Date(b.reviews[b.reviews.length - 1].endDate);
    return dateB - dateA; // Trier par date décroissante
  });

  const areRecentBooksLoading = loadingStates.recentbooks;

  return (
    <>
      <iframe
        src="https://o4gxyez9102nrm.embednotionpage.com/Book-Brawl-a8c34d21f72a4a9dbc73a4b1f7373c16?pvs=74"
      ></iframe>
      {user ? (
        <div className="last-read-books-table-container">
          <h2>Derniers Livres Lus par la Communauté</h2>
          {areRecentBooksLoading ? (
            <LoadingAnimation />
          ) : (
            recentbooks.length === 0 ? (
              <div className="no-books-message">Aucun livre récent trouvé.</div>
            ) : (
              <div className="last-read-table-container">
                <table className="last-read-books-table">
                  <thead>
                    <tr>
                      <th className="column1">Image</th>
                      <th className="column2">Titre</th>
                      <th className="column3">Auteur</th>
                      <th className="column4">Langue</th>
                      <th className="column5">Thèmes</th>
                      <th className="column6">Lecteur</th>
                      <th className="column7">Note</th>
                      <th className="column8">Date de Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBooks.map(book => (
                      <tr key={book._id}>
                        <td className="column1"><Link to={`/book/${book._id}`}><img src={book.image} alt={book.title} className="book-image" /></Link></td>
                        <td className="column2"><Link to={`/book/${book._id}`}>{book.title}</Link></td>
                        <td className="column3">{book.author}</td>
                        <td className="column4">{book.language}</td>
                        <td className="column5"><ul>{book.themes && book.themes.length > 0 ? (
                          book.themes.map((theme, index) => {
                            const themeOption = getThemeOption(theme);
                            return (
                              <li
                                key={index}
                                className='thème'
                                style={{
                                  color: themeOption ? themeOption.color : 'inherit',
                                  backgroundColor: themeOption ? themeOption.backgroundcolor : 'inherit'
                                }}
                              >
                                {themeOption.label}
                              </li>
                            );
                          })
                        ) : (
                          <li>Pas de thème associé</li>
                        )}</ul></td>
                        <td className="column6"><Link to={`/user/${book.pastReaders[book.pastReaders.length - 1]._id}`}>{book.pastReaders[book.pastReaders.length - 1].prenom}</Link></td>
                        <td className="column7">{book.reviews[book.reviews.length - 1].rating}</td>
                        <td className="column8">{new Date(book.reviews[book.reviews.length - 1].endDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )
          }
        </div>
      ) : (
        <>
          <h1>Derniers Livres Lus par la Communauté</h1>
          <p>Veuillez vous connecter pour voir les livres.</p>
        </>
      )}
    </>
  );
}

export default Home;
