// Utility to get cropped image from react-easy-crop
// Usage: getCroppedImg(imageSrc, croppedAreaPixels)

export const getCroppedImg = (imageSrc, croppedAreaPixels) => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
      } catch (error) {
        console.error("Error creating or drawing on canvas:", error);
        reject(error);
        return;
      }

      canvas.toBlob((blob) => {
        try {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            try {
              resolve(reader.result);
            } catch (error) {
              console.error("Error resolving reader result:", error);
              reject(error);
            }
          };
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            reject(error);
          };
        } catch (error) {
          console.error("Error processing blob:", error);
          reject(error);
        }
      }, 'image/jpeg');
    };
    image.onerror = () => reject(new Error('Failed to load image'));
  });
}; 