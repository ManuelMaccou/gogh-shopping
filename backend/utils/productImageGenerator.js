const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

async function getDominantColor(imageUrl) {
    const image = await Jimp.read(imageUrl);
    const dominantColor = await image.getPixelColor(0, 0);
    return Jimp.intToRGBA(dominantColor);
}

function isLight(r, g, b) {
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

async function GenerateProductImage(productData) {
    const imageUrl = productData.image;
    const buffer = await Jimp.read(imageUrl).then(image => image.getBufferAsync(Jimp.MIME_PNG));
    const dominantColor = await getDominantColor(imageUrl);
    const image = await loadImage(Buffer.from(buffer));
  
    const canvasWidth = 1000;
    const canvasHeight = 524;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `rgb(${dominantColor.r},${dominantColor.g},${dominantColor.b})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate room needed for text based on an estimation
    const textHeightEstimation = 100; // Adjust based on expected text size
    let scaleFactor = Math.min(canvasWidth / image.width, (canvasHeight - textHeightEstimation) / image.height);
    let imageWidth = image.width * scaleFactor;
    let imageHeight = image.height * scaleFactor;

    // Position the image closer to the top, leaving room for text below
    let imageX = (canvasWidth - imageWidth) / 2;
    let imageY = 20; // Adjust this value as needed to position the image closer to the top

    ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);

    const textColor = isLight(dominantColor.r, dominantColor.g, dominantColor.b) ? 'black' : 'white';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Verdana';
    ctx.textAlign = 'center';

    // Calculate text position based on image position and height
    let textX = canvasWidth / 2;
    let textY = imageY + imageHeight + 30; // Adjust this value as needed based on the text size

    // Text wrapping function, as previously described
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    };

    wrapText(productData.title, textX, textY, canvasWidth - 40, 28); // Adjust as needed

    const dataUrl = canvas.toDataURL();
    return dataUrl;
}

module.exports = GenerateProductImage;
