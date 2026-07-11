export interface Article {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  content: string[];
  duration: string;
  herbId?: string;
  featured?: boolean;
  imageHint: string;
}

const articles: Article[] = [
  {
    id: 'ginger-power',
    tag: 'Herbs',
    title: 'The Power of Ginger: More Than Just a Spice',
    subtitle: 'How this humble root can transform your daily wellness.',
    duration: '5 min read',
    herbId: 'ginger',
    featured: true,
    imageHint: 'ginger',
    content: [
      'Ginger (Zingiber officinale) is one of the most widely used medicinal plants in West Africa and around the world. For centuries, Ghanaian traditional medicine has relied on ginger to treat everything from stomach discomfort to colds and inflammation.',
      'The magic behind ginger lies in its bioactive compound called gingerol, which gives ginger its distinct pungent flavour and powerful anti-inflammatory properties. Modern research has confirmed what grandmothers have always known — ginger works.',
      'Clinical studies show that just 1 gram of ginger daily can significantly reduce nausea from motion sickness, morning sickness, and chemotherapy. A 2019 review in the journal Nutrients found ginger effective for reducing muscle pain after exercise, with effects appearing as soon as 24 hours after consumption.',
      'Ginger is also a potent digestive aid. It helps speed up gastric emptying, meaning food moves through your stomach faster and discomfort is reduced. For those who experience chronic indigestion or bloating, a cup of ginger tea after meals can make a world of difference.',
      'In Ghana, ginger is traditionally combined with other local herbs like prekese and hibiscus to create powerful wellness infusions. Modern preparations include ginger shots, teas, and culinary additions to soups and stews.',
      'The recommended daily dose is 1–4 grams of fresh ginger. Start with a small piece about the size of your thumb, steep it in hot water for 10 minutes with a squeeze of lemon, and enjoy a daily ritual that connects you to centuries of healing wisdom.',
      'Always source fresh, organic ginger when possible, and consult a healthcare provider if you are on blood-thinning medication, as ginger can have mild anticoagulant effects.',
    ],
  },
  {
    id: 'moringa-superfood',
    tag: 'Herbs',
    title: 'Boost Immunity Naturally with Moringa',
    subtitle: 'The miracle tree growing in your backyard.',
    duration: '6 min read',
    herbId: 'moringa',
    imageHint: 'moringa',
    content: [
      'Moringa oleifera, known locally as "yevu-ti" in Twi, has earned the nickname "The Miracle Tree" for good reason. Almost every part of this resilient plant — leaves, pods, seeds, and even roots — carries medicinal and nutritional value.',
      'What makes moringa truly extraordinary is its nutritional density. Gram for gram, dried moringa leaves contain 7 times the vitamin C of oranges, 4 times the calcium of milk, 4 times the vitamin A of carrots, and 2 times the protein of yogurt. It is arguably nature\'s most complete multivitamin.',
      'Traditional Ghanaian medicine uses moringa for fatigue, low energy, and nutritional deficiencies. The leaves are typically dried and ground into a fine powder that can be added to any meal — soups, stews, porridge, or simply stirred into warm water as a tea.',
      'Modern research supports these traditional uses. Studies published in the Journal of Ethnopharmacology have confirmed moringa\'s anti-inflammatory, antioxidant, and blood sugar-regulating properties. The isothiocyanates in moringa are particularly potent anti-inflammatory compounds.',
      'For those looking to boost their energy naturally without caffeine, moringa is an excellent choice. Unlike coffee which provides a spike and crash, moringa delivers sustained energy through its complete nutritional profile.',
      'To incorporate moringa into your daily routine: start with 1 teaspoon of dried leaf powder stirred into your morning tea, smoothie, or porridge. Gradually increase to 2 teaspoons as your body adjusts. The slightly earthy flavour pairs beautifully with citrus and honey.',
      'Moringa is generally safe for most people, but those on diabetes or thyroid medication should consult their doctor, as it may interact with certain medications.',
    ],
  },
  {
    id: 'cycle-wellness',
    tag: 'Cycle',
    title: 'Natural Support for Every Phase of Your Cycle',
    subtitle: 'Herbal remedies aligned with your body\'s rhythm.',
    duration: '7 min read',
    herbId: 'hibiscus',
    imageHint: 'hibiscus',
    content: [
      'Understanding your menstrual cycle is one of the most empowering steps you can take for your health. Each phase of the cycle brings different hormonal shifts, and your body\'s nutritional and herbal needs change accordingly.',
      'The menstrual cycle consists of four phases: menstruation, the follicular phase, ovulation, and the luteal phase. Each phase responds differently to specific herbs and nutrients.',
      'During menstruation, the body benefits from iron-rich herbs and those that soothe uterine cramps. Hibiscus (Sobolo) is rich in vitamin C and iron, making it an excellent tonic during this phase. Ginger tea can help ease cramping and reduce inflammation.',
      'The follicular phase (days 1–13) is a time of rising energy. Moringa\'s complete nutrition helps replenish the body after menstruation and supports rising oestrogen levels. This is the best time for gentle detoxification with herbs like neem used topically.',
      'Ovulation (around day 14) is peak fertility. The body is warm and receptive. Cooling herbs like hibiscus help maintain balance. Stay well-hydrated with herbal infusions.',
      'The luteal phase (days 15–28) brings progesterone dominance. Many women experience PMS symptoms during this phase. Prekese tea can help with water retention and mood swings due to its mineral content. Ginger continues to support digestion and reduce bloating.',
      'A daily wellness ritual that honours your cycle is one of the most powerful self-care practices. Start by tracking your cycle, noting which phase you are in, and choosing herbs that support your body\'s natural rhythm.',
    ],
  },
  {
    id: 'herbal-teas-daily',
    tag: 'Nutrition',
    title: 'Herbal Teas You Should Drink Daily',
    subtitle: 'Simple brews for everyday vitality.',
    duration: '3 min read',
    herbId: 'prekese',
    imageHint: 'prekese',
    content: [
      'In Ghana, herbal teas are more than just beverages — they are medicine, tradition, and daily ritual all in one cup. Here are four herbal teas that deserve a place in your daily routine.',
      'Ginger Tea: The ultimate digestive aid. Steep 5–6 thin slices of fresh ginger in boiling water for 10 minutes. Add honey and lemon. Best consumed after meals to aid digestion and reduce bloating.',
      'Sobolo (Hibiscus) Tea: Ghana\'s beloved red tea is packed with vitamin C and anthocyanins. Serve chilled with mint for a refreshing daily tonic that supports heart health and hydration.',
      'Prekese Tea: The aromatic pods of the prekese tree make a sweet, warming tea that supports circulation and respiratory health. Simmer a broken pod in water for 15 minutes for a comforting evening brew.',
      'Moringa Leaf Tea: A nutritional powerhouse in a cup. Steep dried moringa leaves or stir powder into hot water. Start your day with this green tea alternative for sustained energy without caffeine.',
      'The beauty of these teas is their versatility. They can be combined — ginger and prekese, hibiscus and ginger, moringa and lemon — to create unique blends that target your specific wellness needs.',
      'Aim for 2–3 cups of herbal tea daily, rotated throughout the week for maximum benefit. Your body will thank you.',
    ],
  },
  {
    id: 'natural-remedies-sleep',
    tag: 'Wellness',
    title: 'Natural Remedies for Better Sleep',
    subtitle: 'Restful nights with traditional wisdom.',
    duration: '4 min read',
    herbId: 'hibiscus',
    imageHint: 'hibiscus',
    content: [
      'Sleep is the foundation of good health, yet many of us struggle to get quality rest. Before reaching for sleep medications, consider these time-tested natural approaches rooted in Ghanaian wellness traditions.',
      'A warm cup of hibiscus tea in the evening can help lower blood pressure and create a sense of calm. The anthocyanins in hibiscus have been shown to promote relaxation and reduce anxiety.',
      'Prekese tea is another excellent evening choice. Its aromatic compounds have a naturally calming effect on the nervous system. The magnesium and potassium in prekese help relax muscles and prepare the body for rest.',
      'Create a calming bedtime ritual: dim the lights, put away screens, and spend 10 minutes with a warm herbal tea. This signals to your body that it is time to wind down.',
      'Ginger can also support sleep when consumed earlier in the day by improving digestion and reducing inflammation that might otherwise keep you awake.',
      'Remember that consistency matters more than intensity. A simple nightly ritual practiced regularly will transform your sleep quality over time.',
    ],
  },
];

export async function getArticles(): Promise<Article[]> {
  return Promise.resolve(articles);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  return Promise.resolve(articles.find(a => a.id === id));
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  if (tag === 'All') return Promise.resolve(articles);
  return Promise.resolve(articles.filter(a => a.tag === tag));
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  return Promise.resolve(articles.find(a => a.featured));
}
