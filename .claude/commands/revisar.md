---
description: Revisa um componente ou página do projeto PRINT3D em busca de problemas. Uso: /revisar [caminho do arquivo]
---

Tarefa: revisar o arquivo indicado no projeto PRINT3D.

Leia o arquivo e verifique:
1. **TypeScript** — props sem tipo, `any` desnecessário, tipos faltando
2. **Responsividade** — mobile-first, breakpoints xs/sm/md/lg cobertos, layout 2 colunas no mobile
3. **Acessibilidade** — alt em imagens, aria-labels em botões sem texto, roles semânticos
4. **Performance** — imagens sem `next/image`, re-renders desnecessários, imports pesados
5. **Padrões do projeto** — `cn()` para classes condicionais, textos em português, sem CSS inline
6. **Bugs visuais** — overflow, texto truncado, espaçamentos quebrados em telas pequenas

Para cada problema encontrado:
- Indique a linha
- Explique o problema
- Mostre a correção

Se não houver problemas significativos, diga que está OK.

Arquivo a revisar: $ARGUMENTS
