import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Length, Max, Min, MinLength } from "class-validator";

export class SearchMoviesDto {
  @IsString()
  @MinLength(1)
  public title: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2025)
  @Type(() => Number)
  public year: number;

  @IsString()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  public page:number = 1;

  @IsNumber()
  @Type(() => Number)
  public userId: string;
}