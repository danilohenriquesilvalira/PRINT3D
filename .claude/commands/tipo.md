---
description: Cria ou atualiza tipos TypeScript no projeto PRINT3D. Uso: /tipo [descrição do tipo]
---

Tarefa: criar ou atualizar tipos TypeScript no projeto PRINT3D.

Contexto:
- Tipos ficam em `src/types/`
- Arquivos existentes: `product.types.ts`, `review.types.ts`
- Padrão: `interface` para objetos (não `type` aliases, exceto para unions/intersections)
- Exportar tudo com `export`
- Usar `?` para campos opcionais, não `| undefined` explícito
- Se o tipo for usado em um componente específico, pode ficar no próprio arquivo do componente

Leia os tipos existentes antes de criar novos para evitar duplicação:
- `src/types/product.types.ts`
- `src/types/review.types.ts`

Se for atualizar um tipo existente, verifique onde ele é usado com Grep antes de alterar campos obrigatórios (pode quebrar outros arquivos).

Tipo a criar/atualizar: $ARGUMENTS
