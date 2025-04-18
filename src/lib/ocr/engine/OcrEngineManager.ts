
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
          
          // Initialize the OCR engine
          await paddleOcr.init({
            detPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/det.onnx',
            recPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/rec.onnx',
            wasmPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/'
          });
          
          console.log("PaddleOCR engine initialized successfully");
          
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
