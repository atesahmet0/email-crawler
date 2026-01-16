import axios, { AxiosError } from 'axios';
import { Logger } from '../logger/logger';

export interface HTTPResponse {
  status: number;
  body: string;
  error?: string;
}

export interface HTTPClient {
  fetch(url: string): Promise<HTTPResponse>;
}

export class AxiosHTTPClient implements HTTPClient {
  private readonly timeout: number;
  private readonly logger: Logger;

  constructor(timeout: number = 10000, logger: Logger) {
    this.timeout = timeout;
    this.logger = logger;
  }

  async fetch(url: string): Promise<HTTPResponse> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EmailExtractor/1.0)',
        },
        validateStatus: () => true, // Don't throw on any status code
        maxRedirects: 5,
      });

      // Log successful HTTP request
      this.logger.logHTTPRequest(url, response.status);

      // Ensure body is a string
      const body = typeof response.data === 'string' ? response.data : String(response.data || '');

      return {
        status: response.status,
        body: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
          const errorMsg = `Connection timeout: ${url}`;
          this.logger.logHTTPError(url, errorMsg);
          return {
            status: 0,
            body: '',
            error: errorMsg,
          };
        }
        
        if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
          const errorMsg = `Connection failed: Unable to reach ${url}`;
          this.logger.logHTTPError(url, errorMsg);
          return {
            status: 0,
            body: '',
            error: errorMsg,
          };
        }

        const errorMsg = `Network error: ${axiosError.message}`;
        this.logger.logHTTPError(url, errorMsg);
        return {
          status: 0,
          body: '',
          error: errorMsg,
        };
      }

      const errorMsg = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.logHTTPError(url, errorMsg);
      return {
        status: 0,
        body: '',
        error: errorMsg,
      };
    }
  }
}

export function createHTTPClient(timeout?: number, logger?: Logger): HTTPClient {
  // Use SilentLogger as default if no logger provided for backward compatibility
  const { SilentLogger } = require('../logger/logger');
  const defaultLogger = logger || new SilentLogger();
  return new AxiosHTTPClient(timeout || 10000, defaultLogger);
}
