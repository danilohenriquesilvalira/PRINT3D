---
description: Carrega o contexto completo do projeto PRINT3D para não precisar reexplicar a stack
---

Este é o projeto PRINT3D — loja e-commerce de peças impressas em 3D, em português (PT-BR).

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit + Redux Persist, ShadCN UI, Framer Motion, Radix UI.

**Estrutura principal:**
- `src/app/` — páginas (page.tsx, shop/, shop/product/[...slug]/, cart/)
- `src/components/` — layout/, homepage/, shop-page/, product-page/, cart-page/, common/, ui/
- `src/lib/` — store.ts (Redux), features/carts/cartsSlice.ts, features/products/productsSlice.ts
- `src/types/` — product.types.ts, review.types.ts

**Convenções do projeto:**
- Componentes: PascalCase, arquivos .tsx, Tailwind para estilos (sem CSS modules)
- Path alias: `@/*` → `src/*`
- Textos sempre em português
- Mobile-first, 2 colunas em xs (375px), responsivo em sm/md/lg
- `cn()` do `@/lib/utils` para classes condicionais
- Dados de produtos estão hardcoded em `src/app/page.tsx`
- Custom fonts: Integral CF (títulos), Satoshi (corpo)
- Cores customizadas definidas em `tailwind.config.ts`

**Estado atual:** Frontend completo e funcional. Sem backend — dados hardcoded. Carrinho persiste via Redux Persist (localStorage).

$ARGUMENTS
