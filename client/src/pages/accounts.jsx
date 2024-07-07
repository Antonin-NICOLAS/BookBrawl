import { useContext } from "react";
import { UserContext } from "../context/userContext"
import { toast } from "react-hot-toast";
import axios from "axios";
import './accounts.css'

function Compte() {
    const { user, setUser } = useContext(UserContext)

      //logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(process.env.NODE_ENV === "production" ? '/api/logout' : '/logout', {
        withCredentials: true,
        headers: {'Content-Type': 'application/json'
          }
      });
      console.log(response);

      if (response.error) {
        toast.error('La déconnexion a échouée.');
        console.log(error)
      } else {
        setUser(null);
        toast.success('Vous êtes déconnecté !')
        setTimeout(() => {
            window.location.href = '/';
          }, 200);
      }
    } catch (err) {
      toast.error('Un problème est survenu pendant la déconnection.')
      console.log(err.response)
    }
  };

    return (
        <>
            <p>{user.prenom}</p>
            <p>{user.nom}</p>
            <p>{user.email}</p>
            <button className="logout" onClick={handleLogout}><i class="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;&nbsp;Se déconnecter</button>
        </>
    );
}

export default Compte;