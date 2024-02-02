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
    const [deletionErrorMessage, setDeletionErrorMessage] = useState('');
    const [deletionConfirmationMessage, setDeletionConfirmationMessage] = useState('');


    useEffect(() => {
        // Grab products to display on page
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
                if (axios.isAxiosError(err)) {
                    const message = err.response?.data?.message || "An error occurred.";
                    if (err.response?.status === 404) {
                        console.log('No products found for user');
                    } else if (err.response?.status === 401) {
                        setErrorMessage('Session has expired. Please log in again.');
                    } else {
                        console.error('Error fetching products:', message);
                    }
                } else {
                    console.error('Error fetching products:', err);
                }
            }
        };
        fetchProducts();

        // Function to check if the user already has a pageId and pageHtml
        const checkPageGenerationStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No token found");

                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/check-page-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Example response structure: { hasPage: true, pageId: "uniqueId" }
                if (response.data.hasPage) {
                    setIsPageGenerated(true);
                    setShareableUrl(`${process.env.REACT_APP_BACKEND_URL}/product-page/${response.data.pageId}`);
                }
            } catch (err) {
                console.error('Error checking page generation status:', err);
            }
        };
        checkPageGenerationStatus();
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
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || "An error occurred.";
                console.error(message);
                setErrorMessage("An error occurred. Please refresh and try again. If the issue persists, feel free to DM me on Warpcast @manuelmaccou.");
            } else {
                console.error('Error occurred while generating the frame:', err);
                setErrorMessage("An error occurred. Please refresh and try again. If the issue persists, feel free to DM me on Warpcast @manuelmaccou.");
            }
        }
    }, []);

    // States and functions from DeleteProducts
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    const toggleEditMode = () => setIsEditMode(!isEditMode);

    const handleProductSelect = (productId: string) => {
        const newSelectedProducts = new Set(selectedProducts);
        if (newSelectedProducts.has(productId)) {
            newSelectedProducts.delete(productId);
        } else {
            newSelectedProducts.add(productId);
        }
        setSelectedProducts(newSelectedProducts);
    };

    const deleteSelectedProducts = async () => {
        if (!window.confirm("Are you sure you want to delete the selected products?")) {
            return; // Abort if the user cancels
        }

        try {
            const productIds = Array.from(selectedProducts);
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/products/delete`, 
                                { productIds }, 
                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            
            if (response.status === 200) {
                setDeletionConfirmationMessage("Products successfully deleted.");
                setProducts(products.filter(product => !selectedProducts.has(product._id)));
                setSelectedProducts(new Set());
                setIsEditMode(false);
            } else {
                throw new Error("Deletion was not successful. Please refresh the page and try again.");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "An error occurred.";
                console.error('Error deleting products:', message);
                setDeletionErrorMessage("Failed to delete products. Please try again later.");
            } else {
                console.error('Error deleting products:', error);
                setDeletionErrorMessage("Failed to delete products. Please try again later.");
            }
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setProductData({ ...productData, [e.target.name]: e.target.value });

        const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setErrorMessage('');
            setConfirmationMessage('');
            setDeletionConfirmationMessage('');
            setDeletionErrorMessage('');
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
                if (axios.isAxiosError(err)) {
                    const message = err.response?.data?.message || "An error occurred.";
                    if (err.response?.status === 400) {
                        setErrorMessage("Failed to submit product. Please check your input URLs and try again.");
                    } else if (err.response?.status === 401) {
                        setErrorMessage("Your session has expired. Please capture any content you need and log in again.");
                    } else {
                        console.error('Error during product submission:', message);
                        setErrorMessage("Failed to submit product. Please check your input URLs and try again.");
                    }
                } else {
                    console.error('Error during product submission:', err);
                    setErrorMessage("An unexpected error occurred. Please refresh the page and try again. If the issue persists, feel free to DM on Warpcast @manuelmaccou.");
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
                

                        {/* Conditionally display the shareable URL section */}
                        {isPageGenerated && shareableUrl && (
                            <div className="shareable-url-section">
                                <h3>Frame URL</h3>
                                <p>Your showcase is ready! Post this URL on Farcaster:</p>
                                <input type="text" value={shareableUrl} readOnly />
                                <button onClick={() => navigator.clipboard.writeText(shareableUrl)}>Copy URL</button>
                            </div>
                        )}

                        {/* Display the 'Generate Product Frame' button only if the page has not been generated */}
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

                <div className={`products-section ${isEditMode ? 'edit-mode' : ''}`}>
                    <h2>{isEditMode ? 'Select products to delete' : 'Frame preview'}</h2>
                        <div className="deletion-buttons">
                        {products.length > 0 && (
                            <>
                                <button className="edit-button" onClick={toggleEditMode}>{isEditMode ? 'Cancel' : 'Edit Products'}</button>
                                {isEditMode && (
                                    <button className="delete-button" onClick={deleteSelectedProducts}>Delete Selected</button>
                                )}
                            </>
                        )}
                        {deletionConfirmationMessage && <div className="confirmation-message">{deletionConfirmationMessage}</div>}
                        {deletionErrorMessage && <div className="confirmation-message">{deletionErrorMessage}</div>}
                    </div>
                    {products.map(product => (
                        <div 
                            className={`product-card ${isEditMode && selectedProducts.has(product._id) ? 'selected' : 'deselected'}`}
                            key={product._id}
                            onClick={() => isEditMode && handleProductSelect(product._id)} // Only handle click in edit mode
                        >
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