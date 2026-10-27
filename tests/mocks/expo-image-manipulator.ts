// O runtime nativo do expo-image-manipulator não roda no Node; os testes que precisam dele usam vi.mock.
export const SaveFormat = { JPEG: "jpeg", PNG: "png", WEBP: "webp" } as const;

export const ImageManipulator = {
  manipulate: (uri: string) => {
    const context = {
      resize: () => context,
      renderAsync: async () => ({ saveAsync: async () => ({ uri, width: 0, height: 0 }) }),
    };
    return context;
  },
};
