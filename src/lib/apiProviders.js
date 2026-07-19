export const API_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    key: 'geminiApiKey',
    url: 'https://makersuite.google.com/app/apikey',
    description: 'מודל מתקדם של Google עם יכולות מולטימודליות',
    free: '60 בקשות לדקה',
    models: 'Gemini Pro, Gemini Pro Vision',
    steps: [
      'היכנס ל-Google AI Studio',
      'לחץ על "Get API Key"',
      'צור מפתח חדש או השתמש בקיים',
      'העתק את המפתח והדבק כאן'
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    key: 'groqApiKey',
    url: 'https://console.groq.com',
    description: 'מהיר ביותר! עד 500 tokens/sec 🚀',
    free: '14,400 בקשות ליום',
    models: 'Llama 3, Mixtral, Gemma',
    steps: [
      'הירשם ב-Groq Console',
      'לך ל-API Keys',
      'צור מפתח חדש',
      'העתק והדבק כאן'
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    key: 'mistralApiKey',
    url: 'https://console.mistral.ai',
    description: 'מודלים אירופאיים מתקדמים',
    free: 'טיר חינמי זמין',
    models: 'Mistral 7B, Mixtral 8x7B',
    steps: [
      'הירשם ב-Mistral Console',
      'צור מפתח API חדש',
      'העתק את המפתח',
      'הדבק כאן'
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    key: 'cohereApiKey',
    url: 'https://dashboard.cohere.com',
    description: 'מודלים עסקיים ומתקדמים',
    free: 'Trial API זמין',
    models: 'Command, Command Light',
    steps: [
      'הירשם ב-Cohere',
      'לך ל-API Keys',
      'צור Trial Key',
      'הדבק כאן'
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    key: 'huggingfaceApiKey',
    url: 'https://huggingface.co/settings/tokens',
    description: 'גישה למאות מודלים בקוד פתוח',
    free: 'חינמי עם rate limits',
    models: 'מאות מודלים',
    steps: [
      'הירשם ב-Hugging Face',
      'לך להגדרות > Access Tokens',
      'צור Read token',
      'הדבק כאן'
    ]
  },
  {
    id: 'together',
    name: 'Together AI',
    key: 'togetherApiKey',
    url: 'https://together.ai',
    description: 'פלטפורמה לריצת מודלים בענן',
    free: '$25 credit חינם',
    models: 'Llama 3, Mistral, ועוד',
    steps: [
      'הירשם ב-Together AI',
      'קבל $25 credit',
      'צור API Key',
      'הדבק כאן'
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude 3.5',
    key: 'claudeApiKey',
    url: 'https://console.anthropic.com',
    description: 'Claude 3.5 Sonnet - מודל מתקדם ביותר לחשיבה מורכבת',
    free: '$5 credit חינם',
    models: 'Claude 3.5 Sonnet, Opus, Haiku',
    category: 'paid',
    steps: [
      'הירשם ב-Anthropic Console',
      'קבל $5 credit חינם',
      'צור API Key חדש',
      'הדבק כאן'
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    key: 'openaiApiKey',
    url: 'https://platform.openai.com/api-keys',
    description: 'GPT-4o - מודל דור חדש עם ראיית חזון',
    free: '$5 credit חינם',
    models: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    category: 'paid',
    steps: [
      'הירשם ב-OpenAI Platform',
      'קבל $5 credit חינם',
      'צור API Key חדש',
      'הדבק כאן'
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (חינמי מקומי)',
    key: 'ollamaEndpoint',
    url: 'https://ollama.ai',
    description: '🆓 הרץ מודלים מקומיים - אפס עלויות ללא קרדיטים',
    free: 'חינמי ב-100%',
    models: 'Llama 2, Mistral, Neural Chat וכו\'',
    category: 'free',
    steps: [
      'הורד Ollama מ-ollama.ai',
      'התקן וקבל את המודלים',
      'הרץ: ollama serve',
      'הוסף localhost:11434'
    ]
  },
  {
    id: 'localaib',
    name: 'LocalAI (חינמי מקומי)',
    key: 'localaiBudget',
    url: 'https://localai.io',
    description: '🆓 OpenAI-compatible API מקומי - אפס עלויות',
    free: 'חינמי ב-100%',
    models: 'מאות מודלים פתוחים',
    category: 'free',
    steps: [
      'התקן LocalAI',
      'הרץ: docker run -p 8080:8080 localai/localai',
      'כנס מודלים מרצוי',
      'הוסף http://localhost:8080'
    ]
  }
];

export const FREE_MODELS = API_PROVIDERS.filter(p => p.category === 'free');
export const PAID_MODELS = API_PROVIDERS.filter(p => p.category !== 'free');