// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'www.themealdb.com', // Existing domain
        'lh3.googleusercontent.com' // Add this domain
      ],
    },
  };
  
  export default nextConfig;
  