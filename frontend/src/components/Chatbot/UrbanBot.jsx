import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  FaTimes,
  FaPaperPlane,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaTrash,
  FaExternalLinkAlt,
  FaSeedling,
  FaThumbsUp,
  FaThumbsDown,
  FaCopy,
  FaCheck,
  FaRedo,
} from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import './UrbanBot.css';

// Female voice indicators across Windows, macOS, iOS, Android, and Chromium
const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl',
  'zira', 'jenny', 'aria', 'sonia', 'neerja', 'libby', 'mia', 'natasha', 'clara', 'emily',
  'swara', 'kalpana', 'heera', 'dhwani', 'kavya', 'shruti',
  'aditi', 'lekha', 'priya', 'ananya', 'geeta', 'veena',
  'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'sangeeta'
];

const MALE_VOICE_KEYWORDS = [
  'male', 'man', 'boy', 'guy',
  'david', 'mark', 'george', 'ravi', 'hemant', 'madhav', 'niranjan', 'prabhat', 'ajay', 'rahul'
];

/**
 * Phonetically transliterates Gujarati script to Devanagari script.
 * Standard Gujarati and Devanagari Unicode blocks share an identical character offset (-0x180).
 * When no native Gujarati TTS voice is installed (common in Chrome on Windows),
 * Hindi female voices (e.g. Google हिन्दी, Swara, Kalpana) read Devanagari text
 * producing fluent, native Gujarati pronunciation.
 */
export const gujaratiToDevanagari = (text) => {
  if (!text) return '';
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      // Gujarati Unicode range is U+0A81 to U+0AF9
      if (code >= 0x0A81 && code <= 0x0AF9) {
        // Special case: Gujarati ળ (U+0AB3) -> Devanagari ल (U+0932) for universal TTS pronunciation
        if (code === 0x0AB3) {
          return 'ल';
        }
        return String.fromCharCode(code - 0x180);
      }
      return char;
    })
    .join('');
};

/**
 * Phonetic Latin fallback for systems with only English TTS engines
 */
const GUJARATI_TO_LATIN = {
  'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo', 'ઋ': 'ri',
  'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
  'ક': 'ka', 'ખ': 'kha', 'ગ': 'ga', 'ઘ': 'gha', 'ઙ': 'nga',
  'ચ': 'cha', 'છ': 'chha', 'જ': 'ja', 'ઝ': 'jha', 'ઞ': 'nya',
  'ટ': 'ta', 'ઠ': 'tha', 'ડ': 'da', 'ઢ': 'dha', 'ણ': 'na',
  'ત': 'ta', 'થ': 'tha', 'દ': 'da', 'ધ': 'dha', 'ન': 'na',
  'પ': 'pa', 'ફ': 'fa', 'બ': 'ba', 'ભ': 'bha', 'મ': 'ma',
  'ય': 'ya', 'ર': 'ra', 'લ': 'la', 'વ': 'va', 'શ': 'sha', 'ષ': 'sha', 'સ': 'sa', 'હ': 'ha', 'ળ': 'la',
  'ા': 'aa', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ૃ': 'ri',
  'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ં': 'n', 'ઃ': 'h'
};

export const gujaratiToLatin = (text) => {
  if (!text) return '';
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];
    if (GUJARATI_TO_LATIN[ch]) {
      const mapped = GUJARATI_TO_LATIN[ch];
      if (mapped.endsWith('a') && nextCh) {
        if (nextCh === '્') {
          res += mapped.slice(0, -1);
          i++;
          continue;
        } else if (['ા', 'િ', 'ી', 'ુ', 'ૂ', 'ૃ', 'ે', 'ૈ', 'ો', 'ૌ'].includes(nextCh)) {
          res += mapped.slice(0, -1) + (GUJARATI_TO_LATIN[nextCh] || '');
          i++;
          continue;
        }
      }
      res += mapped;
    } else if (ch === '્') {
      // Standalone virama
    } else {
      res += ch;
    }
  }
  return res;
};

/**
 * Robust female voice matcher for English, Hindi, and Gujarati
 */
