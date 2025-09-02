import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({ type: "string", example: "Desk", description: "Product nomi" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    type: "string",
    example: "Dars va ofis ishlari uchun mo‘ljallangan",
    description: "Product uchun ta'rif",
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    type: "number",
    example: 300,
    format: "number",
    description: "Product narxi(USD)",
  })
  @IsPositive()
  @IsNumber()
  @Transform(({ value }: { value: string }) => Number(value))
  price: number;

  @ApiProperty({
    type: "number",
    example: 1,
    description: "Product category id'si ",
  })
  @IsInt()
  @IsPositive()
  @Transform(({ value }: { value: string }) => Number(value))
  categoryId: number;

  @ApiProperty({
    type: "array",
    items: {
      format: "binary",
      type: "string",
    },
    maxItems: 10,
    description: "Image file to upload",
    required: false,
  })
  @IsOptional()
  images?: any;

  @ApiProperty({
    type: "number",
    example: 17,
    description: "Product soni",
  })
  @IsInt()
  @IsPositive()
  @Transform(({ value }: { value: string }) => Number(value))
  stock: number;

  @ApiProperty({
    type: "string",
    example: "Dafna",
    description: "Product brandi",
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.trim())
  brand?: string;
}
