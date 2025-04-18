import * as paddleOcr from '@paddle-js-models/ocr';

const MODEL_CDN_URL = 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class OcrEngineManager {
  private modelLoaded = false;
  private modelLoading = false;
  private ocrInstance: any = null;
  private initializationError: Error | null = null;
  private readonly TEST_TEXT = 'Hello World';

  async getEngine(): Promise<any> {
    if (this.initializationError) {
      throw this.initializationError;
    }

    if (!this.modelLoaded) {
      if (!this.modelLoading) {
        this.modelLoading = true;
        
        if (!this.ocrInstance) {
          console.log("Initializing PaddleOCR engine...");
          
          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              if (attempt > 1) {
                console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              }

              await paddleOcr.init(MODEL_CDN_URL);
              console.log("PaddleOCR engine initialized successfully");
              
              // Test the engine with a simple recognition
              const testImage = await this.createTestImage();
              const testResult = await paddleOcr.recognize(testImage);
              
              if (!testResult || !Array.isArray(testResult)) {
                throw new Error("Engine initialization test failed: Invalid result structure");
              }

              // Verify that the test text was recognized
              const recognizedText = this.extractTestText(testResult);
              if (!recognizedText.toLowerCase().includes(this.TEST_TEXT.toLowerCase())) {
                throw new Error(`Engine initialization test failed: Expected "${this.TEST_TEXT}" but got "${recognizedText}"`);
              }
              
              console.log("Engine test successful:", recognizedText);
              this.ocrInstance = paddleOcr;
              break;
            } catch (error) {
              console.error(`PaddleOCR initialization attempt ${attempt} failed:`, error);
              if (attempt === MAX_RETRIES) {
                this.initializationError = new Error(`Failed to initialize PaddleOCR after ${MAX_RETRIES} attempts: ${error.message}`);
                throw this.initializationError;
              }
            }
          }
        }
        
        this.modelLoaded = true;
        this.modelLoading = false;
      } else {
        let waitTime = 0;
        const maxWaitTime = 30000; // 30 seconds
        
        while (this.modelLoading && waitTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitTime += 100;
        }
        
        if (this.modelLoading) {
          throw new Error("Timeout waiting for OCR engine initialization");
        }
      }
    }
    
    return this.ocrInstance;
  }

  private async createTestImage(): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    canvas.width = 300; // Increased size for better recognition
    canvas.height = 100;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Create a clean background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text with better visibility
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Add a slight shadow for better contrast
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Draw the test text
    ctx.fillText(this.TEST_TEXT, canvas.width / 2, canvas.height / 2);
    
    // Convert canvas to image
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to create test image'));
      img.src = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
    });
  }

  private extractTestText(result: any[]): string {
    try {
      return result
        .map(block => {
          if (typeof block === 'object' && block !== null) {
            if (typeof block.text === 'string') {
              return block.text;
            } else if (Array.isArray(block.words)) {
              return block.words
                .map((word: any) => typeof word === 'string' ? word : word.text)
                .filter(Boolean)
                .join(' ');
            }
          }
          return '';
        })
        .filter(Boolean)
        .join(' ');
    } catch (error) {
      console.error('Error extracting test text:', error);
      return '';
    }
  }

  async dispose(): Promise<void> {
    if (this.modelLoaded && this.ocrInstance) {
      try {
        // Add proper cleanup if the engine provides any
        if (typeof this.ocrInstance.dispose === 'function') {
          await this.ocrInstance.dispose();
        }
      } catch (error) {
        console.warn("Error during OCR engine disposal:", error);
      } finally {
        this.ocrInstance = null;
        this.modelLoaded = false;
        this.modelLoading = false;
        this.initializationError = null;
      }
    }
  }
}
