import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { ReportListing, ReportUser } from "@/model/entities/report";
import { AuthError, ValidationError } from "@/model/errors";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";
import type { IReportUseCases, SubmitReportInput, SubmitUserReportInput } from "@/usecase/iReportUseCases";

export class ReportUseCases implements IReportUseCases {
  constructor(private readonly dataSource: IReportDataSource) {}

  async submitReport(input: SubmitReportInput, sessionUserId: string | null): Promise<ReportListing> {
    if (!sessionUserId) {
      throw new AuthError("É necessário estar autenticado para enviar uma denúncia.");
    }

    if (!input.listingId || !input.listingId.trim()) {
      throw new ValidationError("Identificador do anúncio é obrigatório.");
    }

    if (!input.reason) {
      throw new ValidationError("Selecione um motivo para a denúncia.");
    }

    const cleanDetails = input.details
      ? sanitizeTextInput(input.details, { allowNewlines: true })
      : undefined;

    if (cleanDetails && cleanDetails.length > 500) {
      throw new ValidationError("Os detalhes da denúncia devem ter no máximo 500 caracteres.");
    }

    return this.dataSource.create({
      listingId: input.listingId.trim(),
      reporterId: sessionUserId,
      reason: input.reason,
      ...(cleanDetails ? { details: cleanDetails } : {}),
    });
  }

  async submitUserReport(input: SubmitUserReportInput, sessionUserId: string | null): Promise<ReportUser> {
    if (!sessionUserId) {
      throw new AuthError("É necessário estar autenticado para enviar uma denúncia.");
    }
    if (!input.reportedUserId?.trim()) {
      throw new ValidationError("Identificador da pessoa é obrigatório.");
    }
    if (input.reportedUserId.trim() === sessionUserId) {
      throw new ValidationError("Você não pode denunciar a si mesmo.");
    }
    if (!input.reason) {
      throw new ValidationError("Selecione um motivo para a denúncia.");
    }
    const cleanDetails = input.details ? sanitizeTextInput(input.details, { allowNewlines: true }) : undefined;
    if (cleanDetails && cleanDetails.length > 500) {
      throw new ValidationError("Os detalhes da denúncia devem ter no máximo 500 caracteres.");
    }
    return this.dataSource.createUserReport({
      reportedUserId: input.reportedUserId.trim(),
      reporterId: sessionUserId,
      reason: input.reason,
      ...(cleanDetails ? { details: cleanDetails } : {}),
    });
  }
}
