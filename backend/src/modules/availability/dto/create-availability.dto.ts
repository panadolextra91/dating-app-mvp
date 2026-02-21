import { IsDateString, IsUUID } from 'class-validator';
import { IsAfter } from '../../../common/validators/is-after.validator';
import { IsWithinNextWeeks } from '../../../common/validators/is-within-next-weeks.validator';

export class CreateAvailabilityDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  @IsWithinNextWeeks(3, { message: 'startTime must be within the next 3 weeks' })
  startTime: string;

  @IsDateString()
  @IsAfter('startTime', { message: 'endTime must be after startTime' })
  @IsWithinNextWeeks(3, { message: 'endTime must be within the next 3 weeks' })
  endTime: string;
}
