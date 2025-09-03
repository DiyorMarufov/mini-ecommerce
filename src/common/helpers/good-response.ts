export const goodResponse = <T>(
  status_code: number,
  message: string,
  data: T
) => {
  return { status_code, message, data };
}; /* class GoodResponse {
  constructor(
    public statusCode: number,
    public message: string,
    public data: Object,
    public dataName: string
  ) {
    this[dataName] = data;
    this.message = message;
    this.statusCode = statusCode;
  }
} */
