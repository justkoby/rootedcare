import { ImageSourcePropType } from 'react-native';

export interface LocalNames {
  twi?: string;
  ga?: string;
  ewe?: string;
  dagbani?: string;
}

export interface ResearchSource {
  title: string;
  author: string;
  year: number;
}

export interface Herb {
  id: string;
  name: string;
  scientificName: string;
  localNames: LocalNames;
  description: string;
  overview: string;
  activeCompounds: string[];
  benefits: string[];
  howToUse: string[];
  preparation: string[];
  dosage: string;
  precautions: string[];
  sideEffects: string[];
  drugInteractions: string[];
  pregnancy: string;
  children: string;
  bestFor: string[];
  whenToTake: string;
  symptoms: string[];
  relatedHerbIds: string[];
  sources: ResearchSource[];
  image: ImageSourcePropType;
}

export const herbs: Herb[] = [
  {
    id: 'ginger',
    name: 'Ginger',
    scientificName: 'Zingiber officinale',
    localNames: {
      twi: 'Akakaduro',
      ga: 'Kakade',
      ewe: 'Kakawoe',
      dagbani: 'Ginja',
    },
    description: 'Ginger helps with digestion, reduces nausea and inflammation, and supports immunity.',
    overview: 'Ginger is a flowering plant that originated in Southeast Asia. It is among the healthiest (and most delicious) spices on the planet. Traditional Ghanaian practitioners have used ginger for centuries to treat digestive problems, colds, and physical pain.',
    activeCompounds: ['Gingerol', 'Shogaol', 'Paradol', 'Zingerone'],
    benefits: [
      'Alleviates chronic indigestion and bloating',
      'Significantly reduces nausea (morning sickness, motion sickness)',
      'Contains gingerol, a substance with powerful anti-inflammatory and antioxidant properties',
      'Helps lower blood sugar levels and improve heart disease risk factors',
    ],
    howToUse: [
      'Ginger Tea: Steep sliced fresh ginger root in boiling water for 10 minutes, add honey or lemon.',
      'Smoothies & Juices: Add a small 1-inch piece of peeled ginger to your daily wellness blend.',
      'Culinary: Grate fresh ginger into stir-fries, soups, and traditional stews.',
    ],
    preparation: [
      'Wash fresh ginger root thoroughly under cold running water.',
      'Peel using the back of a spoon or a peeler.',
      'Slice or grate as needed — thin slices for tea, grated for cooking.',
      'For ginger tea: add 5–6 thin slices to 2 cups of boiling water.',
      'Simmer for 10 minutes, strain into a cup, and sweeten with honey.',
    ],
    dosage: '1–4g of fresh ginger daily. For tea, use 1–2 teaspoons of fresh grated ginger per cup. Do not exceed 4g/day.',
    precautions: [
      'May cause mild heartburn or stomach discomfort in large quantities (more than 4g per day).',
      'Can act as a mild blood thinner; consult a doctor if taking blood-thinning medication.',
    ],
    sideEffects: [
      'Heartburn or acid reflux in high doses',
      'Mild bloating when taken on an empty stomach',
      'Mouth or throat irritation in sensitive individuals',
    ],
    drugInteractions: [
      'Blood thinners (Warfarin, Aspirin) — ginger may increase bleeding risk',
      'Diabetes medication — may lower blood sugar further',
      'Blood pressure medication — additive effect possible',
    ],
    pregnancy: 'Generally safe in culinary amounts (up to 1g/day). Avoid high medicinal doses. Consult your midwife or doctor before use.',
    children: 'Safe in small food amounts for children over 2 years. Avoid concentrated supplements for children under 6.',
    bestFor: ['Digestion', 'Nausea', 'Cold', 'Immunity'],
    whenToTake: 'After meals or when you feel stomach discomfort.',
    symptoms: ['Nausea', 'Stomach Ache', 'Bloating', 'Cold', 'Sore Throat', 'Headache'],
    relatedHerbIds: ['hibiscus', 'prekese', 'moringa'],
    sources: [
      { title: 'Ginger — an herbal medicinal product with broad anti-inflammatory actions', author: 'Grzanna R et al.', year: 2005 },
      { title: 'Effectiveness of Ginger on Nausea and Vomiting', author: 'Viljoen E et al.', year: 2014 },
    ],
    image: require('../assets/herbs/ginger.png'),
  },
  {
    id: 'moringa',
    name: 'Moringa',
    scientificName: 'Moringa oleifera',
    localNames: {
      twi: 'Yevu-ti',
      ga: 'Zogale',
      ewe: 'Yévú-atí',
      dagbani: 'Munugo',
    },
    description: 'Highly nutritious tree leaf rich in antioxidants, vitamins, and energy-boosting compounds.',
    overview: 'Often referred to as the "Miracle Tree," Moringa oleifera is native to parts of Africa and Asia. Almost every part of the tree is edible or used as an ingredient in traditional herbal medicine, with the leaves containing an exceptional density of vitamins, minerals, and amino acids.',
    activeCompounds: ['Isothiocyanates', 'Quercetin', 'Chlorogenic acid', 'Beta-carotene', 'Vitamin C'],
    benefits: [
      'Extremely rich in vitamins A, C, E, calcium, and iron',
      'Provides a natural, caffeine-free energy boost',
      'Supports healthy blood sugar management and cholesterol levels',
      'Protects cells from damage due to high antioxidant concentration',
    ],
    howToUse: [
      'Moringa Powder: Stir 1 teaspoon of dried moringa leaf powder into water, juice, or warm herbal broths.',
      'Leaf Tea: Brew dried moringa leaves in hot water for 5-7 minutes.',
      'Salads & Soups: Sprinkle fresh or dried leaves over meals just before serving.',
    ],
    preparation: [
      'For powder: dry fresh leaves in shade, then grind into fine powder.',
      'For tea: place 1 tablespoon of dried leaves in a strainer or tea bag.',
      'Pour 250ml of just-boiled water over leaves.',
      'Steep for 5–7 minutes, remove leaves, and drink warm.',
      'Add a squeeze of lemon and honey to balance the earthy taste.',
    ],
    dosage: '2–7g of dried leaf powder per day (roughly 1–2 teaspoons). Start with 1 teaspoon and increase gradually.',
    precautions: [
      'Avoid high doses of moringa bark or root extract during pregnancy as they may cause uterine contractions.',
      'May lower blood sugar; monitor levels if you are diabetic.',
    ],
    sideEffects: [
      'Laxative effect in very high doses',
      'Mild stomach upset when starting — begin with small amounts',
      'Bark and root extracts are toxic in high amounts; use leaf only',
    ],
    drugInteractions: [
      'Diabetes medication — additive blood sugar lowering effect',
      'Thyroid medication — may interfere with levothyroxine absorption',
      'Blood pressure medication — may lower BP further',
    ],
    pregnancy: 'Leaf powder in culinary amounts is considered safe. Avoid bark, root, and seed extracts during pregnancy as they may cause contractions.',
    children: 'Moringa leaves are nutritionally excellent for children over 1 year. Introduce small amounts (½ teaspoon) in food.',
    bestFor: ['Energy', 'Immunity', 'Antioxidants', 'Vitamins'],
    whenToTake: 'In the morning with breakfast to sustain energy levels.',
    symptoms: ['Fatigue', 'Difficulty Sleeping', 'Stress', 'Low Energy'],
    relatedHerbIds: ['ginger', 'neem', 'hibiscus'],
    sources: [
      { title: 'Moringa oleifera: A review on nutritional value', author: 'Gopalakrishnan L et al.', year: 2016 },
      { title: 'Anti-inflammatory properties of Moringa', author: 'Minaiyan M et al.', year: 2014 },
    ],
    image: require('../assets/herbs/moringa.png'),
  },
  {
    id: 'neem',
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    localNames: {
      twi: 'Dua Gyinam',
      ga: 'Kalinji',
      ewe: 'Niimu',
      dagbani: 'Nim',
    },
    description: 'Powerful anti-inflammatory and antimicrobial leaf used for detox, skin health, and dental care.',
    overview: 'Neem is a staple herb in Ghanaian natural wellness. Known for its bitter leaves, it is a potent cleansing agent used globally for skin detoxification, boosting dental health, and regulating systemic body inflammation.',
    activeCompounds: ['Nimbin', 'Nimbidin', 'Nimbidol', 'Azadirachtin', 'Quercetin'],
    benefits: [
      'Clears skin breakouts and acne due to antibacterial properties',
      'Improves gum health and reduces dental plaque',
      'Acts as a natural blood cleanser and detoxifier',
      'Supports digestion and liver function',
    ],
    howToUse: [
      'Skin Wash: Boil fresh neem leaves in water, cool, and use as a soothing face/body rinse.',
      'Detox Tea: Steep 3-4 dried neem leaves in hot water. (Note: Neem is very bitter, sweeten with honey).',
      'Dental care: Brush with neem powder or chew on a clean neem twig as a traditional chew-stick.',
    ],
    preparation: [
      'For skin wash: boil a handful of fresh neem leaves in 1 litre of water for 15 minutes.',
      'Cool completely before applying to skin as a rinse or compress.',
      'For detox tea: steep 3–4 dried leaves in 250ml hot water for 5 minutes.',
      'Strain well, add honey to offset bitterness, and drink once daily for up to 2 weeks.',
    ],
    dosage: 'Topical use: as needed. Internal (tea): 1 cup per day for 1–2 week cycles only. Do not use continuously.',
    precautions: [
      'Do not consume internally for long continuous periods (limit to 1-2 weeks at a time).',
      'Not suitable for children, pregnant women, or couples trying to conceive.',
    ],
    sideEffects: [
      'Bitter taste may cause mild nausea',
      'Prolonged internal use may affect kidney function',
      'High doses can cause vomiting or diarrhoea',
    ],
    drugInteractions: [
      'Immunosuppressants — neem stimulates the immune system, may counteract these drugs',
      'Diabetes medication — may lower blood sugar further',
      'Fertility treatments — neem has contraceptive properties',
    ],
    pregnancy: 'DO NOT use internally during pregnancy. Neem can stimulate uterine contractions and may cause miscarriage. External use with caution only.',
    children: 'Not recommended for children under 12 for internal use. Topical use in diluted form only, away from eyes and mouth.',
    bestFor: ['Detox', 'Skin Health', 'Dental Care', 'Antimicrobial'],
    whenToTake: 'On an empty stomach in the morning during a detox period.',
    symptoms: ['Skin Rash', 'Cough', 'Fever', 'Stomach Ache'],
    relatedHerbIds: ['moringa', 'ginger', 'prekese'],
    sources: [
      { title: 'Neem (Azadirachta indica): A plant with multiple medicinal uses', author: 'Alzohairy MA.', year: 2016 },
      { title: 'Antibacterial activity of neem leaf extracts', author: 'Biswas K et al.', year: 2002 },
    ],
    image: require('../assets/herbs/neem.png'),
  },
  {
    id: 'prekese',
    name: 'Prekese',
    scientificName: 'Tetrapleura tetraptera',
    localNames: {
      twi: 'Prekese',
      ga: 'Oshoshe',
      ewe: 'Oshoshe',
      dagbani: 'Suhira',
    },
    description: 'Traditional Aidan fruit used to improve circulation, manage blood pressure, and ease breathing.',
    overview: 'Prekese is a highly valued medicinal plant in West Africa, recognizable by its characteristic sweet, aromatic scent. It is frequently infused in traditional soups, teas, and steam treatments to regulate cardiovascular flow and relieve respiratory issues.',
    activeCompounds: ['Tannins', 'Saponins', 'Alkaloids', 'Flavonoids', 'Potassium'],
    benefits: [
      'Helps manage and lower high blood pressure levels',
      'Rich in essential minerals like potassium, iron, and calcium',
      'Eases chest congestion and supports respiratory health',
      'Promotes blood circulation throughout the body',
    ],
    howToUse: [
      'Prekese Infusion: Break 1 pod of prekese into smaller pieces, boil in water for 15 minutes, and drink as tea.',
      'Ghanaian Light Soup: Simmer a pod in your vegetable, fish, or chicken soup to infuse flavor and nutrients.',
      'Steam Therapy: Boil pods in water and inhale the warm herbal steam for respiratory relief.',
    ],
    preparation: [
      'Break one dried prekese pod into 4–6 pieces.',
      'Rinse briefly under clean water.',
      'Place in 2 cups of water and bring to a boil.',
      'Simmer on low heat for 15–20 minutes until water turns amber.',
      'Strain and drink warm. May add a little honey or ginger.',
    ],
    dosage: '1 cup of prekese tea per day, or 1 pod per pot of soup. Medicinal use: 1 cup morning and evening for 2–3 week cycles.',
    precautions: [
      'Generally very safe for culinary and medicinal consumption; consume in moderation.',
      'If you have low blood pressure, monitor your levels.',
    ],
    sideEffects: [
      'May cause a mild drop in blood pressure in sensitive individuals',
      'Strong aroma may be overpowering for some when used in steam therapy',
    ],
    drugInteractions: [
      'Antihypertensive drugs — additive blood pressure lowering, monitor BP regularly',
      'Diuretics — prekese also has mild diuretic properties',
    ],
    pregnancy: 'Culinary use in soups and stews is traditionally considered safe during pregnancy. Avoid high-concentration medicinal doses. Consult your midwife.',
    children: 'Safe in food preparations (soups, stews) for children of all ages. Medicinal tea for children over 5 with caution.',
    bestFor: ['Circulation', 'Hypertension', 'Respiration', 'Aromatherapy'],
    whenToTake: 'In the evening to relax and support cardiovascular balance.',
    symptoms: ['Headache', 'Cough', 'Sore Throat', 'Fever', 'Stress'],
    relatedHerbIds: ['hibiscus', 'ginger', 'neem'],
    sources: [
      { title: 'Phytochemical analysis and biological activity of Tetrapleura tetraptera', author: 'Ezeja M et al.', year: 2011 },
      { title: 'Antihypertensive effects of Tetrapleura tetraptera', author: 'Asuzu IU et al.', year: 1999 },
    ],
    image: require('../assets/herbs/prekese.png'),
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus (Sobolo)',
    scientificName: 'Hibiscus sabdariffa',
    localNames: {
      twi: 'Sobolo',
      ga: 'Bonto',
      ewe: 'Tsobile',
      dagbani: 'Tseblani',
    },
    description: 'Refreshing flower calyces used for cooling hydration, heart health, and digestive comfort.',
    overview: 'Known locally in Ghana as "Sobolo" or "Bissap," Hibiscus tea is a deep red, tart infusion enjoyed both hot and cold. Beyond its refreshing taste, it is packed with vitamin C and holds clinical significance in supporting healthy heart functions.',
    activeCompounds: ['Anthocyanins', 'Hibiscus acid', 'Vitamin C', 'Quercetin', 'Protocatechuic acid'],
    benefits: [
      'Helps lower systolic and diastolic blood pressure',
      'High in vitamin C and organic acids to support immunity',
      'Acts as a natural diuretic to cleanse the kidneys',
      'Improves digestive speed and gut comfort',
    ],
    howToUse: [
      'Sobolo Brew: Boil dried hibiscus calyces with ginger, prekese, cloves, and pineapple skins. Strain and sweeten.',
      'Cold Hydration: Serve chilled Sobolo with ice and mint leaves for cooling wellness.',
      'Hot Infusion: Steep dried petals in hot water for 5 minutes as a herbal tea.',
    ],
    preparation: [
      'Rinse 1 cup of dried hibiscus calyces under cold water.',
      'Combine with 4 cups of water in a pot and bring to a boil.',
      'Add ginger slices, a piece of prekese, and cloves for extra flavour.',
      'Reduce heat, simmer for 20 minutes until deep red.',
      'Strain, sweeten with honey or natural sugar. Serve hot or chilled.',
    ],
    dosage: '1–3 cups of hibiscus tea per day. Standard strength: 1.25g dried calyces per 150ml water. Avoid exceeding 3 cups daily.',
    precautions: [
      'Can lower estrogen levels; consult your doctor if you are undergoing hormone therapy.',
      'May interact with paracetamol or blood pressure medications.',
    ],
    sideEffects: [
      'May cause stomach discomfort or gas in large quantities',
      'Can cause dizziness in people with low blood pressure',
      'May have mild laxative effect',
    ],
    drugInteractions: [
      'Paracetamol / Acetaminophen — may affect how the body metabolises this drug',
      'Antihypertensive drugs — additive blood pressure lowering',
      'Chloroquine — may reduce drug absorption',
    ],
    pregnancy: 'Avoid medicinal quantities during pregnancy as hibiscus may stimulate uterine contractions. Culinary use in small amounts in soups is generally fine. Consult your doctor.',
    children: 'Sobolo in culinary diluted amounts is safe and enjoyed by children. Avoid concentrated medicinal preparations for children under 5.',
    bestFor: ['Heart Health', 'Hydration', 'Kidney Cleanse', 'Vitamin C'],
    whenToTake: 'Enjoy during the day for cooling hydration, preferably after a meal.',
    symptoms: ['Headache', 'Fever', 'Stress', 'Fatigue', 'Bloating'],
    relatedHerbIds: ['ginger', 'prekese', 'moringa'],
    sources: [
      { title: 'Hibiscus sabdariffa L. as a source of bioactive compounds', author: 'Da-Costa-Rocha I et al.', year: 2014 },
      { title: 'Effect of Hibiscus tea on blood pressure', author: 'McKay DL et al.', year: 2010 },
    ],
    image: require('../assets/herbs/hibiscus.png'),
  },
];
