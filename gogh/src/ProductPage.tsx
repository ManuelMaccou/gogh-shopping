import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Helmet from "react-helmet";


interface Product {
    _id: string;
    title: string;
    description: string;
    url: string;
    image:string;
}

interface User {
    username: string;
    framesMeta: {
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        fcFrame: string;
        fcFramePostUrl: string;
        fcFrameImage: string;
        fcFrameButton1: string;
        fcFrameButton2: string;
    };
}

function ProductPage() {
    const { uniqueId } = useParams<{ uniqueId: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/products/by-page/${uniqueId}`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchMetadata = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/metadata/${uniqueId}`);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };

        fetchProducts();
        fetchMetadata();
    }, [uniqueId]);

    const handleProductClick = (url: string) => {
        // Redirect to the product's URL
        window.open(url, '_blank');
    };

    // Metadata values with fallbacks
    const title = user?.framesMeta?.ogTitle || 'Gogh Shopping';
    const ogTitle = user?.framesMeta?.ogTitle || 'Gogh Shopping';
    const ogDescription = user?.framesMeta?.ogDescription || 'Sell anything on Farcaster';
    const ogImage = user?.framesMeta?.ogImage || 'https://aef8cbb778975f3e4df2041ad0bae1ca.cdn.bubble.io/f1706632906710x368591580374962200/Screenshot%202024-01-30%20at%2011.41.26%20AM.png?_gl=1*1v7k6uf*_gcl_aw*R0NMLjE3MDY1NjYwNDcuQ2p3S0NBaUF0dDJ0QmhCREVpd0FMWnVoQUlyVGxmWVJfQ05RV0Vhc1E1d3F6Y19jZlh0d3NWMkdXeHRnUERYMnpMaDBxRV9sRWlwS0p4b0NvWDBRQXZEX0J3RQ..*_gcl_au*NzE3MTExODM4LjE3MDY1NjYwNDc.*_ga*ODA1NzE0MDM0LjE3MDY1NjYwNDc.*_ga_BFPVR2DEE2*MTcwNjYzMTk1OS4yLjEuMTcwNjYzMjg5NC41OC4wLjA';
    const fcFrame = user?.framesMeta?.fcFrame || ''
    const fcFrameImage = user?.framesMeta?.fcFrameImage || ''
    const fcFramePostUrl = user?.framesMeta?.fcFramePostUrl || ''
    const fcFrameButton1 = user?.framesMeta?.fcFrameButton1 || ''
    const fcFrameButton2 = user?.framesMeta?.fcFrameButton2 || ''

    return (
        <div>
            <Helmet>
                <title>{title}</title>
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="fc:frame" content={fcFrame} />
                <meta name="fc:frame:post_url" content={fcFramePostUrl} />
                <meta property="fc:frame:image" content={fcFrameImage} />
                <meta property="fc:frame:button:1" content={fcFrameButton1} />
                <meta property="fc:frame:button:2" content={fcFrameButton2} />
            </Helmet>
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