export const findBestFemaleVoice = (voicesList, langCode) => {
  if (!voicesList || voicesList.length === 0) return null;

  const code = (langCode || 'en').toLowerCase().trim();
  const langPrefix = code.slice(0, 2);

  // 1. For English: user requested the SAME authentic Indian female voice artist as Hindi/Gujarati (no robotic Western AI voices!)
  if (langPrefix === 'en') {
    // A. Check for Indian English female voice (Microsoft Neerja, Microsoft Heera, Microsoft Priya, Google en-IN)
    const indianEnglishVoices = voicesList.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
      const isEnglish = vLang.startsWith('en');
      const isIndian =
        vLang === 'en-in' ||
        vLang.startsWith('en-in') ||
        name.includes('india') ||
        name.includes('heera') ||
        name.includes('neerja') ||
        name.includes('priya') ||
        name.includes('veena') ||
        name.includes('swara');
      return isEnglish && isIndian;
    });

    if (indianEnglishVoices.length > 0) {
      const femaleIndianEn = indianEnglishVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        return isFemale && !isMale;
      });
      if (femaleIndianEn) return femaleIndianEn;

      const nonMaleIndianEn = indianEnglishVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      });
      if (nonMaleIndianEn) return nonMaleIndianEn;

      return indianEnglishVoices[0];
    }

    // B. Same Indian voice artist as Hindi & Gujarati (Google हिन्दी, Swara, Kalpana)
    const indianVoices = voicesList.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
      return (
        vLang.startsWith('hi') ||
        vLang.startsWith('gu') ||
        name.includes('hindi') ||
        name.includes('हिन्दी') ||
        name.includes('gujarat')
      );
    });

    if (indianVoices.length > 0) {
      const femaleIndian = indianVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        if (name.includes('google') && name.includes('हिन्दी')) return true;
        const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        return isFemale && !isMale;
      });
      if (femaleIndian) return femaleIndian;

      const nonMaleIndian = indianVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      });
      if (nonMaleIndian) return nonMaleIndian;

      return indianVoices[0];
    }
  }

  // 2. Direct match for other requested languages (gu / hi)
  const matchingLangVoices = voicesList.filter((v) => {
    const vLang = (v.lang || '').toLowerCase().replace('_', '-');
    const vName = (v.name || '').toLowerCase();
    if (langPrefix === 'gu') {
      return vLang.startsWith('gu') || vName.includes('gujarat');
    }
    if (langPrefix === 'hi') {
      return vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('हिन्दी');
    }
    return vLang.startsWith(langPrefix);
  });

  if (matchingLangVoices.length > 0) {
    const femaleMatch = matchingLangVoices.find((v) => {
      const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
      if (name.includes('google') && name.includes('हिन्दी')) return true;
      const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      return isFemale && !isMale;
    });
    if (femaleMatch) return femaleMatch;

    const nonMaleMatch = matchingLangVoices.find((v) => {
      const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
      return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    });
    if (nonMaleMatch) return nonMaleMatch;

    return matchingLangVoices[0];
  }

  // 2. If Gujarati ('gu') and no native Gujarati voice is on this system (common in Chrome Windows):
  // Fall back to Hindi voice (Google हिन्दी, Swara, Kalpana) which reads Gujarati phonetically via Devanagari
  if (langPrefix === 'gu') {
    const hindiVoices = voicesList.filter((v) => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();
      return vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('हिन्दी');
    });

    if (hindiVoices.length > 0) {
      const femaleHi = hindiVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        if (name.includes('google') && name.includes('हिन्दी')) return true;
        const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        return isFemale && !isMale;
      });
      if (femaleHi) return femaleHi;

      const nonMaleHi = hindiVoices.find((v) => {
        const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
        return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
      });
      if (nonMaleHi) return nonMaleHi;

      return hindiVoices[0];
    }
  }

  // 3. Fallback to general female voice (English etc.)
  const fallbackFemale = voicesList.find((v) => {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    return isFemale && !isMale;
  });

  return fallbackFemale || voicesList[0] || null;
};

