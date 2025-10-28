/*
  Warnings:

  - The `year` column on the `Query` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `year` on the `Movie` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Query" DROP COLUMN "year",
ADD COLUMN     "year" INTEGER;
