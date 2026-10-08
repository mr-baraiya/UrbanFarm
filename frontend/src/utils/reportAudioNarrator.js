/**
 * UrbanFarm Report Audio Narrator (Text-to-Speech)
 * ---------------------------------------------------------------------------
 * Reads the 9-section botanical plant diagnosis report aloud using the exact
 * same voice synthesis engine and phonetic logic as the UrbanBot chatbot.
 *
 * Features:
 * - Authentic Krishi AI female voice selection (Microsoft Neerja, Heera, Priya,
 *   Google हिन्दी, Swara, Kalpana, etc.)
 * - Phonetic Gujarati-to-Devanagari transliteration for fluent Gujarati speech
 *   even when no native Gujarati TTS engine is installed on the user's OS.
 * - Sentence chunking to prevent Web Speech API timeouts on Chrome & mobile.
 * - Pitch (1.18) & Rate (0.98) tuned for clear, warm, natural guidance.
 */

// Female voice indicators across Windows, macOS, iOS, Android, and Chromium
export const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl',
  'zira', 'jenny', 'aria', 'sonia', 'neerja', 'libby', 'mia', 'natasha', 'clara', 'emily',
  'swara', 'kalpana', 'heera', 'dhwani', 'kavya', 'shruti',
  'aditi', 'lekha', 'priya', 'ananya', 'geeta', 'veena',
  'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'sangeeta'
];

