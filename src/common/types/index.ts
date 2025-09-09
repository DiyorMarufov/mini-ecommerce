import { Role } from "../enum";
import { Request } from "express";

export interface IPayload {
  id: number;
  role: Role;
}

export type IRequest = Request & { user: IPayload };
