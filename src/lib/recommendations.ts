import { customers, orders, products } from "@/lib/mock-data";
import { buildPosInsights } from "@/lib/pos-insights";

export type Customer = (typeof customers)[number];
type Product = (typeof products)[number];

export type LexicalMatch = {
  productId: string;
  name: string;
  category: string;
  lexicalScore: number;
  matchedOn: string[];
};

export type SemanticMatch = {
  productId: string;
  name: string;
  category: string;
  semanticScore: number;
  sharedTerms: string[];
};

export type BuyerProfile = {
  categories: string[];
  keywords: string[];
  purchasedProductIds: string[];
};

export type ProductRecommendation = {
  productId: string;
  name: string;
  category: string;
  score: number;
  signals: string[];
  explanation: string;
};

export type RecommendationResult = {
  customer: Customer;
  profile: BuyerProfile;
  anchorProduct: { productId: string; name: string } | null;
  lexicalMatches: LexicalMatch[];
  semanticMatches: SemanticMatch[];
  recommendations: ProductRecommendation[];
};

const historyBoost = 3;
const posBoost = 2;
const similarBuyerBoost = 2;

const stopwords = new Set([
  "with",
  "that",
  "this",
  "your",
  "from",
  "into",
  "more",
  "need",
  "needs",
  "range",
  "ranges",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !stopwords.has(token));
}

function productById(productId: string) {
  return products.find((product) => product.id === productId);
}

function buildProfile(customerId: string): BuyerProfile {
  const customerOrders = orders.filter((order) => order.customerId === customerId);

  const purchasedProductIds: string[] = [];
  const categoryCounts = new Map<string, number>();
  const keywords = new Set<string>();

  for (const order of customerOrders) {
    for (const line of order.lines) {
      const product = productById(line.productId);
      if (!product) {
        continue;
      }

      if (!purchasedProductIds.includes(product.id)) {
        purchasedProductIds.push(product.id);
      }
      categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
      for (const token of tokenize(product.subcategory)) {
        keywords.add(token);
      }
    }
  }

  const categories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  return {
    categories,
    keywords: Array.from(keywords),
    purchasedProductIds,
  };
}

function buildLexicalMatches(profile: BuyerProfile): LexicalMatch[] {
  const categorySet = new Set(profile.categories);

  return products
    .flatMap((product): LexicalMatch[] => {
      const matchedOn: string[] = [];

      if (categorySet.has(product.category)) {
        matchedOn.push(`category:${product.category}`);
      }

      const haystack = tokenize(`${product.name} ${product.subcategory} ${product.description}`);
      for (const keyword of profile.keywords) {
        if (haystack.includes(keyword)) {
          matchedOn.push(`keyword:${keyword}`);
        }
      }

      if (matchedOn.length === 0) {
        return [];
      }

      const categoryWeight = matchedOn.some((entry) => entry.startsWith("category:")) ? 2 : 0;
      const keywordWeight = matchedOn.filter((entry) => entry.startsWith("keyword:")).length;

      return [
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          lexicalScore: categoryWeight + keywordWeight,
          matchedOn,
        },
      ];
    })
    .sort((a, b) => b.lexicalScore - a.lexicalScore);
}

function resolveAnchorProduct(customerId: string, profile: BuyerProfile) {
  const bestSeller = buildPosInsights(customerId).bestSellers[0];
  const anchorId = bestSeller?.productId ?? profile.purchasedProductIds[0];
  return anchorId ? productById(anchorId) : undefined;
}

function buildSemanticMatches(anchor: ReturnType<typeof productById>): SemanticMatch[] {
  if (!anchor) {
    return [];
  }

  const anchorTokens = new Set(tokenize(`${anchor.name} ${anchor.description}`));

  return products
    .filter((product) => product.id !== anchor.id)
    .map((product) => {
      const candidateTokens = tokenize(`${product.name} ${product.description}`);
      const sharedTerms = Array.from(
        new Set(candidateTokens.filter((token) => anchorTokens.has(token))),
      );

      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        semanticScore: sharedTerms.length,
        sharedTerms,
      };
    })
    .sort((a, b) => b.semanticScore - a.semanticScore);
}

function buildHistoryLinks(profile: BuyerProfile) {
  const links = new Map<string, string>();

  for (const purchasedId of profile.purchasedProductIds) {
    const purchased = productById(purchasedId);
    if (!purchased) {
      continue;
    }

    for (const similarId of purchased.similarProductIds) {
      if (!profile.purchasedProductIds.includes(similarId) && !links.has(similarId)) {
        links.set(similarId, purchased.name);
      }
    }
  }

  return links;
}

