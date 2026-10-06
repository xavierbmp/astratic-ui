import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // El indicador flotante de desarrollo tapa el usuario de la sidebar; los errores se siguen mostrando.
  devIndicators: false,
  images: {
    // Fotos de ejemplo del workspace (Unsplash) e iconos de las webs del directorio de enlaces.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons" },
    ],
  },
}

export default nextConfig
