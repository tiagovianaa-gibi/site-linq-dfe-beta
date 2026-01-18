# Estrutura do Projeto

## 📁 Árvore de Pastas Completa

```
site-linq-dfe/
├── assets/
│   ├── hero/
│   │   └── hero.mp4                    ← VOCÊ SÓ MUDA AQUI (vídeo do hero)
│   ├── logos/
│   │   ├── linq-dfe.png                ← VOCÊ SÓ MUDA AQUI (logo principal)
│   │   ├── confebraq.png               ← VOCÊ SÓ MUDA AQUI (logo parceiro)
│   │   └── [outros logos de parceiros]
│   ├── fotos-quadrilhas/               ← VOCÊ SÓ MUDA AQUI (fotos das quadrilhas)
│   │   ├── arroxa-o-no.jpg
│   │   ├── formiga-da-roca.jpg
│   │   └── [outras fotos em formato slug]
│   ├── acervo/
│   │   ├── 2024/
│   │   ├── 2025/
│   │   └── 2026/
│   └── banners/
│       └── placeholder.jpg
├── css/
│   └── style.css                        ← Estilos globais
├── js/
│   ├── shared.js                       ← Funções compartilhadas
│   ├── index.js                        ← Lógica da home
│   ├── circuito.js
│   ├── quadrilha.js
│   ├── mapa.js
│   ├── noticias.js
│   ├── acervo.js
│   ├── diretoria.js
│   ├── transparencia.js
│   └── documentos.js
├── data/
│   ├── quadrilhas.json                 ← VOCÊ SÓ MUDA AQUI (dados das quadrilhas)
│   ├── etapas_2026.json                ← VOCÊ SÓ MUDA AQUI (calendário)
│   ├── noticias.json                   ← VOCÊ SÓ MUDA AQUI (notícias)
│   ├── acervo.json                     ← VOCÊ SÓ MUDA AQUI (fotos/vídeos)
│   └── parceiros.json                  ← VOCÊ SÓ MUDA AQUI (parceiros)
├── index.html
├── circuito.html
├── filiadas.html
├── quadrilha.html
├── mapa.html
├── noticias.html
├── acervo.html
├── diretoria.html
├── transparencia.html
├── documentos.html
├── README.md
└── ESTRUTURA.md
```

## 🎯 Onde Editar o Quê

### Conteúdo (JSON)
- **Quadrilhas**: `data/quadrilhas.json`
- **Etapas**: `data/etapas_2026.json`
- **Notícias**: `data/noticias.json`
- **Acervo**: `data/acervo.json`
- **Parceiros**: `data/parceiros.json`

### Mídia
- **Vídeo Hero**: `assets/hero/hero.mp4`
- **Logos**: `assets/logos/`
- **Fotos Quadrilhas**: `assets/fotos-quadrilhas/` (nome em slug)
- **Acervo**: `assets/acervo/[ano]/`

### Estilo
- **CSS Global**: `css/style.css` (variáveis no início do arquivo)

## 📝 Regras Importantes

1. **Nomes de arquivo de fotos**: sempre em slug (sem acentos, com hífens)
2. **Focal point**: ajuste no JSON para focar no rosto
3. **Coordenadas**: lat/lng para o mapa
4. **Fallbacks**: o site sempre tem fallback, não quebra se faltar algo

## ✅ Checklist de Setup

- [ ] Adicionar `hero.mp4` em `assets/hero/`
- [ ] Adicionar logo `linq-dfe.png` em `assets/logos/`
- [ ] Adicionar fotos das quadrilhas em `assets/fotos-quadrilhas/` (nome em slug)
- [ ] Editar `data/quadrilhas.json` com dados reais
- [ ] Editar `data/etapas_2026.json` com calendário real
- [ ] Adicionar notícias em `data/noticias.json`
- [ ] Configurar parceiros em `data/parceiros.json`
- [ ] Testar localmente com Live Server
- [ ] Publicar (GitHub Pages ou Netlify)


