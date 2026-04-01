---
description: Cria uma nova página Next.js no projeto PRINT3D. Uso: /pg [nome e rota da página]
---

Tarefa: criar uma nova página no projeto PRINT3D.

Padrões obrigatórios:
- Arquivo `page.tsx` dentro de `src/app/[rota]/`
- Páginas são Server Components por padrão — adicionar `"use client"` só se necessário
- Layout já inclui Navbar e Footer (definidos em `src/app/layout.tsx`) — não adicione novamente
- Usar `src/components/layout/` para componentes de layout se precisar
- Tailwind CSS, mobile-first, textos em português
- Se a página tiver rota dinâmica: usar `[slug]` ou `[...slug]` no diretório
- Importar componentes com path alias `@/components/...`

Estrutura base de uma página:
```tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Título | PRINT3D",
  description: "Descrição da página",
};

const NomePagina = () => {
  return (
    <main className="...">
      {/* conteúdo */}
    </main>
  );
};

export default NomePagina;
```

Página a criar: $ARGUMENTS
