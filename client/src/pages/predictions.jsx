import { useContext } from "react";
import { UserContext } from "../context/userContext";
import './predictions.css'

function Predictions() {
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

export default Predictions;