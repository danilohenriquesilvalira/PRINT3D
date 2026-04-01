---
description: Diagnostica e corrige um problema no projeto PRINT3D. Uso: /debug [descrição do problema]
---

Tarefa: diagnosticar e corrigir o problema descrito no projeto PRINT3D.

Contexto do projeto:
- Next.js 14 App Router, TypeScript, Tailwind CSS, Redux Toolkit
- `"use client"` obrigatório para hooks/eventos — Server Components não têm acesso a estado
- Redux Persist usa localStorage — erros de hidratação são comuns em SSR
- Path alias: `@/*` → `src/*`

Passos para diagnóstico:
1. Leia os arquivos relevantes para o problema
2. Identifique a causa raiz (não apenas o sintoma)
3. Verifique se não há outros arquivos afetados
4. Aplique a correção mínima necessária — não refatore código não relacionado
5. Explique o que causou o problema

Problemas comuns neste projeto:
- `useSelector`/`useDispatch` em Server Component → adicionar `"use client"`
- Hidratação SSR com Redux Persist → usar `PersistGate` (já configurado em `providers.tsx`)
- Imagem sem `width`/`height` com `next/image` → adicionar dimensões ou usar `fill`
- Tailwind classe não aplicando → verificar se está no `content` do `tailwind.config.ts`

Problema a resolver: $ARGUMENTS
