import axios from 'axios';
import { FileUploadResponse } from '../config/types';

enum AxiosResponseStatus {
  DATA = 200,
  NO_DATA = 204,
  SUCCESS = 301,
  ERROR = 500
}

enum RequestType {
  GET = 'get',
  POST = 'post'
}

type AxiosResponse<T> = {
  status: AxiosResponseStatus,
  data?: T
  error?: string
}

const a = axios.create({
  baseURL: process.env.MEDIASERVICE_URL,
  withCredentials: true
});

const getAuthToken = () => localStorage.getItem('fb_token');

async function request<ResponseType>( method: RequestType, url: string, data = {} ): Promise<AxiosResponse<ResponseType>> {
  const token = getAuthToken();

  //  solution in LinkPeak is much better, but meh
  const response = await a.request({
    url,
    method,
    data,
    headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
  });

  if ( response.data.status === AxiosResponseStatus.ERROR ) {
    throw new Error( response.data.error );
  }

  return response.data;
}

export async function videoUpload( file: File ): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('video', file);

  const { data }  = await request<FileUploadResponse>( RequestType.POST, '/video', formData );

  return data;
}

export type ProcessingStatusResponse<T = string> = {
  webm: T,
  mp4: T
}

export async function processingStatus( key: string ): Promise<ProcessingStatusResponse<number>> {
  const { data } = await request<ProcessingStatusResponse>( RequestType.GET, '/video/status/' + key );

  return { mp4: parseFloat(data.mp4), webm: parseFloat(data.webm)};
}
