import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './userContext';

export const AdminContext = createContext({});

export function AdminContextProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/admin/adminprofile' : '/admin/adminprofile', {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    setIsAdmin(response.data.isAdmin);
                } catch (error) {
                    console.error('Error checking admin status:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, [user]);

    return (
        <AdminContext.Provider value={{ isAdmin, isLoading }}>
            {children}
        </AdminContext.Provider>
    );
}