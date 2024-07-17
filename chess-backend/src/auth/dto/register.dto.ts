import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    username: string;

    @IsNotEmpty()
    password: string;
}