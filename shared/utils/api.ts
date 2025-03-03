/**
 * Shared API client utilities for Appraisily applications
 */

import { ApiError } from '../types/models';

// Add type declaration for Vite's import.meta.env
declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string;
    [key: string]: any;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Configuration for API requests
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Request options for fetch calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Creates a configured API client instance
 * @param config API client configuration
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, timeout = 10000, headers: defaultHeaders = {} } = config;

  /**
   * Builds a full URL with query parameters
   */
  const buildUrl = (
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string => {
    const url = new URL(`${baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  };

  /**
   * Creates an AbortController with timeout
   */
  const createTimeoutController = (
    ms: number
  ): { controller: AbortController; timeoutId: number } => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ms);
    return { controller, timeoutId };
  };

  /**
   * Handles API errors and transforms them into consistent format
   */
  const handleApiError = async (response: Response): Promise<ApiError> => {
    try {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        message: errorData.message || response.statusText,
        errors: errorData.errors,
        timestamp: new Date().toISOString(),
        path: response.url,
      };
    } catch (error) {
      return {
        statusCode: response.status,
        message: response.statusText,
        timestamp: new Date().toISOString(),
        path: response.url,
      };
    }
  };

  /**
   * Performs an API request
   */
  const request = async <T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers = {}, params, timeout: requestTimeout = timeout, signal } = options;

    // Set up request timeout
    let timeoutController;
    let requestSignal = signal;

    if (!signal) {
      timeoutController = createTimeoutController(requestTimeout);
      requestSignal = timeoutController.controller.signal;
    }

    try {
      const url = buildUrl(endpoint, params);

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...defaultHeaders,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: requestSignal,
      };

      if (data && method !== 'GET' && method !== 'HEAD') {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestOptions);

      // Clear timeout if we got a response
      if (timeoutController) {
        clearTimeout(timeoutController.timeoutId);
      }

      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (timeoutController) {
        clearTimeout(timeoutController.timeoutId);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          statusCode: 408,
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
          path: endpoint,
        };
      }

      throw error;
    }
  };

  // Return the API client interface
  return {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>('GET', endpoint, undefined, options),

    post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>('POST', endpoint, data, options),

    put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>('PUT', endpoint, data, options),

    patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>('PATCH', endpoint, data, options),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>('DELETE', endpoint, undefined, options),
  };
}

/**
 * Create a default API client instance using environment variables
 */
export const defaultApiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.appraisily.com',
  headers: {
    Accept: 'application/json',
  },
});
