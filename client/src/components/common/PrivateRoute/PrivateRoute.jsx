// 🚨 Цей файл фінальний. Не змінювати без дозволу!

import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
//import { Spinner } from '../components';
import { useAuth } from '../../../context/auth.context';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Запам'ятовуємо поточний URL
    const location = useLocation();

    // Чекаємо завершення завантаження
    if (isLoading) { 
        return <>load</>;//<Spinner />; 
    }

    // Якщо користувач не авторизований, перенаправляємо його
    if(!isAuthenticated){
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Якщо користувач авторизований, відображаємо дочірній компонент
    return <Outlet />;
};

export default PrivateRoute;