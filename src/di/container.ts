import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

// Única implementação disponível nesta fundação; sem seleção de backend fictício.
// A mesma instância de anúncios é compartilhada com a negociação (reserva ao aceitar).
const bookDataSource = new MemoryBookDataSource();

export const bookUseCases: IBookUseCases = new BookUseCases(bookDataSource);

export const authUseCases: IAuthUseCases = new AuthUseCases(
  new MemoryAuthDataSource(),
);

export const bookRequestUseCases: IBookRequestUseCases = new BookRequestUseCases(
  bookDataSource,
  new MemoryBookRequestDataSource(),
);
