import { useContext, useState } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import defaultaccountimage from "../assets/account.jpeg";
import './accounts.css';

function Compte({onPasswordClick}) {
  const { user, setUser, isLoading: userLoading } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState(null);

  // Logout
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

  // Upload avatar
  const handleAvatarUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter un avatar');
      return;
    }

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
      setShowForm(false);
      setUser(response.data); // Met à jour le contexte utilisateur avec les nouvelles données
    } catch (error) {
      console.error('Error adding avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  //ouvrir popup changement de mot de passe :
  const handlePasswordClick = () => {
      onPasswordClick();
  };
  
  if (userLoading) {
    return <p>Chargement...</p>
  }

  return (
    <>
      <div className="account1">
        <div className="identity-card">
          <div className="identity-left">
            <img src={user.avatar || defaultaccountimage} alt={user.prenom} className="avatar" />
            <button className="buttonaddavatar" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Annuler' : "Changer d'avatar"}
            </button>
            {showForm && (<form onSubmit={handleAvatarSubmit} className="avatar-form">
              <div className="form-group">
                <label htmlFor="image">
                  <span>Avatar :</span><br />
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
            </form>)}
          </div>
          <div className="identity-right">
            <span>{user.prenom}</span>
            <span>{user.nom}</span>
            <span>{user.email}</span>
            <button className="buttonchangepassword" onClick={handlePasswordClick}>
        Changer le mot de passe
      </button>
      <button className="logout" onClick={handleLogout}>
        <i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;&nbsp;Se déconnecter
      </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Compte;