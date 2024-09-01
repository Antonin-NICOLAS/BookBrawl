import React, { useContext, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
//images
import defaultaccountimage from "../assets/account.jpeg";
import FullStar from '../assets/starrating.png';
import HalfStar from '../assets/halfstarrating.png';
//Context
import { UserContext } from "../context/userContext";
import { useLoading } from '../context/LoadingContext';
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
//CSS
import './accounts.css';
//LOADER//
import LoadingAnimation from '../components/loader';

function Compte({ onPasswordClick }) {
  //Context
  const { user, setUser, isLoading } = useContext(UserContext);
  const { setIsLoading, loadingStates } = useLoading();
  //others
  const [avatar, setAvatar] = useState(null);
  const [status, setStatus] = useState(null);
  const [words, setwords] = useState(null);
  const [StatusData, setStatusData] = useState({
    status: ''
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [rewards, setRewards] = useState([]);
  //form
  const [showAvatarForm, setshowAvatarForm] = useState(false);
  const [showStatusForm, setshowStatusForm] = useState(false);
  const [image, setImage] = useState(null);
  //sections
  const [activeSection, setActiveSection] = useState('status');

  //attendre Usercontext
  useEffect(() => {
    if (!isLoading && user) {
      fetchRecentBooks();
      verifyRewards();
      fetchUserAvatar();
      fetchUserStatus();
      fetchUserWords();
    }
  }, [isLoading, user]);

  ////////////status et avatar et livres récents et wordsread
  //status

  const fetchUserStatus = async () => {
    setIsLoading('status', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/userstatus' : '/user/userstatus', {
      });
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    } finally {
      setIsLoading('status', false);
    }
  };

  //avatar
  const fetchUserAvatar = async () => {
    setIsLoading('avatar', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/useravatar' : '/user/useravatar', {
      });
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setAvatar(response.data.avatar);
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    } finally {
      setIsLoading('avatar', false);
    }
  };

  //livres récents
  const fetchRecentBooks = async () => {
    setIsLoading('recentBooks', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/userrecentbooks' : '/books/userrecentbooks', {
      });

      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setRecentBooks(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent books:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    } finally {
      setIsLoading('recentBooks', false);
    }
  };

  const fetchUserWords = async () => {
    setIsLoading('words', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/userwords' : '/user/userwords', {
      });
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        setwords(response.data.words);
      }
    } catch (error) {
      console.error('Error fetching user words:', error);
      toast.error('Un problème est survenu lors de la récupération des mots lus.');
    } finally {
      setIsLoading('words', false);
    }
  };

  //submit avatar & status
  //avatar
  const handleAvatarUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();
    setIsLoading('avatarchange', true);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/user/addavatar' : '/user/addavatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      } else {
        toast.success('Votre avatar a été ajouté');
        setImage(null);
        setshowAvatarForm(false);
        setAvatar(response.data.avatar);
      }
    } catch (error) {
      console.error('Error adding avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    } finally {
      setIsLoading('avatarchange', false);
    }
  };

  //status
  const handleStatusChange = (e) => {
    setStatusData({ ...StatusData, [e.target.name]: e.target.value });
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    setIsLoading('statuschange', true);

    const { status } = StatusData

    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/user/addstatus' : '/user/addstatus', {
        status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data.error) {
        console.log(response.data.error);
        toast.error(response.data.error);
      } else {
        setStatusData({});
        toast.success('Votre statut a été modifié !');
        setshowStatusForm(false);
        setStatus(response.data.status);
      }
    } catch (error) {
      console.log("erreur lors de la modification du statut", error);
      toast.error('Un problème est survenu. réessayez plus tard.');
    } finally {
      setIsLoading('statuschange', false);
    }
  };


  //rewards
  const verifyRewards = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/rewards/checkrewards' : '/rewards/checkrewards', {
      });

      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      }
      else {
        fetchRewards();
      }

    } catch (error) {
      console.error("Erreur lors de la récupération des récompenses :", error);
      //toast.error('Un problème est survenu. Réessayez plus tard.'); => pas de toast car si 404 => normal => pas forcément de nouveu reward débloqué
    }
  };

  const fetchRewards = async () => {
    setIsLoading('rewards', true);
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/rewards/userrewards' : '/rewards/userrewards', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      }
      else {
        setRewards(response.data);
      }

    } catch (error) {
      console.error("Erreur lors de la récupération des récompenses :", error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    } finally {
      setIsLoading('rewards', false);
    }
  };

  //logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/logout' : '/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        toast.error('La déconnexion a échouée.');
      }

      else {
        toast.success('Vous êtes déconnecté !');
        setUser(null);
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }

    } catch (error) {
      console.log(error);
      toast.error('Un problème est survenu pendant la déconnexion.');
    }
  };

  //ouvrir la popup
  const handlePasswordClick = () => {
    onPasswordClick();
  };

  //convertir date en date lisible
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  };

  //animations
  const menuanim = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'status':
        return (
          <div className="status section-content">
            {isStatusChanging || isStatusLoading ? (
              <LoadingAnimation />
            ) : (
              <>
                <h3>Votre statut</h3>
                <p>{status || "Aucun statut défini"}</p>
                <button className="buttonaddstatus" onClick={() => setshowStatusForm(!showStatusForm)}>{showStatusForm ? "Annuler" : "Modifier le statut"}</button>
                <div className={`wrapper-status-form ${showStatusForm ? 'active' : ''}`}>
                  <form onSubmit={handleStatusSubmit} className="status-form">
                    <div className="form-status-group">
                      <label htmlFor="status">
                        <span>Nouveau statut :</span><br />
                        <textarea
                          id="status"
                          name="status"
                          rows="2"
                          cols="50"
                          value={StatusData.status || ''}
                          onChange={handleStatusChange}
                          required
                        />
                      </label>
                    </div>
                    <button type="submit" className="submitstatus">Ajouter comme statut</button>
                  </form>
                </div>
              </>
            )}
          </div>
        );
      case 'words':
        return (
          <div className="words section-content">
            <h3>Mots lus</h3>
            {isWordsLoading ? (
              <LoadingAnimation />
            ) : (
              <p>{words}</p>
            )}
            <h3>Derniers livres lus</h3>
            {isRecentBooksLoading ? (
              <LoadingAnimation />
            ) : (
              <table className="books-table">
                <tbody>
                  {recentBooks.length > 0 ? (
                    recentBooks.map((book) => {
                      const rating = book.reviews[0].rating;
                      const fullStars = Math.floor(rating);
                      const hasHalfStar = rating % 1 !== 0;

                      return (
                        <React.Fragment key={book._id}>
                          <tr>
                            <td className='column1' rowSpan="3">
                              <Link to={`/book/${book._id}`} className="recentbooklink">
                                <img src={book.image} alt={book.title} className="book-image" />
                              </Link>
                            </td>
                            <td className="column2">
                              <p>
                                <span>{book.title}</span>, {book.author}
                              </p>
                            </td>
                            <td className="column3">
                              <p>{formatDate(book.reviews[0].endDate)}</p>
                            </td>
                          </tr>
                          <tr>
                            <td className="column2">{book.wordsRead}</td>
                            <td className="column3" rowSpan="2">
                              <button>See more</button>
                            </td>
                          </tr>
                          <tr>
                            <td className="column2 rating">
                              <div className="stars">
                                {[...Array(fullStars)].map((_, i) => (
                                  <img key={i} src={FullStar} alt="full star" className="star-image" />
                                ))}
                                {hasHalfStar && <img src={HalfStar} alt="half star" className="star-image" />}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3">Aucun livre récent disponible.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        );
      case 'rewards':
        return (
          <div className="rewards section-content">
            {isRewardsLoading ? (
              <LoadingAnimation recentBooks={recentBooks} isLoading={isRecentBooksLoading} />
            ) : (
              <>
                <div className="reward-category">
                  <h3>Mots</h3>
                  {rewards.filter(reward => reward.criteria === 'word').length > 0 ? (
                    <div className="reward-section">
                      {rewards.filter(reward => reward.criteria === 'word').map(reward => (
                        <img key={reward._id} src={reward.icon} alt={reward.name} />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      <p>Aucune récompense pour les mots</p>
                    </ul>
                  )}
                </div>
                <div className="reward-category">
                  <h3>Livres</h3>
                  {rewards.filter(reward => reward.criteria === 'book').length > 0 ? (
                    <div className="reward-section">
                      {rewards.filter(reward => reward.criteria === 'book').map(reward => (
                        <img key={reward._id} src={reward.icon} alt={reward.name} />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      <p>Aucune récompense pour les livres</p>
                    </ul>
                  )}
                </div>
                <div className="reward-category">
                  <h3>Participation</h3>
                  {rewards.filter(reward => reward.criteria === 'participation').length > 0 ? (
                    <div className="reward-section">
                      {rewards.filter(reward => reward.criteria === 'participation').map(reward => (
                        <img key={reward._id} src={reward.icon} alt={reward.name} />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      <p>Aucune récompense pour la participation</p>
                    </ul>
                  )}
                </div>
                <div className="reward-category">
                  <h3>Création</h3>
                  {rewards.filter(reward => reward.criteria === 'creation').length > 0 ? (
                    <div className="reward-section">
                      {rewards.filter(reward => reward.criteria === 'creation').map(reward => (
                        <img key={reward._id} src={reward.icon} alt={reward.name} />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      <p>Aucune récompense pour la création</p>
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const isAvatarLoading = loadingStates.avatar;
  const isStatusLoading = loadingStates.status;
  const isWordsLoading = loadingStates.words;
  const isAvatarChanging = loadingStates.avatarchange;
  const isStatusChanging = loadingStates.statuschange;
  const isRecentBooksLoading = loadingStates.recentBooks;
  const isRewardsLoading = loadingStates.rewards;

  return (
    <>
      <div className="account">
        <div className="account1">
          <div className={`identity-card ${showAvatarForm ? 'large' : ""}`}>
            <div className="identity-const">
              {isAvatarChanging || isAvatarLoading || isLoading ? (
                <LoadingAnimation />
              ) : (
                <div className="identity-left">
                  <img src={avatar || defaultaccountimage} alt={user.prenom} className="avatar" />
                  <button className="buttonaddavatar" onClick={() => setshowAvatarForm(!showAvatarForm)}>
                    {showAvatarForm ? 'Annuler' : "Changer d'avatar"}
                  </button>
                </div>
              )}
              <div className="identity-right">
                {isLoading ? (
                  <LoadingAnimation />
                ) : (
                  <>
                    <span>{user.prenom}</span>
                    <span>{user.nom}</span>
                    <span>{user.email}</span>
                  </>
                )}
                <button className="buttonchangepassword" onClick={handlePasswordClick}>
                  Changer le mot de passe
                </button>
                <button className="logout" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;&nbsp;Se déconnecter
                </button>
              </div>
            </div>
            <div className={`wrapper-avatar-form ${showAvatarForm ? 'active' : ''}`}>
              <form onSubmit={handleAvatarSubmit} className="avatar-form">
                <div className="form-avatar-group">
                  <label htmlFor="image">
                    <span>Nouvel avatar :</span><br />
                    <span className="button-image">Choisir une image</span>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="submitavatar">Ajouter cette image comme avatar</button>
              </form>
            </div>
          </div>
        </div>
        <div className="account2" >
          <div className="renderSection">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1, transition: { duration: 0.5 } }}
              className="accountnav">
              <motion.button onClick={() => setActiveSection('status')}
                initial="hidden"
                animate="visible"
                variants={menuanim}
                className={activeSection === 'status' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-circle-user"></i>
                </span>
                <span className="text">Statut</span>
              </motion.button>
              <motion.button onClick={() => setActiveSection('words')}
                initial="hidden"
                animate="visible"
                variants={menuanim}
                className={activeSection === 'words' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-chart-simple"></i>
                </span>
                <span className="text">Statistiques</span>
              </motion.button>
              <motion.button onClick={() => setActiveSection('rewards')}
                initial="hidden"
                animate="visible"
                variants={menuanim}
                className={activeSection === 'rewards' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-award"></i>
                </span>
                <span className="text">Récompenses</span>
              </motion.button>
            </motion.div>
            {renderSection()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Compte;