import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './book-details.css'

const BookDetails = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(process.env.NODE_ENV === "production" ? `/api/user/${userId}` : `/user/${userId}`); // Remplacez par votre endpoint API pour récupérer les détails du livre
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching book details:', error);
            }
        };

        fetchUser();
    }, [userId]);

    if (!user) {
        return <div>Chargement...</div>;
    }

    return (
        <div className="book-details-page">
            <h2>{user.prenom}</h2>
            <img src={user.avatar} alt={user.nom} />
            {/* Affichez d'autres détails du livre selon votre besoin */}
        </div>
    );
};

export default BookDetails;