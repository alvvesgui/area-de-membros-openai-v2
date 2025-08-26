-- Adiciona as colunas "resetToken" e "resetTokenExpiry" na tabela "User"
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" BIGINT;