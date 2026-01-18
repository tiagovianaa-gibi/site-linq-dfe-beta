# HUB Junino LINQ-DFE

Portal oficial da Liga de Quadrilhas Juninas do DF e Entorno.

## 🚀 Como Rodar Localmente

### Pré-requisitos
- VS Code (ou editor similar)
- Extensão "Live Server" instalada no VS Code

### Passos
1. Abra a pasta `site-linq-dfe` no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"
4. O site abrirá automaticamente no navegador (geralmente em `http://127.0.0.1:5500`)

## 📦 Como Publicar

### GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em Settings > Pages
4. Selecione a branch `main` e pasta `/ (root)`
5. Salve e aguarde alguns minutos
6. Seu site estará em `https://seu-usuario.github.io/site-linq-dfe`

### Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para a área de deploy
3. Pronto! O site estará online

## ☁️ Deploy das Cloud Functions (gerador de notícia)

Para usar o gerador de rascunho com IA no painel, é preciso publicar a Function `generateNewsDraft`.

1. Instale o Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Faça login e selecione o projeto:
   ```bash
   firebase login
   firebase use --add
   ```
3. Exporte a variável no ambiente do deploy (ou configure no painel do provedor):
   ```bash
   export OPENAI_API_KEY="SUA_CHAVE_AQUI"
   ```
4. Faça o deploy das funções:
   ```bash
   firebase deploy --only functions
   ```

> Observação: o gerador exige usuário autenticado e limita a 10 chamadas/dia por usuário.

## 📁 Onde Editar Conteúdo

### 🎬 Trocar Vídeo do Hero
- **VOCÊ SÓ MUDA AQUI**: Substitua o arquivo `assets/hero/hero.mp4`
- Mantenha o nome `hero.mp4`
- Formatos suportados: MP4, WebM

### 🖼️ Logos e Fotos
- **Logos**: Coloque em `assets/logos/`
  - Logo principal: `linq-dfe.png`
  - Logo Confebraq: `confebraq.png`
  - Outros parceiros: `assets/logos/parceiro-x.png`

- **Fotos das Quadrilhas**: Coloque em `assets/fotos-quadrilhas/`
  - Nome do arquivo: **slug da quadrilha** (ex: `arroxa-o-no.jpg`)
  - Regra de slug: sem acentos, com hífens
  - Exemplos:
    - "Arroxa o Nó" → `arroxa-o-no.jpg`
    - "Formiga da Roca" → `formiga-da-roca.jpg`

### 📊 Editar Dados (JSON)

#### `data/quadrilhas.json`
Lista completa de todas as quadrilhas filiadas.

**Campos principais:**
- `nome`: Nome oficial da quadrilha
- `grupo`: "Especial" ou "Acesso"
- `cidade`: Ex: "Paranoá/DF"
- `instagram`: Ex: "@arroxaono"
- `foto`: Nome do arquivo (ou deixe vazio para usar slug automático)
- `focal`: Posição do foco na foto `{"x":0.52,"y":0.22}` (0-1)
- `coords`: Coordenadas para o mapa `{"lat":-15.78,"lng":-47.88}`
- `pontos2025`: Pontuação do último ano
- `historico`: Array com histórico de anos anteriores
- `tema2026`: Tema escolhido para 2026

**Exemplo:**
```json
{
  "id": 1,
  "nome": "Arroxa o Nó",
  "grupo": "Especial",
  "cidade": "Paranoá/DF",
  "instagram": "@arroxaono",
  "foto": "",
  "focal": {"x":0.52,"y":0.22},
  "coords": {"lat":-15.78,"lng":-47.88},
  "pontos2025": 629.2,
  "historico": [{"ano":2024,"pontos":620.0,"pos":1}],
  "tema2026": "Brasil: 200 anos de independência",
  "ensaio_local": "Quadra da comunidade",
  "contato": {"email":"contato@arroxaono.com.br","telefone":"(61) 99999-9999"}
}
```

#### `data/etapas_2026.json`
Calendário de etapas do circuito 2026.

**Estrutura:**
```json
[
  {
    "id": 1,
    "nome": "1ª Etapa — Acesso",
    "data": "2026-06-06",
    "cidade": "Ceilândia/DF",
    "local": "Quadra X",
    "quadrilhas": [12, 3, 7]
  }
]
```

- `quadrilhas`: Array com IDs das quadrilhas participantes

#### `data/noticias.json`
Notícias e comunicados da liga.

**Estrutura:**
```json
[
  {
    "id": 1,
    "titulo": "Inscrições 2026 abertas",
    "data": "2026-01-15",
    "resumo": "Resumo curto da notícia...",
    "conteudo": "Conteúdo completo da notícia...",
    "imagem": "assets/banners/news1.jpg",
    "tags": ["liga", "inscricoes"]
  }
]
```

#### `data/acervo.json`
Acervo de fotos e vídeos por ano.

**Estrutura:**
```json
{
  "2024": [
    {
      "id": "2024-01",
      "quad_id": 1,
      "tipo": "foto",
      "titulo": "Final 2024",
      "arquivo": "assets/acervo/2024/final-arroxa-o-no.jpg",
      "thumb": "assets/acervo/2024/thumb-final-arroxa-o-no.jpg",
      "focal": {"x":0.5,"y":0.2}
    }
  ],
  "2025": [],
  "2026": []
}
```

