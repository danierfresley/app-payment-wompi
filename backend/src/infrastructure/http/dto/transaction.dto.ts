import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsUUID('loose')
  productId!: string;

  @ApiProperty()
  @IsUUID('loose')
  customerId!: string;

  @ApiProperty()
  @IsUUID('loose')
  deliveryId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Tokenized card from the payment provider' })
  @IsString()
  @IsNotEmpty()
  cardToken!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  acceptanceToken!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  acceptPersonalAuth!: string;
}
