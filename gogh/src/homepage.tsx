import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('token') !== null;

    const handleGetStartedClick = () => {
        if (isLoggedIn) {
            navigate('/submit-product');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="homepage-container">
            <h1 className="title">Hang tight. We're fixing some issues. We'll be back ASAP!</h1>
            
        </div>
    );
};

export default HomePage;
