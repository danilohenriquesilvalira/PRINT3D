---
description: Cria um novo componente React seguindo os padrões do projeto PRINT3D. Uso: /comp [nome e descrição]
---

Tarefa: criar um novo componente para o projeto PRINT3D.

Padrões obrigatórios:
- Arquivo `.tsx` em PascalCase, dentro de `src/components/` na pasta adequada
- `"use client"` somente se usar hooks/eventos
- Props tipadas com interface TypeScript acima do componente
- Tailwind CSS para todos os estilos — sem CSS inline, sem CSS modules
- `cn()` de `@/lib/utils` para classes condicionais
- Textos em português
- Mobile-first: começar pelas classes base (mobile), adicionar `sm:`, `md:`, `lg:` para telas maiores
- Breakpoint `xs` (375px) disponível no Tailwind config

Estrutura do arquivo:
```tsx
"use client"; // apenas se necessário

import { cn } from "@/lib/utils";

interface NomeProps {
  // props aqui
}

const Nome = ({ ... }: NomeProps) => {
  return (
    // JSX com Tailwind
  );
};

export default Nome;
```

Componente a criar: $ARGUMENTS
