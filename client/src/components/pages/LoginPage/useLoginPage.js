import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from '../../../context/auth.context';
import { useHttp } from '../../../hooks/http.hook';


const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());


const validatePassword = password => password.length >= 6;


 
export const useLoginPage = () => {

    const { isAuthenticated, login } = useAuth();    
    const { loading, request } = useHttp();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);    

    const navigate = useNavigate();

    if(isAuthenticated){
        return <Navigate to="/" />;
    }    

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const loginHandler = async () => {
        if (!validateEmail(form.email)) {
            setError('Некорректный email');
            return;
        }

        if (!validatePassword(form.password)) {
            setError('Пароль должен содержать не менее 6 символов');
            return;
        }

        try {
            const data = await request('/api/auth/login', 'POST', { ...form });
            login(data.result.accessToken, data.result.publicId);
            navigate("/")
        } catch (e) {
            setError(e.message || 'Что-то пошло не так, попробуйте снова');
        }

    };

    const isFormValid = form.email.trim() !== '' && form.password.trim() !== ''; 

    return { form, error, loading, changeHandler, loginHandler, isFormValid };
}