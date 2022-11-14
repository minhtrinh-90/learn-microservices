export interface CommonErrorResponse {
  statusCode: number;
  errors: Array<{ message: string; field?: string }>;
}
