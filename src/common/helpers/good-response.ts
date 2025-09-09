export const goodResponse = (
  statusCode: number,
  message: string,
  data,
  dataName: string
) => {
  return { statusCode, message, data };
};
