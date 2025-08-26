export const goodResponse = <T>(
  statusCode: number,
  message: string,
  data: T
) => {
  return { statusCode, message, data };
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
