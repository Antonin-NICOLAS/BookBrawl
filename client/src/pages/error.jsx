import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./error.css"

function Error() {

    return (
        <>
        <p className="errortextpage1">La page que tu cherches n'existe pas</p>
        <p className="errortextpage1">Retournes à la page d'accueil :</p>
        <Link to="/" className="errortextpage3">Home</Link>
        </>
    );
}

export default Error;
