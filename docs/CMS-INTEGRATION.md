# Guia de Integração com CMS (WordPress/Outros)

## 📋 Visão Geral

Este site foi construído com arquitetura **100% data-driven**, permitindo que todo o conteúdo seja gerenciado através de arquivos JSON, sem necessidade de editar código HTML/CSS/JS.

## 🎯 Princípio Fundamental

**TODOS OS DADOS VÊM DE JSON** → O código apenas renderiza

## 📁 Estrutura de Dados

### 1. Configuração Global
**Arquivo:** `data/config.json`

Contém todas as configurações do site:
- Nome, descrição, URL
- Navegação (menu)
- Cores (pode ser substituído por CSS variables)
- Assets (logos, vídeos)
- Features (habilitar/desabilitar funcionalidades)

**Para integrar com CMS:**
- Criar endpoint REST que retorna este JSON
- Ou usar WordPress Custom Fields/ACF para gerar este JSON

### 2. Quadrilhas
**Arquivo:** `data/quadrilhas.json`

Array de objetos, cada um representando uma quadrilha.

**Campos principais:**
- `id`, `nome`, `slug`, `cidade`, `uf`
- `grupo`, `grupo_2025`, `posicao_2025`
- `foto`, `foto_capa`, `instagram`
- `coords` (lat/lng para mapa)
- `pontos2025`, `notas_2025`
- `historico` (array de anos anteriores)

**Para integrar com CMS:**
- Criar Custom Post Type "Quadrilha" no WordPress
- Mapear campos ACF para JSON
- Gerar `quadrilhas.json` via API ou cron job

### 3. Etapas do Circuito
**Arquivo:** `data/etapas_2026.json` (ou `etapas_YYYY.json`)

Array de etapas do circuito.

**Campos:**
- `id`, `nome`, `data`, `cidade`, `local`
- `quadrilhas` (array de IDs)
- `status`

**Para integrar com CMS:**
- Custom Post Type "Etapa"
- Relacionar com quadrilhas via meta fields

### 4. Notícias
**Arquivo:** `data/noticias.json`

Array de notícias.

**Campos:**
- `id`, `titulo`, `data`, `resumo`, `conteudo`
- `imagem`, `tags`

**Para integrar com CMS:**
- Usar Posts padrão do WordPress
- Exportar via REST API ou gerar JSON

### 5. Acervo
**Arquivo:** `data/acervo.json`

Objeto com anos como chaves, arrays de itens como valores.

**Estrutura:**
```json
{
  "2024": [...],
  "2025": [...],
  "2026": [...]
}
```

**Para integrar com CMS:**
- Custom Post Type "Mídia" com taxonomia "Ano"
- Relacionar com etapas e quadrilhas
- Gerar JSON estruturado

### 6. Parceiros
**Arquivo:** `data/parceiros.json`

Array de parceiros.

**Para integrar com CMS:**
- Custom Post Type "Parceiro"
- Campos: nome, logo, URL

## 🔌 Estratégias de Integração

### Opção 1: WordPress REST API

1. **Criar Custom Post Types:**
   - Quadrilha
   - Etapa
   - Mídia (Acervo)
   - Parceiro

2. **Criar Endpoint Customizado:**
```php
// functions.php
add_action('rest_api_init', function() {
    register_rest_route('linq/v1', '/quadrilhas', [
        'methods' => 'GET',
        'callback' => 'get_quadrilhas_json',
    ]);
});

function get_quadrilhas_json() {
    // Buscar posts, formatar como JSON
    // Retornar estrutura igual a quadrilhas.json
}
```

3. **Modificar `shared.js`:**
```javascript
// Em vez de loadJSON('data/quadrilhas.json')
// Usar: fetch('https://seu-site.com/wp-json/linq/v1/quadrilhas')
```

### Opção 2: Gerador de JSON (Cron Job)

1. **Criar script PHP/Python que:**
   - Lê dados do WordPress
   - Gera arquivos JSON
   - Salva em `data/`

2. **Executar via cron:**
   - A cada atualização de conteúdo
   - Ou periodicamente (diário)

### Opção 3: Headless CMS (Strapi, Contentful, etc.)

1. **Configurar CMS:**
   - Criar collections equivalentes aos JSONs
   - Configurar relações

2. **API do CMS:**
   - Substituir `loadJSON()` por chamadas à API
   - Ou gerar JSONs estáticos via build

## 📝 Mapeamento WordPress → JSON

### Quadrilha (Custom Post Type)

```php
// Campos ACF
- nome (text)
- slug (text)
- cidade (text)
- uf (select)
- grupo_2025 (select)
- posicao_2025 (number)
- foto (image) → URL
- foto_capa (image) → URL
- instagram (text)
- coords_lat (number)
- coords_lng (number)
- pontos2025 (number)
- historico (repeater)
```

### Etapa (Custom Post Type)

```php
// Campos ACF
- nome (text)
- data (date)
- cidade (text)
- local (text)
- quadrilhas (relationship) → IDs
- status (select)
```

## 🛠️ Implementação Prática

### Passo 1: Criar Plugin WordPress

```php
<?php
// linq-data-generator.php
class LINQ_Data_Generator {
    public function generate_quadrilhas_json() {
        $quadrilhas = get_posts(['post_type' => 'quadrilha']);
        $data = [];
        
        foreach ($quadrilhas as $post) {
            $data[] = [
                'id' => $post->ID,
                'nome' => get_field('nome', $post->ID),
                'slug' => get_field('slug', $post->ID),
                // ... mapear todos os campos
            ];
        }
        
        file_put_contents(
            get_template_directory() . '/data/quadrilhas.json',
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }
}
```

### Passo 2: Hook em Atualizações

```php
add_action('save_post_quadrilha', 'generate_linq_data');
add_action('save_post_etapa', 'generate_linq_data');

function generate_linq_data() {
    $generator = new LINQ_Data_Generator();
    $generator->generate_quadrilhas_json();
    $generator->generate_etapas_json();
    // ... outros
}
```

### Passo 3: Modificar JavaScript (Opcional)

Se quiser usar API direta em vez de JSON estático:

```javascript
// js/shared.js
export async function loadJSON(path) {
  // Se for produção e tiver API configurada
  if (window.LINQ_API_URL) {
    const endpoint = path.replace('data/', '').replace('.json', '');
    const response = await fetch(`${window.LINQ_API_URL}/${endpoint}`);
    return await response.json();
  }
  
  // Fallback para JSON estático
  const response = await fetch(path);
  return await response.json();
}
```

## ✅ Checklist de Integração

- [ ] Criar Custom Post Types no WordPress
- [ ] Configurar campos ACF
- [ ] Criar função de geração de JSON
- [ ] Configurar hooks de atualização
- [ ] Testar geração de JSONs
- [ ] Validar estrutura dos JSONs gerados
- [ ] Configurar cron job (se necessário)
- [ ] Testar site com JSONs gerados
- [ ] Documentar processo para usuários

## 🎨 Personalização sem Código

### Cores
Editar `css/style.css` → variáveis `:root`

### Navegação
Editar `data/config.json` → `navegacao`

### Assets
Substituir arquivos em `assets/` (mantendo nomes)

### Conteúdo
Editar JSONs em `data/` (ou via CMS se integrado)

## 📚 Recursos Adicionais

- WordPress REST API: https://developer.wordpress.org/rest-api/
- ACF (Advanced Custom Fields): https://www.advancedcustomfields.com/
- Headless WordPress: https://www.wpengine.com/resources/headless-wordpress/

---

**Lembre-se:** O objetivo é que o usuário final **NUNCA precise editar código**, apenas dados (JSON ou via CMS).

