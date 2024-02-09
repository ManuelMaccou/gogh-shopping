import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import NavigationWrapper from './NavigationWrapper';
import HomePage from './homepage';
import SubmitProduct from './SubmitProduct';

const App: React.FC = () => {

    return (
            <div>
                <HelmetProvider>
                    <NavigationWrapper />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/submit-product" element={<SubmitProduct />} />
                        </Routes>
                </HelmetProvider>
            </div>
    );
};

export default App;