- `tipo`: "foto" ou "video"
- `quad_id`: ID da quadrilha (ou null para geral)
- `focal`: Posição do foco (apenas para fotos)

#### `data/parceiros.json`
Lista de parceiros e apoiadores.

**Estrutura:**
```json
[
  {
    "nome": "Parceiro X",
    "logo": "assets/logos/parceiro-x.png",
    "url": "https://parceiro.com.br"
  }
]
```

## 🎯 Regra de Slug (Nomes de Arquivo)

O slug é gerado automaticamente a partir do nome da quadrilha:
- Remove acentos (á → a, ç → c)
- Converte para minúsculas
- Substitui espaços por hífens
- Remove caracteres especiais

**Exemplos:**
- "Arroxa o Nó" → `arroxa-o-no.jpg`
- "Formiga da Roca" → `formiga-da-roca.jpg`
- "São João do Cerrado" → `sao-joao-do-cerrado.jpg`

## 📐 Ajustar Focal (Foco da Foto)

O `focal` controla onde a foto será "cortada" para destacar o rosto/pessoas.

**Valores:**
- `x`: 0.0 (esquerda) até 1.0 (direita) — padrão: 0.5 (centro)
- `y`: 0.0 (topo) até 1.0 (baixo) — padrão: 0.18 (acima do centro, ideal para rostos)

**Como descobrir:**
1. Abra a foto em um editor
2. Identifique onde está o rosto principal
3. Calcule a posição relativa:
   - Se o rosto está no centro horizontal: `x: 0.5`
   - Se está à esquerda: `x: 0.3`
   - Se está no topo: `y: 0.15`
   - Se está mais abaixo: `y: 0.25`

**Exemplo prático:**
```json
"focal": {"x":0.52,"y":0.22}
```
Significa: foco ligeiramente à direita (52%) e um pouco abaixo do topo (22%).

## 🎨 Personalizar Cores e Estilo

**VOCÊ SÓ MUDA AQUI**: Edite `css/style.css`

Principais variáveis no início do arquivo:
- Cores principais
- Tamanhos de fonte
- Espaçamentos

## 📱 Estrutura de Pastas

```
site-linq-dfe/
├── assets/
│   ├── hero/
│   │   └── hero.mp4          ← VOCÊ SÓ MUDA AQUI (vídeo)
│   ├── logos/
│   │   ├── linq-dfe.png      ← VOCÊ SÓ MUDA AQUI (logo)
│   │   └── confebraq.png
│   ├── fotos-quadrilhas/     ← VOCÊ SÓ MUDA AQUI (fotos)
│   │   ├── arroxa-o-no.jpg
│   │   └── formiga-da-roca.jpg
│   ├── acervo/
│   │   ├── 2024/
│   │   ├── 2025/
│   │   └── 2026/
│   └── banners/
│       └── placeholder.jpg
├── css/
│   └── style.css             ← Estilos globais
├── js/
│   ├── shared.js             ← Funções compartilhadas
│   ├── index.js              ← Lógica da home
│   ├── circuito.js
│   ├── quadrilha.js
│   ├── mapa.js
│   ├── noticias.js
│   ├── acervo.js
│   ├── diretoria.js
│   ├── transparencia.js
│   └── documentos.js
├── data/
│   ├── quadrilhas.json       ← VOCÊ SÓ MUDA AQUI (dados)
│   ├── etapas_2026.json
│   ├── noticias.json
│   ├── acervo.json
│   └── parceiros.json
├── index.html
├── circuito.html
├── filiadas.html
├── quadrilha.html
├── mapa.html
├── diretoria.html
├── noticias.html
├── acervo.html
├── transparencia.html
├── documentos.html
└── README.md
```

## ⚠️ Dicas Importantes

1. **Sempre teste localmente** antes de publicar
2. **Mantenha backups** dos arquivos JSON antes de editar
3. **Use imagens otimizadas** (JPEG para fotos, PNG para logos)
4. **Nomes de arquivo**: sempre em minúsculas, sem espaços
5. **Se faltar foto/dado**: o site usa placeholders automaticamente (não quebra!)

## 🆘 Problemas Comuns

### Vídeo não aparece
- Verifique se o arquivo está em `assets/hero/hero.mp4`
- Teste o vídeo em outro player para garantir que não está corrompido

### Fotos não aparecem
- Verifique o nome do arquivo (deve ser o slug exato)
- Confira se está em `assets/fotos-quadrilhas/`
- Veja o console do navegador (F12) para erros

### Mapa não carrega
- Verifique se há conexão com internet (Leaflet usa CDN)
- Confira se as coordenadas estão corretas no JSON

### Página em branco
- Abra o console (F12) e veja se há erros
- Verifique se todos os arquivos JSON estão válidos (sem vírgulas extras)

## 📞 Suporte

Para dúvidas sobre edição de conteúdo, consulte os comentários no código marcados com **"VOCÊ SÓ MUDA AQUI"**.

---

**Desenvolvido com ❤️ para a LINQ-DFE**
