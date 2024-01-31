import { Route, Routes } from 'react-router-dom';
import NavigationWrapper from './NavigationWrapper';
import HomePage from './homepage';
import Register from './register';
import Login from './login';
import SubmitProduct from './SubmitProduct';
//import ProductPage from './ProductPage';

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
