---
description: Guia para implementar o fluxo de checkout no PRINT3D. Uso: /checkout [etapa ou funcionalidade específica]
---

Tarefa: implementar ou evoluir o fluxo de checkout no projeto PRINT3D.

Estado atual do projeto:
- Carrinho funcional em `src/app/cart/page.tsx` com Redux (`cartsSlice`)
- Sem backend, sem autenticação, sem pagamento
- `cartsSlice` já calcula subtotal, desconto e total

Estrutura sugerida para o checkout completo:
```
src/app/checkout/
├── page.tsx              # Formulário de entrega + resumo
├── pagamento/
│   └── page.tsx          # Dados de pagamento
└── confirmacao/
    └── page.tsx          # Confirmação do pedido
```

Integrações comuns para este tipo de projeto:
- **Pagamento BR:** Stripe (cartão), MercadoPago (PIX, boleto, cartão)
- **Autenticação:** NextAuth.js (Google, Email)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage) ou PlanetScale
- **Email transacional:** Resend ou SendGrid

Dados já disponíveis via Redux (em `cartsSlice`):
- `carts` — array de itens com quantidade, preço, desconto
- Total calculado no seletor

Ao criar formulários:
- Validação com React Hook Form + Zod
- Campos: nome, email, CPF, endereço, CEP (com busca via ViaCEP API)
- Textos em português

Etapa ou funcionalidade a implementar: $ARGUMENTS
