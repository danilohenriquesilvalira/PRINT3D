---
description: Cria ou modifica uma slice Redux no projeto PRINT3D. Uso: /redux [nome e descrição da slice]
---

Tarefa: criar ou modificar uma Redux slice no projeto PRINT3D.

Contexto do Redux no projeto:
- Store em `src/lib/store.ts`
- Slices em `src/lib/features/[nome]/[nome]Slice.ts`
- Hooks tipados em `src/lib/hooks/redux.tsx` — `useAppDispatch` e `useAppSelector`
- Redux Persist configurado no store — carrinho persiste em localStorage
- Padrão: Redux Toolkit (`createSlice`, `PayloadAction`)

Estrutura padrão de uma slice:
```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NomeState {
  // estado
}

const initialState: NomeState = {
  // valores iniciais
};

const nomeSlice = createSlice({
  name: "nome",
  initialState,
  reducers: {
    // actions
  },
});

export const { /* actions */ } = nomeSlice.actions;
export default nomeSlice.reducer;
```

Após criar a slice, lembre de:
1. Adicionar o reducer em `src/lib/store.ts`
2. Se precisar persistir, adicionar na config do `persistConfig`

Slice a criar/modificar: $ARGUMENTS
