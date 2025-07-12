-- CreateEnum
CREATE TYPE "MockMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE');

-- CreateEnum
CREATE TYPE "HttpStatus" AS ENUM ('200', '201', '400', '404', '500');

-- CreateTable
CREATE TABLE "MockConfig" (
    "id" SERIAL NOT NULL,
    "ruta" TEXT NOT NULL,
    "metodo" "MockMethod" NOT NULL,
    "queryParams" JSONB NOT NULL,
    "bodyParams" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "statusCode" "HttpStatus" NOT NULL,
    "responseTemplate" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockVariation" (
    "id" SERIAL NOT NULL,
    "mockConfigId" INTEGER NOT NULL,
    "condition" JSONB NOT NULL,
    "overrideStatusCode" INTEGER,
    "overrideTemplate" TEXT,
    "overrideContentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockVariation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MockVariation" ADD CONSTRAINT "MockVariation_mockConfigId_fkey" FOREIGN KEY ("mockConfigId") REFERENCES "MockConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
