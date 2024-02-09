const fs = require('fs');
const conceptGenerateProductImage = require('./concept-imageGenerator');

async function conceptTestGenerateProductImage() {
    // Sample product data
    const productData = {
        image: 'https://swagcaster.xyz/cdn/shop/files/classic-dad-hat-black-front-6510999daddcd_1024x1024@2x.jpg?v=1695586726',
        title: 'Farcaster + [Your Handle] Tee',
    };

    try {
        const imageDataUrl = await conceptGenerateProductImage(productData);
        const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');

        // Save the image as a file
        fs.writeFileSync('output.png', base64Data, 'base64');
        console.log('Image saved as output.png');
    } catch (error) {
        console.error('Error generating image:', error);
    }
}

conceptTestGenerateProductImage();
