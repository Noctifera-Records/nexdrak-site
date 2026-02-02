// Default image config.
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

// List of images.
export const requiredImages = [
  "/img/logo.png",
  "/img/red.png", 
  "/img/others/xayah.jpg",
  "/img/others/live-performance.jpg"
];