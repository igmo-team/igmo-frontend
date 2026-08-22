import axios from 'axios';

import { captureAnalyticsEvent } from '../analytics';

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

type RequestConfig<RequestBody> = Omit<
  AxiosRequestConfig<RequestBody>,
  'url' | 'method'
> & {
  url: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

async function get<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, ...options } = config;
  return requestWithAnalytics('GET', url, () =>
    axiosInstance.get<ResponseBody>(url, options),
  );
}

async function post<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  return requestWithAnalytics('POST', url, () =>
    axiosInstance.post<ResponseBody>(url, data, options),
  );
}

async function patch<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  return requestWithAnalytics('PATCH', url, () =>
    axiosInstance.patch<ResponseBody>(url, data, options),
  );
}

async function put<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  return requestWithAnalytics('PUT', url, () =>
    axiosInstance.put<ResponseBody>(url, data, options),
  );
}

async function del<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, ...options } = config;
  return requestWithAnalytics('DELETE', url, () =>
    axiosInstance.delete<ResponseBody>(url, options),
  );
}

async function requestWithAnalytics<ResponseBody>(
  method: string,
  url: string,
  request: () => Promise<AxiosResponse<ResponseBody>>,
) {
  const startedAt = performance.now();

  try {
    const response = await request();

    captureAnalyticsEvent('api_request_completed', {
      method,
      endpoint: url,
      status: response.status,
      duration_ms: Math.round(performance.now() - startedAt),
      success: true,
    });

    return response.data;
  } catch (error) {
    captureAnalyticsEvent('api_request_completed', {
      method,
      endpoint: url,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      duration_ms: Math.round(performance.now() - startedAt),
      success: false,
    });

    throw error;
  }
}

const client = {
  get,
  post,
  patch,
  put,
  delete: del,
};

export default client;
