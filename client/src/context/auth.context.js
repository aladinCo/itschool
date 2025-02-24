import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

// Константы для ключей хранилища и сообщений
const STORAGE_NAME = 'userData';
const LOADING_MESSAGE = 'Загрузка...';

function noop() {}

// Проверка срока действия токена
const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
        return true; // Если токен невалидный, считаем его истекшим
    }
};

export const AuthContext = createContext({
    token: null,
    userId: null,
    login: noop,
    logout: noop,
    isAuthenticated: false,
    isLoading:true
});

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedData = JSON.parse(sessionStorage.getItem(STORAGE_NAME));
        
        if (storedData?.token && !isTokenExpired(storedData.token)) {
            setToken(storedData.token);
            setUserId(storedData.userId);
        } else {
            sessionStorage.removeItem(STORAGE_NAME);
        }

        setIsLoading(false);
    }, []);
    
    /*useEffect(() => {
        if (token && userId) {
            setIsLoading(false);
        }
    }, [token, userId]);*/
    

    const login = useCallback((jwtToken, id) => {
        setToken(jwtToken);
        setUserId(id);

        sessionStorage.setItem(STORAGE_NAME, JSON.stringify({
            userId: id, token: jwtToken
        }));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        sessionStorage.removeItem(STORAGE_NAME);
    }, []);

    // Значение контекста
    const contextValue = { 
        token, 
        userId, 
        login, 
        logout, 
        isAuthenticated:!!token, 
        isLoading 
    }
    return (
        <AuthContext.Provider value={contextValue}>            
            {isLoading ? <div className='loading-message'>{LOADING_MESSAGE}</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

