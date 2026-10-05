import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaSync,
  FaSearch,
  FaThLarge,
  FaList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { RiSparklingLine } from 'react-icons/ri';
import SEO from '../../components/SEO/SEO';
import { getMarketPrices } from '../../services/marketService';
import './MarketPricesPage.css';

// Translation map for API data (Commodities, States, Districts, Markets, Units, Variety)
const API_TRANSLATIONS = {
  commodities: {
    'Groundnut': { hi: 'मूंगफली', gu: 'મગફળી' },
    'Cotton': { hi: 'कपास (रुआ)', gu: 'કપાસ' },
    'Wheat': { hi: 'गेहूं', gu: 'ઘઉં' },
    'Maize': { hi: 'मक्का', gu: 'મકાઈ' },
    'Bajra': { hi: 'बाजरा', gu: 'બાજરો' },
    'Cumin (Jeera)': { hi: 'जीरा', gu: 'જીરું' },
    'Castor Seed': { hi: 'अरंडी (एरंड)', gu: 'દિવેલા / એરંડા' },
    'Gram (Chana)': { hi: 'चना', gu: 'ચણા' },
    'Onion': { hi: 'प्याज', gu: 'ડુંગળી' },
    'Potato': { hi: 'आलू', gu: 'બટાકા' },
    'Tomato': { hi: 'टमाटर', gu: 'ટામેટા' },
    'Okra (Bhindi)': { hi: 'भिंडी', gu: 'ભીંડા' },
    'Green Chilli': { hi: 'हरी मिर्च', gu: 'લીલા મરચાં' },
    'Cabbage': { hi: 'पत्ता गोभी', gu: 'કોબીજ' },
    'Cauliflower': { hi: 'फूल गोभी', gu: 'ફૂલકોબી' },
    'Spinach (Palak)': { hi: 'पालक', gu: 'પાલક' },
    'Coriander (Dhania)': { hi: 'धनिया', gu: 'કોથમીર / ધાણા' },
    'Green Peas (Matar)': { hi: 'हरी मटर', gu: 'લીલા વટાણા' },
    'Brinjal (Eggplant)': { hi: 'बैंगन', gu: 'રીંગણ' },
    'Bottle Gourd (Lauki)': { hi: 'लौकी', gu: 'દૂધી' },
    'Bitter Gourd (Karela)': { hi: 'करेला', gu: 'કારેલા' },
    'Rose (Gulab)': { hi: 'गुलाब', gu: 'ગુલાબ' },
    'Jasmine (Mogra)': { hi: 'मोगरा / चमेली', gu: 'મોગરો / જુઈ' },
    'Marigold (Genda)': { hi: 'गेंदा', gu: 'ગલગોટો' },
    'Chrysanthemum (Guldaudi)': { hi: 'गुलदाउदी', gu: 'સેવંતી / ગુલદાઉદી' }
  },
  states: {
    'Gujarat': { hi: 'गुजरात', gu: 'ગુજરાત' },
    'Maharashtra': { hi: 'महाराष्ट्र', gu: 'મહારાષ્ટ્ર' },
    'Punjab': { hi: 'पंजाब', gu: 'પંજાબ' },
    'Madhya Pradesh': { hi: 'मध्य प्रदेश', gu: 'મધ્ય પ્રદેશ' },
    'Rajasthan': { hi: 'राजस्थान', gu: 'રાજસ્થાન' },
    'Uttar Pradesh': { hi: 'उत्तर प्रदेश', gu: 'ઉત્તર પ્રદેશ' },
    'Karnataka': { hi: 'कर्नाटक', gu: 'કર્ણાટક' },
    'Tamil Nadu': { hi: 'तमिलनाडु', gu: 'તમિલનાડુ' },
    'Delhi': { hi: 'दिल्ली', gu: 'દિલ્હી' },
    'Haryana': { hi: 'हरियाणा', gu: 'હરિયાણા' }
  },
  districts: {
    'Rajkot': { hi: 'राजकोट', gu: 'રાજકોટ' },
    'Ludhiana': { hi: 'लुधियाना', gu: 'લુધિયાણા' },
    'Indore': { hi: 'इंदौर', gu: 'ઇન્દોર' },
    'Jaipur': { hi: 'जयपुर', gu: 'જયપુર' },
    'Banaskantha': { hi: 'बनासकांठा', gu: 'બનાસકાંઠા' },
    'Mehsana': { hi: 'महसाणा', gu: 'મહેસાણા' },
    'Latur': { hi: 'लातूर', gu: 'લાતૂર' },
    'Nashik': { hi: 'नासिक', gu: 'નાસિક' },
    'Agra': { hi: 'आगरा', gu: 'આગ્રા' },
    'Kolar': { hi: 'कोलार', gu: 'કોલાર' },
    'Ahmedabad': { hi: 'अहमदाबाद', gu: 'અમદાવાદ' },
    'Surat': { hi: 'सूरत', gu: 'સુરત' },
    'Pune': { hi: 'पुणे', gu: 'પુણે' },
    'Amritsar': { hi: 'अमृतसर', gu: 'અમૃતસર' },
    'Bhopal': { hi: 'भोपाल', gu: 'ભોપાલ' },
    'Karnal': { hi: 'करनाल', gu: 'કનાલ' },
    'Vadodara': { hi: 'वडोदरा', gu: 'વડોદરા' },
    'Kanpur': { hi: 'कानपुर', gu: 'કાનપુર' },
    'Jodhpur': { hi: 'जोधपुर', gu: 'જોધપુર' },
    'Bengaluru': { hi: 'बेंगलुरु', gu: 'બેંગલુરુ' },
    'Madurai': { hi: 'मदुरै', gu: 'મદુરાઈ' },
    'Anand': { hi: 'आनंद', gu: 'આણંદ' }
  },
  markets: {
    'Rajkot': { hi: 'राजकोट मंडी', gu: 'રાજકોટ મંડી' },
    'Gondal': { hi: 'गोंडल मंडी', gu: 'ગોંડલ મંડી' },
    'Ludhiana': { hi: 'लुधियाना मंडी', gu: 'લુધિયાણા મંડી' },
    'Indore': { hi: 'इंदौर मंडी', gu: 'ઇન્દોર मंडी' },
    'Jaipur': { hi: 'जयपुर मंडी', gu: 'જયપુર મંડી' },
    'Palanpur': { hi: 'पालनपुर मंडी', gu: 'પાલનપુર મંડી' },
    'Unjha': { hi: 'ऊंझा मंडी', gu: 'ઊંઝા મંડી' },
    'Latur': { hi: 'लातूर मंडी', gu: 'લાતૂર મંડી' },
    'Lasalgaon': { hi: 'लासलगांव मंडी', gu: 'લાસલગામ મંડી' },
    'Agra': { hi: 'आगरा मंडी', gu: 'આગ્રા મંડી' },
    'Kolar': { hi: 'कोलार मंडी', gu: 'કોલાર મંડી' },
    'Ahmedabad APMC': { hi: 'अहमदाबाद एपीएमसी', gu: 'અમદાવાદ APMC' },
    'Surat APMC': { hi: 'सूरत एपीएमसी', gu: 'સુરત APMC' },
    'Pune APMC': { hi: 'पुणे एपीएमसी', gu: 'પુણે APMC' },
    'Azadpur APMC': { hi: 'आजादपुर एपीएमसी', gu: 'આઝાદપુર APMC' },
    'Amritsar APMC': { hi: 'अमृतसर एपीएमसी', gu: 'અમૃતસર APMC' },
    'Bhopal APMC': { hi: 'भोपाल एपीएमसी', gu: 'ભોપાલ APMC' },
    'Karnal APMC': { hi: 'करनाल एपीएमसी', gu: 'કનાલ APMC' },
    'Vadodara APMC': { hi: 'वडोदरा एपीएमसी', gu: 'વડોદરા APMC' },
    'Kanpur APMC': { hi: 'कानपुर एपीएमसी', gu: 'કાનપુર APMC' },
    'Jodhpur APMC': { hi: 'जोधपुर एपीएमसी', gu: 'જોધપુર APMC' },
    'KR Market Bengaluru': { hi: 'केआर मार्केट बेंगलुरु', gu: 'કેઆર માર્કેટ બેંગલુરુ' },
    'Madurai Flower Market': { hi: 'मदुरै फ्लावर मार्केट', gu: 'મદુરાઈ ફ્લાવર માર્કેટ' },
    'Anand Flower APMC': { hi: 'आनंद फ्लावर एपीएमसी', gu: 'આણંદ ફ્લાવર APMC' },
    'Gultekdi Pune': { hi: 'गुलटेकड़ी पुणे', gu: 'ગુલટેકડી પુણે' }
  },
  varieties: {
    'Bold': { hi: 'बोल्ड (मोटा)', gu: 'બોલ્ડ (મોટું)' },
    'Shankar-6': { hi: 'शंकर-6', gu: 'શંકર-6' },
    'Kalyan Sona': { hi: 'कल्याण सोना', gu: 'કલ્યાણ સોના' },
    'Yellow': { hi: 'पीला (येलो)', gu: 'પીળું' },
    'Deshi': { hi: 'देशी', gu: 'દેશી' },
    'Desi': { hi: 'देशी', gu: 'દેશી' },
    'Quality-1': { hi: 'उत्कृष्ट 1', gu: 'ક્વોલિટી-1' },
    'Medium': { hi: 'मध्यम', gu: 'મધ્યમ' },
    'Red': { hi: 'लाल', gu: 'લાલ' },
    'Jyoti': { hi: 'ज्योति', gu: 'જ્યોતિ' },
    'Hybrid': { hi: 'हाइब्रिड', gu: 'હાઇબ્રિડ' },
    'Green Medium': { hi: 'हरा मध्यम', gu: 'લીલું મધ્યમ' },
    'G-4 Spicy': { hi: 'जी-4 तीखा', gu: 'જી-4 તીખું' },
    'Round Green': { hi: 'गोल हरा', gu: 'ગોળ લીલું' },
    'Snowball': { hi: 'स्नोबॉल', gu: 'સ્નોબોલ' },
    'Fresh Leafy': { hi: 'ताजा पत्तेदार', gu: 'તાજા પાંદડાવાળા' },
    'Green Aromatic': { hi: 'हरा सुगंधित', gu: 'લીલું સુગંધિત' },
    'Sweet Green': { hi: 'मीठा हरा', gu: 'મીઠું લીલું' },
    'Purple Round': { hi: 'बैंगनी गोल', gu: 'રીંગણી ગોળ' },
    'Long Green': { hi: 'लंबा हरा', gu: 'લાંબુ લીલું' },
    'Dark Green': { hi: 'गहरा हरा', gu: 'ઘેરૂ લીલું' },
    'Dutch Red': { hi: 'डच रेड', gu: 'ડચ રેડ' },
    'Gundu Malli': { hi: 'गुंडू मल्ली', gu: 'ગુન્ડુ મલ્લી' },
    'Orange African': { hi: 'ऑरेंज अफ्रीकन', gu: 'ઓરેન્જ આફ્રિકન' },
    'Yellow Hybrid': { hi: 'पीला हाइब्रिड', gu: 'પીળું હાઇબ્રિડ' }
  },
  units: {
    '₹/quintal': { en: '₹/quintal', hi: '₹/क्विंटल', gu: '₹/ક્વિન્ટલ' }
  }
};

