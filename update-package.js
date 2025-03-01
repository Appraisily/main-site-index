const fs = require("fs");

// Read the package.json file
const pkg = JSON.parse(fs.readFileSync("package.json"));

// Update the build script to include fix-missing-images.js
pkg.scripts.build = "tsc && vite build && node scripts/fix-missing-images.js && node scripts/generate-static.js && node scripts/copy-static.js";

// Write the updated package.json file
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));

console.log("Updated package.json build script to include fix-missing-images.js"); 