function buildPosAdjacentIds(customerId: string, profile: BuyerProfile) {
  const adjacent = new Set<string>();

  for (const bestSeller of buildPosInsights(customerId).bestSellers) {
    const product = productById(bestSeller.productId);
    for (const similarId of product?.similarProductIds ?? []) {
      if (!profile.purchasedProductIds.includes(similarId)) {
        adjacent.add(similarId);
      }
    }
  }

  return adjacent;
}

function buildSimilarBuyerIds(customer: Customer, profile: BuyerProfile) {
  const peerIds = new Set<string>();
  const peers = customers.filter(
    (peer) =>
      peer.id !== customer.id &&
      (peer.region === customer.region || peer.segment === customer.segment),
  );

  for (const peer of peers) {
    for (const order of orders.filter((entry) => entry.customerId === peer.id)) {
      for (const line of order.lines) {
        if (!profile.purchasedProductIds.includes(line.productId)) {
          peerIds.add(line.productId);
        }
      }
    }
  }

  return peerIds;
}

function buildExplanation(
  customer: Customer,
  product: Product,
  signals: string[],
  historyLinkName: string | undefined,
  anchorName: string | undefined,
): string {
  const reasons: string[] = [];

  if (signals.includes("history") && historyLinkName) {
    reasons.push(`it complements ${historyLinkName} from recent orders`);
  }
  if (signals.includes("pos")) {
    reasons.push("it tracks closely with current POS best sellers");
  }
  if (signals.includes("lexical")) {
    reasons.push(`it fits the ${product.category} range you already stock`);
  }
  if (signals.includes("semantic") && anchorName) {
    reasons.push(`its profile reads like your flagship ${anchorName}`);
  }
  if (signals.includes("similar-buyer")) {
    reasons.push("similar venues in your area are ordering it");
  }
  if (reasons.length === 0) {
    reasons.push(`it broadens the ${product.category} range for the venue`);
  }

  return `For ${customer.name} (${customer.segment}), ${reasons.join("; ")}.`;
}

function buildReranked(
  customer: Customer,
  profile: BuyerProfile,
  lexicalMatches: LexicalMatch[],
  semanticMatches: SemanticMatch[],
  anchorName: string | undefined,
): ProductRecommendation[] {
  const lexicalScores = new Map(lexicalMatches.map((match) => [match.productId, match]));
  const semanticScores = new Map(semanticMatches.map((match) => [match.productId, match]));
  const historyLinks = buildHistoryLinks(profile);
  const posAdjacent = buildPosAdjacentIds(customer.id, profile);
  const similarBuyerIds = buildSimilarBuyerIds(customer, profile);

  return products
    .filter((product) => !profile.purchasedProductIds.includes(product.id))
    .map((product): ProductRecommendation => {
      const lexical = lexicalScores.get(product.id);
      const semantic = semanticScores.get(product.id);
      const signals: string[] = [];
      let score = 0;

      if (lexical) {
        score += lexical.lexicalScore;
        signals.push("lexical");
      }
      if (semantic && semantic.semanticScore > 0) {
        score += semantic.semanticScore;
        signals.push("semantic");
      }
      if (historyLinks.has(product.id)) {
        score += historyBoost;
        signals.push("history");
      }
      if (posAdjacent.has(product.id)) {
        score += posBoost;
        signals.push("pos");
      }
      if (similarBuyerIds.has(product.id)) {
        score += similarBuyerBoost;
        signals.push("similar-buyer");
      }

      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        score,
        signals,
        explanation: buildExplanation(
          customer,
          product,
          signals,
          historyLinks.get(product.id),
          anchorName,
        ),
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function buildRecommendations(customerId: string): RecommendationResult {
  const customer = customers.find((entry) => entry.id === customerId) ?? customers[0];
  const profile = buildProfile(customer.id);
  const lexicalMatches = buildLexicalMatches(profile);
  const anchor = resolveAnchorProduct(customer.id, profile);
  const semanticMatches = buildSemanticMatches(anchor);
  const recommendations = buildReranked(
    customer,
    profile,
    lexicalMatches,
    semanticMatches,
    anchor?.name,
  );

  return {
    customer,
    profile,
    anchorProduct: anchor ? { productId: anchor.id, name: anchor.name } : null,
    lexicalMatches,
    semanticMatches,
    recommendations,
  };
}
