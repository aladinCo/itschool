

import { useLoginPage } from './useLoginPage';

const ErrorMessage = ({ message }) => message ? <div className="error">{message}</div> : null


const LoginPage = () => {
    
    const { form, error, loading, changeHandler, loginHandler, isFormValid } = useLoginPage();

    return (
        <div className="login_page">
            <div className="login_page__logo"></div>
            <h1>Увійдіть</h1>
            <ErrorMessage message={error} />
            <div className="login_page__form">
                <div className="login_page__form_group">
                    
                    <input
                        className="login_page__form_input"
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={changeHandler}
                        placeholder=''
                    />
                    <label className="login_page__form_label" htmlFor="email">Email</label>
                </div>
                <div className="login_page__form_group">                    
                    <input
                        className="login_page__form_input"
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={form.password}
                        onChange={changeHandler}
                        placeholder=''
                    />
                    <label  className="login_page__form_label" htmlFor="password">Пароль</label>
                </div>
                <button
                    className="login_page__form_button"
                    onClick={loginHandler}
                    disabled={loading || !isFormValid}
                >
                    Ввійти
                </button>
            </div>
        </div>
    );
};

export default LoginPage;