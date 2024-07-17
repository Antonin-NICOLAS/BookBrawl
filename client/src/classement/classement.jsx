import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast'
//CSS
import './classement.css';
//LOADER//
import LoadingAnimation from '../components/loader';

const Classement = () => {
    //Context
    const { user, isLoading } = useContext(UserContext);
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [users, setUsers] = useState([]);

    //attendre Usercontext
    useEffect(() => {
        if (!isLoading && user) {
            fetchUsers();
        }
    }, [isLoading, user]);

    //ask users to server
    const fetchUsers = async () => {
        setIsLoading('users', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/userranking' : '/user/userranking'
            );
            setUsers(response.data);

            if (response.error) {
                console.log(response.error)
                toast.error(response.error)
            }

        } catch (error) {
            console.log('Erreur de récupération des utilisateurs :', error);
        } finally {
            setIsLoading('users', false);
        }
    };

    if (!user) {
        return (
            <div className='unauthorizeduser'>
                <h1>Classement des utilisateurs par nombre de mots lus</h1>
                <p>Veuillez vous connecter pour voir le classement.</p>
            </div>
        );
    }

    const isUsersLoading = loadingStates.users;


    return (
        <div className='classement'>
            <h1>Classement des utilisateurs par nombre de mots lus</h1>
            {isUsersLoading ? (
                <LoadingAnimation />
            ) : (
                <table className='classement-table'>
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
                                    <td className='column1'>{index + 1}</td>
                                    <td className="column2"><Link to={`/user/${userItem._id}`}>{userItem.prenom} {userItem.nom}</Link></td>
                                    <td className="column3">{userItem.wordsRead}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">Aucun utilisateur trouvé</td>
                            </tr>
                        )}
                    </tbody>
                </table>)}
        </div>
    );
};

export default Classement;