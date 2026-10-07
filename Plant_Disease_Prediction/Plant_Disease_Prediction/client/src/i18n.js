export const LANGUAGES = [
  { code: 'en', label: 'English', apiName: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)', apiName: 'Hindi (हिन्दी)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)', apiName: 'Gujarati (ગુજરાતી)' }
];

export const translations = {
  en: {
    appTitle: 'Plant Doctor',
    appSubtitle: 'Instant plant disease diagnosis & treatment guide powered by AI',
    uploadTitle: 'Upload Plant Photo',
    uploadInstructions: 'Click to browse or drag and drop a photo',
    uploadCamera: 'Take photo or choose from gallery',
    uploadLimit: 'JPG, PNG or WEBP (Max 5 MB)',
    selectedImage: 'Selected Image',
    changeImage: 'Change photo',
    selectLanguage: 'Language',
    analyzeBtn: 'Analyze Plant',
    analyzingBtn: 'Analyzing Plant...',
    loadingMessage: 'Examining leaf patterns, checking for diseases, and preparing recommendations...',
    analyzeAnother: 'Analyze another image',
    footerDisclaimer: 'AI suggestions are for guidance. Confirm with a local agriculture expert before spraying chemicals.',
    
    // Non-plant error
    notPlantError: "This doesn't look like a plant image. Please upload a photo of a plant, leaf, flower or fruit.",
    
    // Client-side validations
    errNoImage: 'Please upload or capture a plant image first.',
    errFileType: 'Unsupported file type. Please upload a JPG, PNG, or WEBP image.',
    errFileSize: 'Image exceeds 5 MB limit. Please choose a smaller image.',
    errCorruptImage: 'Could not load image. The file may be corrupted or unreadable.',
    
    // Result Headings & Badges
    resultTitle: 'Diagnostic Report',
    plantName: 'Plant Name',
    scientificName: 'Scientific Name',
    condition: 'Diagnosis / Condition',
    confidence: 'Confidence',
    healthyStatus: 'Healthy Plant',
    issueStatus: 'Condition Detected',
    confHigh: 'High Confidence',
    confMedium: 'Moderate Confidence',
    confLow: 'Low Confidence (Uncertain)',
    description: 'Description & Diagnosis Overview',
    symptoms: 'Observed Symptoms',
    causes: 'Underlying Causes',
    treatmentSteps: 'Step-by-Step Treatment Plan',
    medicalSolutions: 'Chemical / Medical Solutions (Active Ingredients)',
    desiSolutions: 'Desi / Home Remedies (Traditional Indian Recipes)',
    recoveryTips: 'Recovery Tips',
    preventionTips: 'Prevention Tips',
    expertHelp: 'When to Seek Expert Help',
    noteIfUnsure: 'Important Note / Retake Advice',
    noneMentioned: 'None specified'
  },
  hi: {
    appTitle: 'प्लांट डॉक्टर (Plant Doctor)',
    appSubtitle: 'एआई द्वारा संचालित त्वरित पौधा रोग पहचान और उपचार मार्गदर्शिका',
    uploadTitle: 'पौधे की फोटो अपलोड करें',
    uploadInstructions: 'फोटो चुनने के लिए क्लिक करें या यहाँ खींचें',
    uploadCamera: 'कैमरे से फोटो लें या गैलरी से चुनें',
    uploadLimit: 'JPG, PNG या WEBP (अधिकतम 5 MB)',
    selectedImage: 'चुनी गई फोटो',
    changeImage: 'फोटो बदलें',
    selectLanguage: 'भाषा चुनें',
    analyzeBtn: 'पौधे की जांच करें',
    analyzingBtn: 'जांच जारी है...',
    loadingMessage: 'पत्तियों के लक्षणों की जांच हो रही है, देसी और रासायनिक उपचार तैयार किए जा रहे हैं...',
    analyzeAnother: 'अन्य पौधे की जांच करें',
    footerDisclaimer: 'एआई सुझाव केवल मार्गदर्शन के लिए हैं। रसायनों के छिड़काव से पहले स्थानीय कृषि विशेषज्ञ से पुष्टि अवश्य करें।',
    
    // Non-plant error
    notPlantError: 'यह किसी पौधे की तस्वीर नहीं लग रही है। कृपया किसी पौधे, पत्ती, फूल या फल की तस्वीर अपलोड करें।',
    
    // Client-side validations
    errNoImage: 'कृपया पहले किसी पौधे की फोटो अपलोड करें।',
    errFileType: 'अमान्य फ़ाइल प्रकार। कृपया JPG, PNG या WEBP फ़ाइल अपलोड करें।',
    errFileSize: 'फ़ाइल 5 MB से बड़ी है। कृपया छोटी फ़ाइल चुनें।',
    errCorruptImage: 'फोटो लोड नहीं हो सकी। कृपया दूसरी फोटो का उपयोग करें।',
    
    // Result Headings & Badges
    resultTitle: 'निदान रिपोर्ट',
    plantName: 'पौधे का नाम',
    scientificName: 'वैज्ञानिक नाम',
    condition: 'रोग / समस्या',
    confidence: 'सटीकता स्तर',
    healthyStatus: 'पौधा स्वस्थ है',
    issueStatus: 'रोग/समस्या पाई गई',
    confHigh: 'उच्च सटीकता (High)',
    confMedium: 'मध्यम सटीकता (Medium)',
    confLow: 'कम सटीकता (पुष्टि आवश्यक)',
    description: 'समस्या का विवरण',
    symptoms: 'लक्षण',
    causes: 'संभावित कारण',
    treatmentSteps: 'क्रमबद्ध उपचार योजना (Step-by-step)',
    medicalSolutions: 'रासायनिक / कीटनाशक समाधान (सक्रिय घटक व प्रयोग विधि)',
    desiSolutions: 'देसी एवं घरेलू उपाय (आसानी से उपलब्ध भारतीय नुस्खे)',
    recoveryTips: 'पौधे को सुधारने के उपाय',
    preventionTips: 'भविष्य से बचाव के उपाय',
    expertHelp: 'कृषि विशेषज्ञ से कब संपर्क करें',
    noteIfUnsure: 'महत्वपूर्ण सूचना / फोटो सलाह',
    noneMentioned: 'कोई उल्लेख नहीं'
  },
  gu: {
    appTitle: 'પ્લાન્ટ ડૉક્ટર (Plant Doctor)',
    appSubtitle: 'AI આધારિત છોડના રોગનું સચોટ નિદાન અને ઉપચાર માર્ગદર્શિકા',
    uploadTitle: 'છોડ અથવા પાંદડાનો ફોટો અપલોડ કરો',
    uploadInstructions: 'ફોટો પસંદ કરવા ક્લિક કરો અથવા અહીં ખેંચો',
    uploadCamera: 'કેમેરાથી ફોટો લો અથવા ગેલેરીમાંથી પસંદ કરો',
    uploadLimit: 'JPG, PNG અથવા WEBP (મહત્તમ 5 MB)',
    selectedImage: 'પસંદ કરેલ ફોટો',
    changeImage: 'ફોટો બદલો',
    selectLanguage: 'ભાષા પસંદ કરો',
    analyzeBtn: 'છોડનું વિશ્લેષણ કરો',
    analyzingBtn: 'વિશ્લેષણ ચાલુ છે...',
    loadingMessage: 'પાંદડાના લક્ષણો ચકાસી રહ્યા છીએ, દેશી અને દવાઓના ઉપાયો તૈયાર થઈ રહ્યા છે...',
    analyzeAnother: 'બીજા છોડનું વિશ્લેષણ કરો',
    footerDisclaimer: 'AI સૂચનો માત્ર માર્ગદર્શન માટે છે. રસાયણોનો છંટકાવ કરતાં પહેલાં સ્થાનિક કૃષિ નિષ્ણાતની સલાહ અવશ્ય લો.',
    
    // Non-plant error
    notPlantError: 'આ કોઈ છોડની તસવીર હોય તેવું લાગતું નથી. કૃપા કરીને કોઈ છોડ, પાંદડું, ફૂલ અથવા ફળનો ફોટો અપલોડ કરો.',
    
    // Client-side validations
    errNoImage: 'કૃપા કરીને પહેલાં છોડનો ફોટો અપલોડ કરો.',
    errFileType: 'અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને JPG, PNG અથવા WEBP અપલોડ કરો.',
    errFileSize: 'ફાઇલ 5 MB કરતાં મોટી છે. કૃપા કરીને નાની ફાઇલ પસંદ કરો.',
    errCorruptImage: 'ફોટો લોડ થઈ શક્યો નહીં. કૃપા કરીને અન્ય ફોટો વાપરો.',
    
    // Result Headings & Badges
    resultTitle: 'નિદાન અહેવાલ',
    plantName: 'છોડનું નામ',
    scientificName: 'વૈજ્ઞાનિક નામ',
    condition: 'રોગ / તકલીફ',
    confidence: 'વિશ્વાસ સ્તર',
    healthyStatus: 'છોડ તંદુરસ્ત છે',
    issueStatus: 'રોગ/ખામી જણાયેલ છે',
    confHigh: 'ઉચ્ચ સચોટતા (High)',
    confMedium: 'મધ્યમ સચોટતા (Medium)',
    confLow: 'ઓછી સચોટતા (સ્પષ્ટ ફોટો જરૂરી)',
    description: 'રોગની વિગતવાર માહિતી',
    symptoms: 'લક્ષણો',
    causes: 'મુખ્ય કારણો',
    treatmentSteps: 'તબક્કાવાર ઉપચાર યોજના (Step-by-step)',
    medicalSolutions: 'રાસાયણિક / દવાઓના ઉપાયો (દવાનું નામ અને ઉપયોગ)',
    desiSolutions: 'દેશી અને ઘરગથ્થુ ઉપાયો (સરળ ભારતીય નુસખા)',
    recoveryTips: 'છોડ ઝડપથી સુધારવા માટેની ટિપ્સ',
    preventionTips: 'ભવિષ્યમાં રોગ અટકાવવા માટેના ઉપાયો',
    expertHelp: 'કૃષિ નિષ્ણાત પાસે ક્યારે જવું',
    noteIfUnsure: 'મહત્વપૂર્ણ નોંધ / ફોટો સલાહ',
    noneMentioned: 'કોઈ વિગત નથી'
  }
};
