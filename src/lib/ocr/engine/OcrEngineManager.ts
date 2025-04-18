
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
          // Initialize the OCR engine using the correct API
          // Check the API documentation to ensure we're correctly passing parameters
          await paddleOcr.init({
            wasmPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/',
          });
          
          // Store the initialized module for later use
          this.ocrInstance = paddleOcr;
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
