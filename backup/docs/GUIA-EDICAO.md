# 📝 Guia Completo de Edição - LINQ-DFE

## 🎯 Princípio Fundamental

**VOCÊ NUNCA PRECISA MEXER NO CÓDIGO!**

Todo o conteúdo é gerenciado através de arquivos JSON em `data/`. O código apenas renderiza esses dados.

---

## 📁 Onde Editar Cada Coisa

### 1. ⚙️ Configurações Gerais
**Arquivo:** `data/config.json`

Aqui você controla:
- Nome do site
- Menu de navegação
- Cores (via CSS variables)
- Assets (logos, vídeos)
- Features (habilitar/desabilitar funcionalidades)

**Exemplo:**
```json
{
  "site": {
    "nome": "LINQ-DFE",
    "nomeCompleto": "Liga de Quadrilhas Juninas do DF e Entorno"
  },
  "navegacao": [
    { "href": "index.html", "label": "Home" },
    { "href": "circuito.html", "label": "Circuito" }
  ]
}
```

### 2. 👥 Quadrilhas
**Arquivo:** `data/quadrilhas.json`

**Campos importantes:**
- `nome`: Nome oficial
- `slug`: URL-friendly (sem acentos, com hífens)
- `cidade`, `uf`: Localização
- `grupo`: "Especial" ou "Acesso"
- `foto`: Nome do arquivo em `assets/fotos-quadrilhas/`
- `foto_capa`: Foto de capa (para perfil)
- `instagram`: Handle com @ (ex: "@nome")
- `coords`: `{"lat": -15.78, "lng": -47.88}` para mapa
- `pontos2025`: Pontuação
- `historico`: Array de anos anteriores

**Exemplo:**
```json
{
  "id": 1,
  "nome": "Arroxa o Nó",
  "slug": "arroxa-o-no",
  "cidade": "Paranoá/DF",
  "grupo": "Especial",
  "foto": "arroxa-o-no.jpg",
  "instagram": "@arroxaono",
  "coords": {"lat": -15.7754, "lng": -47.7798},
  "pontos2025": 629.2
}
```

### 3. 🏆 Etapas do Circuito
**Arquivo:** `data/etapas_2026.json` (ou `etapas_YYYY.json`)

**Estrutura:**
```json
[
  {
    "id": 1,
    "nome": "1ª Etapa — Acesso",
    "data": "2026-06-06",
    "cidade": "Ceilândia/DF",
    "local": "Quadra Central",
    "quadrilhas": [3, 4],
    "status": "agendada"
  }
]
```

### 4. 📰 Notícias
**Arquivo:** `data/noticias.json`

**Estrutura:**
```json
[
  {
    "id": 1,
    "titulo": "Título da Notícia",
    "data": "2026-01-15",
    "resumo": "Resumo curto...",
    "conteudo": "<p>Conteúdo completo com HTML...</p>",
    "imagem": "assets/banners/news1.jpg",
    "tags": ["liga", "inscricoes"]
  }
]
```

**Dica:** O `conteudo` pode ter HTML (parágrafos, listas, links).

### 5. 📸 Acervo
**Arquivo:** `data/acervo.json`

**Estrutura:**
```json
{
  "2024": [
    {
      "id": "2024-001",
      "etapa_id": 1,
      "quad_id": 3,
      "tipo": "foto",
      "titulo": "Título da foto",
      "descricao": "Descrição opcional",
      "data": "2024-06-01",
      "arquivo": "assets/acervo/2024/foto.jpg",
      "thumb": "assets/acervo/2024/thumb-foto.jpg",
      "focal": {"x": 0.5, "y": 0.18}
    }
  ]
}
```

**Tipos suportados:**
- `foto`: Imagem
- `video`: Vídeo
- `album`: Galeria
- `pdf`: Documento

### 6. 🤝 Parceiros
**Arquivo:** `data/parceiros.json`

