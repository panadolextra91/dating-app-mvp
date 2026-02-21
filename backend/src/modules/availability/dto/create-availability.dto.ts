import { IsDateString, IsUUID } from 'class-validator';
import { IsAfter } from '../../../common/validators/is-before.validator';

export class CreateAvailabilityDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsAfter('startTime', { message: 'endTime must be after startTime' })
  endTime: string;
}
