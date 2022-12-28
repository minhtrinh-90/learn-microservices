import axios from 'axios';
import { useState } from 'react';

import { HttpMethods } from '../@types/http-methods';

export default function useRequest<T>({
  url,
  method,
  params,
  body,
  onSuccess,
  onError,
}: {
  url: string;
  method: HttpMethods;
  params?: {
    [key: string]: any;
  };
  body?: {
    [key: string]: any;
  };
  onSuccess?: (arg: T) => void;
  onError?: (error: unknown) => void;
}): { doRequest: () => Promise<T>; errors: string[] | null; loading: boolean } {
  const [errors, setErrors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const doRequest = async () => {
    setErrors(null);
    setLoading(true);
    try {
      const response = await axios.request({
        url,
        method,
        params,
        data: body,
      });
      onSuccess?.(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (Array.isArray(error.response?.data.message)) {
          setErrors(error.response?.data.message);
        } else {
          setErrors([error.response?.data.message]);
        }
      }
      onError?.(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { doRequest, errors, loading };
}
