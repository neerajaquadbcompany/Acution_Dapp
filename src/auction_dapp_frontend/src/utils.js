export function useImageSource(imageArrayBuffer) {
    if (!imageArrayBuffer || !(imageArrayBuffer instanceof Uint8Array)) {
        console.error("Invalid image array buffer: ", imageArrayBuffer);
        return null; 
    }

    try {
        
        const blob = new Blob([imageArrayBuffer], { type: 'image/jpeg' }); 
        
        
        const imageUrl = URL.createObjectURL(blob);

        console.log("Generated Blob URL for image:", imageUrl);
        return imageUrl;

    } catch (error) {
        console.error("Error while creating image source:", error);
        return null;
    }
}
