import crypto from 'crypto';

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret:');
console.log(jwtSecret);
console.log('\nAdd this to your Render environment variables as JWT_SECRET');
console.log('\nYou can also run: echo "JWT_SECRET=' + jwtSecret + '" >> .env');