```json
[
  {
    "nome": "Parceiro X",
    "logo": "assets/logos/parceiro-x.png",
    "url": "https://parceiro.com.br"
  }
]
```

---

## 🎨 Personalização Visual

### Cores
**Arquivo:** `css/style.css` (linhas 5-35)

Edite as variáveis CSS:
```css
:root {
  --accent-primary: #d32f2f;  /* Cor principal */
  --accent-secondary: #f57c00; /* Cor secundária */
  --bg-primary: #f6f7f9;       /* Fundo */
  --bg-card: #ffffff;          /* Cards */
}
```

### Logos e Mídia
**Pasta:** `assets/`

- **Logo:** `assets/logos/linq-dfe.png`
- **Vídeo Hero:** `assets/hero/hero.mp4`
- **Fotos Quadrilhas:** `assets/fotos-quadrilhas/[slug].jpg`
- **Acervo:** `assets/acervo/[ano]/`

---

## 🔧 Regras Importantes

### 1. Nomes de Arquivo (Slug)
- Sem acentos
- Espaços viram hífens
- Minúsculas
- Exemplo: "Arroxa o Nó" → `arroxa-o-no.jpg`

### 2. Coordenadas (Mapa)
- Formato: `{"lat": -15.78, "lng": -47.88}`
- Use Google Maps para encontrar coordenadas
- Cada cidade deve ter coordenadas únicas

### 3. Focal Point (Fotos)
- Controla onde a foto será "cortada"
- `{"x": 0.5, "y": 0.18}` = centro horizontal, 18% do topo (ideal para rostos)
- Valores de 0 a 1

### 4. Datas
- Formato: `YYYY-MM-DD` (ex: "2026-06-06")
- Sempre ISO 8601

---

## ✅ Checklist de Atualização

### Adicionar Nova Quadrilha
1. [ ] Adicionar objeto em `data/quadrilhas.json`
2. [ ] Adicionar foto em `assets/fotos-quadrilhas/[slug].jpg`
3. [ ] Adicionar foto_capa em `assets/fotos-quadrilhas/[slug]-capa.jpg`
4. [ ] Verificar coordenadas no mapa

### Adicionar Nova Notícia
1. [ ] Adicionar objeto em `data/noticias.json`
2. [ ] Adicionar imagem (se houver) em `assets/banners/`
3. [ ] Verificar HTML no conteúdo

### Adicionar Nova Etapa
1. [ ] Adicionar objeto em `data/etapas_2026.json`
2. [ ] Relacionar IDs das quadrilhas participantes

### Adicionar Mídia ao Acervo
1. [ ] Adicionar arquivo em `assets/acervo/[ano]/`
2. [ ] Adicionar objeto em `data/acervo.json`
3. [ ] Relacionar com etapa (etapa_id) e quadrilha (quad_id)

---

## 🚫 O Que NÃO Fazer

❌ **NÃO edite arquivos HTML** (exceto para estrutura básica)
❌ **NÃO edite arquivos JavaScript** (exceto se souber o que está fazendo)
❌ **NÃO mude nomes de arquivos JSON** sem atualizar referências
❌ **NÃO use caracteres especiais** em nomes de arquivo

---

## 🆘 Problemas Comuns

### Foto não aparece
- Verifique se o nome do arquivo corresponde ao `foto` no JSON
- Verifique se está em `assets/fotos-quadrilhas/`
- Use o console do navegador (F12) para ver erros

### Mapa não mostra quadrilha
- Verifique se `coords` está correto
- Formato: `{"lat": número, "lng": número}`
- Use coordenadas decimais (não graus/minutos/segundos)

### Notícia não aparece
- Verifique se o JSON está válido (sem vírgulas extras)
- Use um validador JSON online
- Verifique se o `id` é único

---

## 📚 Próximos Passos

Para integrar com WordPress ou outro CMS, consulte:
- `CMS-INTEGRATION.md` - Guia completo de integração

---

**Lembre-se:** Tudo é data-driven. Edite apenas JSONs e assets!

