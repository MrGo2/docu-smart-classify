
import * as paddleOcr from '@paddle-js-models/ocr';

export class OcrEngineManager {
  private modelLoaded = false;
  private modelLoading = false;
  private ocrInstance: any = null;

  async getEngine(): Promise<any> {
    if (!this.modelLoaded) {
      if (!this.modelLoading) {
        this.modelLoading = true;
        
        if (!this.ocrInstance) {
          console.log("Initializing PaddleOCR engine...");
          
          try {
            // Check the actual interface of the paddleOcr.init function
            // The error suggests it expects a string, not an object
            await paddleOcr.init(
              'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/'
            );
            
            console.log("PaddleOCR engine initialized successfully");
            
            // Store the initialized module for later use
            this.ocrInstance = paddleOcr;
          } catch (error) {
            console.error("Failed to initialize PaddleOCR engine:", error);
            throw error;
          }
        }
        
        this.modelLoaded = true;
        this.modelLoading = false;
      } else {
        while (this.modelLoading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    return this.ocrInstance;
  }

  dispose(): void {
    if (this.modelLoaded && this.ocrInstance) {
      this.ocrInstance = null;
      this.modelLoaded = false;
    }
  }
}