export const MALE_VOICE_KEYWORDS = [
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
 * Robust female voice matcher for English, Hindi, and Gujarati (same as UrbanBot)
 */
export const findBestFemaleVoice = (voicesList, langCode) => {
  if (!voicesList || voicesList.length === 0) return null;

  const code = (langCode || 'en').toLowerCase().trim();
  const langPrefix = code.slice(0, 2);

  // 1. For English: user requested the SAME authentic Indian female voice artist as Hindi/Gujarati
  if (langPrefix === 'en') {
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

  // 2. Direct match for requested languages (gu / hi)
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

  // Fallback for Gujarati if no native Gujarati voice exists -> Hindi voice
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

  // General female voice fallback
  const fallbackFemale = voicesList.find((v) => {
    const name = `${v.name || ''} ${v.voiceURI || ''}`.toLowerCase();
    const isFemale = FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    const isMale = MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
    return isFemale && !isMale;
  });

  return fallbackFemale || voicesList[0] || null;
};

/**
 * Clean text for natural speech (removes markdown, links, emojis, brackets)
 */
function cleanForSpeech(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\[Link:[^\]]+\]/g, '')
    .replace(/(\*\*|\*|#|_|`)/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[—–]/g, ', ')
    .replace(/[-•]\s+/g, ', ')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into fine-grained sentence chunks
 */
function splitIntoSentences(text) {
  if (!text) return [];
  const raw = text.split(/(?<=[.!?।॥\n])\s+/);
  const chunks = [];

  for (const part of raw) {
    const cleaned = cleanForSpeech(part);
    if (!cleaned) continue;
    if (cleaned.length > 160) {
      const sub = cleaned.split(/(?<=[,;])\s+/);
      chunks.push(...sub.map(cleanForSpeech).filter(Boolean));
    } else {
      chunks.push(cleaned);
    }
  }
  return chunks;
}

/**
 * Build 9-section report speech script
 */
export function buildReportAudioScript(data, lang = 'en') {
  if (!data) return [];
  const currentLang = (lang || 'en').toLowerCase().split('-')[0];
  const parts = [];

  const plantName = cleanForSpeech(data.plantName || data.plant_name || '');
  const diseaseName = cleanForSpeech(data.diseaseName || data.condition_name || data.disease || '');
  const shortExplanation = cleanForSpeech(data.shortExplanation || data.description || '');
  const isHealthy = Boolean(
    data.isHealthy ||
    (data.diseaseName || '').toLowerCase().includes('healthy') ||
    (data.severityLevel || '').toLowerCase() === 'healthy'
  );

  // Dynamic Accuracy / Confidence
  const rawConfidence = data.confidencePercent ?? data.confidencePercentage ?? data.confidenceScore ?? data.confidence ?? data.accuracy;
  const confPercent = typeof rawConfidence === 'number'
    ? (rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence))
    : 85;

  // Dynamic Damage / Risk Index
  const rawDamage = data.severityPercentage ?? data.damageIndex ?? data.severity_percentage;
  const damagePercent = typeof rawDamage === 'number'
    ? Math.round(rawDamage)
    : (isHealthy ? 0 : 40);

  // Dynamic Severity Label
  const severityText = cleanForSpeech(data.severityDisplayLabel || data.severityLevel || data.severity_level || (isHealthy ? 'Healthy' : 'Moderate'));
  const severityDesc = cleanForSpeech(data.severityDescription || data.severity_description || '');

  const observedSymptoms = (data.observedSymptoms || data.symptoms || []).map(cleanForSpeech).filter(Boolean);
  const possibleCauses = (data.possibleCauses || data.causes || []).map(cleanForSpeech).filter(Boolean);
  const immediateActions = (data.immediateActions || data.treatmentSteps || []).map(cleanForSpeech).filter(Boolean);
  const modernSolutions = (data.modernSolutions || data.medicalSolutions || []).map(cleanForSpeech).filter(Boolean);
  const naturalSolutions = (data.naturalSolutions || data.desiSolutions || []).map(cleanForSpeech).filter(Boolean);
  const preventionTips = (data.preventionTips || data.prevention_tips || []).map(cleanForSpeech).filter(Boolean);
  const whenToContactExpert = cleanForSpeech(data.whenToContactExpert || data.whenToSeekExpertHelp || '');

  if (currentLang === 'gu') {
    parts.push(`છોડ રોગ નિદાન અહેવાલ.`);
    if (plantName) parts.push(`છોડનું નામ: ${plantName}.`);
    if (diseaseName) parts.push(`નિદાન: ${diseaseName}.`);
    parts.push(`ચોકસાઈ: ${confPercent} ટકા.`);
    if (isHealthy) {
      parts.push(`છોડની જીવનશક્તિ: ૧૦૦ ટકા.`);
      parts.push(`આરોગ્ય સ્થિતિ: તંદુરસ્ત.`);
    } else {
      parts.push(`નુકસાન અને જોખમ ઇન્ડેક્સ: ${damagePercent} ટકા.`);
      if (severityText) parts.push(`તીવ્રતા: ${severityText}.`);
      parts.push(`આરોગ્ય સ્થિતિ: સમસ્યા જણાઈ.`);
    }
    if (shortExplanation) parts.push(`વિગત: ${shortExplanation}`);

    if (observedSymptoms.length > 0) {
      parts.push(`જોવાયેલા લક્ષણો: ${observedSymptoms.join(', ')}.`);
    }
    if (possibleCauses.length > 0) {
      parts.push(`સંભવિત કારણો: ${possibleCauses.join(', ')}.`);
    }
    if (severityDesc) {
      parts.push(`ગંભીરતા વિશ્લેષણ: ${severityDesc}`);
    }
    if (immediateActions.length > 0) {
      parts.push(`ત્વરિત સારવાર પગલાં: ${immediateActions.join(', ')}.`);
    }
    if (modernSolutions.length > 0) {
      parts.push(`આધુનિક કૃષિ ઉપાયો: ${modernSolutions.join(', ')}.`);
    }
    if (naturalSolutions.length > 0) {
      parts.push(`કુદરતી દેશી ઉપાયો: ${naturalSolutions.join(', ')}.`);
    }
    if (preventionTips.length > 0) {
      parts.push(`લાંબા ગાળાની નિવારણ ટિપ્સ: ${preventionTips.join(', ')}.`);
    }
    if (whenToContactExpert) {
      parts.push(`કૃષિ નિષ્ણાતની સલાહ ક્યારે લેવી: ${whenToContactExpert}`);
    }
  } else if (currentLang === 'hi') {
    parts.push(`पौधा रोग निदान रिपोर्ट.`);
    if (plantName) parts.push(`पौधे का नाम: ${plantName}.`);
    if (diseaseName) parts.push(`निदान: ${diseaseName}.`);
    parts.push(`सटीकता: ${confPercent} प्रतिशत.`);
    if (isHealthy) {
      parts.push(`पौधे की जीवन शक्ति: 100 प्रतिशत.`);
      parts.push(`स्वास्थ्य स्थिति: स्वस्थ.`);
    } else {
      parts.push(`क्षति और जोखिम सूचकांक: ${damagePercent} प्रतिशत.`);
      if (severityText) parts.push(`गंभीरता: ${severityText}.`);
      parts.push(`स्वास्थ्य स्थिति: समस्या पाई गई.`);
    }
    if (shortExplanation) parts.push(`विवरण: ${shortExplanation}`);

    if (observedSymptoms.length > 0) {
      parts.push(`देखे गए लक्षण: ${observedSymptoms.join(', ')}.`);
    }
    if (possibleCauses.length > 0) {
      parts.push(`संभावित कारण: ${possibleCauses.join(', ')}.`);
    }
    if (severityDesc) {
      parts.push(`गंभीरता विश्लेषण: ${severityDesc}`);
    }
    if (immediateActions.length > 0) {
      parts.push(`तत्काल प्राथमिक उपचार: ${immediateActions.join(', ')}.`);
    }
    if (modernSolutions.length > 0) {
      parts.push(`आधुनिक कृषि उपाय: ${modernSolutions.join(', ')}.`);
    }
    if (naturalSolutions.length > 0) {
      parts.push(`पारंपरिक देसी उपचार: ${naturalSolutions.join(', ')}.`);
    }
    if (preventionTips.length > 0) {
      parts.push(`बचाव के तरीके: ${preventionTips.join(', ')}.`);
    }
    if (whenToContactExpert) {
      parts.push(`कृषि विशेषज्ञ से कब संपर्क करें: ${whenToContactExpert}`);
    }
  } else {
    parts.push(`Plant Health Diagnosis Report.`);
    if (plantName) parts.push(`Plant Name: ${plantName}.`);
    if (diseaseName) parts.push(`Diagnosed Condition: ${diseaseName}.`);
    parts.push(`Accuracy: ${confPercent} percent.`);
    if (isHealthy) {
      parts.push(`Plant Vitality: 100 percent.`);
      parts.push(`Assessment Status: Healthy.`);
    } else {
      parts.push(`Damage and Risk Index: ${damagePercent} percent.`);
      if (severityText) parts.push(`Severity: ${severityText}.`);
      parts.push(`Assessment Status: Issue Detected.`);
    }
    if (shortExplanation) parts.push(`Overview: ${shortExplanation}`);

    if (observedSymptoms.length > 0) {
      parts.push(`Observed Symptoms: ${observedSymptoms.join(', ')}.`);
    }
    if (possibleCauses.length > 0) {
      parts.push(`Possible Causes: ${possibleCauses.join(', ')}.`);
    }
    if (severityDesc) {
      parts.push(`Severity Analysis: ${severityDesc}`);
    }
    if (immediateActions.length > 0) {
      parts.push(`Immediate Actions and First Aid: ${immediateActions.join(', ')}.`);
    }
    if (modernSolutions.length > 0) {
      parts.push(`Modern Treatments: ${modernSolutions.join(', ')}.`);
    }
    if (naturalSolutions.length > 0) {
      parts.push(`Natural Organic Remedies: ${naturalSolutions.join(', ')}.`);
    }
    if (preventionTips.length > 0) {
      parts.push(`Long term Prevention Tips: ${preventionTips.join(', ')}.`);
    }
    if (whenToContactExpert) {
      parts.push(`When to Seek Expert Advice: ${whenToContactExpert}`);
    }
  }

  const sentenceChunks = [];
  for (const p of parts) {
    sentenceChunks.push(...splitIntoSentences(p));
  }
  return sentenceChunks;
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let activeSpeechSession = null;

export function stopReportNarration() {
  if (activeSpeechSession) {
    activeSpeechSession.cancelled = true;
    activeSpeechSession = null;
  }
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore cancel errors */
    }
  }
}

/**
 * Play speech synthesis for the diagnosis report using UrbanBot's exact voice & phonetic engine
 */
export function playReportNarration(data, lang = 'en', { onStart, onEnd, onError, onSentence } = {}) {
  if (!isSpeechSupported()) {
    if (onError) onError(new Error('Speech synthesis not supported in this browser.'));
    return;
  }

  stopReportNarration();

  // Resume synthesis if browser had paused it
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  const currentLang = (lang || 'en').toLowerCase().split('-')[0];
  const sentences = buildReportAudioScript(data, currentLang);

  if (!sentences || sentences.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  const session = {
    cancelled: false,
    currentIndex: 0,
    total: sentences.length,
  };
  activeSpeechSession = session;

  if (onStart) onStart();

  const startPlaybackWithVoices = (voices) => {
    const selectedVoice = findBestFemaleVoice(voices, currentLang);

    const speakNext = () => {
      if (session.cancelled) return;
      if (session.currentIndex >= sentences.length) {
        stopReportNarration();
        if (onEnd) onEnd();
        return;
      }

      const originalSentence = sentences[session.currentIndex];
      if (onSentence) onSentence(originalSentence, session.currentIndex, sentences.length);

      let spokenText = originalSentence;
      let speechLang = 'en-US';

      if (currentLang === 'gu') {
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
          spokenText = originalSentence;
        } else if (isHindiVoice) {
          // Fluent phonetic Gujarati through Devanagari (same as UrbanBot)
          speechLang = 'hi-IN';
          spokenText = gujaratiToDevanagari(originalSentence);
        } else {
          speechLang = 'en-US';
          spokenText = gujaratiToLatin(originalSentence);
        }
      } else if (currentLang === 'hi') {
        speechLang = 'hi-IN';
        spokenText = originalSentence;
      } else {
        speechLang = selectedVoice?.lang || 'en-IN';
        spokenText = originalSentence;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = speechLang;
      utterance.pitch = 1.18; // Warm, friendly Krishi AI female voice pitch
      utterance.rate = 0.98;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (session.cancelled) return;
        session.currentIndex += 1;
        speakNext();
      };

      utterance.onerror = (e) => {
        if (session.cancelled) return;
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.warn('Speech synthesis utterance error:', e);

        // Auto recovery for Gujarati if gu-IN failed
        if (speechLang === 'gu-IN') {
          const hindiVoice = findBestFemaleVoice(voices, 'hi');
          if (hindiVoice) {
            const retryUtterance = new SpeechSynthesisUtterance(gujaratiToDevanagari(originalSentence));
            retryUtterance.lang = 'hi-IN';
            retryUtterance.voice = hindiVoice;
            retryUtterance.pitch = 1.18;
            retryUtterance.rate = 0.98;
            retryUtterance.onend = () => {
              if (session.cancelled) return;
              session.currentIndex += 1;
              speakNext();
            };
            window.speechSynthesis.speak(retryUtterance);
            return;
          }
        }

        session.currentIndex += 1;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const initialVoices = window.speechSynthesis.getVoices() || [];
  if (initialVoices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      if (!session.cancelled && session.currentIndex === 0) {
        const loadedVoices = window.speechSynthesis.getVoices() || [];
        startPlaybackWithVoices(loadedVoices);
      }
    };
    setTimeout(() => {
      if (!session.cancelled && session.currentIndex === 0) {
        const loadedVoices = window.speechSynthesis.getVoices() || [];
        startPlaybackWithVoices(loadedVoices);
      }
    }, 150);
  } else {
    startPlaybackWithVoices(initialVoices);
  }
}
