import { useContext } from "react";
import { UserContext } from "../context/userContext";
//CSS
import './predictions.css'
//LOADER//
import LoadingAnimation from '../components/loader';

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