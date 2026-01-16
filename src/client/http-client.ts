import axios, { AxiosError } from 'axios';

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

  constructor(timeout: number = 10000) {
    this.timeout = timeout;
  }

  async fetch(url: string): Promise<HTTPResponse> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EmailExtractor/1.0)',
        },
        validateStatus: () => true, // Don't throw on any status code
      });

      return {
        status: response.status,
        body: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
          return {
            status: 0,
            body: '',
            error: `Connection timeout: ${url}`,
          };
        }
        
        if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
          return {
            status: 0,
            body: '',
            error: `Connection failed: Unable to reach ${url}`,
          };
        }

        return {
          status: 0,
          body: '',
          error: `Network error: ${axiosError.message}`,
        };
      }

      return {
        status: 0,
        body: '',
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

export function createHTTPClient(timeout?: number): HTTPClient {
  return new AxiosHTTPClient(timeout);
}
