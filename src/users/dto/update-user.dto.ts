import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
  // Add any other fields that can be updated
}
