# Ótica Vanazzi — demonstração premium

E-commerce demonstrativo mobile-first, criado em Next.js/TypeScript com catálogo, busca, filtros, favoritos, sacola de orçamento, páginas de produto e painel administrativo.

## Executar localmente

```bash
npm install
npm run dev
```

O projeto usa uma Bottom Navigation Bar no celular e um header horizontal no desktop. Não há menu hambúrguer.

## Painel administrativo

- Rota: `/admin`
- Senha demonstrativa: `vanazzi2026`
- Produtos, configurações, favoritos e sacola persistem no `localStorage` do navegador.
- É possível cadastrar, editar, ocultar, excluir e alterar o status dos produtos, além de enviar imagens e trocar o banner.

O modo de demonstração seguro vem ativado: a mensagem de orçamento é preparada e copiada, sem abrir um número real. O WhatsApp real só é habilitado quando um número for configurado no painel e o modo seguro for desativado.

## Produção

Para produção, substitua o adaptador local por Supabase para banco, autenticação e Storage. As imagens e preços incluídos são ilustrativos. O perfil oficial configurado é [@oticavanazzi](https://www.instagram.com/oticavanazzi/).

## Verificação

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm run build
```