const UrbanBot = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Normalize active language code (gu, hi, or en)
  const rawLang = (i18n.language || localStorage.getItem('language') || 'en')
    .toLowerCase()
    .slice(0, 2);
  const currentLang = ['gu', 'hi'].includes(rawLang) ? rawLang : 'en';
  const prevLangRef = useRef(currentLang);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [failedMessage, setFailedMessage] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [dynamicChips, setDynamicChips] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const latestTranscriptRef = useRef('');


  // Dedicated helper to cancel active voice recognition cleanly
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Dedicated helper to cancel active TTS speech cleanly
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('Speech cancellation error:', err);
      }
    }
    setSpeakingMsgId(null);
    utteranceRef.current = null;
    window.__krishiActiveUtterance = null;
  };

  // Header Mute/Unmute toggle
  const toggleSound = () => {
    if (soundEnabled) {
      // User clicked to MUTE: stop speaking immediately and set soundEnabled to false
      stopSpeaking();
      setSoundEnabled(false);
    } else {
      // User clicked to UNMUTE: set soundEnabled to true and immediately play latest bot message
      setSoundEnabled(true);
      const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
      if (lastBotMsg && lastBotMsg.text) {
        speakText(lastBotMsg.text, lastBotMsg.id);
      }
    }
  };

  // Text-to-Speech (Audio playback with Krishi AI female voice)
  const speakText = (text, msgId) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported by your browser');
      return;
    }

    // Toggle stop if already speaking this message
    if (speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    // Stop any active speech first
    stopSpeaking();

    // Clean text for natural speech
    const cleanSpeech = text
      .replace(/\[Link:[^\]]+\]/g, '')
      .replace(/(\*\*|\*|#|_|`)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[-•]\s+/g, ', ')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .trim();

    if (!cleanSpeech) return;

    // Small delay ensures Chromium resets audio state cleanly after cancel()
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const langCode = currentLang;
        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const selectedVoice = findBestFemaleVoice(voices, langCode);

        let spokenText = cleanSpeech;
        let speechLang = 'en-US';

        if (langCode === 'gu') {
          const isNativeGujarati =
            selectedVoice &&
            ((selectedVoice.lang || '').toLowerCase().startsWith('gu') ||
              (selectedVoice.name || '').toLowerCase().includes('gujarat'));

          const isHindiVoice =
            selectedVoice &&
            ((selectedVoice.lang || '').toLowerCase().startsWith('hi') ||
              (selectedVoice.name || '').toLowerCase().includes('hindi') ||
              (selectedVoice.name || '').toLowerCase().includes('हिन्दी'));

          if (isNativeGujarati) {
            speechLang = 'gu-IN';
            spokenText = cleanSpeech;
          } else if (isHindiVoice) {
            // Highly natural fallback: Hindi voice reads Gujarati words phonetically in Devanagari
            speechLang = 'hi-IN';
            spokenText = gujaratiToDevanagari(cleanSpeech);
          } else {
            // Pure English voice fallback: reads phonetic Latin
            speechLang = 'en-US';
            spokenText = gujaratiToLatin(cleanSpeech);
          }
        } else if (langCode === 'hi') {
          speechLang = 'hi-IN';
          spokenText = cleanSpeech;
        } else {
          speechLang = selectedVoice?.lang || 'en-IN';
          spokenText = cleanSpeech;
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = speechLang;
        utterance.pitch = 1.18;
        utterance.rate = 0.98;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          setSpeakingMsgId(msgId);
        };

        utterance.onend = () => {
          setSpeakingMsgId(null);
          utteranceRef.current = null;
          window.__krishiActiveUtterance = null;
        };

        utterance.onerror = (e) => {
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('Speech synthesis error:', e);
            // Automatic graceful recovery: if gu-IN failed on the browser, retry with Hindi engine
            if (speechLang === 'gu-IN') {
              const hindiVoice = findBestFemaleVoice(voices, 'hi');
              if (hindiVoice) {
                const retryUtterance = new SpeechSynthesisUtterance(gujaratiToDevanagari(cleanSpeech));
                retryUtterance.lang = 'hi-IN';
                retryUtterance.voice = hindiVoice;
                retryUtterance.pitch = 1.18;
                retryUtterance.rate = 0.98;
                retryUtterance.onstart = () => setSpeakingMsgId(msgId);
                retryUtterance.onend = () => {
                  setSpeakingMsgId(null);
                  utteranceRef.current = null;
                  window.__krishiActiveUtterance = null;
                };
                utteranceRef.current = retryUtterance;
                window.__krishiActiveUtterance = retryUtterance;
                window.speechSynthesis.speak(retryUtterance);
                return;
              }
            }
          }
          setSpeakingMsgId(null);
          utteranceRef.current = null;
          window.__krishiActiveUtterance = null;
        };

        // Retain reference on window and ref to prevent Chromium garbage collection bug
        utteranceRef.current = utterance;
        window.__krishiActiveUtterance = utterance;

        setSpeakingMsgId(msgId);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('speakText error:', err);
        setSpeakingMsgId(null);
      }
    }, 60);
  };

  // Suggested questions with icons
  const quickSuggestions = {
    en: [
      { icon: '🌱', label: 'How do I diagnose my plant?', query: 'How do I diagnose plant diseases on UrbanFarm?' },
      { icon: '💧', label: 'When should I water my plants?', query: 'How does the Smart Watering schedule work?' },
      { icon: '🌾', label: 'What should I grow this season?', query: 'What are the best high-yield crops to grow this season?' },
      { icon: '🏡', label: 'How do I add a garden?', query: 'How can I add and manage my garden and plants in UrbanFarm?' },
    ],
    gu: [
      { icon: '🌱', label: 'છોડનું રોગ નિદાન કેવી રીતે કરવું?', query: 'મારા છોડમાં રોગ છે, નિદાન કેવી રીતે કરવું?' },
      { icon: '💧', label: 'પાણી ક્યારે અને કેટલું આપવું?', query: 'સ્માર્ટ વોટરિંગ શેડ્યૂલ કેવી રીતે કામ કરે છે?' },
      { icon: '🌾', label: 'આ ઋતુમાં કયા પાક ઉગાડવા?', query: 'આ ઋતુમાં બાલ્કની અને ટેરેસ માટે શ્રેષ્ઠ પાક કયા?' },
      { icon: '🏡', label: 'નવો બગીચો કેવી રીતે ઉમેરવો?', query: 'નવો બગીચો અને છોડ કેવી રીતે ઉમેરવા?' },
    ],
    hi: [
      { icon: '🌱', label: 'पौधे का रोग निदान कैसे करें?', query: 'पौधे का रोग निदान कैसे करें?' },
      { icon: '💧', label: 'पौधों को पानी कब और कितना दें?', query: 'स्मार्ट सिंचाई शेड्यूल कैसे काम करता है?' },
      { icon: '🌾', label: 'इस मौसम में क्या उगाएं?', query: 'इस मौसम में बालकनी और छत के लिए बेहतरीन फसलें कौन सी हैं?' },
      { icon: '🏡', label: 'नया बगीचा कैसे जोड़ें?', query: 'नया बगीचा और पौधे कैसे जोड़ें?' },
    ],
  };

  const getGreeting = (lang) => {
    switch (lang) {
      case 'gu':
        return 'નમસ્તે! હું કૃષિ AI છું, તમારી અર્બનફાર્મ ખેતી સહાયક. 🌿\nહું તમને છોડના રોગ નિદાન, સ્માર્ટ સિંચાઈ, બગીચા સંચાલન અને પાક ભલામણમાં પગલાંવાર મદદ કરી શકું છું. આજે હું તમને કઈ રીતે મદદ કરી શકું?';
      case 'hi':
        return 'नमस्ते! मैं कृषि AI हूँ, आपकी अर्बनफार्म कृषि सहायक। 🌿\nमैं पौधों के रोग निदान, स्मार्ट सिंचाई, बगीचे के प्रबंधन और फसल सुझावों में आपकी सहायता कर सकती हूँ। आज मैं आपकी क्या सहायता कर सकती हूँ?';
      default:
        return 'Hello! I am Krishi AI, your Intelligent AI Farming Guide for UrbanFarm. 🌿\nI can guide you step-by-step on plant diagnosis, smart watering, garden spaces, crop tips, and platform features. How can I help you today?';
    }
  };

  const createInitialGreeting = (lang) => ({
    id: `msg-init-${lang}`,
    sender: 'bot',
    text: getGreeting(lang),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickActions: [
      {
        label: lang === 'gu' ? 'રોગ નિદાન' : lang === 'hi' ? 'रोग निदान' : 'AI Plant Diagnosis',
        path: '/app/diagnosis',
      },
      {
        label: lang === 'gu' ? 'સ્માર્ટ વોટરિંગ' : lang === 'hi' ? 'स्मार्ट सिंचाई' : 'Smart Watering',
        path: '/app/watering',
      },
      {
        label: lang === 'gu' ? 'મારા બગીચાઓ' : lang === 'hi' ? 'मेरे बगीचे' : 'My Gardens',
        path: '/app/gardens',
      },
    ],
    followUpSuggestions: [
      lang === 'gu' ? 'છોડનું રોગ નિદાન કેવી રીતે કરવું?' : lang === 'hi' ? 'पौधे का रोग निदान कैसे करें?' : 'How do I diagnose plant diseases?',
      lang === 'gu' ? 'સ્માર્ટ સિંચાઈ કેવી રીતે કામ કરે છે?' : lang === 'hi' ? 'स्मार्ट सिंचाई कैसे काम करती है?' : 'How does smart watering work?'
    ]
  });

  // Populate Web Speech API voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          setAvailableVoices(v);
        }
      } catch (err) {
        console.warn('Voice retrieval error:', err);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Retry timers catch async voice load in Chromium
    const t1 = setTimeout(loadVoices, 300);
    const t2 = setTimeout(loadVoices, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Handle language change or initial history load
  useEffect(() => {
    const isLangChanged = prevLangRef.current !== currentLang;
    prevLangRef.current = currentLang;

    if (isLangChanged) {
      stopSpeaking();
      stopListening();
      setSpeechError(null);
      setFailedMessage(null);

      setMessages((prev) => {
        // If there are no messages or only the initial greeting, replace with fresh greeting in new language
        const isOnlyGreeting =
          !prev ||
          prev.length === 0 ||
          (prev.length === 1 && prev[0].id?.startsWith('msg-init'));

        if (isOnlyGreeting) {
          const freshGreeting = [createInitialGreeting(currentLang)];
          sessionStorage.setItem('urbanfarm_chatbot_history', JSON.stringify(freshGreeting));
          return freshGreeting;
        }

        // If there is active conversation history, append a clear, friendly language-change notice
        const switchNotice = {
          id: `lang-switch-${Date.now()}`,
          sender: 'bot',
          isSystemNotice: true,
          text:
            currentLang === 'gu'
              ? '🌿 **ભાષા બદલાઈ ગઈ:** હવે તમારા બધા પ્રશ્નોના જવાબો **ગુજરાતી (Gujarati)** માં મળશે. તમે કોઈપણ પ્રશ્ન પૂછી શકો છો!'
              : currentLang === 'hi'
              ? '🌿 **भाषा बदल दी गई है:** अब आपके सभी प्रश्नों के उत्तर **हिन्दी (Hindi)** में मिलेंगे। आप बेझिझक अपना सवाल पूछ सकते हैं!'
              : '🌿 **Language switched:** Responses will now be provided in **English**. Feel free to ask your gardening questions!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updated = [...prev, switchNotice];
        sessionStorage.setItem('urbanfarm_chatbot_history', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    // Initial mount: load saved history if available, else initialize greeting
    const saved = sessionStorage.getItem('urbanfarm_chatbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.length === 1 && parsed[0].id?.startsWith('msg-init')) {
            if (!parsed[0].id.endsWith(`-${currentLang}`)) {
              setMessages([createInitialGreeting(currentLang)]);
              return;
            }
          }
          setMessages(parsed);
          return;
        }
      } catch (e) {
        // Fallback to fresh greeting
      }
    }

    setMessages([createInitialGreeting(currentLang)]);
  }, [currentLang]);

  // Persist messages to session
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('urbanfarm_chatbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Cleanly stop speech and mic when chat window is closed or component unmounts
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Speech Recognition (Speech-to-Text) with real-time transcription & auto-send
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      // User clicked to stop listening manually
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      const textToSend = latestTranscriptRef.current?.trim();
      if (textToSend) {
        latestTranscriptRef.current = '';
        handleSendMessage(textToSend);
      }
      return;
    }

    // Stop TTS if Krishi AI is currently speaking so it does not talk over the user
    stopSpeaking();
    setSpeechError(null);
    setInputMessage('');
    latestTranscriptRef.current = '';

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const langCode = currentLang;
      recognition.lang = langCode === 'gu' ? 'gu-IN' : langCode === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const chunk = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }

        const text = (finalTranscript || interimTranscript).trim();
        if (text) {
          setInputMessage(text);
          latestTranscriptRef.current = text;
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        const lang = currentLang;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError(
            lang === 'gu'
              ? 'માઇક્રોફોન પરવાનગી બ્લોક છે. કૃપા કરીને બ્રાઉઝરમાં માઇકને મંજૂરી આપો.'
              : lang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अवरुद्ध है। कृपया ब्राउज़र में माइक की अनुमति दें।'
              : 'Microphone access blocked. Please allow mic in browser address bar.'
          );
        } else if (event.error === 'network') {
          setSpeechError(
            lang === 'gu'
              ? 'વોઇસ નેટવર્ક કનેક્શન સમસ્યા. કૃપા કરીને ફરી પ્રયાસ કરો.'
              : lang === 'hi'
              ? 'वॉइस नेटवर्क कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।'
              : 'Speech network error. Please check your internet connection.'
          );
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const textToSend = latestTranscriptRef.current?.trim();
        if (textToSend) {
          latestTranscriptRef.current = '';
          handleSendMessage(textToSend);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not start microphone. Please check permissions.');
    }
  };

  const handleCopyText = (text, msgId) => {
    if (!navigator.clipboard) return;
    const clean = text
      .replace(/\[Link:[^\]]+\]/g, '')
      .replace(/(\*\*|\*|#|_|`)/g, '')
      .trim();

    navigator.clipboard.writeText(clean);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = async (msgId, rating, question = '', reply = '') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: rating } : m))
    );

    try {
      await api.post('/chat/feedback', {
        messageId: msgId,
        rating,
        question,
        reply,
      });
    } catch (err) {
      console.warn('Feedback submission failed:', err);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || loading) return;

    if (isListening) {
      stopListening();
    }
    latestTranscriptRef.current = '';
    setSpeechError(null);

    setFailedMessage(null);

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        message: textToSend,
        language: currentLang,
        history: messages.slice(-10).map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      });

      const botReply = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.data?.reply || 'I am ready to help you with anything on UrbanFarm.',
        intent: response.data?.intent || 'general',
        quickActions: response.data?.quickActions || [],
        followUpSuggestions: response.data?.followUpSuggestions || [],
        safetyNotice: response.data?.safetyNotice || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: null,
      };

      setMessages((prev) => [...prev, botReply]);

      // Update bottom chips bar with dynamic follow-up suggestions from this response
      if (botReply.followUpSuggestions && botReply.followUpSuggestions.length > 0) {
        setDynamicChips(
          botReply.followUpSuggestions.map((sug) => ({ label: sug, query: sug }))
        );
      }

      if (soundEnabled) {
        speakText(botReply.text, botReply.id);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setFailedMessage(textToSend);

      const fallbackReply = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text:
          currentLang === 'gu'
            ? 'ક્ષમા કરશો, સર્વર સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.'
            : currentLang === 'hi'
            ? 'क्षमा करें, सर्वर से संपर्क नहीं हो सका। कृपया कुछ समय बाद पुनः प्रयास करें।'
            : 'Sorry, I am having trouble connecting right now. Please try again shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    sessionStorage.removeItem('urbanfarm_chatbot_history');
    setFailedMessage(null);
    setDynamicChips(null);
    setMessages([createInitialGreeting(currentLang)]);
  };

  // Use dynamic follow-up chips after a bot response, else fall back to static defaults
  const currentChips = dynamicChips || (quickSuggestions[currentLang] || quickSuggestions.en);

  const renderMessageContent = (text) => {
    const parts = text.split('\n');
    return parts.map((line, idx) => {
      const formattedLine = line.split(/(\*\*[^*]+\*\*)/g).map((chunk, cIdx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={cIdx}>{chunk.slice(2, -2)}</strong>;
        }
        return chunk;
      });

      return (
        <React.Fragment key={idx}>
          {formattedLine}
          {idx < parts.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      <div className="urban-bot-launcher-wrapper">
        {!isOpen && (
          <button
            className="urban-bot-launcher-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open Krishi AI Chatbot"
            title={t('chatbot.openTitle', 'Chat with Krishi AI')}
          >
            <div className="bot-launcher-inner">
              <MdSupportAgent className="bot-launcher-icon" />
              <span className="bot-launcher-leaf-badge" title="Krishi AI">
                <FaSeedling />
              </span>
            </div>
            <span className="bot-online-badge"></span>
          </button>
        )}
      </div>

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div className="urban-bot-window" role="dialog" aria-label="Krishi AI Chatbot">
          {/* Header */}
          <div className="urban-bot-header">
            <div className="bot-header-info">
              <div className="bot-avatar-circle">
                <MdSupportAgent className="bot-header-avatar-icon" />
                <span className="bot-header-leaf-badge">
                  <FaSeedling />
                </span>
              </div>
              <div className="bot-header-text-group">
                <h4 className="bot-header-title">
                  {currentLang === 'gu'
                    ? 'કૃષિ AI'
                    : currentLang === 'hi'
                    ? 'कृषि AI'
                    : t('chatbot.title', 'Krishi AI')}
                </h4>
                <div className="bot-status-indicator">
                  <span className="bot-status-dot"></span>
                  <span className="bot-status-text">
                    {currentLang === 'gu'
                      ? 'તમારી સ્માર્ટ કૃષિ સહાયક'
                      : currentLang === 'hi'
                      ? 'आपकी स्मार्ट कृषि सहायक'
                      : t('chatbot.subtitle', 'Your Intelligent AI Farming Guide')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bot-header-controls">
              <button
                type="button"
                className={`bot-icon-btn ${soundEnabled ? 'active-sound' : 'muted-sound'}`}
                onClick={toggleSound}
                title={soundEnabled ? 'Voice is ON (Click to Mute)' : 'Voice is MUTED (Click to Unmute)'}
                aria-label={soundEnabled ? 'Mute voice responses' : 'Unmute voice responses'}
              >
                {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>

              <button
                type="button"
                className="bot-icon-btn"
                onClick={handleClearHistory}
                title={t('chatbot.clearChat', 'Clear chat history')}
                aria-label="Clear chat"
              >
                <FaTrash />
              </button>

              <button
                type="button"
                className="bot-icon-btn close-btn"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                aria-label="Close Chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="urban-bot-messages">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`urban-bot-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="msg-bot-avatar">
                    <MdSupportAgent className="msg-agent-icon" />
                  </div>
                )}

                <div className={`urban-bot-bubble ${msg.sender} ${msg.isError ? 'bubble-error' : ''} ${msg.isSystemNotice ? 'bubble-system-notice' : ''}`}>
                  <div className="msg-content">{renderMessageContent(msg.text)}</div>

                  {/* Safety Warning Banner */}
                  {msg.safetyNotice && (
                    <div className="msg-safety-banner">
                      <span className="safety-badge-icon">⚠️</span>
                      <span className="safety-badge-text">{msg.safetyNotice}</span>
                    </div>
                  )}

                  {/* Action Link Chips */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="msg-action-chips">
                      {msg.quickActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          className="msg-action-btn"
                          onClick={() => {
                            if (act.path) {
                              navigate(act.path);
                              setIsOpen(false);
                            }
                          }}
                        >
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Footer with Timestamp and Action Controls */}
                  <div className="msg-footer">
                    <span className="msg-timestamp">{msg.time}</span>

                    {msg.sender === 'bot' && !msg.isSystemNotice && (
                      <div className="msg-footer-actions">
                        {/* Copy Response Button */}
                        <button
                          type="button"
                          className={`msg-action-icon-btn ${copiedMsgId === msg.id ? 'copied' : ''}`}
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          title={copiedMsgId === msg.id ? 'Copied to clipboard' : 'Copy response'}
                          aria-label="Copy response"
                        >
                          {copiedMsgId === msg.id ? <FaCheck /> : <FaCopy />}
                        </button>

                        {/* Thumbs Up Button */}
                        <button
                          type="button"
                          className={`msg-action-icon-btn ${msg.feedback === 'like' ? 'active-like' : ''}`}
                          onClick={() => {
                            const prevUserMsg = index > 0 && messages[index - 1]?.sender === 'user' ? messages[index - 1].text : '';
                            handleFeedback(msg.id, 'like', prevUserMsg, msg.text);
                          }}
                          title="Helpful response"
                          aria-label="Thumbs up"
                        >
                          <FaThumbsUp />
                        </button>

                        {/* Thumbs Down Button */}
                        <button
                          type="button"
                          className={`msg-action-icon-btn ${msg.feedback === 'dislike' ? 'active-dislike' : ''}`}
                          onClick={() => {
                            const prevUserMsg = index > 0 && messages[index - 1]?.sender === 'user' ? messages[index - 1].text : '';
                            handleFeedback(msg.id, 'dislike', prevUserMsg, msg.text);
                          }}
                          title="Report or unhelpful"
                          aria-label="Thumbs down"
                        >
                          <FaThumbsDown />
                        </button>

                        {/* Audio playback button */}
                        <button
                          type="button"
                          className={`msg-action-icon-btn ${speakingMsgId === msg.id ? 'speaking' : ''}`}
                          onClick={() => {
                            if (speakingMsgId === msg.id) {
                              stopSpeaking();
                            } else {
                              speakText(msg.text, msg.id);
                            }
                          }}
                          title={speakingMsgId === msg.id ? 'Stop voice' : 'Listen in Krishi AI female voice'}
                          aria-label={speakingMsgId === msg.id ? 'Stop voice' : 'Listen aloud'}
                        >
                          {speakingMsgId === msg.id ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Error Retry Banner */}
            {failedMessage && (
              <div className="urban-bot-retry-banner">
                <span>Failed to send question.</span>
                <button
                  type="button"
                  className="retry-send-btn"
                  onClick={() => handleSendMessage(failedMessage)}
                  disabled={loading}
                >
                  <FaRedo /> Retry
                </button>
              </div>
            )}

            {loading && (
              <div className="urban-bot-message-row bot-row">
                <div className="msg-bot-avatar">
                  <MdSupportAgent className="msg-agent-icon" />
                </div>
                <div className="urban-bot-bubble bot typing-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions Bar */}
          <div className="urban-bot-chips-bar">
            {currentChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="urban-bot-chip"
                onClick={() => handleSendMessage(chip.query)}
                disabled={loading}
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="urban-bot-speech-error">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                title="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            className="urban-bot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <button
              type="button"
              className={`bot-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'Listening... click to stop' : 'Voice input (Speak to ask)'}
            >
              {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              {isListening && <span className="mic-wave"></span>}
            </button>

            <input
              ref={inputRef}
              type="text"
              className="urban-bot-input"
              placeholder={
                isListening
                  ? currentLang === 'gu'
                    ? 'કૃષિ AI સાંભળી રહી છે... હવે બોલો'
                    : currentLang === 'hi'
                    ? 'कृषि AI सुन रही है... अब बोलिए'
                    : t('chatbot.listeningPlaceholder', 'Krishi AI is listening... speak now')
                  : currentLang === 'gu'
                  ? 'છોડના રોગ, સિંચાઈ, ખાતર વિશે પૂછો...'
                  : currentLang === 'hi'
                  ? 'रोग निदान, सिंचाई या बगीचे के बारे में पूछें...'
                  : t('chatbot.placeholder', 'Ask Krishi AI about diagnosis, watering, gardens...')
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="bot-send-btn"
              disabled={!inputMessage.trim() || loading}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>

          {/* Disclaimer Footer */}
          <div className="urban-bot-disclaimer">
            {currentLang === 'gu'
              ? 'કૃષિ AI સ્માર્ટ ખેતી માર્ગદર્શન પૂરું પાડે છે. સ્થાનિક આબોહવા પરિબળો ચકાસો.'
              : currentLang === 'hi'
              ? 'कृषि AI स्मार्ट कृषि मार्गदर्शन प्रदान करता है। स्थानीय मौसम कारकों की पुष्टि करें।'
              : t(
                  'chatbot.disclaimer',
                  'Krishi AI provides smart agricultural guidance. Verify regional climatic factors.'
                )}
          </div>
        </div>
      )}
    </>
  );
};

export default UrbanBot;
