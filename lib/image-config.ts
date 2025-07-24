// Configuración de imágenes para evitar errores 404
export const imageConfig = {
  logo: "/img/logo.png",
  redEyeFlight: "/img/red.png",
  
  artistPhoto: "/img/others/xayah.jpg",
  livePerformance: "/img/others/live-performance.jpg",
  
  placeholder: "/placeholder.svg",
  
  getImageSrc: (src: string, fallback: string = "/placeholder.svg") => {
    return src || fallback;
  }
};

// Lista de imágenes que deben existir en el proyecto
export const requiredImages = [
  "/img/logo.png",
  "/img/red.png", 
  "/img/others/xayah.jpg",
  "/img/others/live-performance.jpg"
];