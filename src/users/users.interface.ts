import { RegisterDTO } from "src/auth/auth.interface";

// Login Successfly Response
export interface LoginSucc {
    _id: string,
    email: string,
    avatar: string,
    name: string,
}