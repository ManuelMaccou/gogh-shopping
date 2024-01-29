import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './homepage';
import Register from './register';
import Login from './login';
import SubmitProduct from './SubmitProduct';
import NavigationWrapper from './NavigationWrapper';

const App: React.FC = () => {

    return (
        <div>
        <NavigationWrapper />
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/submit-product" element={<SubmitProduct />} />
            </Routes>
        </div>
    );
};

export default App;
