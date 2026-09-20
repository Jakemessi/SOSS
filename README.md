# SOSS

Sistema de Ordem de Serviço Simplificada para criação de documentos em PDF.

O SOSS funciona diretamente no navegador e foi preparado para utilização offline em um único computador.

## Funcionalidades

- Criação de Ordens de Serviço em PDF.
- Numeração automática das ordens.
- Alteração manual do próximo número.
- Validação dos campos obrigatórios.
- Quebra automática de textos longos.
- Criação de páginas adicionais quando necessário.
- Cabeçalho e rodapé em todas as páginas.
- Funcionamento sem conexão com a internet.

## Como executar

1. Mantenha todos os arquivos e pastas do projeto juntos.
2. Abra o arquivo `index.html` no navegador.
3. Preencha os dados da Ordem de Serviço.
4. Clique em **Gerar PDF**.

Não é necessário instalar dependências nem manter conexão com a internet.

## Estrutura do projeto

```text
SOSS/
├── assets/
│   └── favicon.svg
├── css/
│   └── default.css
├── js/
│   └── default.js
├── vendor/
│   ├── jspdf.umd.min.js
│   └── LICENSE.jspdf.txt
├── index.html
└── README.md