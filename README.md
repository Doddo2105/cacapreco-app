# Fareja — Promoções, Cupons Online & Supermercados 🏷️🛒

Aplicativo mobile (iOS, Android & Web) desenvolvido em **React Native + Expo SDK 58**, **Expo Router (`NativeTabs`)**, **Supabase** e **Gemini AI (`@google/genai`)** seguindo os padrões nativos de interface do **`expo-native-ui`**.

## Funcionalidades
- **Promoções & Cupons Online:** Ofertas da Amazon, Mercado Livre, Shopee e Magalu com termômetro de votos, cópia de cupom e links de afiliado automáticos.
- **Mercados & Atacarejos:** Comparação de encartes do Atacadão, Assaí e Carrefour por corredor (*Açougue, Bebidas, Mercearia, Laticínios, Limpeza*).
- **Minha Cesta (Comparador Inteligente):** Calcula automaticamente em qual supermercado a sua lista de compras inteira sai mais barata.
- **Alertas de Preço & Assinatura VIP:** Monitoramento automático de preços desejados e desbloqueio de ofertas "Bug de Preço".
- **Importador Mágico com IA (`gemini-3.8-flash`):** Extrai produtos e preços de textos de ofertas ou encartes em lote.

## Conta & perfil
- **Login / cadastro / recuperar senha** em `app/login.tsx`, com opção de **continuar sem conta**.
- Com Supabase configurado no `.env`, as contas usam o **Supabase Auth** (e-mail e senha). Sem ele, o app roda em **modo local**: a conta fica salva só no aparelho (senha guardada apenas como hash).
- **Perfil** (`app/(tabs)/(profile)`): dados da conta, edição de nome, status VIP, tema, cidade/afiliados e sair.
- Nome do produto centralizado em `src/constants/brand.ts`; logo em `assets/logo.svg`.

## Design & animações
- **Paleta:** verde-esmeralda para dinheiro/economia, laranja quente para urgência e descontos, dourado para o VIP e violeta para os recursos de IA (`src/theme/colors.ts`).
- **Movimento:** `react-native-reanimated` 4 — feedback de toque, entradas em cascata, contador de economia, chama de temperatura e barras de progresso, sempre respeitando "reduzir movimento" (`src/components/motion.tsx`).
- **Feedback:** toasts não-bloqueantes no lugar de alertas e cópia real do cupom para a área de transferência.

## Como rodar
```bash
npm install
cp .env.example .env
npx expo start
```
