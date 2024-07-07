import { useContext } from "react";
import { UserContext } from "../context/userContext"
import './books.css'

function Books() {
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

export default Books;