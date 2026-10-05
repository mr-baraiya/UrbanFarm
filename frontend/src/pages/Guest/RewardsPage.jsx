import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaTrophy,
  FaSeedling,
  FaTint,
  FaMicroscope,
  FaAward,
  FaLeaf,
  FaUsers,
  FaCrown,
  FaCloudSunRain,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaLock,
  FaGift,
  FaTimes
} from 'react-icons/fa';
import { RiSparklingLine, RiMedalLine } from 'react-icons/ri';
import SEO from '../../components/SEO/SEO';
import './RewardsPage.css';

const BADGES_DATA = [
  {
    id: 'first_sprout',
    icon: <FaSeedling />,
    points: '+50 XP',
    color: '#27ae60',
    tierCategory: 'beginner',
    name: {
      en: 'First Sprout',
      hi: 'पहला अंकुर',
      gu: 'પ્રથમ અંકુર'
    },
    tier: {
      en: 'Bronze Milestone',
      hi: 'कांस्य मील का पत्थर',
      gu: 'કાંસ્ય માઇલસ્ટોન'
    },
    description: {
      en: 'Planted and registered your first seed or seedling into UrbanFarm.',
      hi: 'अर्बनफार्म में अपना पहला बीज या पौधा रोपा और पंजीकृत किया।',
      gu: 'અર્બનફાર્મમાં તમારું પ્રથમ બીજ અથવા છોડ રોપ્યું અને રજીસ્ટર કર્યું.'
    },
    eligibility: {
      en: 'Add your 1st plant to any urban garden space',
      hi: 'किसी भी शहरी बगीचे में अपना पहला पौधा जोड़ें',
      gu: 'કોઈપણ બગીચામાં તમારો પહેલો છોડ ઉમેરો'
    },
    requirementStep: {
      en: '1 Plant Registered',
      hi: '1 पौधा पंजीकृत',
      gu: '1 છોડ રજિસ્ટર'
    }
  },
  {
    id: 'hydration_master',
    icon: <FaTint />,
    points: '+100 XP',
    color: '#2980b9',
    tierCategory: 'intermediate',
    name: {
      en: 'Hydration Master',
      hi: 'जल मास्टर',
      gu: 'પાણી માસ્ટર'
    },
    tier: {
      en: 'Water Specialist',
      hi: 'जल विशेषज्ञ',
      gu: 'પાણી નિષ્ણાત'
    },
    description: {
      en: 'Completed 10 regular watering sessions to keep crops thriving.',
      hi: 'फसलों को लहलहाते रखने के लिए 10 नियमित सिंचाई सत्र पूरे किए।',
      gu: 'પાકને તંદુરસ્ત રાખવા માટે 10 નિયમિત સિંચાઈ સત્રો પૂર્ણ કર્યા.'
    },
    eligibility: {
      en: 'Complete 10 scheduled watering sessions',
      hi: '10 अनुसूचित सिंचाई सत्र पूरे करें',
      gu: '10 નિર્ધારિત સિંચાઈ સત્રો પૂર્ણ કરો'
    },
    requirementStep: {
      en: '10 Watering Sessions Completed',
      hi: '10 सिंचाई सत्र पूर्ण',
      gu: '10 સિંચાઈ સત્રો પૂર્ણ'
    }
  },
  {
    id: 'plant_doctor',
    icon: <FaMicroscope />,
    points: '+150 XP',
    color: '#8e44ad',
    tierCategory: 'intermediate',
    name: {
      en: 'Plant Doctor',
      hi: 'प्लांट डॉक्टर',
      gu: 'પ્લાન્ટ ડોક્ટર'
    },
    tier: {
      en: 'Health Specialist',
      hi: 'स्वास्थ्य विशेषज्ञ',
      gu: 'સ્વાસ્થ્ય નિષ્ણાત'
    },
    description: {
      en: 'Diagnosed plant diseases and health conditions with the AI vision scanner.',
      hi: 'एआई विजन स्कैनर से पौधों की बीमारियों और स्वास्थ्य का निदान किया।',
      gu: 'AI વિઝન સ્કેનર વડે છોડના રોગોનું નિદાન કર્યું.'
    },
    eligibility: {
      en: 'Run your 1st plant disease diagnosis scan using Krishi AI',
      hi: 'कृषि एआई का उपयोग करके अपना पहला पौधा रोग निदान स्कैन चलाएं',
      gu: 'કૃષિ AI નો ઉપયોગ કરીને તમારું પ્રથમ રોગ નિદાન સ્કેન ચલાવો'
    },
    requirementStep: {
      en: '1 Diagnosis Scan Run',
      hi: '1 निदान स्कैन पूर्ण',
      gu: '1 નિદાન સ્કેન પૂર્ણ'
    }
  },
  {
    id: 'first_harvest',
    icon: <FaAward />,
    points: '+200 XP',
    color: '#e67e22',
    tierCategory: 'intermediate',
    name: {
      en: 'First Harvest',
      hi: 'पहली उपज',
      gu: 'પ્રથમ લણણી'
    },
    tier: {
      en: 'Harvest Glory',
      hi: 'फसल गौरव',
      gu: 'લણણી ગૌરવ'
    },
    description: {
      en: 'Reaped the fresh fruits and vegetables of your urban garden labour.',
      hi: 'अपने शहरी बगीचे की ताजा फल और सब्जियों की कटाई की।',
      gu: 'તમારા શહેરી બગીચામાંથી તાજા શાકભાજી અને ફળો મેળવ્યા.'
    },
    eligibility: {
      en: 'Harvest and log your 1st homegrown crop batch',
      hi: 'अपनी पहली घरेलू फसल बैच की कटाई करें और लॉग करें',
      gu: 'તમારા ઘરના પ્રથમ પાકની લણણી કરો'
    },
    requirementStep: {
      en: '1 Crop Harvest Logged',
      hi: '1 फसल कटाई दर्ज',
      gu: '1 પાક લણણી નોંધાયેલ'
    }
  },
  {
    id: 'green_thumb',
    icon: <FaLeaf />,
    points: '+250 XP',
    color: '#2ecc71',
    tierCategory: 'master',
    name: {
      en: 'Green Thumb',
      hi: 'ग्रीन थंब',
      gu: 'ગ્રીન થંબ'
    },
    tier: {
      en: 'Emerald Mastery',
      hi: 'मरकत महारत',
      gu: 'એમરાલ્ડ નિપુણતા'
    },
    description: {
      en: 'Cultivated 5 or more active healthy urban plants simultaneously.',
      hi: 'एक साथ 5 या अधिक सक्रिय स्वस्थ शहरी पौधे उगाए।',
      gu: 'એકસાથે 5 અથવા વધુ સક્રિય તંદુરસ્ત છોડ ઉગાડ્યા.'
    },
    eligibility: {
      en: 'Maintain 5+ active healthy plants at the same time',
      hi: 'एक ही समय में 5+ सक्रिय स्वस्थ पौधे बनाए रखें',
      gu: 'એકસાથે 5+ તંદુરસ્ત છોડ જાળવો'
    },
    requirementStep: {
      en: '5+ Active Healthy Plants Growing',
      hi: '5+ सक्रिय स्वस्थ पौधे बढ़ रहे हैं',
      gu: '5+ તંદુરસ્ત છોડ ઉગી રહ્યા છે'
    }
  },
  {
    id: 'community_gardener',
    icon: <FaUsers />,
    points: '+200 XP',
    color: '#16a085',
    tierCategory: 'community',
    name: {
      en: 'Community Gardener',
      hi: 'समुदाय माली',
      gu: 'સમુદાય માળી'
    },
    tier: {
      en: 'Community Champion',
      hi: 'समुदाय चैंपियन',
      gu: 'સમુદાય ચેમ્પિયન'
    },
    description: {
      en: 'Shared knowledge, tips, and harvest photos with other city growers.',
      hi: 'अन्य शहरी उत्पादकों के साथ ज्ञान, सुझाव और फसल की तस्वीरें साझा कीं।',
      gu: 'અન્ય ખેડૂતો સાથે જ્ઞાન, ટિપ્સ અને ચિત્રો શેર કર્યા.'
    },
    eligibility: {
      en: 'Share 5 posts or helpful replies in the UrbanFarm Community Feed',
      hi: 'अर्बनफार्म कम्युनिटी फीड में 5 पोस्ट या उपयोगी उत्तर साझा करें',
      gu: 'અર્બનફાર્મ કમ્યુનિટીમાં 5 પોસ્ટ્સ અથવા જવાબો શેર કરો'
    },
    requirementStep: {
      en: '5 Community Contributions',
      hi: '5 सामुदायिक योगदान',
      gu: '5 સમુદાય યોગદાન'
    }
  },
  {
    id: 'gardening_guru',
    icon: <FaCrown />,
    points: '+500 XP',
    color: '#f1c40f',
    tierCategory: 'master',
    name: {
      en: 'Gardening Guru',
      hi: 'बागवानी गुरु',
      gu: 'બાગાયત ગુરુ'
    },
    tier: {
      en: 'Master Seal',
      hi: 'मास्टर सील',
      gu: 'માસ્ટર સીલ'
    },
    description: {
      en: 'Attained supreme gardening knowledge and master urban leadership.',
      hi: 'सर्वोच्च बागवानी ज्ञान और मास्टर शहरी नेतृत्व प्राप्त किया।',
      gu: 'સર્વોચ્ચ બાગાયતી જ્ઞાન અને માસ્ટર અનુભવ પ્રાપ્ત કર્યો.'
    },
    eligibility: {
      en: 'Accumulate 100+ total gardening reward points',
      hi: 'कुल 100+ बागवानी पुरस्कार अंक जमा करें',
      gu: 'કુલ 100+ પુરસ્કાર પોઇન્ટ એકત્રિત કરો'
    },
    requirementStep: {
      en: '100+ Gardening XP Earned',
      hi: '100+ बागवानी XP अर्जित',
      gu: '100+ બાગાયત XP મેળવ્યા'
    }
  },
  {
    id: 'weather_watcher',
    icon: <FaCloudSunRain />,
    points: '+100 XP',
    color: '#3498db',
    tierCategory: 'beginner',
    name: {
      en: 'Weather Watcher',
      hi: 'मौसम निरीक्षक',
      gu: 'હવામાન નિરીક્ષક'
    },
    tier: {
      en: 'Microclimate Expert',
      hi: 'सूक्ष्म जलवायु विशेषज्ञ',
      gu: 'હવામાન નિષ્ણાત'
    },
    description: {
      en: 'Utilised hyper-local weather alerts and smart irrigation intelligence.',
      hi: 'स्थानीय मौसम अलर्ट और स्मार्ट सिंचाई खुफिया जानकारी का उपयोग किया।',
      gu: 'સ્થાનિક હવામાન ચેતવણીઓ અને સિંચાઈ બુદ્ધિમત્તાનો ઉપયોગ કર્યો.'
    },
    eligibility: {
      en: 'Register garden location & activate live weather insights',
      hi: 'बगीचे का स्थान पंजीकृत करें और लाइव मौसम संबंधी जानकारी सक्रिय करें',
      gu: 'બગીચાનું સ્થળ રજીસ્ટર કરો અને હવામાન સુવિધા સક્રિય કરો'
    },
    requirementStep: {
      en: 'Location & Weather Active',
      hi: 'स्थान और मौसम सक्रिय',
      gu: 'સ્થળ અને હવામાન સક્રિય'
    }
  }
];

