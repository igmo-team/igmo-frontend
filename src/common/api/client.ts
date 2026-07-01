import axios from 'axios';

import type { AxiosRequestConfig } from 'axios';

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
  const response = await axiosInstance.get<ResponseBody>(url, options);

  return response.data;
}

async function post<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  const response = await axiosInstance.post<ResponseBody>(url, data, options);

  return response.data;
}

async function patch<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  const response = await axiosInstance.patch<ResponseBody>(url, data, options);

  return response.data;
}

async function put<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, data, ...options } = config;
  const response = await axiosInstance.put<ResponseBody>(url, data, options);

  return response.data;
}

async function del<ResponseBody, RequestBody>(
  config: RequestConfig<RequestBody>,
): Promise<ResponseBody> {
  const { url, ...options } = config;
  const response = await axiosInstance.delete<ResponseBody>(url, options);

  return response.data;
}

const client = {
  get,
  post,
  patch,
  put,
  delete: del,
};

export default client;
