import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

// Única implementação disponível nesta fundação; sem seleção de backend fictício.
export const bookUseCases: IBookUseCases = new BookUseCases(
  new MemoryBookDataSource(),
);

export const authUseCases: IAuthUseCases = new AuthUseCases(
  new MemoryAuthDataSource(),
);
