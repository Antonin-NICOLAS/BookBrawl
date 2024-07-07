import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { toast } from 'react-hot-toast'
import './classement.css';

const Classement = () => {
    const { user } = useContext(UserContext); // Utiliser le contexte utilisateur
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/userranking' : '/userranking');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching the users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Classement des utilisateurs par nombre de mots lus</h1>
            <table>
                <thead className="table-head">
                    <tr>
                        <th className="column1">Rang</th>
                        <th className="column2">Nom</th>
                        <th className="column3">Mots lus</th>
                    </tr>
                </thead>
                <tbody>
                    {users && users.length > 0 ? (
                        users.map((userItem, index) => (
                            <tr
                                key={userItem._id}
                                className={user && String(userItem._id) === String(user.id) ? 'table-highlight' : ''}
                            >
                                <td>{index + 1}</td>
                                <td>{userItem.prenom} {userItem.nom}</td>
                                <td>{userItem.wordsRead}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">Aucun utilisateur trouvé</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Classement;
