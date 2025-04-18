import * as paddleOcr from '@paddle-js-models/ocr';

const MODEL_CDN_URL = 'https://cdn.jsdelivr.net/npm/@paddle-js-models/ocr/dist/paddle-ocr-wasm/';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const INIT_TIMEOUT = 60000; // 60 seconds
const INIT_CHECK_INTERVAL = 200; // 200ms

export class OcrEngineManager {
  private modelLoaded = false;
  private modelLoading = false;
  private ocrInstance: any = null;
  private initializationError: Error | null = null;
  private initializationPromise: Promise<void> | null = null;
  private readonly TEST_TEXT = 'Hello World';

  async getEngine(): Promise<any> {
    if (this.initializationError) {
      throw this.initializationError;
    }

    if (!this.modelLoaded) {
      if (!this.initializationPromise) {
        this.initializationPromise = this.initializeEngine();
      }

      try {
        await Promise.race([
          this.initializationPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout waiting for OCR engine initialization")), INIT_TIMEOUT)
          )
        ]);
      } catch (error) {
        this.initializationError = error instanceof Error ? error : new Error(String(error));
        this.modelLoading = false;
        this.initializationPromise = null;
        throw this.initializationError;
      }
    }

    return this.ocrInstance;
  }

  private async initializeEngine(): Promise<void> {
    if (this.modelLoading || this.modelLoaded) {
      return;
    }

    this.modelLoading = true;
    console.log("Initializing PaddleOCR engine...");

    try {
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
          this.modelLoaded = true;
          return;

        } catch (error) {
          console.error(`PaddleOCR initialization attempt ${attempt} failed:`, error);
          if (attempt === MAX_RETRIES) {
            throw error;
          }
        }
      }
    } catch (error) {
      this.initializationError = new Error(`Failed to initialize PaddleOCR: ${error.message}`);
      throw this.initializationError;
    } finally {
      this.modelLoading = false;
      this.initializationPromise = null;
    }
  }

  private extractTestText(result: any[]): string {
    return result
      .map(block => block.text || '')
      .join(' ')
      .trim();
  }

  private async createTestImage(): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
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
      img.src = canvas.toDataURL('image/png', 1.0);
    });
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
        this.initializationPromise = null;
      }
    }
  }
}
