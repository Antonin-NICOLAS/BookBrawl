import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Added isLoading state

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/user/profile' : '/user/profile', {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!user) {
            fetchUserProfile();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, isLoading, setUser }}>
            {children}
        </UserContext.Provider>
    );
}