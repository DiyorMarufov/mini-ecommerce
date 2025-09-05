import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    type: "string",
    example: "furniture",
    uniqueItems: true,
    description:
      "Product uchun category nomi(takrorlanmas bo‘lishi kerak, database'ga barcha harflar kichik holatda saqlanadi)",
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  name: string;
}
