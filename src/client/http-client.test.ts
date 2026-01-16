import { describe, it, expect } from 'bun:test';
import { AxiosHTTPClient } from './http-client';

describe('AxiosHTTPClient', () => {
  it('should fetch a valid URL successfully', async () => {
    const client = new AxiosHTTPClient();
    const response = await client.fetch('https://example.com');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.error).toBeUndefined();
  });

  it('should handle connection timeout', async () => {
    const client = new AxiosHTTPClient(1); // 1ms timeout
    const response = await client.fetch('https://example.com');
    
    expect(response.status).toBe(0);
    expect(response.error).toContain('timeout');
  });

  it('should handle unreachable host', async () => {
    const client = new AxiosHTTPClient();
    const response = await client.fetch('https://this-domain-does-not-exist-12345.com');
    
    expect(response.status).toBe(0);
    expect(response.error).toBeTruthy();
  });

  it('should handle HTTP error status codes gracefully', async () => {
    const client = new AxiosHTTPClient();
    // Using a URL that will return 404
    const response = await client.fetch('https://example.com/this-page-does-not-exist-12345');
    
    expect(response.status).toBe(404);
    expect(response.body).toBeTruthy();
    expect(response.error).toBeUndefined();
  });
});