// Multilingual Page Labels
const PAGE_LABELS = {
  en: {
    heroTag: 'GOVERNMENT OF INDIA / AGMARKNET API',
    heroTitle: 'Latest Available Market Prices',
    heroSub: 'Explore real-time APMC mandi prices for crops, green vegetables, and flowers sourced directly from Government of India (Data.gov.in).',
    dataSourceLabel: 'Data Source: Government of India / Data.gov.in',
    allCat: 'All Commodities',
    cropsCat: '🌾 Crops',
    vegCat: '🥬 Green Vegetables',
    flowersCat: '🌸 Flowers',
    searchPlaceholder: 'Search crop, vegetable, flower or APMC market...',
    allStates: 'All States',
    allDistricts: 'All Districts',
    allMarkets: 'All APMC Markets',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    modalPrice: 'Modal Price',
    marketLabel: 'APMC Market',
    dateLabel: 'Date',
    unitLabel: 'Unit',
    varietyLabel: 'Variety:',
    lastUpdated: 'Last Updated:',
    refreshBtn: 'Refresh Prices',
    cardView: 'Card View',
    tableView: 'Table View',
    commodity: 'Commodity',
    location: 'Location',
    noDataTitle: 'No Mandi Prices Found',
    noDataSub: 'No matching market price records found for your active search or filter selection.',
    loadingText: 'Fetching latest available AGMARKNET mandi prices from Data.gov.in...',
    errorText: 'Unable to retrieve live market prices at this time. Please try refreshing.',
    disclaimerNotice: 'Prices shown are the latest available records from official AGMARKNET mandis. Prices are updated as official data is published by Data.gov.in.'
  },
  hi: {
    heroTag: 'भारत सरकार / एगमार्कनेट एपीआई',
    heroTitle: 'नवीनतम उपलब्ध बाजार भाव',
    heroSub: 'भारत सरकार (Data.gov.in) से सीधे प्राप्त फसलों, हरी सब्जियों और फूलों के वास्तविक समय के एपीएमसी मंडी भाव देखें।',
    dataSourceLabel: 'डेटा स्रोत: भारत सरकार / Data.gov.in',
    allCat: 'सभी जिंस (वस्तुएं)',
    cropsCat: '🌾 फसलें',
    vegCat: '🥬 हरी सब्जियां',
    flowersCat: '🌸 फूल',
    searchPlaceholder: 'फसल, सब्जी, फूल या मंडी खोजें...',
    allStates: 'सभी राज्य',
    allDistricts: 'सभी जिले',
    allMarkets: 'सभी एपीएमसी मंडियां',
    minPrice: 'न्यूनतम भाव',
    maxPrice: 'अधिकतम भाव',
    modalPrice: 'मॉडल (औसत) भाव',
    marketLabel: 'एपीएमसी मंडी',
    dateLabel: 'दिनांक',
    unitLabel: 'इकाई',
    varietyLabel: 'किस्म:',
    lastUpdated: 'अंतिम अद्यतन:',
    refreshBtn: 'भाव रिफ्रेश करें',
    cardView: 'कार्ड दृश्य',
    tableView: 'तालिका दृश्य',
    commodity: 'जिंस (वस्तु)',
    location: 'स्थान',
    noDataTitle: 'कोई मंडी भाव नहीं मिला',
    noDataSub: 'आपकी सक्रिय खोज या फ़िल्टर चयन के लिए कोई मेल खाता रिकॉर्ड नहीं मिला।',
    loadingText: 'Data.gov.in से नवीनतम उपलब्ध मंडी भाव प्राप्त किए जा रहे हैं...',
    errorText: 'इस समय लाइव बाजार भाव प्राप्त करने में असमर्थ। कृपया रिफ्रेश करने का प्रयास करें।',
    disclaimerNotice: 'दिखाए गए भाव आधिकारिक एगमार्कनेट मंडियों के नवीनतम उपलब्ध रिकॉर्ड हैं।'
  },
  gu: {
    heroTag: 'ભારત સરકાર / AGMARKNET API',
    heroTitle: 'નવીનતમ ઉપલબ્ધ બજાર ભાવ',
    heroSub: 'ભારત સરકાર (Data.gov.in) માંથી સીધા જ મેળવેલ પાક, લીલા શાકભાજી અને ફૂલોના રીઅલ-ટાઇમ APMC મંડી ભાવ જુઓ.',
    dataSourceLabel: 'ડેટા સ્ત્રોત: ભારત સરકાર / Data.gov.in',
    allCat: 'તમામ કોમોડિટીઝ',
    cropsCat: '🌾 પાક',
    vegCat: '🥬 લીલા શાકભાજી',
    flowersCat: '🌸 ફૂલો',
    searchPlaceholder: 'પાક, શાકભાજી, ફૂલ અથવા મંડી શોધો...',
    allStates: 'તમામ રાજ્યો',
    allDistricts: 'તમામ જિલ્લાઓ',
    allMarkets: 'તમામ APMC મંડીઓ',
    minPrice: 'ન્યૂનતમ ભાવ',
    maxPrice: 'મહત્તમ ભાવ',
    modalPrice: 'મોડલ (સરેરાશ) ભાવ',
    marketLabel: 'APMC મંડી',
    dateLabel: 'તારીખ',
    unitLabel: 'એકમ',
    varietyLabel: 'જાત / પ્રકાર:',
    lastUpdated: 'છેલ્લું અપડેટ:',
    refreshBtn: 'ભાવ રીફ્રેશ કરો',
    cardView: 'કાર્ડ વ્યૂ',
    tableView: 'ટેબલ વ્યૂ',
    commodity: 'પાક / વસ્તુ',
    location: 'સ્થળ',
    noDataTitle: 'કોઈ મંડી ભાવ મળ્યા નથી',
    noDataSub: 'તમારી સક્રિય શોધ અથવા ફિલ્ટર પસંદગી માટે કોઈ મેળ ખાતા રેકોર્ડ મળ્યા નથી.',
    loadingText: 'Data.gov.in માંથી નવીનતમ ઉપલબ્ધ મંડી ભાવ મેળવી રહ્યા છીએ...',
    errorText: 'આ સમયે લાઈવ બજાર ભાવ મેળવવામાં અસમર્થ. કૃપા કરીને રીફ્રેશ કરવાનો પ્રયાસ કરો.',
    disclaimerNotice: 'દર્શાવવામાં આવેલા ભાવ સત્તાવાર AGMARKNET મંડીઓના તાજેતરના ઉપલબ્ધ રેકોર્ડ છે.'
  }
};