const UI_TEXT = {
  en: {
    heroTag: 'URBANFARM REWARDS & BADGES',
    heroTitle: 'Earn Badges &',
    heroTitleGrad: 'Build Your Community With Us',
    sloganBanner: '🌱 "Build your community with us"',
    heroSub: 'Unlock exclusive achievement medallions, earn points, track your urban farming milestones, and share your green progress with fellow city growers.',
    allBadges: 'All Badges',
    beginner: 'Beginner Milestones',
    intermediate: 'Intermediate',
    master: 'Master Tiers',
    community: 'Community Champion',
    eligibilityHeader: 'Eligibility Criteria:',
    howToEarn: 'How to Earn:',
    unlockedBadgeModal: 'Badge Details',
    closeModal: 'Close',
    sloganCardTitle: 'Build Your Community With Us',
    sloganCardSub: 'UrbanFarm is more than just an app — it is a vibrant collective of city gardeners sharing advice, diagnosing crops, and growing greener together.',
    joinCommunityBtn: 'Join Community Now',
    testDiagnosisBtn: 'Try AI Scan Demo',
    badgeUnlockedNotice: 'Log in to start earning and showcasing badges on your grower profile!'
  },
  hi: {
    heroTag: 'अर्बनफार्म पुरस्कार और बैज',
    heroTitle: 'बैज अर्जित करें और',
    heroTitleGrad: 'हमारे साथ अपना समुदाय बनाएं',
    sloganBanner: '🌱 "हमारे साथ अपना समुदाय बनाएं"',
    heroSub: 'विशेष उपलब्धि पदक अनलॉक करें, अंक अर्जित करें, अपने शहरी बागवानी मील के पत्थर को ट्रैक करें, और साथी उत्पादकों के साथ अपनी हरित प्रगति साझा करें।',
    allBadges: 'सभी बैज',
    beginner: 'प्रारंभिक मील के पत्थर',
    intermediate: 'मध्यवर्ती',
    master: 'मास्टर स्तर',
    community: 'समुदाय चैंपियन',
    eligibilityHeader: 'पात्रता मापदंड:',
    howToEarn: 'अर्जित कैसे करें:',
    unlockedBadgeModal: 'बैज विवरण',
    closeModal: 'बंद करें',
    sloganCardTitle: 'हमारे साथ अपना समुदाय बनाएं',
    sloganCardSub: 'अर्बनफार्म सिर्फ एक ऐप से कहीं अधिक है - यह शहर के बागवानों का एक जीवंत समूह है जो सलाह साझा करते हैं और साथ में हरियाली बढ़ाते हैं।',
    joinCommunityBtn: 'अभी समुदाय से जुड़ें',
    testDiagnosisBtn: 'एआई स्कैन डेमो आज़माएं',
    badgeUnlockedNotice: 'अपनी उत्पादक प्रोफ़ाइल पर बैज अर्जित करना शुरू करने के लिए लॉग इन करें!'
  },
  gu: {
    heroTag: 'અર્બનફાર્મ પુરસ્કારો અને બેજ',
    heroTitle: 'બેજ મેળવો અને',
    heroTitleGrad: 'અમારી સાથે તમારો સમુદાય બનાવો',
    sloganBanner: '🌱 "અમારી સાથે તમારો સમુદાય બનાવો"',
    heroSub: 'વિશિષ્ટ સિદ્ધિ મેડલ અનલૉક કરો, પોઇન્ટ મેળવો અને અન્ય ખેડૂતો સાથે તમારી પ્રગતિ શેર કરો.',
    allBadges: 'બધા બેજ',
    beginner: 'શરૂઆતી માઇલસ્ટોન',
    intermediate: 'મધ્યવર્તી',
    master: 'માસ્ટર સ્તર',
    community: 'સમુદાય ચેમ્પિયન',
    eligibilityHeader: 'પાત્રતાના માપદંડ:',
    howToEarn: 'મેળવવાની રીત:',
    unlockedBadgeModal: 'બેજ વિગતો',
    closeModal: 'બંધ કરો',
    sloganCardTitle: 'અમારી સાથે તમારો સમુદાય બનાવો',
    sloganCardSub: 'અર્બનફાર્મ એ માત્ર એક એપ નથી — તે શહેરી ખેડૂતોનો એક જીવંત સમુદાય છે જે સલાહ શેર કરે છે અને સાથે મળીને હરિયાળી વધારે છે.',
    joinCommunityBtn: 'હવે સમુદાયમાં જોડાઓ',
    testDiagnosisBtn: 'AI સ્કેન ડેમો અજમાવો',
    badgeUnlockedNotice: 'તમારી પ્રોફાઇલ પર બેજ મેળવવાનું શરૂ કરવા માટે લૉગ ઇન કરો!'
  }
};

const RewardsPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language && ['en', 'hi', 'gu'].includes(i18n.language) ? i18n.language : 'en';
  const L = UI_TEXT[lang] || UI_TEXT.en;

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const filteredBadges = BADGES_DATA.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.tierCategory === activeCategory;
  });

  return (
    <div className="rewards-page">
      <SEO
        title="Badges & Rewards Collection | UrbanFarm"
        description="Explore UrbanFarm badges, achievement eligibility criteria, and earn XP as you build your urban gardening community with us."
      />

      {/* Hero Header */}
      <section className="rewards-hero">
        <div className="rewards-container text-center">
          <div className="slogan-badge-pill">
            <RiSparklingLine /> {L.sloganBanner}
          </div>

          <h1 className="rewards-hero-title">
            {L.heroTitle} <span className="rewards-gradient-text">{L.heroTitleGrad}</span>
          </h1>

          <p className="rewards-hero-subtitle">{L.heroSub}</p>

          {/* Filter Pills */}
          <div className="rewards-filter-bar">
            <button
              className={`rewards-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <FaTrophy /> {L.allBadges}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'beginner' ? 'active' : ''}`}
              onClick={() => setActiveCategory('beginner')}
            >
              <FaSeedling /> {L.beginner}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'intermediate' ? 'active' : ''}`}
              onClick={() => setActiveCategory('intermediate')}
            >
              <FaAward /> {L.intermediate}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'master' ? 'active' : ''}`}
              onClick={() => setActiveCategory('master')}
            >
              <FaCrown /> {L.master}
            </button>
            <button
              className={`rewards-filter-btn ${activeCategory === 'community' ? 'active' : ''}`}
              onClick={() => setActiveCategory('community')}
            >
              <FaUsers /> {L.community}
            </button>
          </div>
        </div>
      </section>

      {/* Badges Grid Section */}
      <section className="rewards-content-section">
        <div className="rewards-container">
          
          <div className="rewards-section-title">
            <h2>
              <RiMedalLine className="title-icon" /> Official Badges & Eligibility Criteria
            </h2>
            <p>Click on any badge medallion to view full requirement details and reward rewards.</p>
          </div>

          {/* Grid */}
          <div className="badges-grid">
            {filteredBadges.map((badge) => {
              const bName = badge.name[lang] || badge.name.en;
              const bTier = badge.tier[lang] || badge.tier.en;
              const bDesc = badge.description[lang] || badge.description.en;
              const bElig = badge.eligibility[lang] || badge.eligibility.en;
              const bStep = badge.requirementStep[lang] || badge.requirementStep.en;

              return (
                <div
                  key={badge.id}
                  className="badge-card"
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className="badge-card-top">
                    <div className="badge-icon-box" style={{ background: `${badge.color}15`, color: badge.color }}>
                      {badge.icon}
                    </div>
                    <span className="badge-xp-pill">{badge.points}</span>
                  </div>

                  <div className="badge-card-body">
                    <span className="badge-tier-tag" style={{ color: badge.color, borderColor: `${badge.color}40` }}>
                      {bTier}
                    </span>
                    <h3 className="badge-name">{bName}</h3>
                    <p className="badge-desc">{bDesc}</p>

                    {/* Eligibility Requirement Box */}
                    <div className="eligibility-box">
                      <span className="elig-label">{L.howToEarn}</span>
                      <p className="elig-text">
                        <FaCheckCircle className="check-ic" /> {bElig}
                      </p>
                      <div className="elig-step-tag">
                        <FaLock className="lock-ic" /> {bStep}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SLOGAN SPOTLIGHT BANNER: "Build your community with us" */}
          <div className="slogan-spotlight-card">
            <div className="spotlight-content">
              <span className="spotlight-badge"><FaUsers /> COMMUNITY SLOGAN</span>
              <h2>🌱 "Build Your Community With Us"</h2>
              <p>{L.sloganCardSub}</p>
              <div className="spotlight-actions">
                <Link to="/register" className="rewards-btn rewards-btn-primary">
                  <FaUsers /> {L.joinCommunityBtn} <FaArrowRight />
                </Link>
                <Link to="/demo" className="rewards-btn rewards-btn-outline">
                  <FaMicroscope /> {L.testDiagnosisBtn}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Badge Detail Modal Preview */}
      {selectedBadge && (
        <div className="badge-modal-backdrop" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedBadge(null)}>
              <FaTimes />
            </button>

            <div className="modal-icon-header" style={{ background: `${selectedBadge.color}20`, color: selectedBadge.color }}>
              {selectedBadge.icon}
            </div>

            <span className="badge-tier-tag" style={{ color: selectedBadge.color }}>
              {selectedBadge.tier[lang] || selectedBadge.tier.en}
            </span>
            <h2 className="modal-title">{selectedBadge.name[lang] || selectedBadge.name.en}</h2>
            <p className="modal-desc">{selectedBadge.description[lang] || selectedBadge.description.en}</p>

            <div className="modal-eligibility-details">
              <h4>{L.eligibilityHeader}</h4>
              <p className="modal-elig-text">
                <FaCheckCircle style={{ color: selectedBadge.color }} /> {selectedBadge.eligibility[lang] || selectedBadge.eligibility.en}
              </p>
              <div className="modal-reward-tag">
                <FaGift /> Reward Value: <strong>{selectedBadge.points}</strong>
              </div>
            </div>

            <p className="modal-unlock-notice">{L.badgeUnlockedNotice}</p>

            <div className="modal-actions">
              <Link to="/register" className="rewards-btn rewards-btn-primary full-width" onClick={() => setSelectedBadge(null)}>
                Register To Unlock Badges
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
