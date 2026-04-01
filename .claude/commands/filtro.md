---
description: Adiciona ou modifica um filtro na página de shop do PRINT3D. Uso: /filtro [tipo e opções do filtro]
---

Tarefa: adicionar ou modificar um filtro na shop page do projeto PRINT3D.

Arquivos relevantes:
- `src/components/shop-page/filters/index.tsx` — container dos filtros (sidebar desktop)
- `src/components/shop-page/filters/MobileFilters.tsx` — versão mobile (sheet/drawer)
- Filtros existentes (cada um é um componente separado):
  - `CategoriesSection.tsx`
  - `ColorsSection.tsx`
  - `PriceSection.tsx`
  - `SizeSection.tsx`
  - `DressStyleSection.tsx`
- `src/app/shop/page.tsx` — onde os filtros são aplicados aos produtos

Fluxo para adicionar novo filtro:
1. Criar `src/components/shop-page/filters/[Nome]Section.tsx`
2. Importar e adicionar em `filters/index.tsx` (desktop)
3. Importar e adicionar em `MobileFilters.tsx` (mobile)
4. Conectar a lógica de filtragem em `src/app/shop/page.tsx`

Padrão visual dos filtros:
- Título da seção em negrito, seguido de divisor `<hr>`
- Opções como botões clicáveis ou checkboxes estilizados com Tailwind
- Estado local com `useState` ou Redux se precisar persistir

Filtro a adicionar/modificar: $ARGUMENTS
