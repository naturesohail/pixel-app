/** @type {import('next').NextConfig} */
const nextConfig = {
 
       turbopack: {
                 root: __dirname
       },
        images: {
            remotePatterns: [
                        {
                         protocol: "https",
                         hostname: "aioftheworld.com",
                         pathname: "/**"
                        }
                          ] 
       },
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: `${process.env.BASE_URL||"*"}` },
            { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          ],
        },
      ];
    },
  
  
};

module.exports = nextConfig;
