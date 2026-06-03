/**
 * Categorias e palavras-chave padrão (pt-BR) semeadas para cada novo usuário.
 * `icon` usa nomes do Material Symbols (mesmo conjunto de ícones do front Quasar).
 * As palavras-chave devem estar em minúsculo (o matching é case-insensitive).
 */
export interface DefaultCategory {
  name: string;
  color: string;
  icon: string;
  keywords: string[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Alimentação',
    color: '#059669',
    icon: 'restaurant',
    keywords: [
      'mercado',
      'supermercado',
      'padaria',
      'restaurante',
      'lanche',
      'lanchonete',
      'ifood',
      'feira',
      'açougue',
      'hortifruti',
      'comida',
      'almoço',
      'jantar',
      'café',
    ],
  },
  {
    name: 'Moradia',
    color: '#0369A1',
    icon: 'home',
    keywords: [
      'aluguel',
      'condomínio',
      'condominio',
      'luz',
      'energia',
      'água',
      'agua',
      'gás',
      'gas',
      'internet',
      'iptu',
      'faxina',
      'reforma',
    ],
  },
  {
    name: 'Transporte',
    color: '#D97706',
    icon: 'directions_car',
    keywords: [
      'uber',
      '99',
      'táxi',
      'taxi',
      'gasolina',
      'combustível',
      'combustivel',
      'ônibus',
      'onibus',
      'metrô',
      'metro',
      'estacionamento',
      'pedágio',
      'pedagio',
      'oficina',
      'mecânico',
    ],
  },
  {
    name: 'Saúde',
    color: '#DC2626',
    icon: 'favorite',
    keywords: [
      'farmácia',
      'farmacia',
      'remédio',
      'remedio',
      'médico',
      'medico',
      'consulta',
      'exame',
      'hospital',
      'dentista',
      'plano de saúde',
      'plano de saude',
      'laboratório',
      'laboratorio',
      'fisioterapia',
      'ótica',
      'otica',
    ],
  },
  {
    name: 'Lazer',
    color: '#7C3AED',
    icon: 'celebration',
    keywords: [
      'cinema',
      'viagem',
      'streaming',
      'netflix',
      'spotify',
      'passeio',
      'presente',
      'show',
      'teatro',
      'parque',
      'hotel',
    ],
  },
  {
    name: 'Educação',
    color: '#2563EB',
    icon: 'school',
    keywords: [
      'curso',
      'livro',
      'escola',
      'faculdade',
      'mensalidade',
      'material escolar',
      'apostila',
    ],
  },
  {
    name: 'Vestuário',
    color: '#DB2777',
    icon: 'checkroom',
    keywords: ['roupa', 'calçado', 'calcado', 'sapato', 'tênis', 'tenis', 'loja', 'bolsa'],
  },
  {
    name: 'Contas e Serviços',
    color: '#475569',
    icon: 'receipt_long',
    keywords: [
      'telefone',
      'celular',
      'assinatura',
      'tarifa',
      'seguro',
      'banco',
      'cartão',
      'cartao',
      'anuidade',
      'tv',
    ],
  },
  {
    // Categoria de fallback (sem palavras-chave) — recebe o que não casar com nenhuma regra.
    name: 'Outros',
    color: '#64748B',
    icon: 'category',
    keywords: [],
  },
];

export const FALLBACK_CATEGORY_NAME = 'Outros';
