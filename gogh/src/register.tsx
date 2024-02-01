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
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                const message = err.response.data.message;
                if (message.toLowerCase().includes("user already exists")) {
                    setErrorMessage("Username or email already in use.");
                } else if (message.toLowerCase().includes("invalid credentials")) {
                    setErrorMessage("Invalid registration credentials.");
                } else {
                    setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
                }
                console.error(err.response.data); // for debugging
            } else if (err instanceof Error) {
                console.error('An error occurred during registration:', err.message); // for debugging
                setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
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