
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
          this.ocrInstance = new paddleOcr.OCREngine({
            detPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/assets/ppocr_det/',
            recPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/assets/ppocr_rec/',
            wasmPath: 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/',
          });
          
          await this.ocrInstance.init();
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
