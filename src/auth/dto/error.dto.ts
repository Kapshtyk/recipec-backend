import { ApiProperty } from '@nestjs/swagger'

export class ErrorDto {
  @ApiProperty({ description: 'Erroorr message' })
  message: string
}
