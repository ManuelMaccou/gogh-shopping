import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';


function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    const { email, password } = formData;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/users/login`, 
                formData
            );
            localStorage.setItem('token', response.data.token);
            navigate('/submit-product');

        } catch (err) {
            if (axios.isAxiosError(err)) {
                // Extracting the message safely using optional chaining and a default value
                const message = err.response?.data?.message || "An error occurred.";
                if (typeof message === 'string' && message.toLowerCase().includes("invalid credentials")) {
                    setErrorMessage("Invalid login credentials.");
                } else {
                    // Use the message from the error response if it's a string, otherwise, a generic message
                    setErrorMessage(typeof message === 'string' ? message : "An unexpected error occurred. Please try again.");
                }
                console.error('Error data:', err.response?.data); // for debugging
            } else {
                // This could be a network error or something else not related to Axios
                console.error('An error occurred during login:', err); // for debugging
                setErrorMessage("An unexpected network error occurred. Please check your internet connection and try again.");
            }
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Login</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label><br />
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label><br />
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div>
                
                </div>
            </div>
        </div>
    );
}

export default Login;