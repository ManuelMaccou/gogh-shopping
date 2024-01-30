import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


interface Product {
    _id: string;
    title: string;
    description: string;
    url: string;
    image:string;
}

function ProductPage() {
    const { uniqueId } = useParams<{ uniqueId: string }>();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/products/by-page/${uniqueId}`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [uniqueId]);

    const handleProductClick = (url: string) => {
        // Redirect to the product's URL
        window.open(url, '_blank'); // Opens in a new tab
    };

    return (
        <div>
            <h1>Products</h1>
            <div className="products-section">
                {products.map(product => (
                    <div className="product-card" key={product._id} onClick={() => handleProductClick(product.url)}>
                        {product.image && <img src={product.image} alt={product.title} className="product-image" />}
                        <div className="product-details">
                            <p>{product.description}</p>
                        </div>  
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductPage;
