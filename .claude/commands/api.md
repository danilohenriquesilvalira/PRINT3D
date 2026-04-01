---
description: Cria uma API Route no Next.js para o projeto PRINT3D. Uso: /api [rota e funcionalidade]
---

Tarefa: criar uma API Route no projeto PRINT3D.

Padrões do projeto (Next.js 14 App Router):
- Arquivo: `src/app/api/[rota]/route.ts`
- Exportar funções nomeadas: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Usar `NextRequest` e `NextResponse` de `next/server`
- Retornar sempre `NextResponse.json()` com status code explícito
- Validar entrada no início da função (não confiar em dados externos)
- Textos de erro em português

Estrutura base:
```ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // lógica
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // validar body
    // lógica
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}
```

Rota e funcionalidade: $ARGUMENTS
