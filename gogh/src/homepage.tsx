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
            <h1 className="title">Sell anything on Farcaster</h1>
            <p className="description">
                Promote your NFTs, products, and services directly in the feed.
            </p>
            <div className="image-container">
            </div>
            <button onClick={handleGetStartedClick} className="get-started-button">
                Get Started
            </button>
        </div>
    );
};

export default HomePage;

