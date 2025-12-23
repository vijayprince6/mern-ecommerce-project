// Quick script to check if .env file has JWT_SECRET
require('dotenv').config();

console.log('Checking environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✓' : 'NOT SET ✗');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET ✓' : 'NOT SET ✗');
console.log('PORT:', process.env.PORT || '5000 (default)');

if (!process.env.JWT_SECRET) {
  console.error('\n❌ ERROR: JWT_SECRET is not set!');
  console.log('\nPlease add this to your .env file:');
  console.log('JWT_SECRET=your_secret_key_here_make_it_long_and_random');
} else {
  console.log('\n✅ All environment variables are set correctly!');
}


