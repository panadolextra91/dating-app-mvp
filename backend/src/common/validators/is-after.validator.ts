import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(endTime: any, args: ValidationArguments): boolean {
    const [startTimeField] = args.constraints;
    const startTime = (args.object as any)[startTimeField];

    if (!startTime || !endTime) return false;

    return new Date(startTime).getTime() < new Date(endTime).getTime();
  }

  defaultMessage(args: ValidationArguments): string {
    const [startTimeField] = args.constraints;
    return `${args.property} must be after ${startTimeField}`;
  }
}

export function IsAfter(
  startTimeField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [startTimeField],
      validator: IsAfterConstraint,
    });
  };
}
