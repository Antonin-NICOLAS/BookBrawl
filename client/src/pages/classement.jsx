import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
import { toast } from 'react-hot-toast'
import './classement.css';

const Classement = () => {
    const { user, isLoading: userLoading } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!userLoading && user) {
            fetchUsers();
        }
    }, [userLoading, user]);

        const fetchUsers = async () => {
                try {
                    const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/userranking' : '/userranking'
                    );
                    setUsers(response.data);
                    setIsLoading(false);

                    if (response.error) {
                        console.log(response.error)
                        toast.error(response.error)
                        setIsLoading(false);
                    }

                } catch (error) {
                    console.log('Erreur de récupération des utilisateurs :', error);
                    setIsLoading(false);
                }
            };

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
                {isLoading ? (
                    <tbody>
                        <tr>
                            <td colSpan="3">Chargement...</td>
                        </tr>
                    </tbody>
                ) : (
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
                </tbody>)}
            </table>
        </div>
    );
};

export default Classement;