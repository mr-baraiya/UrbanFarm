const translations = {
  gu: {
    'Healthy Plant': 'તંદુરસ્ત છોડ',
    'Powdery Mildew (Fungal Pathogen)': 'પાવડરી મિલ્ડ્યુ (ફંગલ)',
    'Cercospora Leaf Spot': 'સર્કોસ્પોરા લીફ સ્પોટ',
    'Unhealthy': 'અસ્વસ્થ',
    'Healthy': 'તંદુરસ્ત',
    'Needs Water': 'પાણીની જરૂર છે',
    'Watering': 'સિંચાઈ',
    'Fertilizing': 'ખાતર આપવું',
    'Pruning': 'છંટકાવ',
    'Harvesting': 'લણણી'
  },
  hi: {
    'Healthy Plant': 'स्वस्थ पौधा',
    'Powdery Mildew (Fungal Pathogen)': 'पाउडरी फफूंदी',
    'Cercospora Leaf Spot': 'सर्कसपोरा लीफ स्पॉट',
    'Unhealthy': 'अस्वस्थ',
    'Healthy': 'स्वस्थ',
    'Needs Water': 'पानी की आवश्यकता',
    'Watering': 'सिंचाई',
    'Fertilizing': 'खाद देना',
    'Pruning': 'छंटाई',
    'Harvesting': 'कटाई'
  }
};

exports.getTranslatedText = (text, lang = 'en') => {
  if (!text || lang === 'en' || !translations[lang]) return text;
  return translations[lang][text] || text;
};

exports.getLanguageFromRequest = (req) => {
  const langHeader = req.headers['accept-language'] || req.query.lang || 'en';
  if (langHeader.startsWith('gu')) return 'gu';
  if (langHeader.startsWith('hi')) return 'hi';
  return 'en';
};
