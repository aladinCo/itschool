import React from 'react';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
/*********************************************** */
//import LogRocket from 'logrocket';
/*********************************************** */


import { AuthProvider } from './context/auth.context';
import {PrivateRoute} from './components';

import './styles/App.css';
import {StartPage, ProblemPage, LoginPage} from './components/pages';



//LogRocket.init('xkfy4f/itschool');


function App() {
  return (  
    <AuthProvider>  
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route element={<PrivateRoute />}>
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="/" element={<StartPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};     

export default App;
