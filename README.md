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
- Exportação e importação de backup da numeração.
- Registro local das Ordens de Serviço geradas.

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
```

## Numeração das Ordens de Serviço

O último número utilizado fica armazenado no navegador do computador.

O botão **Definir próximo Nº** permite escolher manualmente o número da próxima Ordem de Serviço.

Ao escolher um número inferior ou igual ao último utilizado, o sistema apresenta um aviso sobre o risco de duplicidade.

## Histórico local

Cada Ordem de Serviço gerada é registrada no navegador com número, data, modelo, código, setor, resumo e descrição.

A tabela apresenta as ordens já registradas e impede a criação de outro documento com o mesmo número.

O histórico permanece somente neste navegador. Nesta versão, ele ainda não está incluído no arquivo de backup.

## Backup da numeração

O botão **Exportar backup** cria um arquivo JSON contendo o último número utilizado pelo SOSS.

O botão **Importar backup** restaura essa numeração em outro navegador, em outro computador ou após uma perda dos dados locais.

Guarde o arquivo de backup em um local seguro e faça uma nova exportação periodicamente.

O backup atual protege somente a numeração. Os PDFs gerados devem ser armazenados e copiados separadamente.

## Cuidados importantes

- Utilize sempre o mesmo navegador.
- Não limpe os dados do navegador sem possuir um backup atualizado.
- Outro navegador terá um contador separado.
- Para transferir a numeração a outro computador, utilize a exportação e importação de backup.
- O suporte simultâneo a vários computadores será implementado em uma etapa futura.
- Limpar os dados do navegador também apaga o histórico local.

## Dependência incluída

O projeto utiliza o jsPDF 2.5.1 para gerar os documentos.

A biblioteca está armazenada localmente em `vendor/`, permitindo o funcionamento offline. Sua licença MIT está disponível em `vendor/LICENSE.jspdf.txt`.

## Estado atual

Esta versão foi projetada para utilização offline em um único computador.