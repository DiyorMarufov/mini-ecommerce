import { hash, compare } from 'bcrypt';

export const encrypt = async (data: string) => {
  return await hash(data, 10);
};

export const decrypt = async (data: string, encryptData: string) => {
  return await compare(data, encryptData);
};
