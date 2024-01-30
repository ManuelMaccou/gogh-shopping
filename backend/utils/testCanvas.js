const fs = require('fs');
const generateProductImage = require('./imageGenerator');

async function testGenerateProductImage() {
    // Sample product data
    const product = {
        title: 'Sample Product Title Sample Product Title Sample Product Title',
        description: 'This is a very long description to test the wrapping of text in the canvas. It should wrap nicely over multiple lines. This is a very long description to test the wrapping of text in the canvas. It should wrap nicely over multiple lines. This is a very long description to test the wrapping of text in the canvas. It should wrap nicely over multiple lines. This is a very long description to test the wrapping of text in the canvas. It should wrap nicely over multiple lines.',
        image: 'https://kinsta.com/wp-content/uploads/2020/08/tiger-jpg.jpg', // Replace with a valid image URL
        url: 'https://example.com'
    };

    try {
        const imageDataUrl = await generateProductImage(product);
        const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');

        // Save the image as a file
        fs.writeFileSync('output.png', base64Data, 'base64');
        console.log('Image saved as output.png');
    } catch (error) {
        console.error('Error generating image:', error);
    }
}

testGenerateProductImage();
