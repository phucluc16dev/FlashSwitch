const icongen = require('icon-gen');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = process.argv[2];
if (!sourceImage) {
    console.error('Usage: node scripts/update-icons.js <source-image-path>');
    process.exit(1);
}

const imagesDir = path.join(__dirname, '../images');
const assetsDir = path.join(__dirname, '../src/assets');

// Ensure directories exist
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

async function generateIcons() {
    console.log(`Generating icons from ${sourceImage}...`);

    try {
        // 1. Generate ICO and ICNS for Electron Forge
        console.log('Generating .ico and .icns...');
        await icongen(sourceImage, imagesDir, {
            report: true,
            ico: {
                name: 'icon',
                sizes: [16, 24, 32, 48, 64, 128, 256]
            },
            icns: {
                name: 'icon',
                sizes: [16, 32, 64, 128, 256, 512, 1024]
            }
        });

        // 2. Generate standard PNGs for AppImage / Linux
        console.log('Generating PNGs...');
        const sizes = [16, 32, 64, 128];
        for (const size of sizes) {
            await sharp(sourceImage)
                .resize(size, size)
                .toFile(path.join(imagesDir, `${size}x${size}.png`));
        }
        // High DPI 128x128@2x (256x256)
        await sharp(sourceImage)
            .resize(256, 256)
            .toFile(path.join(imagesDir, '128x128@2x.png'));

        // Main icon.png
        await sharp(sourceImage)
            .resize(512, 512)
            .toFile(path.join(imagesDir, 'icon.png'));

        // 3. Generate Tray Icon
        // Tray icons often need to be small and possibly monochrome, but for now we'll just resize.
        // Recommended size for tray is usually 16x16 or 24x24 (with @2x variants). 
        // We will generate a 24x24 png for tray.
        console.log('Generating tray.png...');
        await sharp(sourceImage)
            .resize(24, 24)
            .toFile(path.join(assetsDir, 'tray.png'));

        // Also copy to images/tray.png just in case
        await sharp(sourceImage)
            .resize(24, 24)
            .toFile(path.join(imagesDir, 'tray.png'));

        // Generate src/assets/icon.png (Used in Dev Mode)
        console.log('Generating src/assets/icon.png...');
        await sharp(sourceImage)
            .resize(512, 512)
            .toFile(path.join(assetsDir, 'icon.png'));

        // 4. Favicon for Web/Renderer (if needed)
        console.log('Generating favicon.ico...');
        // icon-gen already generated 'icon.ico', let's copy it to favicon.ico or generate specific ones
        // We'll just assume icon.ico is good enough or use the PNGs. 
        // Let's generate a favicon.png for explicit usage
        await sharp(sourceImage)
            .resize(32, 32)
            .toFile(path.join(imagesDir, 'favicon-32.png'));

        console.log('Icon update complete!');
    } catch (err) {
        console.error('Error generating icons:', err);
        process.exit(1);
    }
}

generateIcons();
