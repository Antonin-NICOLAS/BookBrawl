import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
//Context
import { UserContext } from '../context/userContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion'
//CSS
import './classement.css';
//LOADER//
import LoadingAnimation from '../components/loader';
//Graphique
import ClassementChart from './classementchart';

const Classement = () => {
    //Context
    const { setIsLoading, loadingStates } = useLoading();
    //others
    const [users, setUsers] = useState([]);
    //
        useEffect(() => {
            fetchUsers();
    }, []);

    //ask users to server
    const fetchUsers = async () => {
        setIsLoading('users', true);
        try {
            const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/userranking' : '/user/userranking');
            setUsers(response.data);

            if (response.error) {
                console.log(response.error);
                toast.error(response.error);
            }

        } catch (error) {
            console.log('Erreur de récupération des utilisateurs :', error);
        } finally {
            setIsLoading('users', false);
        }
    };

    const calculateRanks = (users) => {

        // Initialiser le rang et une variable pour suivre le nombre de mots du précédent utilisateur
        let rank = 1;

        // Parcourir les utilisateurs triés pour assigner les rangs
        return users.map((user, index) => {
            let prevWordsRead = users[0].wordsRead;
            // Si le nombre de mots du courant est inférieur au précédent, mettre à jour le rang
            if (index > 0 && user.wordsRead < prevWordsRead) {
                rank = index + 1;
            }
            prevWordsRead = user.wordsRead;
            return { ...user, rank };
        });
    };

    const isUsersLoading = loadingStates.users;
    const rankedUsers = calculateRanks(users);

    return (
        <>
            <div className='classement'>
                <h1>Classement des utilisateurs par nombre de mots lus</h1>
                {isUsersLoading ? (
                    <LoadingAnimation />
                ) : (
                    <>
                        <motion.table 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 1 } }}
                        className='classement-table'>
                            <thead className="table-head">
                                <motion.tr
                                    initial={{ rotateY: 180 }}
                                    animate={{ rotateY: 360, transition: { duration: 0.5 } }}>
                                    <th className="column1">Rang</th>
                                    <th className="column2">Nom</th>
                                    <th className="column3">Mots lus</th>
                                </motion.tr>
                            </thead>
                            <tbody>
                                {rankedUsers && rankedUsers.length > 0 ? (
                                    rankedUsers.map((userItem, index) => (
                                        <motion.tr
                                            key={userItem._id}
                                            initial={{ rotateY: 180 }}
                                            animate={{ rotateY: 360, transition: { duration: (0.5 + index) * 0.2 } }}
                                            className={user && String(userItem._id) === String(user.id) ? 'table-highlight' : ''}
                                        >
                                            <td className='column1'>{userItem.rank}</td>
                                            <td className="column2"><Link to={`/user/${userItem._id}`}>{userItem.prenom} {userItem.nom}</Link></td>
                                            <td className="column3">{userItem.wordsRead}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Aucun utilisateur trouvé</td>
                                    </tr>
                                )}
                            </tbody>
                        </motion.table>
                        <ClassementChart users={users} className="chart" />
                    </>
                )}
            </div>
        </>
    );
};

export default Classement;
