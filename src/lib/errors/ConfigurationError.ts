
/**
 * Error class for configuration issues
 */
export class ConfigurationError extends Error {
  /**
   * Component with the configuration error
   */
  component: string;
  
  /**
   * Error code for programmatic handling
   */
  errorCode: string;
  
  /**
   * Additional error details
   */
  details?: Record<string, any>;

  /**
   * Create a new ConfigurationError
   * 
   * @param message Error message
   * @param component The component with the configuration issue
   * @param errorCode Error code
   * @param details Additional error details
   */
  constructor(
    message: string,
    component: string,
    errorCode: string = "CONFIGURATION_ERROR",
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ConfigurationError";
    this.component = component;
    this.errorCode = errorCode;
    this.details = details;
  }

  /**
   * Create a missing API key error
   * 
   * @param service Service name
   * @returns A configuration error
   */
  static missingApiKeyError(service: string): ConfigurationError {
    return new ConfigurationError(
      `No API key configured for ${service}`,
      service,
      "MISSING_API_KEY",
      { service }
    );
  }

  /**
   * Create a missing configuration error
   * 
   * @param component Component name
   * @param configName Name of the missing configuration
   * @returns A configuration error
   */
  static missingConfigurationError(component: string, configName: string): ConfigurationError {
    return new ConfigurationError(
      `Missing configuration "${configName}" for ${component}`,
      component,
      "MISSING_CONFIGURATION",
      { configName }
    );
  }

  /**
   * Create an invalid configuration error
   * 
   * @param component Component name
   * @param configName Name of the invalid configuration
   * @param reason Reason for invalidity
   * @returns A configuration error
   */
  static invalidConfigurationError(
    component: string, 
    configName: string,
    reason: string
  ): ConfigurationError {
    return new ConfigurationError(
      `Invalid configuration "${configName}" for ${component}: ${reason}`,
      component,
      "INVALID_CONFIGURATION",
      { configName, reason }
    );
  }
}
