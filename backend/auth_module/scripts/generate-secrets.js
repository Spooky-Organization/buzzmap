const crypto = require("crypto");

// Generate secure JWT secrets using cryptographically strong random bytes
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString("base64");
};

// Generate JWT Access Token Secret (64 bytes = 512 bits)
const jwtSecret = generateSecret(64);

// Generate JWT Refresh Token Secret (64 bytes = 512 bits)
const jwtRefreshSecret = generateSecret(64);

console.log("🔐 Generated Secure JWT Secrets");
console.log("================================");
console.log("");
console.log("JWT_SECRET=" + jwtSecret);
console.log("");
console.log("JWT_REFRESH_SECRET=" + jwtRefreshSecret);
console.log("");
console.log("⚠️  IMPORTANT:");
console.log("- Copy these secrets to your .env file");
console.log(
  "- Keep these secrets secure and never commit them to version control"
);
console.log(
  "- Use different secrets for each environment (development, staging, production)"
);
console.log("- These are 512-bit (64-byte) secrets for maximum security");
