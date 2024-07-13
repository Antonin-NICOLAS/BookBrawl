import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import defaultaccountimage from "../assets/account.jpeg";
import Star from '../assets/starrating.png'
import './accounts.css';

function Compte({ onPasswordClick }) {
  const { user, setUser, isLoading: userLoading } = useContext(UserContext);
  const [StatusData, setStatusData] = useState({
    status: ''
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [showAvatarForm, setshowAvatarForm] = useState(false);
  const [showStatusForm, setshowStatusForm] = useState(false);
  const [image, setImage] = useState(null);
  const [activeSection, setActiveSection] = useState('status');
  const [avatar, setAvatar] = useState(null);
  const [status, setStatus] = useState(null);


  // Combiner les useEffect pour recent books et rewards
  useEffect(() => {
    if (!userLoading && user) {
      fetchRecentBooks();
      verifyRewards();
      fetchUserAvatar();
      fetchUserStatus();
    }
  }, [userLoading, user]);

  ////////////status et avatar et livres récents
  //status

  const fetchUserStatus = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/userstatus' : '/userstatus', {
      });
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
        return;
      }
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching user status:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  //avatar
  const fetchUserAvatar = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/useravatar' : '/useravatar', {
      });
      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
        return;
      }
      setAvatar(response.data.avatar);
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  //livres récents
  const fetchRecentBooks = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/books/userrecentbooks' : '/books/userrecentbooks', {
      });

      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
        return;
      }

      setRecentBooks(response.data);
    } catch (error) {
      console.error('Error fetching recent books:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  //submit avatar & status
  //avatar
  const handleAvatarUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/addavatar' : '/addavatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      toast.success('Votre avatar a été ajouté');
      setImage(null);
      setshowAvatarForm(false);
      setAvatar(response.data.avatar);
    } catch (error) {
      console.error('Error adding avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  //status
  const handleStatusChange = (e) => {
    setStatusData({ ...StatusData, [e.target.name]: e.target.value });
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    const { status } = StatusData
    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/addstatus' : '/addstatus', {
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
        return;
      }

      fetchRewards();
    } catch (error) {
      console.error("Erreur lors de la récupération des récompenses :", error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/rewards/userrewards' : '/rewards/userrewards', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
        return;
      }

      setRewards(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des récompenses :", error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
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
      } else {
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

  const handlePasswordClick = () => {
    onPasswordClick();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'status':
        return (
          <div className="status section-content">
            {user ? (
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
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        );
      case 'words':
        return (
          <div className={`words section-content ${recentBooks.length > 2 ? 'large' : ''}`}>
            {user ? (
              <>
                <h3>Mots lus</h3>
                <p>{user.words}</p>
                <h3>Derniers livres lus</h3>
                <table className="books">
                  <tbody>
                    {recentBooks.length > 0 ? (
                      recentBooks.map(book => (
                        <>
                          <tr key={book._id}>
                            <td className='column1' rowSpan="3"><img src={book.image} alt={book.title} /></td>
                            <td className="column2"><p><span>{book.title}</span>, {book.author}</p></td>
                            <td className="column3"><p>{formatDate(book.addedAt)}</p></td>
                          </tr>
                          <tr key={book._id + "_wordsRead"}>
                            <td className="column2">{book.wordsRead}</td>
                            <td className="column3" rowSpan="2"><button>See more</button></td>
                          </tr>
                          <tr key={book._id + "_rating"}>
                            <td className="column2 rating">
                              <div className="stars">
                                {[...Array(book.rating)].map((_, i) => (
                                  <img key={i} src={Star} alt="star" className="star-image" />
                                ))}
                              </div>
                            </td>
                          </tr>
                        </>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">Aucun livre récent</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        );
      case 'rewards':
        return (
          <div className="rewards section-content">
            {user ? (
              <>
                <div className="reward-category">
                  <h3>Mots</h3>
                  <div className="word-reward">
                    {rewards.filter(reward => reward.criteria === 'word').length > 0 ? (
                      rewards.filter(reward => reward.criteria === 'word').map(reward => (
                        <img key={reward._id} src={reward.icon} alt={reward.name} />
                      ))
                    ) : (
                      <p>Aucune récompense pour les mots</p>
                    )}
                  </div>
                </div>
                <div className="reward-category">
                  <h3>Livres</h3>
                  <ul>
                    {rewards.filter(reward => reward.criteria === 'book').length > 0 ? (
                      rewards.filter(reward => reward.criteria === 'book').map(reward => (
                        <li key={reward._id}>
                          <img src={reward.icon} alt={reward.name} />
                          <span>{reward.name}</span>
                          <p>{reward.description}</p>
                        </li>
                      ))
                    ) : (
                      <p>Aucune récompense pour les livres</p>
                    )}
                  </ul>
                </div>
                <div className="reward-category">
                  <h3>Participation</h3>
                  <ul>
                    {rewards.filter(reward => reward.criteria === 'participation').length > 0 ? (
                      rewards.filter(reward => reward.criteria === 'participation').map(reward => (
                        <li key={reward._id}>
                          <img src={reward.icon} alt={reward.name} />
                          <span>{reward.name}</span>
                          <p>{reward.description}</p>
                        </li>
                      ))
                    ) : (
                      <p>Aucune récompense pour la participation</p>
                    )}
                  </ul>
                </div>
                <div className="reward-category">
                  <h3>Création</h3>
                  <ul>
                    {rewards.filter(reward => reward.criteria === 'creation').length > 0 ? (
                      rewards.filter(reward => reward.criteria === 'creation').map(reward => (
                        <li key={reward._id}>
                          <img src={reward.icon} alt={reward.name} />
                          <span>{reward.name}</span>
                          <p>{reward.description}</p>
                        </li>
                      ))
                    ) : (
                      <p>Aucune récompense pour la création</p>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="account">
        <div className="account1">
          <div className={`identity-card ${showAvatarForm ? 'large' : ""}`}>
            <div className="identity-const">
              <div className="identity-left">
                {user ? (
                  <>
                    <img src={avatar || defaultaccountimage} alt={user.prenom} className="avatar" />
                    <button className="buttonaddavatar" onClick={() => setshowAvatarForm(!showAvatarForm)}>
                      {showAvatarForm ? 'Annuler' : "Changer d'avatar"}
                    </button>
                  </>
                ) : (
                  <img src={defaultaccountimage} alt="default" className="avatar" />
                )}
              </div>
              <div className="identity-right">
                {user ? (
                  <>
                    <span>{user.prenom}</span>
                    <span>{user.nom}</span>
                    <span>{user.email}</span>
                    <button className="buttonchangepassword" onClick={handlePasswordClick}>
                      Changer le mot de passe
                    </button>
                    <button className="logout" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;&nbsp;Se déconnecter
                    </button>
                  </>
                ) : (
                  <p>Chargement...</p>
                )}
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
        <div className={`account2 ${activeSection === 'words' && recentBooks.length > 2 ? 'large' : ''} ${activeSection === 'rewards' ? 'large' : ''} ${activeSection === 'status' && showStatusForm ? 'large' : ''}`} >
          <div className="renderSection">
            <div className="accountnav">
              <button onClick={() => setActiveSection('status')} className={activeSection === 'status' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-circle-user"></i>
                </span>
                <span className="text">Statut</span>
              </button>
              <button onClick={() => setActiveSection('words')} className={activeSection === 'words' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-chart-simple"></i>
                </span>
                <span className="text">Statistiques</span>
              </button>
              <button onClick={() => setActiveSection('rewards')} className={activeSection === 'rewards' ? 'active' : ''}>
                <span className="icon">
                  <i className="fa-solid fa-award"></i>
                </span>
                <span className="text">Récompenses</span>
              </button>
            </div>
            {renderSection()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Compte;