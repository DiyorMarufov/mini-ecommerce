import { PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {}
// Extend UpdateProductDto to support images array
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

export class UpdateProductImagesDto {
	@ApiProperty({
		type: "array",
		items: { type: "string" },
		description: "Array of image filenames",
		nullable: true,
		required: false,
		example: ["img1.jpg", "img2.png"]
	})
	@IsArray()
	@IsOptional()
	images?: string[];
}
