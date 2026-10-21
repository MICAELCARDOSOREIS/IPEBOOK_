import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import type { IPwaService } from "@/model/services/iPwaService";
import { PwaRegister } from "@/view/components/PwaRegister";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("PwaRegister Component (Spec 041, ADR 0035)", () => {
  it("renderiza sem nós visuais e aciona o ciclo de registro", async () => {
    const mockService: IPwaService = {
      isSupported: vi.fn().mockReturnValue(true),
      register: vi.fn().mockResolvedValue(true),
      unregister: vi.fn().mockResolvedValue(true),
    };

    let renderer!: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<PwaRegister pwaService={mockService} autoRegister={true} />);
    });

    // Componente é invisível (retorna null)
    expect(renderer.toJSON()).toBeNull();
    expect(mockService.register).toHaveBeenCalledTimes(1);
  });
});
