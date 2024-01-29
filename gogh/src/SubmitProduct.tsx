import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';


interface ProductData {
    title: string;
    description: string;
    image: string;
    url: string;
    shippingDetails: string;
}

interface Product {
    title: string;
    description: string;
    image: string;
    url: string;
    shippingDetails: string;
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
        }
    }, [navigate]);

    const [productData, setProductData] = useState<ProductData>({
        title: '',
        description: '',
        image: '',
        url: '',
        shippingDetails: ''
    });

    const { title, description, image, url, shippingDetails } = productData;

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
                    // Optionally set a state here to show a message on the UI
                } else {
                    console.error('Error fetching products:', err);
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
        if (!token) return;
    
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
            console.error('Error during page generation or fetching page ID:', err);
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
                console.error("No token found. User is not logged in.");
                navigate('/login');
                return;
            }
                const decodedToken = parseJwt(token);
                const userId = decodedToken?.userId;
                
            try {

                const productWithUser = {
                    ...productData,
                    user: userId,
                };
                console.log('Submitting product:', productWithUser);

                const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/products/add`, 
                    productWithUser,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                console.log('Product submission response:', response.data);

                setConfirmationMessage('Product successfully added!');
                setProducts([...products, response.data]);
                console.log(response.data);
                // Reset the form fields
                setProductData({
                    title: '',
                    description: '',
                    image: '',
                    url: '',
                    shippingDetails: ''
                });
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    const axiosError = err as AxiosError;
                    console.error(axiosError.response?.data || axiosError.message);
                } else if (err instanceof Error) {
                    console.error('An error occurred:', err.message);
                }
            }
        };

        return (
            <div className="submit-product-container">
                <div className="product-form-section">
                    <div className="product-form-box">
                        <h2>Submit New Product</h2>
                        <form onSubmit={onSubmit} className="product-form">
                            <div className="form-group">
                                <label htmlFor="title">Title:</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={title} 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <textarea 
                                    name="description" 
                                    value={description} 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="image">Image URL:</label>
                                <span>Must be .jpg, .jpeg, or .png</span>
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
                                <label htmlFor="shippingDetails">Shipping Details:</label>
                                <textarea 
                                    name="shippingDetails" 
                                    value={shippingDetails} 
                                    onChange={onChange}
                                />
                            </div>
                            <button type="submit">Submit</button>
                        </form>
                        {confirmationMessage && <div className="confirmation-message">{confirmationMessage}</div>}
                
                        {isPageGenerated && shareableUrl && (
                            <div className="shareable-url-section">
                                <h3>Product Page URL</h3>
                                <p>Your product page is ready! Share this URL on Farcaster:</p>
                                <input type="text" value={shareableUrl} readOnly />
                                <button onClick={() => navigator.clipboard.writeText(shareableUrl)}>Copy URL</button>
                            </div>
                        )}
                        {!isPageGenerated && (
                            <div className="shareable-url-section">
                                <p>Once you submit all of your poducts, click the button below to generate a URL and share it on Farcaster.</p>
                                <button onClick={fetchPageIdAndGenerateUrl}>Generate Product Frame</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="products-section">
                    <h2>Your products</h2>
                    {products.map(product => (
                        <div className="product-card" key={product.title}>
                            {product.image && <img src={product.image} alt={product.title} className="product-image"/>}
                                <div className="product-details">
                                    <h3>{product.title}</h3>
                                    <p>{product.description}</p>
                                </div>
                        </div>
                    ))}
                </div>




            </div>
        );
    }
    
    export default SubmitProduct;