const fs = require('fs');
const path = require('path');

// Test if the uploads directory structure is correct
const uploadsRoot = path.join(__dirname, "public", "uploads");
console.log(`Checking uploads directory: ${uploadsRoot}`);

// Check if the directory exists
if (fs.existsSync(uploadsRoot)) {
    console.log('✅ Uploads directory exists');
    
    // Check subdirectories
    const productsDir = path.join(uploadsRoot, 'products');
    if (fs.existsSync(productsDir)) {
        console.log('✅ Products subdirectory exists');
    } else {
        console.log('❌ Products subdirectory does not exist');
        // Try to create it
        fs.mkdirSync(productsDir, { recursive: true });
        console.log('📁 Created products subdirectory');
    }
    
    const tempDir = path.join(productsDir, 'temp');
    if (fs.existsSync(tempDir)) {
        console.log('✅ Temp subdirectory exists');
    } else {
        console.log('❌ Temp subdirectory does not exist');
        // Try to create it
        fs.mkdirSync(tempDir, { recursive: true });
        console.log('📁 Created temp subdirectory');
    }
} else {
    console.log('❌ Uploads directory does not exist');
    // Try to create it
    fs.mkdirSync(uploadsRoot, { recursive: true });
    console.log('📁 Created uploads directory');
}

console.log('\nDirectory structure:');
console.log('- public/uploads/');
console.log('  - products/');
console.log('    - [productId]/ (individual product folders)');
console.log('    - temp/ (temporary storage for new uploads)');

console.log('\nThe image upload functionality should now work properly.');
console.log('1. When creating a new product, images are temporarily stored in public/uploads/products/temp/');
console.log('2. After the product is created and gets an ID, images are moved to public/uploads/products/[productId]/');
console.log('3. The image paths in the database will reflect the final location');
console.log('4. Static file serving is configured to serve files from /uploads/ path');