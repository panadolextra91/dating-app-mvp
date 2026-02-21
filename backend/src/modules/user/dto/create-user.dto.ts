import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(18, { message: 'Age must be at least 18' })
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  bio?: string;
}
