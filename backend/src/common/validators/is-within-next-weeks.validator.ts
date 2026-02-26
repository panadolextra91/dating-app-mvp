import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsWithinNextWeeksConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [weeks] = args.constraints;
    if (!value) return false;

    const date = new Date(value);
    const now = new Date();
    const maxDate = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

    return date >= now && date <= maxDate;
  }

  defaultMessage(args: ValidationArguments): string {
    const [weeks] = args.constraints;
    return `${args.property} must be within the next ${weeks} weeks`;
  }
}

export function IsWithinNextWeeks(
  weeks: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [weeks],
      validator: IsWithinNextWeeksConstraint,
    });
  };
}