// Translation Helper Function
const getLocText = (type, val, lang) => {
  if (!val) return '';
  if (lang === 'en') return val;
  const map = API_TRANSLATIONS[type];
  if (map && map[val] && map[val][lang]) {
    return map[val][lang];
  }
  return val;
};

const MarketPricesPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language && ['en', 'hi', 'gu'].includes(i18n.language) ? i18n.language : 'en';
  const L = PAGE_LABELS[lang] || PAGE_LABELS.en;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'crops', 'vegetables', 'flowers'
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMarketPrices(forceRefresh);
      if (res && res.records) {
        setRecords(res.records);
        setLastUpdated(res.lastUpdated ? new Date(res.lastUpdated).toLocaleString() : new Date().toLocaleString());
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch mandi market prices:', err);
      setError(L.errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPrices(true);
  };

  // Unique States, Districts, Markets
  const uniqueStates = useMemo(() => {
    const set = new Set(records.map((r) => r.state).filter(Boolean));
    return Array.from(set).sort();
  }, [records]);

  const uniqueDistricts = useMemo(() => {
    let filtered = records;
    if (selectedState) {
      filtered = filtered.filter((r) => r.state === selectedState);
    }
    const set = new Set(filtered.map((r) => r.district).filter(Boolean));
    return Array.from(set).sort();
  }, [records, selectedState]);

  const uniqueMarkets = useMemo(() => {
    let filtered = records;
    if (selectedState) filtered = filtered.filter((r) => r.state === selectedState);
    if (selectedDistrict) filtered = filtered.filter((r) => r.district === selectedDistrict);
    const set = new Set(filtered.map((r) => r.market).filter(Boolean));
    return Array.from(set).sort();
  }, [records, selectedState, selectedDistrict]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
        return false;
      }
      if (selectedState && rec.state !== selectedState) {
        return false;
      }
      if (selectedDistrict && rec.district !== selectedDistrict) {
        return false;
      }
      if (selectedMarket && rec.market !== selectedMarket) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const locCommodity = getLocText('commodities', rec.commodity, lang).toLowerCase();
        const locMarket = getLocText('markets', rec.market, lang).toLowerCase();
        const locDistrict = getLocText('districts', rec.district, lang).toLowerCase();
        const locState = getLocText('states', rec.state, lang).toLowerCase();
        const origCommodity = rec.commodity ? rec.commodity.toLowerCase() : '';
        const origMarket = rec.market ? rec.market.toLowerCase() : '';

        const match =
          locCommodity.includes(q) ||
          locMarket.includes(q) ||
          locDistrict.includes(q) ||
          locState.includes(q) ||
          origCommodity.includes(q) ||
          origMarket.includes(q);

        if (!match) return false;
      }
      return true;
    });
  }, [records, selectedCategory, selectedState, selectedDistrict, selectedMarket, searchQuery, lang]);

  return (
    <div className="market-prices-page">
      <SEO
        title="Latest Available APMC Mandi Market Prices | UrbanFarm"
        description="Check real-time Indian mandi prices for crops, green vegetables, and flowers sourced directly from Government of India (Data.gov.in AGMARKNET)."
      />

      {/* Hero Header Banner */}
      <section className="market-hero">
        <div className="market-container text-center">
          <div className="gov-source-tag">
            <RiSparklingLine /> {L.heroTag}
          </div>
          <h1 className="market-hero-title">
            {L.heroTitle}
          </h1>
          <p className="market-hero-subtitle">{L.heroSub}</p>

          <div className="data-source-badge">
            <FaCheckCircle className="badge-ic" /> {L.dataSourceLabel}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="market-content-section">
        <div className="market-container">
          
          {/* Controls Card */}
          <div className="market-controls-card">
            
            {/* Category Tabs */}
            <div className="category-tabs-bar">
              <button
                className={`cat-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                {L.allCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'crops' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('crops')}
              >
                {L.cropsCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'vegetables' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('vegetables')}
              >
                {L.vegCat}
              </button>
              <button
                className={`cat-tab-btn ${selectedCategory === 'flowers' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('flowers')}
              >
                {L.flowersCat}
              </button>
            </div>

            {/* Filter Inputs Row */}
            <div className="filter-inputs-row">
              <div className="search-input-wrapper">
                <FaSearch className="search-ic" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={L.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* State Dropdown */}
              <div className="select-wrapper">
                <select
                  className="filter-select"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                    setSelectedMarket('');
                  }}
                >
                  <option value="">{L.allStates}</option>
                  {uniqueStates.map((st) => (
                    <option key={st} value={st}>
                      {getLocText('states', st, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="select-wrapper">
                <select
                  className="filter-select"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedMarket('');
                  }}
                >
                  <option value="">{L.allDistricts}</option>
                  {uniqueDistricts.map((d) => (
                    <option key={d} value={d}>
                      {getLocText('districts', d, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Dropdown */}
              <div className="select-wrapper">
                <select
                  className="filter-select"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="">{L.allMarkets}</option>
                  {uniqueMarkets.map((m) => (
                    <option key={m} value={m}>
                      {getLocText('markets', m, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="controls-action-bar">
              <div className="bar-left-info">
                {lastUpdated && (
                  <span className="last-updated-text">
                    <FaCalendarAlt /> {L.lastUpdated} <strong>{lastUpdated}</strong>
                  </span>
                )}
              </div>

              <div className="bar-right-controls">
                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                  <button
                    className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                    title={L.cardView}
                  >
                    <FaThLarge /> {L.cardView}
                  </button>
                  <button
                    className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title={L.tableView}
                  >
                    <FaList /> {L.tableView}
                  </button>
                </div>

                {/* Refresh Button */}
                <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                  <FaSync className={loading ? 'spin-ic' : ''} /> {L.refreshBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="market-state-card loading">
              <FaSync className="spin-ic state-ic" />
              <h3>{L.loadingText}</h3>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="market-state-card error">
              <FaExclamationTriangle className="state-ic error" />
              <h3>{error}</h3>
              <button className="market-btn primary" onClick={handleRefresh}>
                <FaSync /> {L.refreshBtn}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredRecords.length === 0 && (
            <div className="market-state-card empty">
              <FaInfoCircle className="state-ic info" />
              <h3>{L.noDataTitle}</h3>
              <p>{L.noDataSub}</p>
              <button className="market-btn outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedState('');
                setSelectedDistrict('');
                setSelectedMarket('');
              }}>
                Reset Filters
              </button>
            </div>
          )}

          {/* Records Output: Card View */}
          {!loading && !error && filteredRecords.length > 0 && viewMode === 'card' && (
            <div className="market-cards-grid">
              {filteredRecords.map((item) => {
                const locCommodity = getLocText('commodities', item.commodity, lang);
                const locVariety = getLocText('varieties', item.variety, lang);
                const locMarket = getLocText('markets', item.market, lang);
                const locDistrict = getLocText('districts', item.district, lang);
                const locState = getLocText('states', item.state, lang);
                const locUnit = getLocText('units', item.unit, lang);

                return (
                  <div key={item.id} className="mandi-price-card">
                    <div className="card-top">
                      <span className={`cat-pill ${item.category}`}>
                        {item.category === 'crops' && '🌾 Crop'}
                        {item.category === 'vegetables' && '🥬 Vegetable'}
                        {item.category === 'flowers' && '🌸 Flower'}
                      </span>
                      <span className="arrival-date">
                        <FaCalendarAlt /> {item.arrival_date}
                      </span>
                    </div>

                    <h3 className="commodity-title">{locCommodity}</h3>
                    <p className="variety-sub">{L.varietyLabel} <strong>{locVariety}</strong></p>

                    <div className="location-info">
                      <FaMapMarkerAlt className="loc-ic" />
                      <span><strong>{locMarket}</strong>, {locDistrict}, {locState}</span>
                    </div>

                    {/* Prices Display */}
                    <div className="price-metrics-box">
                      <div className="price-item modal-highlight">
                        <span className="p-label">{L.modalPrice}</span>
                        <strong className="p-val">₹{item.modal_price.toLocaleString('en-IN')}</strong>
                        <span className="p-unit">{locUnit}</span>
                      </div>

                      <div className="price-sub-row">
                        <div className="price-item">
                          <span className="p-label">{L.minPrice}</span>
                          <strong className="p-val min">₹{item.min_price.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="price-item">
                          <span className="p-label">{L.maxPrice}</span>
                          <strong className="p-val max">₹{item.max_price.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Records Output: Table View */}
          {!loading && !error && filteredRecords.length > 0 && viewMode === 'table' && (
            <div className="market-table-container">
              <table className="market-table">
                <thead>
                  <tr>
                    <th>{L.commodity}</th>
                    <th>{L.marketLabel}</th>
                    <th>{L.location}</th>
                    <th>{L.minPrice}</th>
                    <th>{L.maxPrice}</th>
                    <th>{L.modalPrice}</th>
                    <th>{L.unitLabel}</th>
                    <th>{L.dateLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item) => {
                    const locCommodity = getLocText('commodities', item.commodity, lang);
                    const locVariety = getLocText('varieties', item.variety, lang);
                    const locMarket = getLocText('markets', item.market, lang);
                    const locDistrict = getLocText('districts', item.district, lang);
                    const locState = getLocText('states', item.state, lang);
                    const locUnit = getLocText('units', item.unit, lang);

                    return (
                      <tr key={item.id}>
                        <td className="commodity-td">
                          <strong>{locCommodity}</strong>
                          <span className="variety-tag">{locVariety}</span>
                        </td>
                        <td><strong>{locMarket}</strong></td>
                        <td>{locDistrict}, {locState}</td>
                        <td className="price-td min">₹{item.min_price.toLocaleString('en-IN')}</td>
                        <td className="price-td max">₹{item.max_price.toLocaleString('en-IN')}</td>
                        <td className="price-td modal">₹{item.modal_price.toLocaleString('en-IN')}</td>
                        <td>{locUnit}</td>
                        <td>{item.arrival_date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Disclaimer Footer Note */}
          <div className="market-disclaimer-note">
            <FaInfoCircle /> {L.disclaimerNotice} • <strong>{L.dataSourceLabel}</strong>
          </div>

        </div>
      </section>
    </div>
  );
};

export default MarketPricesPage;
