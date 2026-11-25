/**
 * Calculates new width and height for an image, capping the longest side
 * to maxDimension while strictly preserving the aspect ratio.
 * 
 * @param {number} width - Original image width in pixels
 * @param {number} height - Original image height in pixels
 * @param {number} maxDimension - Maximum allowed size on the longest edge (default 1600px)
 * @returns {{ width: number, height: number }} - Scaled dimensions
 */
export function calculateTargetDimensions(width, height, maxDimension = 1600) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { width: maxDimension, height: maxDimension };
  }

  // If already within bounds, do not enlarge
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width >= height) {
    // Landscape or square
    const ratio = height / width;
    return {
      width: maxDimension,
      height: Math.round(maxDimension * ratio),
    };
  } else {
    // Portrait
    const ratio = width / height;
    return {
      width: Math.round(maxDimension * ratio),
      height: maxDimension,
    };
  }
}

/**
 * Resizes an image file in the browser using HTML5 Canvas and converts it to JPEG.
 * Reduces bandwidth and prevents memory exhaustion on the backend.
 * 
 * @param {File} file - Original user image file
 * @param {number} maxDimension - Longest side limit (default 1600px)
 * @param {number} quality - JPEG compression quality 0.0 to 1.0 (default 0.85)
 * @returns {Promise<File>} - Resized and compressed image File
 */
export async function resizeImage(file, maxDimension = 1600, quality = 0.85) {
  // If not an image, return original file
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          const { width, height } = calculateTargetDimensions(
            img.width,
            img.height,
            maxDimension
          );

          // Create an offscreen canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve(file); // Fallback to original if canvas 2D context fails
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw the resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              // Create a new File object with a .jpg filename
              const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const resizedFile = new File([blob], cleanName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              resolve(resizedFile);
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          console.error("Canvas resize error:", err);
          resolve(file); // Fallback to original file
        }
      };

      img.onerror = () => {
        console.warn("Failed to load image element, using original file");
        resolve(file);
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      console.warn("Failed to read image file, using original file");
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
