const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

async function getDominantColor(imageUrl) {
    const image = await Jimp.read(imageUrl);
    const dominantColor = await image.getPixelColor(0, 0); // Simplified method to get dominant color
    return Jimp.intToRGBA(dominantColor);
}

async function GenerateProductImage(productData) {
    const imageUrl = productData.image;
    const buffer = await Jimp.read(imageUrl).then(image => image.getBufferAsync(Jimp.MIME_PNG));
    const dominantColor = await getDominantColor(imageUrl);
    const image = await loadImage(Buffer.from(buffer));
  
    const margin = 15; // Margin on top and bottom
    const canvasWidth = 1000; // Arbitrary width; adjust as needed
    const canvasHeight = 524;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Set canvas background to dominant color
    ctx.fillStyle = `rgb(${dominantColor.r},${dominantColor.g},${dominantColor.b})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate image dimensions to maintain aspect ratio and fit within canvas margins
    let scaleFactor = Math.min((canvasWidth - 2 * margin) / image.width, (canvasHeight - 2 * margin) / image.height);
    let canvasImageWidth = image.width * scaleFactor;
    let canvasImageHeight = image.height * scaleFactor;
    let imageX = (canvasWidth - canvasImageWidth) / 2; // Center horizontally
    let imageY = (canvasHeight - canvasImageHeight) / 2; // Center vertically

    // Draw the image on the canvas
    ctx.drawImage(image, imageX, imageY, canvasImageWidth, canvasImageHeight);

    // Convert canvas to data URL or save as needed
    const dataUrl = canvas.toDataURL();
    return dataUrl;
}

module.exports = GenerateProductImage;