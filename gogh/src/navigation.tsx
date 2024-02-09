import { Link, useNavigate } from 'react-router-dom';

interface NavigationProps {
    showNav: boolean;
  }

  const Navigation: React.FC<NavigationProps> = ({ showNav }) => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isLoggedIn = () => localStorage.getItem('token') !== null;
    if (!showNav) {
        return null;
    }

    return (
        <nav className="navigation">
            <ul className="nav-links">
                {!isLoggedIn() && (
                    <>
                    </>
                )}
            </ul>
            {isLoggedIn() && (
                <div className="logout-container">
                    <button onClick={logout}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
