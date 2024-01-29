const satori = require('satori');

// const sharp = require('sharp');
const React = require('react');

async function generateProductImage(product) {
    console.log('Generating image for product:', product);

    const productImageSrc = product.image;
    console.log('Product image source:', productImageSrc);

    try{
        const svg = await satori(
            <div style={{ display: 'flex', backgroundColor: '#fff', width: '600px', height: '400px' }}>
                {productImageSrc && <img src={productImageSrc} style={{ width: '200px', height: '200px' }} alt={product.title} />}
                <div style={{ marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '24px', color: '#333' }}>{product.title}</h3>
                    <p style={{ fontSize: '16px', color: '#666' }}>{product.description}</p>
                </div>
            </div>,
            { width: 600, height: 400 }
        );

        console.log('Generated SVG:', svg);
        return svg;
    } catch (error) {
        console.error('Error in generating SVG with Satori:', error);
        throw error; // Rethrow the error to be handled in the calling function
    }

    // const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    // const pngBase64 = pngBuffer.toString('base64');
    
    // return pngBase64;
}

module.exports = generateProductImage;
