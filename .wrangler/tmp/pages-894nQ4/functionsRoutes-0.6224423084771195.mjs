import { onRequest as __livro__id__ts_onRequest } from "/home/usermicael/Projetos/IPEBOOK_/functions/livro/[id].ts"

export const routes = [
    {
      routePath: "/livro/:id",
      mountPath: "/livro",
      method: "",
      middlewares: [],
      modules: [__livro__id__ts_onRequest],
    },
  ]