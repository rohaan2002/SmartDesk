import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';

type User = {
    id: number;
    name: string;
    email: string;
}

type MeResponse = {
    user: User;
}

type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}   

const AuthContext = createContext<AuthContextType| null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMe() {
            try {
                const res = await apiGet<MeResponse>("/auth/me");
                if (res.ok) {
                    setUser(res.data.user);
                }else{
                    console.error("Failed to fetch user data", res);
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchMe();
    }, []);

    async function logout() {
        await apiPost("/auth/logout");
        setUser(null);
    }
    
    return <AuthContext.Provider value={{user, loading, logout}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const contextVal = useContext(AuthContext);
    if (!contextVal) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return contextVal;


}

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
         if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
    }, [loading, user, navigate, location.pathname]);

    if(loading) return <div>Checking Session</div>;
    if(!user) return null;

    return <>{children}</>;
}
