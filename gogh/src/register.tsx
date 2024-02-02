import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    const { username, email, password } = formData;

    const onChange = (e: ChangeEvent<HTMLInputElement>) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/users/register`, 
                formData
            );
            const loginResponse = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/users/login`, 
                { email, password }
            );
            localStorage.setItem('token', loginResponse.data.token);
            navigate('/submit-product');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    // Check if the response data has a 'message' property
                    const message = err.response.data.message || err.response.data;
                    if (typeof message === 'string') {
                        if (message.toLowerCase().includes("user already exists")) {
                            setErrorMessage("Username or email already in use.");
                        } else if (message.toLowerCase().includes("invalid credentials")) {
                            setErrorMessage("Invalid registration credentials.");
                        } else {
                            setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.");
                        }
                    } else {
                        // If message isn't a string, log the error and set a generic message
                        console.error('Error response data is not a string:', err.response.data);
                        setErrorMessage("An unexpected error occurred. Please try again.");
                    }
                } else {
                    // If there is no response, it's likely a network error
                    setErrorMessage("A network error occurred. Please check your internet connection and try again.");
                }
            } else if (err instanceof Error) {
                // Handle non-Axios errors
                console.error('An error occurred during registration:', err.message);
                setErrorMessage("An unexpected network error occurred. Please check your internet connection and try again.");
            }
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Register</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label><br />
                        <input 
                            type="text" 
                            name="username" 
                            value={username} 
                            onChange={onChange} 
                            required 
                        />
                    </div>
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
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;