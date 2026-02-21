import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(18, { message: 'Age must be at least 18' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  bio?: string;
}
