# LINQ-DFE | Pacote de dados para Power BI (2022–2025)

Gerado em: 2026-02-01 10:51:20

## O que tem aqui
Este pacote transforma suas planilhas (Acesso/Especial 2022–2025) em um **modelo estrela** pronto para Power BI.

### Tabelas
**Dimensões**
- `dim_ano` (Ano)
- `dim_grupo` (Grupo: GRUPO ESPECIAL / GRUPO DE ACESSO)
- `dim_etapa` (Etapa, EtapaOrd)
- `dim_quesito` (Quesito)
- `dim_quadrilha` (Quadrilha – nome canônico)

**Fatos**
- `fact_final` (grão: Ano + Grupo + Quadrilha)
  - TotalFinal, RankFinal, EtapasParticipadas, EtapasNoAno, ParticipacaoPct, Status
- `fact_etapa` (grão: Ano + Grupo + Quadrilha + Etapa)
  - TotalEtapa
- `fact_quesito_etapa` (grão: Ano + Grupo + Quadrilha + Etapa + Quesito)
  - NotaQuesitoEtapa

## Relacionamentos sugeridos (Power BI)
- `dim_ano[Ano]` 1:* `fact_final[Ano]`, `fact_etapa[Ano]`, `fact_quesito_etapa[Ano]`
- `dim_grupo[Grupo]` 1:* `fact_*[Grupo]`
- `dim_quadrilha[Quadrilha]` 1:* `fact_*[Quadrilha]`
- `dim_etapa[Etapa]` 1:* `fact_etapa[Etapa]`, `fact_quesito_etapa[Etapa]`
- `dim_quesito[Quesito]` 1:* `fact_quesito_etapa[Quesito]`

Direção do filtro: **single** (dim -> fato).

## Observações importantes dos dados
- Há anos com **3 etapas** e outros com **4 etapas**; isso muda o teto de pontuação.
- **Temática** aparece apenas no **Especial 2024–2025**.
- Valores `0` em etapas foram tratados como **não apresentação** (viraram vazio).
- Encontramos variação de grafia em 2 quadrilhas e padronizamos:
  - MALA VEIA -> MALA VÉIA
  - XEM NHEM NHEM -> XÉM NHEM NHÉM