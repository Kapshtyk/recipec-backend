import { ApiProperty } from '@nestjs/swagger'

export class ErrorDto {
  @ApiProperty({ description: 'Error message' })
  message: string
}
