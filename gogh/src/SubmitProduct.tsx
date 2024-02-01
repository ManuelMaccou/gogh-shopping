import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';

interface ProductData {
    description: string;
    image: string;
    url: string;
    price: string;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    image: string;
    url: string;
    price: string;
}

function parseJwt(token: string) {
    if (!token) { return null; }
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};


function SubmitProduct() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage("Please log in to continue");
            navigate('/login');
        }
    }, [navigate]);

    const [productData, setProductData] = useState<ProductData>({
        description: '',
        image: '',
        url: '',
        price: ''
    });

    const { description, image, url, price } = productData;

    const [products, setProducts] = useState<Product[]>([]);
    const [confirmationMessage, setConfirmationMessage] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/products/user-products`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setProducts(response.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    console.log('No products found for user');

                } else if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 401) {
                      setErrorMessage('Session has expired. Please log in again.');
                    } else {
                        console.error('An error occurred while submitting a product:', err.message);
                        setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
                    }
                } else {
                    console.error('Error fetching products:', err);
                    setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
                }
            }
        };

        fetchProducts();
    }, []);

    const [shareableUrl, setShareableUrl] = useState('');
    const [isPageGenerated, setIsPageGenerated] = useState(false);

    // Function to fetch the pageId and generate the shareable URL
    const fetchPageIdAndGenerateUrl = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage("Your session has expired. Please capture any content you need and log in again.");
            return;
        }
    
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/generate-page`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const pageIdResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/get-page-id`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const pageId = pageIdResponse.data.pageId;
            setShareableUrl(`${process.env.REACT_APP_BACKEND_URL}/product-page/${pageId}`);
            setIsPageGenerated(true);
        } catch (err) {
            console.error('Error occured while generating the frame:', err);
            if (axios.isAxiosError(err)) {
                console.error('Axios error response:', err.response);
            }
        }
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setProductData({ ...productData, [e.target.name]: e.target.value });

        const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const token = localStorage.getItem('token');

            if (!token) {
                setErrorMessage("You are not logged in. Please log in to submit a product.");
                return;
            }

            if (description.length > 300) {
                setErrorMessage("Description must be 300 characters or less.");
                return;
            }

            const decodedToken = parseJwt(token);
            const userId = decodedToken?.userId;
                
            try {

                const productWithUser = {
                    ...productData,
                    user: userId,
                };

                const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/products/add`, 
                    productWithUser,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                setConfirmationMessage('Product successfully added!');
                setProducts([...products, response.data]);
                // Reset the form fields
                setProductData({
                    description: '',
                    image: '',
                    url: '',
                    price: ''
                });
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    // Handle specific server response errors
                    if (err.response.status === 400) {
                        setErrorMessage("Failed to submit product. Please check your input.");
                    } else if (err.response.status === 401) {
                        setErrorMessage("Your session has expired. Please capture any content you need and log in again.");
                    } else {
                        setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
                    }
                } else {
                    // Handle any other errors
                    setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If it happens again, please let me know on Warpcast @manuelmaccou.eth.");
                }
                console.error('Error during product submission:', err);
            }
        };

        return (
            <div className="submit-product-container">
                <div className="product-form-section">
                    <div className="product-form-box">
                        <h2>Submit New Product</h2>
                        <form onSubmit={onSubmit} className="product-form">

                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <textarea 
                                    name="description" 
                                    value={description} 
                                    onChange={onChange} 
                                    required
                                    maxLength={300}
                                />
                                <span className="field-hint">Max 300 characters</span>
                            </div>
                            <div className="form-group">
                                <label htmlFor="image">Image URL:</label>
                                <input 
                                    type="text" 
                                    name="image" 
                                    value={image} 
                                    onChange={onChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="url">Product URL:</label>
                                <input 
                                    type="text" 
                                    name="url" 
                                    value={url} 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Price:</label>
                                <textarea 
                                    name="price" 
                                    value={price} 
                                    onChange={onChange}
                                />
                            </div>
                            <button type="submit">Add product</button>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                        </form>
                        {confirmationMessage && <div className="confirmation-message">{confirmationMessage}</div>}
                
                        {isPageGenerated && shareableUrl && (
                            <div className="shareable-url-section">
                                <h3>Frame URL</h3>
                                <p>Your showcase is ready! Post this URL on Farcaster:</p>
                                <input type="text" value={shareableUrl} readOnly />
                                <button onClick={() => navigator.clipboard.writeText(shareableUrl)}>Copy URL</button>
                            </div>
                        )}
                        {!isPageGenerated && (
                            <div className="shareable-url-section">
                                <p>Once you submit all of your poducts, click the button below to generate your frame showcasing your products.</p>
                                <div className="generate-button-container">
                                    <button onClick={fetchPageIdAndGenerateUrl} type="submit">Generate Product Frame</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="products-section">
                    <h2>Your products</h2>
                    {products.map(product => (
                        <div className="product-card" key={product._id}>
                            {product.image && <img src={product.image} alt={product.title} className="product-image"/>}
                                <div className="product-details">
                                    <p>{product.description}</p>
                                </div>
                                <div className="product-price">
                                    <p>{product.price}</p>
                                </div>
                        </div>
                    ))}
                </div>




            </div>
        );
    }
    
    export default SubmitProduct;