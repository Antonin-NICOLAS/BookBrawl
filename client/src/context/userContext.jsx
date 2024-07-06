import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({})

export function UserContextProvider({children}) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        if(!user) {
            axios.get('/profile',{
                withCredentials: true,
                headers: {'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.FRONTEND_SERVER
                }
            }).then(({data}) => {
                setUser(data)
            })
        }
    }, [])
    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}
