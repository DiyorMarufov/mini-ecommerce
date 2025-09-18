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
  @Transform(({ value }: { value: string }) => value.trim())
  title: string;

  @ApiProperty({
    type: "string",
    example: "Dars va ofis ishlari uchun mo‘ljallangan",
    description: "Product uchun ta'rif",
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  description: string;

  @ApiProperty({
    type: "number",
    example: 300,
    description: "Product narxi(USD)",
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? Number(value) : undefined
  )
  price: number;

  @ApiProperty({
    type: "number",
    example: 1,
    description: "Product category id'si ",
  })
  @IsInt()
  @IsPositive()
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? Number(value) : undefined
  )
  categoryId: number;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    required: false,
    maxItems: 10,
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
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? Number(value) : undefined
  )
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
