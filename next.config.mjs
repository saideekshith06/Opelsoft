/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Keep these out of the server bundle so they're required from real node_modules
  // at runtime. pdf-parse loads @napi-rs/canvas for DOMMatrix/ImageData/Path2D;
  // bundling breaks that resolution (DOMMatrix is not defined -> empty PDF text).
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'nodemailer'],
};

export default nextConfig;
