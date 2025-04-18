
/**
 * Interface for document storage operations
 */
export interface StorageProviderInterface {
  /**
   * Unique identifier for the storage provider
   */
  id: string;
  
  /**
   * Display name of the storage provider
   */
  name: string;
  
  /**
   * Store a document in the storage system
   * 
   * @param file The file to store
   * @param metadata Additional data about the file
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @returns A storage reference or path
   */
  storeDocument(
    file: File,
    metadata: Record<string, any>,
    onProgressUpdate: (progress: number) => void
  ): Promise<string>;
  
  /**
   * Retrieve a document from storage
   * 
   * @param storagePath Path or reference to the stored document
   * @returns The requested file or a URL to access it
   */
  retrieveDocument(storagePath: string): Promise<File | string>;
  
  /**
   * Delete a document from storage
   * 
   * @param storagePath Path or reference to the stored document
   * @returns Whether deletion was successful
   */
  deleteDocument(storagePath: string): Promise<boolean>;
}

/**
 * Abstract base class for all storage providers
 */
export abstract class AbstractStorageProvider implements StorageProviderInterface {
  /**
   * Unique identifier for the storage provider
   */
  id: string;
  
  /**
   * Display name of the storage provider
   */
  name: string;

  /**
   * Create a new AbstractStorageProvider
   * 
   * @param id Provider ID
   * @param name Display name
   */
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Store a document in the storage system
   * 
   * @param file The file to store
   * @param metadata Additional data about the file
   * @param onProgressUpdate Callback for reporting progress (0-100)
   * @returns A storage reference or path
   */
  abstract storeDocument(
    file: File,
    metadata: Record<string, any>,
    onProgressUpdate: (progress: number) => void
  ): Promise<string>;
  
  /**
   * Retrieve a document from storage
   * 
   * @param storagePath Path or reference to the stored document
   * @returns The requested file or a URL to access it
   */
  abstract retrieveDocument(storagePath: string): Promise<File | string>;
  
  /**
   * Delete a document from storage
   * 
   * @param storagePath Path or reference to the stored document
   * @returns Whether deletion was successful
   */
  abstract deleteDocument(storagePath: string): Promise<boolean>;
}
