const fs = require('fs');
const GenerateProductImage = require('./productImageGenerator');

async function testGenerateProductImage() {
    // Sample product data
    const productData = {
        image: 'https://humankind.place/cdn/shop/files/ebbandflowwords_4e49e1e5-2bfa-4659-8ba7-b1cb86680091.png?v=1701910586&width=1206', // Replace with a valid image URL
    };

    try {
        const imageDataUrl = await GenerateProductImage(productData);
        const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');

        // Save the image as a file
        fs.writeFileSync('output.png', base64Data, 'base64');
        console.log('Image saved as output.png');
    } catch (error) {
        console.error('Error generating image:', error);
    }
}

testGenerateProductImage();
