import { useContext } from "react";
import { UserContext } from "../context/userContext"
import './classement.css'

function Classement() {
    const { user, setUser } = useContext(UserContext)

    return (
        <>
            {user ? (
                <p> Hi {user.prenom}!</p>
            ) : (
                <p> Hi!</p>
            )}
        </>
    );
}

export default Classement;