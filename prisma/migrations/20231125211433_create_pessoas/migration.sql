-- CreateTable
CREATE TABLE "Pessoas" (
    "id" TEXT NOT NULL,
    "Nome" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Telefone" TEXT NOT NULL,
    "Instrumento" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pessoas_pkey" PRIMARY KEY ("id")
);
