import { Injectable } from "@nestjs/common";
import { Role } from "../enum";

export interface Payload {
  id: number;
  role: Role;
}
