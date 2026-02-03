# Runtime Config no GitHub Pages

`js/runtime-config.js` **nao deve ser commitado**. Ele e gerado no workflow de deploy a partir de GitHub Secrets.

## Desenvolvimento local

1. Copie `js/runtime-config.example.js` para `js/runtime-config.js`.
2. Preencha os valores do Firebase no arquivo local.
3. Rode o site normalmente.

## Producao (GitHub Pages)

- O workflow `.github/workflows/deploy-pages.yml` roda `scripts/generate-runtime-config.js`.
- Os valores vem dos Secrets do repositorio (`FIREBASE_*`).
- O arquivo gerado entra apenas no artifact do deploy.

## Troubleshooting rapido

- **404 em `/js/runtime-config.js`**: o workflow de deploy nao gerou/nao publicou artifact valido.
- **Mensagem "Configuracao ausente..." no browser**: arquivo nao foi servido ou esta invalido.
- Confirme em **Settings > Pages** que a source esta em **GitHub Actions**.
- Confirme no Actions que o job **Deploy GitHub Pages (with runtime-config)** ficou verde.
