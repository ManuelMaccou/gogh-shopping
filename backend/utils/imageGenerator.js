const { createCanvas, loadImage } = require('canvas');

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}

function calculateContainAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
    const srcRatio = srcWidth / srcHeight;
    return srcRatio > 1 ? { width: maxWidth, height: maxWidth / srcRatio } : { width: maxHeight * srcRatio, height: maxHeight };
}

function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines, measureOnly = false) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    let totalHeight = 0;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            if (lineCount === maxLines) break;
            if (!measureOnly) context.fillText(line, x, y + totalHeight);
            line = words[n] + ' ';
            totalHeight += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    if (lineCount < maxLines) {
        if (!measureOnly) context.fillText(line, x, y + totalHeight);
        totalHeight += lineHeight;
    }

    return totalHeight; // Return the total height of the text
}

async function generateProductImage(product) {
    const height = 400;
    const width = Math.round(height * 1.91);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    try {
        if (product.image && isValidUrl(product.image)) {
            const productImage = await loadImage(product.image);
            const imageSize = calculateContainAspectRatio(productImage.width, productImage.height, width * 0.5, height);
            const xOffset = (width * 0.5 - imageSize.width) / 2;
            const yOffset = (height - imageSize.height) / 2;
            ctx.drawImage(productImage, xOffset, yOffset, imageSize.width, imageSize.height);
        }

        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        const descriptionLineHeight = 24;
        const maxDescriptionLines = 12;
        const textX = width * 0.5 + 20;
        // Measure the height without drawing
        const descriptionTextHeight = wrapText(ctx, product.description, textX, 0, width - (textX + 20), descriptionLineHeight, maxDescriptionLines, true);
        // Calculate the Y position for centered text
        const descriptionY = (height - descriptionTextHeight) / 2;
        // Draw the text
        wrapText(ctx, product.description, textX, descriptionY, width - (textX + 20), descriptionLineHeight, maxDescriptionLines);

        const dataUrl = canvas.toDataURL();

        return dataUrl;
    } catch (error) {
        console.error('Error in generating image:', error);
        throw error;
    }
}

module.exports = generateProductImage;
