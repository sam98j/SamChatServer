export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    avatar?: string;
    usrname: string
}