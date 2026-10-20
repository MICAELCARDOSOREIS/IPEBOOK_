import { useCallback, useEffect, useState } from "react";
import { searchAlertUseCases } from "@/di/container";
import type { SearchAlert } from "@/model/entities/searchAlert";
import { DomainError } from "@/model/errors";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";

export type SearchAlertsState = { alerts: readonly SearchAlert[]; query: string; loading: boolean; error: string | null; message: string | null };
export type SearchAlertsActions = {
  setQuery: (value: string) => void;
  reload: () => Promise<void>;
  create: () => Promise<boolean>;
  update: (id: string, query: string) => Promise<boolean>;
  setActive: (id: string, active: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useSearchAlertsViewModel(userId: string | null, initialQuery = "", useCases: ISearchAlertUseCases = searchAlertUseCases): [SearchAlertsState, SearchAlertsActions] {
  const [state, setState] = useState<SearchAlertsState>({ alerts: [], query: initialQuery, loading: Boolean(userId), error: null, message: null });
  const reload = useCallback(async () => {
    if (!userId) { setState((prev) => ({ ...prev, loading: false })); return; }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const alerts = await useCases.listAlerts(userId);
      setState((prev) => ({ ...prev, alerts, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error instanceof DomainError ? error.message : "Não foi possível carregar alertas." }));
    }
  }, [userId, useCases]);
  useEffect(() => { void reload(); }, [reload]);
  const setQuery = useCallback((query: string) => setState((prev) => ({ ...prev, query, error: null })), []);
  const create = useCallback(async () => {
    try {
      await useCases.createAlert(userId, state.query);
      setState((prev) => ({ ...prev, query: "", message: "Alerta criado. Avisaremos quando um livro aparecer.", error: null }));
      await reload();
      return true;
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof DomainError ? error.message : "Não foi possível criar o alerta." }));
      return false;
    }
  }, [userId, state.query, useCases, reload]);
  const update = useCallback(async (id: string, query: string) => {
    try {
      await useCases.updateAlert(userId, id, query);
      setState((prev) => ({ ...prev, query: "", message: "Alerta atualizado.", error: null }));
      await reload();
      return true;
    } catch (error) {
      setState((prev) => ({ ...prev, error: error instanceof DomainError ? error.message : "Não foi possível atualizar o alerta." }));
      return false;
    }
  }, [userId, useCases, reload]);
  const setActive = useCallback(async (id: string, active: boolean) => {
    try { await useCases.setActive(userId, id, active); await reload(); }
    catch (error) { setState((prev) => ({ ...prev, error: error instanceof DomainError ? error.message : "Não foi possível atualizar o alerta." })); }
  }, [userId, useCases, reload]);
  const remove = useCallback(async (id: string) => {
    try { await useCases.deleteAlert(userId, id); await reload(); }
    catch (error) { setState((prev) => ({ ...prev, error: error instanceof DomainError ? error.message : "Não foi possível excluir o alerta." })); }
  }, [userId, useCases, reload]);
  return [state, { setQuery, reload, create, update, setActive, remove }];
}
