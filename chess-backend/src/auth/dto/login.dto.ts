import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsString()
    username: string;

    @IsNotEmpty()
    password: string;
}