# ReciCla ♻️

**Marketplace mobile que conecta centros de reciclagem, fornecedores e população diretamente** —
sem intermediário. Publique material reciclável, negocie em tempo real (proposta,
contraproposta, aceite) e feche o negócio, tudo dentro do app.

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-realtime-010101?logo=socketdotio&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/arturtmelo/recifle/actions/workflows/ci.yml/badge.svg)](https://github.com/arturtmelo/recifle/actions/workflows/ci.yml)

## Por que esse projeto

Reciclagem no Brasil esbarra num problema de coordenação: quem tem material reciclável
(população, fornecedores) geralmente não sabe quem, perto dali, está interessado em coletar —
e centros de reciclagem dependem de doações/vendas avulsas e imprevisíveis. O ReciCla ataca isso
como um marketplace de verdade: publicação de anúncios geolocalizados, negociação estruturada
(com histórico de propostas) e acompanhamento do negócio do primeiro contato até a coleta
confirmada — com gamificação simples (nível eco, kg reciclados) para incentivar o hábito.

## Funcionalidades

- **Autenticação por perfil** — População, Fornecedor ou Centro de Reciclagem, cada um com uma
  experiência de navegação adaptada
- **Anúncios de material** — tipo, quantidade, fotos, localização, doação ou venda
- **Busca e filtros avançados** — bottom sheet com múltiplos materiais, faixa de preço e
  ordenação (distância / menor preço / mais recente)
- **Mapa interativo** dos centros de reciclagem próximos, com tema claro/escuro
- **Negociação em tempo real** — proposta → contraproposta → aceite/recusa, com chat via
  WebSocket
- **Fechamento de negócio** — agendar coleta → coletado → concluído, com atualização automática
  das estatísticas de impacto de ambas as partes
- **Avaliações** (nota + comentário) após negócio concluído
- **Favoritos** — salvar anúncios e centros para acessar depois
- **Painel de impacto** — gráfico de kg reciclados por mês, nível eco (Bronze/Prata/Ouro/Platina)
- **Modo escuro** completo (automático, claro ou escuro)
- **Central de notificações** in-app em tempo real

**Próximos passos** (fora do escopo atual, arquitetura já preparada): push notification via
Expo Push Service/EAS, pagamento integrado, contadores de mensagens não lidas, visualizador de
fotos em tela cheia, painel administrativo web.

## Stack técnica e decisões de arquitetura

| Camada | Tecnologia | Por quê |
|---|---|---|
| Mobile | Expo (React Native + TypeScript) | Iteração rápida via Expo Go, sem precisar de build nativo para desenvolver |
| Navegação | React Navigation | Padrão de mercado, tipagem forte de rotas |
| Estado servidor | TanStack Query | Cache, refetch automático, updates otimistas (ex.: favoritar) |
| Backend | Express + TypeScript | API REST simples e previsível |
| Banco | Prisma ORM sobre SQLite (dev) | Zero setup de infra local; troca de `provider` para Postgres em produção sem tocar no código |
| Tempo real | Socket.io | Chat de negociação e notificações ao vivo |
| Auth | JWT + bcrypt | Simples, sem dependência de serviço externo |
| Mapa | WebView + Leaflet/OpenStreetMap | `react-native-maps` (Google Maps nativo) **não funciona no Expo Go** nas versões atuais do SDK — exige build nativo customizado. Resolvido com um mapa via WebView, sem chave de API e 100% funcional no fluxo de desenvolvimento via Expo Go |
| Tema | Context API com paletas light/dark | Todo componente usa `useThemeColors()`; estilos são funções `createStyles(colors)` para recalcular sob demanda quando o tema muda |
| Animações | Moti + Reanimated | Microinterações (transições de tela, feedback de ações, gráfico) |

## Arquitetura

```
Celular (Expo Go)                    Servidor (Node)
┌─────────────────────┐              ┌──────────────────────────┐
│ React Native app     │  REST/JSON   │ Express API               │
│  - TanStack Query ───┼─────────────▶│  - rotas /auth /listings   │
│  - Socket.io client ─┼──WebSocket──▶│    /negotiations /deals    │
│  - WebView (mapa)     │              │  - Socket.io (chat)        │
└─────────────────────┘              │  - Prisma ORM ──▶ SQLite   │
                                      └──────────────────────────┘
```

## Estrutura do projeto

```
reclicla/
  backend/
    prisma/schema.prisma   modelo de dados (User, Listing, Negotiation, Deal, Favorite, ...)
    src/routes/             uma rota por domínio (auth, listings, negotiations, deals, favorites...)
    src/sockets/             chat em tempo real
  mobile/
    src/screens/             uma pasta por área (auth, home, listings, map, negotiations, profile...)
    src/components/          design system (Button, Card, BottomSheet, Toast, FavoriteButton...)
    src/hooks/                camada de dados (React Query) por domínio
    src/theme/                paleta light/dark, tipografia, espaçamento
```

## Como rodar

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev   # cria o banco SQLite local (dev.db)
npm run seed              # popula com dados de demonstração
npm run dev                # sobe a API em http://localhost:4000
```

Contas de demonstração (senha para todas: `senha123`):

| E-mail | Perfil |
|---|---|
| centro1@reclicla.com | Centro: EcoPonto Vila Verde |
| centro2@reclicla.com | Centro: Cooperativa Recicla Mais |
| centro3@reclicla.com | Centro: Ponto Verde Pinheiros |
| populacao@reclicla.com | População: Marina Souza |
| fornecedor@reclicla.com | Fornecedor: Distribuidora Bom Destino |

### 2. Mobile

O celular físico não alcança `localhost` do seu PC — configure o IP local da máquina:

```bash
cd mobile
cp .env.example .env
# edite .env com o IP local do seu PC (descubra com `ipconfig` / `ifconfig`)
# EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:4000

npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (disponível na Play Store/App Store) — celular e PC
precisam estar na **mesma rede Wi-Fi** (ou use `npx expo start --tunnel` para contornar
restrições de rede local).

### Testando o fluxo completo

1. Entre com `populacao@reclicla.com` e publique um anúncio (ou use os anúncios já semeados)
2. Em outro dispositivo/sessão, entre com `centro1@reclicla.com` e envie uma proposta pelo anúncio
3. Negocie no chat (proposta, contraproposta, aceite)
4. Ao aceitar, o negócio é criado — agende a coleta, marque como coletado e depois concluído
5. Avalie o negócio e veja as estatísticas de impacto e o gráfico atualizarem no perfil
6. Favorite anúncios/centros, teste o filtro avançado e alterne entre tema claro/escuro/automático

## Screenshots

> _em breve_

## Licença

MIT — veja [LICENSE](./LICENSE).
