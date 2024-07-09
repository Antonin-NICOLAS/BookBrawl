import { useContext, useState } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import defaultaccountimage from "../assets/account.jpeg"
import './accounts.css';

function Compte() {
  const { user, setUser } = useContext(UserContext);
  const [image, setImage] = useState(null);
  const [PasswordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmnewPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/logout' : '/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response);

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
      toast.error('Un problème est survenu pendant la déconnection.');
    }
  };

  // Change password
  const handlePasswordChange = (e) => {
    setPasswordData({ ...PasswordData, [e.target.name]: e.target.value });
  };

  const validatePassword = () => {
    const password = document.getElementById("new_password");
    const confirmPassword = document.getElementById("confirm_new_password");
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Les mots de passe diffèrent");
    } else {
      confirmPassword.setCustomValidity('');
    }
  };

  const handleNewPasswordChange = (e) => {
    handlePasswordChange(e);
    validatePassword();
  };

  const changePassword = async (event) => {
    event.preventDefault();
    const { oldPassword, newPassword } = PasswordData;
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "production" ? '/api/change-password' : '/change-password',
        { oldPassword, newPassword },
        { withCredentials: true }
      );

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setPasswordData({ oldPassword: '', newPassword: '', confirmnewPassword: '' });
        toast.success(response.data.message);
        setShowPasswordForm(false);
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Réessayez plus tard.');
      console.error('Error changing password:', error);
    }
  };
  //upload avatar
  const handleAvatarUpload = (event) => {
    setImage(event.target.files[0]);
  };
  const handleAvatarSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter un livre');
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
    } catch (error) {
      console.error('Error adding avatar:', error);
      toast.error('Un problème est survenu. Réessayez plus tard.');
    }
  };

  return (
    <>
        <img src={defaultaccountimage} alt='avatar' />
        <form onSubmit={handleAvatarSubmit} className="book-form">
          <div className="form-group">
            <label htmlFor="image">Avatar :</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleAvatarUpload}
              required
            />
          </div>
          <button type="submit" className="submit-avatar">Ajouter un avatar</button>
        </form>
      <p>{user.prenom}</p>
      <p>{user.nom}</p>
      <p>{user.email}</p>
      <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
        {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
      </button>
      {showPasswordForm && (
        <div className="change-password-form">
          <h1>Changer le mot de passe</h1>
          <form onSubmit={changePassword}>
            <div>
              <label htmlFor="oldpassword">Ancien mot de passe</label>
              <input
                type="password"
                id="old_password"
                name="oldPassword"
                value={PasswordData.oldPassword || ''}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div>
              <label htmlFor="newpassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="new_password"
                name="newPassword"
                value={PasswordData.newPassword || ''}
                onChange={handleNewPasswordChange}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm_newpassword">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                id="confirm_new_password"
                name="confirmnewPassword"
                value={PasswordData.confirmnewPassword || ''}
                onChange={handleNewPasswordChange}
                required
              />
            </div>
            <button type="submit">Changer le mot de passe</button>
          </form>
        </div>
      )}
      <button className="logout" onClick={handleLogout}>
        <i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;&nbsp;Se déconnecter
      </button>
    </>
  );
}

export default Compte;