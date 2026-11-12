import { GoogleGenAI } from '@google/genai';
import { newId } from '@/services/database';
import type { Deal, DealKind } from '@/types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

export async function parseDealsWithAi(
  rawText: string,
  defaultKind: DealKind,
  city: string
): Promise<Deal[]> {
  const hasValidKey =
    Boolean(GEMINI_API_KEY) &&
    !GEMINI_API_KEY.includes('sua-chave-api') &&
    GEMINI_API_KEY.length > 15;

  if (hasValidKey) {
    try {
      const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash',
        system_instruction: `Você é um extrator de ofertas para um aplicativo brasileiro de Promoções, Cupons Online e Encartes de Supermercado.
Analise o texto enviado pelo usuário e extraia uma lista de ofertas estruturadas.
- Se for oferta de loja online (Amazon, Mercado Livre, Shopee, Magalu, AliExpress), use kind="online" e categorias como "Eletrônicos", "Eletro & Casa", "Suplementos", "Bebês & Limpeza", "Gamer" ou "Moda".
- Se for oferta de supermercado/atacarejo (Atacadão, Assaí, Carrefour, etc.), use kind="mercado" e categorias como "Açougue", "Bebidas", "Mercearia", "Laticínios", "Limpeza" ou "Hortifrúti".
- Se o preço original não for informado, estime um preço original 25% maior que o dealPrice.`,
        input: rawText,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              deals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    kind: { type: 'string', enum: ['online', 'mercado'] },
                    title: { type: 'string' },
                    storeName: { type: 'string' },
                    category: { type: 'string' },
                    originalPrice: { type: 'number' },
                    dealPrice: { type: 'number' },
                    unit: { type: 'string' },
                    couponCode: { type: 'string' },
                    affiliateUrl: { type: 'string' },
                    description: { type: 'string' },
                  },
                  required: ['kind', 'title', 'storeName', 'category', 'dealPrice'],
                },
              },
            },
            required: ['deals'],
          },
        },
      });

      if (interaction.output_text) {
        const parsed = JSON.parse(interaction.output_text);
        if (Array.isArray(parsed.deals) && parsed.deals.length > 0) {
          return parsed.deals.map((d: any) => {
            const dealPrice = Number(d.dealPrice || 19.9);
            const originalPrice =
              Number(d.originalPrice) > dealPrice
                ? Number(d.originalPrice)
                : Number((dealPrice * 1.28).toFixed(2));
            return {
              id: newId(),
              kind: d.kind === 'mercado' ? 'mercado' : 'online',
              title: d.title || 'Oferta Especial',
              storeName: d.storeName || (defaultKind === 'mercado' ? 'Atacadão' : 'Amazon'),
              category:
                d.category || (defaultKind === 'mercado' ? 'Mercearia' : 'Eletrônicos'),
              originalPrice,
              dealPrice,
              unit: d.unit || 'un',
              couponCode: d.couponCode || null,
              affiliateUrl: d.affiliateUrl || null,
              city: d.kind === 'mercado' ? city : 'Brasil',
              description: d.description || 'Oferta extraída automaticamente via IA Gemini.',
              temperature: 50,
              isVipEarly: false,
              createdAt: new Date().toISOString(),
            };
          });
        }
      }
    } catch (err) {
      console.warn('Fallback local para extração de ofertas:', err);
    }
  }

  return parseDealsLocally(rawText, defaultKind, city);
}

function parseDealsLocally(rawText: string, defaultKind: DealKind, city: string): Deal[] {
  const lines = rawText
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const results: Deal[] = [];

  for (const line of lines) {
    const priceMatches = [...line.matchAll(/(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)/gi)];
    const numbers = priceMatches
      .map((m) => Number(m[1].replace(',', '.')))
      .filter((n) => n > 1 && n < 50000);

    const dealPrice = numbers.length > 0 ? Math.min(...numbers) : 29.9;
    const originalPrice =
      numbers.length > 1 && Math.max(...numbers) > dealPrice
        ? Math.max(...numbers)
        : Number((dealPrice * 1.25).toFixed(2));

    const couponMatch = line.match(/cupom[:\s]+([A-Z0-9_-]{4,18})/i);
    const urlMatch = line.match(/https?:\/\/[^\s]+/i);

    const lower = line.toLowerCase();
    let storeName = defaultKind === 'mercado' ? 'Atacadão' : 'Amazon';
    if (lower.includes('mercado livre') || lower.includes('mercadolivre'))
      storeName = 'Mercado Livre';
    else if (lower.includes('shopee')) storeName = 'Shopee';
    else if (lower.includes('magalu') || lower.includes('magazine')) storeName = 'Magalu';
    else if (lower.includes('assai') || lower.includes('assaí'))
      storeName = 'Assaí Atacadista';
    else if (lower.includes('carrefour')) storeName = 'Carrefour';
    else if (lower.includes('atacadao') || lower.includes('atacadão'))
      storeName = 'Atacadão';

    const cleanTitle = line
      .replace(/https?:\/\/[^\s]+/gi, '')
      .replace(/cupom[:\s]+[A-Z0-9_-]+/gi, '')
      .trim()
      .slice(0, 85);

    results.push({
      id: newId(),
      kind: defaultKind,
      title: cleanTitle || 'Oferta Cadastrada',
      storeName,
      category: defaultKind === 'mercado' ? 'Mercearia' : 'Eletrônicos',
      originalPrice,
      dealPrice,
      unit: lower.includes('kg') ? 'kg' : 'un',
      couponCode: couponMatch ? couponMatch[1].toUpperCase() : null,
      affiliateUrl: urlMatch ? urlMatch[0] : null,
      city: defaultKind === 'mercado' ? city : 'Brasil',
      description: 'Oferta cadastrada via preenchimento rápido.',
      temperature: 25,
      isVipEarly: false,
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}
