/**
 * Crops an image to a specific maximum width or height while maintaining its aspect ratio.
 *
 * @param imageFile - The original image file to be cropped.
 * @param maxSize - The maximum width or height of the cropped image.
 * @returns A new File object with the cropped image.
 */
export async function cropImage(imageFile: File, maxSize = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!imageFile.type.startsWith('image/')) {
      reject(new Error('Provided file is not an image'))
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Define max size
      let width = img.width
      let height = img.height

      // Calculate new dimensions while keeping aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height
          height = maxSize
        }
      }

      // Set canvas to the new calculated dimensions
      canvas.width = width
      canvas.height = height

      // Draw the resized image on the canvas
      ctx!.drawImage(img, 0, 0, width, height)

      // Convert canvas to blob and create a new File
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('Canvas conversion to blob failed'))
        }
      }, imageFile.type)

      URL.revokeObjectURL(img.src) // clean up the Object URL once done
    }

    img.onerror = () => reject(new Error('Failed to load the image'))
    img.src = URL.createObjectURL(imageFile)
  })
}
