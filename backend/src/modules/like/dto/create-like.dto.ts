import {
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsNotSelfLike implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    return obj.fromUserId !== obj.toUserId;
  }

  defaultMessage(): string {
    return 'You cannot like yourself';
  }
}

export class CreateLikeDto {
  @IsUUID()
  fromUserId: string;

  @IsUUID()
  @Validate(IsNotSelfLike)
  toUserId: string;
}
