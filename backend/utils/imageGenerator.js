const { createCanvas, loadImage, registerFont } = require('canvas');

// registerFont('path-to-your-font.ttf', { family: 'CustomFont' });

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth*ratio, height: srcHeight*ratio };
}

async function generateProductImage(product) {
    const height = 400;
    const width = Math.round(height * 1.91);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    try {
        // Load and draw product image
        if (product.image && isValidUrl(product.image)) {
            const productImage = await loadImage(product.image);
            // Calculate the size to maintain aspect ratio
            const imageSize = calculateAspectRatioFit(
                productImage.width,
                productImage.height,
                200, // Maximum image width
                200  // Maximum image height
            );
            // Draw the image with the new size
            ctx.drawImage(productImage, 10, 10, imageSize.width, imageSize.height);
        }

        // Set font style for title and description
        // If registered a custom font above, use 'CustomFont' as the family
        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        ctx.textBaseline = 'top';
        ctx.fillText(product.title, 220, 50); // Adjust position as needed

        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(product.description, 220, 100, width - 240); // Wrap text at the edge of the canvas

        // Convert canvas to Data URL
        const dataUrl = canvas.toDataURL();

        // To save the image to a file instead, do the following
        // const buffer = canvas.toBuffer('image/png');
        // fs.writeFileSync('path-to-save-image.png', buffer);

        return dataUrl; // This will give a base64 encoded image
    } catch (error) {
        console.error('Error in generating image:', error);
        throw error;
    }
}

module.exports = generateProductImage;
