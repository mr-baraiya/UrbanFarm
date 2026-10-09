enum AppLanguage {
  english('en', 'English', 'English'),
  hindi('hi', 'हिन्दी', 'Hindi'),
  gujarati('gu', 'ગુજરાતી', 'Gujarati');

  final String code;
  final String label;
  final String apiName;

  const AppLanguage(this.code, this.label, this.apiName);

  static AppLanguage fromCode(String? code) {
    switch (code) {
      case 'hi':
        return AppLanguage.hindi;
      case 'gu':
        return AppLanguage.gujarati;
      case 'en':
      default:
        return AppLanguage.english;
    }
  }
}

class AppStrings {
  final AppLanguage language;

  const AppStrings(this.language);

  static AppStrings of(AppLanguage language) => AppStrings(language);

  // App Title & Tagline
  String get appName {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य (Vaidha)';
      case AppLanguage.gujarati:
        return 'વૈદ્ય (Vaidha)';
      case AppLanguage.english:
        return 'Vaidha';
    }
  }

  String get appTagline {
    switch (language) {
      case AppLanguage.hindi:
        return 'आपके पौधे का एआई डॉक्टर (Your Plant’s AI Doctor)';
      case AppLanguage.gujarati:
        return 'તમારા છોડના AI ડૉક્ટર (Your Plant’s AI Doctor)';
      case AppLanguage.english:
        return 'Your Plant’s AI Doctor';
    }
  }

  // Home Screen
  String get selectLanguage {
    switch (language) {
      case AppLanguage.hindi:
        return 'भाषा';
      case AppLanguage.gujarati:
        return 'ભાષા';
      case AppLanguage.english:
        return 'Language';
    }
  }

  String get takePhoto {
    switch (language) {
      case AppLanguage.hindi:
        return 'कैमरे से फोटो लें';
      case AppLanguage.gujarati:
        return 'કેમેરાથી ફોટો લો';
      case AppLanguage.english:
        return 'Take Photo';
    }
  }

  String get chooseFromGallery {
    switch (language) {
      case AppLanguage.hindi:
        return 'गैलरी से चुनें';
      case AppLanguage.gujarati:
        return 'ગેલેરીમાંથી પસંદ કરો';
      case AppLanguage.english:
        return 'Choose from Gallery';
    }
  }

  String get quickTipTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'सर्वोत्तम परिणाम के लिए सुझाव';
      case AppLanguage.gujarati:
        return 'શ્રેષ્ઠ પરિણામ માટે ટિપ્સ';
      case AppLanguage.english:
        return 'Tips for Best Results';
    }
  }

  String get quickTipBody {
    switch (language) {
      case AppLanguage.hindi:
        return 'प्रभावित पत्ती या फल की स्पष्ट फोटो दिन के प्राकृतिक उजाले में लें।';
      case AppLanguage.gujarati:
        return 'રોગગ્રસ્ત પાંદડા અથવા ફળનો સ્પષ્ટ ફોટો દિવસના કુદરતી અજવાળામાં લો.';
      case AppLanguage.english:
        return 'Capture a clear, close-up photo of the affected leaf or fruit in natural daylight.';
    }
  }

  // Web portal link
  String get urbanFarmTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'अर्बन फार्म — और अधिक कृषि सुविधाएं';
      case AppLanguage.gujarati:
        return 'અર્બન ફાર્મ — વધુ આધુનિક ખેતી સુવિધાઓ';
      case AppLanguage.english:
        return 'UrbanFarm — Explore More Features';
    }
  }

  String get urbanFarmSubtitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'स्मार्ट कृषि टूल्स, मौसम सलाह और फसल प्रबंधन के लिए पोर्टल पर जाएं।';
      case AppLanguage.gujarati:
        return 'સ્માર્ટ ખેતી સાધનો, હવામાન સલાહ અને પાક માર્ગદર્શન માટે પોર્ટલ જુઓ.';
      case AppLanguage.english:
        return 'Visit our web portal for smart farm management, tools & crop guides.';
    }
  }

  String get visitWebsite {
    switch (language) {
      case AppLanguage.hindi:
        return 'वेबसाइट खोलें';
      case AppLanguage.gujarati:
        return 'વેબસાઇટ જુઓ';
      case AppLanguage.english:
        return 'Visit Portal';
    }
  }

  // Preview Screen
  String get previewTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'फोटो पूर्वावलोकन';
      case AppLanguage.gujarati:
        return 'ફોટો પૂર્વાવલોકન';
      case AppLanguage.english:
        return 'Image Preview';
    }
  }

  String get analyzeButton {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधे की जांच करें';
      case AppLanguage.gujarati:
        return 'છોડનું વિશ્લેષણ કરો';
      case AppLanguage.english:
        return 'Analyze Plant';
    }
  }

  String get changePhoto {
    switch (language) {
      case AppLanguage.hindi:
        return 'फोटो बदलें';
      case AppLanguage.gujarati:
        return 'ફોટો બદલો';
      case AppLanguage.english:
        return 'Change Photo';
    }
  }

  String get readyToAnalyze {
    switch (language) {
      case AppLanguage.hindi:
        return 'जांच के लिए तैयार (अधिकतम 5 MB)';
      case AppLanguage.gujarati:
        return 'વિશ્લેષણ માટે તૈયાર (મહત્તમ 5 MB)';
      case AppLanguage.english:
        return 'Ready to analyze (Max 5 MB)';
    }
  }

  // Loading Screen
  String get analyzingTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य द्वारा पौधे की जांच जारी है...';
      case AppLanguage.gujarati:
        return 'વૈદ્ય દ્વારા છોડનું વિશ્લેષણ ચાલુ છે...';
      case AppLanguage.english:
        return 'Vaidha is analyzing your plant...';
    }
  }

  String get analyzingSubtitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पत्तियों के लक्षणों की पहचान कर रासायनिक व देसी नुस्खे तैयार किए जा रहे हैं।';
      case AppLanguage.gujarati:
        return 'પાંદડાના લક્ષણો ચકાસીને દવાઓ અને દેશી ઉપાયો તૈયાર થઈ રહ્યા છે.';
      case AppLanguage.english:
        return 'Examining leaf patterns, identifying conditions, and formulating medical & desi remedies.';
    }
  }

  // Not a Plant Screen
  String get notPlantTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'यह पौधे की तस्वीर नहीं है';
      case AppLanguage.gujarati:
        return 'આ છોડની તસવીર નથી';
      case AppLanguage.english:
        return 'Not a Plant Image';
    }
  }

  String get notPlantMessage {
    switch (language) {
      case AppLanguage.hindi:
        return 'यह किसी पौधे की तस्वीर नहीं लग रही है। कृपया किसी पौधे, पत्ती, फूल या फल की तस्वीर अपलोड करें।';
      case AppLanguage.gujarati:
        return 'આ કોઈ છોડની તસવીર હોય તેવું લાગતું નથી. કૃપા કરીને કોઈ છોડ, પાંદડું, ફૂલ અથવા ફળનો ફોટો અપલોડ કરો.';
      case AppLanguage.english:
        return "This doesn't look like a plant. Please upload a photo of a plant, leaf, flower or fruit.";
    }
  }

  String get tryAgain {
    switch (language) {
      case AppLanguage.hindi:
        return 'पुनः प्रयास करें (Try Again)';
      case AppLanguage.gujarati:
        return 'ફરી પ્રયાસ કરો (Try Again)';
      case AppLanguage.english:
        return 'Try Again';
    }
  }

  // Result Screen
  String get diagnosticReport {
    switch (language) {
      case AppLanguage.hindi:
        return 'निदान रिपोर्ट';
      case AppLanguage.gujarati:
        return 'નિદાન અહેવાલ';
      case AppLanguage.english:
        return 'Diagnostic Report';
    }
  }

  String get plantName {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधे का नाम';
      case AppLanguage.gujarati:
        return 'છોડનું નામ';
      case AppLanguage.english:
        return 'Plant Name';
    }
  }

  String get scientificName {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैज्ञानिक नाम';
      case AppLanguage.gujarati:
        return 'વૈજ્ઞાનિક નામ';
      case AppLanguage.english:
        return 'Scientific Name';
    }
  }

  String get healthyPlant {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधा स्वस्थ है';
      case AppLanguage.gujarati:
        return 'છોડ તંદુરસ્ત છે';
      case AppLanguage.english:
        return 'Healthy Plant';
    }
  }

  String get conditionDetected {
    switch (language) {
      case AppLanguage.hindi:
        return 'रोग / समस्या पाई गई';
      case AppLanguage.gujarati:
        return 'રોગ / ખામી જણાયેલ છે';
      case AppLanguage.english:
        return 'Condition Detected';
    }
  }

  String get confHigh {
    switch (language) {
      case AppLanguage.hindi:
        return 'उच्च सटीकता';
      case AppLanguage.gujarati:
        return 'ઉચ્ચ સચોટતા';
      case AppLanguage.english:
        return 'High Confidence';
    }
  }

  String get confMedium {
    switch (language) {
      case AppLanguage.hindi:
        return 'मध्यम सटीकता';
      case AppLanguage.gujarati:
        return 'મધ્યમ સચોટતા';
      case AppLanguage.english:
        return 'Medium Confidence';
    }
  }

  String get confLow {
    switch (language) {
      case AppLanguage.hindi:
        return 'कम सटीकता (अस्पष्ट)';
      case AppLanguage.gujarati:
        return 'ઓછી સચોટતા (અસ્પષ્ટ)';
      case AppLanguage.english:
        return 'Low Confidence';
    }
  }

  // Section Headers
  String get sectionDescription {
    switch (language) {
      case AppLanguage.hindi:
        return 'समस्या का विवरण';
      case AppLanguage.gujarati:
        return 'રોગની વિગતવાર માહિતી';
      case AppLanguage.english:
        return 'Description';
    }
  }

  String get sectionSymptoms {
    switch (language) {
      case AppLanguage.hindi:
        return 'प्रमुख लक्षण';
      case AppLanguage.gujarati:
        return 'મુખ્ય લક્ષણો';
      case AppLanguage.english:
        return 'Symptoms';
    }
  }

  String get sectionCauses {
    switch (language) {
      case AppLanguage.hindi:
        return 'संभावित कारण';
      case AppLanguage.gujarati:
        return 'મુખ્ય કારણો';
      case AppLanguage.english:
        return 'Causes';
    }
  }

  String get sectionTreatmentSteps {
    switch (language) {
      case AppLanguage.hindi:
        return 'उपचार कैसे करें (चरणबद्ध)';
      case AppLanguage.gujarati:
        return 'કેવી રીતે ઉકેલ લાવવો (તબક્કાવાર)';
      case AppLanguage.english:
        return 'How to Treat (Step-by-Step)';
    }
  }

  String get sectionMedicalSolutions {
    switch (language) {
      case AppLanguage.hindi:
        return 'रासायनिक / कीटनाशक समाधान';
      case AppLanguage.gujarati:
        return 'રાસાયણિક દવાઓ (સક્રિય ઘટકો)';
      case AppLanguage.english:
        return 'Medical Solutions (Chemical)';
    }
  }

  String get sectionDesiSolutions {
    switch (language) {
      case AppLanguage.hindi:
        return 'देसी व पारंपरिक उपाय';
      case AppLanguage.gujarati:
        return 'દેશી અને ઘરગથ્થુ ઉપાયો';
      case AppLanguage.english:
        return 'Desi Remedies (Home Solutions)';
    }
  }

  String get sectionRecoveryTips {
    switch (language) {
      case AppLanguage.hindi:
        return 'सुधार के उपाय (रिकवरी)';
      case AppLanguage.gujarati:
        return 'છોડ સુધારણા ટિપ્સ';
      case AppLanguage.english:
        return 'Recovery Tips';
    }
  }

  String get sectionPreventionTips {
    switch (language) {
      case AppLanguage.hindi:
        return 'भविष्य से बचाव के उपाय';
      case AppLanguage.gujarati:
        return 'ભવિષ્યમાં રોગ અટકાવવા ઉપાયો';
      case AppLanguage.english:
        return 'Prevention Tips';
    }
  }

  String get sectionExpertHelp {
    switch (language) {
      case AppLanguage.hindi:
        return 'कृषि विशेषज्ञ से कब मिलें';
      case AppLanguage.gujarati:
        return 'કૃષિ નિષ્ણાત પાસે ક્યારે જવું';
      case AppLanguage.english:
        return 'When to See an Expert';
    }
  }

  String get noteIfUnsureTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'विशेष सलाह / फोटो सुझाव';
      case AppLanguage.gujarati:
        return 'ખાસ સલાહ / ફોટો સૂચના';
      case AppLanguage.english:
        return 'Important Note / Retake Advice';
    }
  }

  // PDF Report Actions
  String get downloadPdfReport {
    switch (language) {
      case AppLanguage.hindi:
        return 'पीडीएफ रिपोर्ट डाउनलोड / शेयर करें';
      case AppLanguage.gujarati:
        return 'PDF રિપોર્ટ ડાઉનલોડ / શેર કરો';
      case AppLanguage.english:
        return 'Download / Share PDF Report';
    }
  }

  String get generatingPdf {
    switch (language) {
      case AppLanguage.hindi:
        return 'पीडीएफ तैयार हो रहा है...';
      case AppLanguage.gujarati:
        return 'PDF તૈયાર થઈ રહ્યો છે...';
      case AppLanguage.english:
        return 'Generating PDF Report...';
    }
  }

  String get analyzeAnother {
    switch (language) {
      case AppLanguage.hindi:
        return 'अन्य पौधे की जांच करें';
      case AppLanguage.gujarati:
        return 'બીજા છોડનું વિશ્લેષણ કરો';
      case AppLanguage.english:
        return 'Analyze Another Plant';
    }
  }

  String get disclaimer {
    switch (language) {
      case AppLanguage.hindi:
        return 'एआई सुझाव केवल मार्गदर्शन के लिए हैं। रसायनों के छिड़काव से पहले स्थानीय कृषि विशेषज्ञ से पुष्टि अवश्य करें।';
      case AppLanguage.gujarati:
        return 'AI સૂચનો માત્ર માર્ગદર્શન માટે છે. રસાયણોનો છંટકાવ કરતાં પહેલાં સ્થાનિક કૃષિ નિષ્ણાતની સલાહ અવશ્ય લો.';
      case AppLanguage.english:
        return 'AI suggestions are for guidance. Confirm with a local agriculture expert before spraying chemicals.';
    }
  }

  // Voice Reading / Text-To-Speech
  String get listenReportVoice {
    switch (language) {
      case AppLanguage.hindi:
        return 'पूरी रिपोर्ट बोलकर सुनें';
      case AppLanguage.gujarati:
        return 'સંપૂર્ણ રિપોર્ટ સાંભળો';
      case AppLanguage.english:
        return 'Listen to Full Report';
    }
  }

  String get voiceReaderHelp {
    switch (language) {
      case AppLanguage.hindi:
        return 'यदि पढ़ना नहीं आता, तो पूरी बीमारी और इलाज सुनने के लिए यहाँ दबाएं';
      case AppLanguage.gujarati:
        return 'વાંચતા ન આવડતું હોય તો સંપૂર્ણ રોગ અને ઉપચાર સાંભળવા અહીં દબાવો';
      case AppLanguage.english:
        return 'Tap to listen to the complete diagnosis, causes and remedies';
    }
  }

  String get voiceReading {
    switch (language) {
      case AppLanguage.hindi:
        return 'रिपोर्ट सुनाई जा रही है...';
      case AppLanguage.gujarati:
        return 'રિપોર્ટ સંભળાઈ રહ્યો છે...';
      case AppLanguage.english:
        return 'Reading report aloud...';
    }
  }

  String get voicePaused {
    switch (language) {
      case AppLanguage.hindi:
        return 'आवाज़ रोकी गई है';
      case AppLanguage.gujarati:
        return 'અવાજ થોભાવેલ છે';
      case AppLanguage.english:
        return 'Speech Paused';
    }
  }

  String get voiceResume {
    switch (language) {
      case AppLanguage.hindi:
        return 'जारी रखें';
      case AppLanguage.gujarati:
        return 'ચાલુ રાખો';
      case AppLanguage.english:
        return 'Resume';
    }
  }

  String get voicePause {
    switch (language) {
      case AppLanguage.hindi:
        return 'रोकें';
      case AppLanguage.gujarati:
        return 'થોભો';
      case AppLanguage.english:
        return 'Pause';
    }
  }

  String get voiceStop {
    switch (language) {
      case AppLanguage.hindi:
        return 'बंद करें';
      case AppLanguage.gujarati:
        return 'બંધ કરો';
      case AppLanguage.english:
        return 'Stop';
    }
  }

  String get voiceStepPrefix {
    switch (language) {
      case AppLanguage.hindi:
        return 'चरण';
      case AppLanguage.gujarati:
        return 'તબક્કો';
      case AppLanguage.english:
        return 'Step';
    }
  }

  // Error Messages
  String get errNoInternet {
    switch (language) {
      case AppLanguage.hindi:
        return 'इंटरनेट कनेक्शन नहीं है। कृपया अपना नेटवर्क जांचें।';
      case AppLanguage.gujarati:
        return 'ઇન્ટરનેટ કનેક્શન નથી. કૃપા કરીને તમારું નેટવર્ક તપાસો.';
      case AppLanguage.english:
        return 'No internet connection. Please check your network and try again.';
    }
  }

  String get errTimeout {
    switch (language) {
      case AppLanguage.hindi:
        return 'अनुरोध समय समाप्त हो गया (30 सेकंड)। कृपया पुनः प्रयास करें।';
      case AppLanguage.gujarati:
        return 'વિનંતી સમય સમાપ્ત થઈ ગયો (30 સેકન્ડ). કૃપા કરીને ફરી પ્રયાસ કરો.';
      case AppLanguage.english:
        return 'Connection timed out (30s). The server took too long to respond. Please try again.';
    }
  }

  String get errRateLimit {
    switch (language) {
      case AppLanguage.hindi:
        return 'बहुत सारे अनुरोध प्राप्त हुए हैं। कृपया एक मिनट बाद पुनः प्रयास करें।';
      case AppLanguage.gujarati:
        return 'ખૂબ વધુ વિનંતીઓ આવી છે. કૃપા કરીને એક મિનિટ પછી ફરી પ્રયાસ કરો.';
      case AppLanguage.english:
        return 'Too many requests, try again in a minute.';
    }
  }

  String get errGeneric {
    switch (language) {
      case AppLanguage.hindi:
        return 'निदान में समस्या आई। कृपया पुनः प्रयास करें।';
      case AppLanguage.gujarati:
        return 'નિદાન કરવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.';
      case AppLanguage.english:
        return 'Unable to analyze image. Please try again with a clearer photo.';
    }
  }

  String get errFileTooLarge {
    switch (language) {
      case AppLanguage.hindi:
        return 'फ़ाइल 5 MB से बड़ी है। कृपया छोटी फ़ाइल चुनें।';
      case AppLanguage.gujarati:
        return 'ફાઇલ 5 MB કરતાં મોટી છે. કૃપા કરીને નાની ફાઇલ પસંદ કરો.';
      case AppLanguage.english:
        return 'Image exceeds 5 MB size limit. Please choose a smaller photo.';
    }
  }

  String get errInvalidFormat {
    switch (language) {
      case AppLanguage.hindi:
        return 'अमान्य प्रारूप। कृपया केवल JPG, PNG या WEBP फोटो चुनें।';
      case AppLanguage.gujarati:
        return 'અમાન્ય ફોર્મેટ. કૃપા કરીને માત્ર JPG, PNG અથવા WEBP ફોટો પસંદ કરો.';
      case AppLanguage.english:
        return 'Unsupported format. Only JPG, PNG, and WEBP images are supported.';
    }
  }

  String get retry {
    switch (language) {
      case AppLanguage.hindi:
        return 'पुनः प्रयास करें (Retry)';
      case AppLanguage.gujarati:
        return 'ફરી પ્રયાસ કરો (Retry)';
      case AppLanguage.english:
        return 'Retry';
    }
  }

  // Navigation Tabs
  String get tabDiagnose {
    switch (language) {
      case AppLanguage.hindi:
        return 'निदान (Diagnose)';
      case AppLanguage.gujarati:
        return 'નિદાન (Diagnose)';
      case AppLanguage.english:
        return 'Diagnose';
    }
  }

  String get tabTips {
    switch (language) {
      case AppLanguage.hindi:
        return 'सुझाव व गाइड';
      case AppLanguage.gujarati:
        return 'ટિપ્સ અને ગાઇડ';
      case AppLanguage.english:
        return 'Tips & Guide';
    }
  }

  String get tabSettings {
    switch (language) {
      case AppLanguage.hindi:
        return 'सेटिंग्स';
      case AppLanguage.gujarati:
        return 'સેટિંગ્સ';
      case AppLanguage.english:
        return 'Settings';
    }
  }

  // Onboarding & Language Selection
  String get welcomeTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य में आपका स्वागत है';
      case AppLanguage.gujarati:
        return 'વૈદ્યમાં તમારું સ્વાગત છે';
      case AppLanguage.english:
        return 'Welcome to Vaidha';
    }
  }

  String get chooseLanguageSubtitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधों की सटीक जांच और देसी व वैज्ञानिक उपचार के लिए अपनी भाषा चुनें।';
      case AppLanguage.gujarati:
        return 'છોડના સચોટ રોગ નિદાન અને દેશી તથા વૈજ્ઞાનિક ઉપાયો માટે તમારી ભાષા પસંદ કરો.';
      case AppLanguage.english:
        return 'Select your preferred language to get personalized diagnosis and remedies.';
    }
  }

  String get continueButton {
    switch (language) {
      case AppLanguage.hindi:
        return 'शुरू करें (Continue)';
      case AppLanguage.gujarati:
        return 'આગળ વધો (Continue)';
      case AppLanguage.english:
        return 'Continue';
    }
  }

  String get canChangeLater {
    switch (language) {
      case AppLanguage.hindi:
        return 'आप सेटिंग्स से कभी भी भाषा बदल सकते हैं';
      case AppLanguage.gujarati:
        return 'તમે સેટિંગ્સથી ગમે ત્યારે ભાષા બદલી શકો છો';
      case AppLanguage.english:
        return 'You can change this anytime in Settings';
    }
  }

  // Home Screen Enhancements
  String get homeGreeting {
    switch (language) {
      case AppLanguage.hindi:
        return 'नमस्ते, किसान मित्र!';
      case AppLanguage.gujarati:
        return 'નમસ્તે, ખેડૂત મિત્ર!';
      case AppLanguage.english:
        return 'Hello, Plant Parent!';
    }
  }

  String get homeSubtitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'अपनी फसल या पौधे की पत्ती स्कैन करें और तुरंत समाधान पाएं';
      case AppLanguage.gujarati:
        return 'તમારા પાક અથવા છોડનું પાંદડું સ્કેન કરો અને તરત જ ઉપાય મેળવો';
      case AppLanguage.english:
        return 'Scan an affected leaf to get instant AI diagnosis and remedies';
    }
  }

  String get scanCardTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधे की बीमारी जांचें';
      case AppLanguage.gujarati:
        return 'છોડનો રોગ તપાસો';
      case AppLanguage.english:
        return 'Instant Plant Diagnosis';
    }
  }

  String get scanCardSubtitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पत्ती की फोटो खींचें या गैलरी से चुनें';
      case AppLanguage.gujarati:
        return 'પાંદડાનો ફોટો પાડો અથવા ગેલેરીમાંથી પસંદ કરો';
      case AppLanguage.english:
        return 'Snap a photo or select from gallery';
    }
  }

  String get howItWorksTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य कैसे काम करता है?';
      case AppLanguage.gujarati:
        return 'વૈદ્ય કેવી રીતે કાર્ય કરે છે?';
      case AppLanguage.english:
        return 'How Vaidha Works';
    }
  }

  String get commonDiseasesTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पहचाने जाने वाले मुख्य रोग';
      case AppLanguage.gujarati:
        return 'ઓળખી શકાતા મુખ્ય રોગો';
      case AppLanguage.english:
        return 'Common Diseases We Detect';
    }
  }

  // Tips Screen
  String get tipsPageTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'उपयोग निर्देश व पौधे सुझाव';
      case AppLanguage.gujarati:
        return 'ઉપયોગ માર્ગદર્શિકા અને ટિપ્સ';
      case AppLanguage.english:
        return 'Tips & Usage Guide';
    }
  }

  String get photographyTipsTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'सटीक परिणाम के लिए फोटो कैसे लें?';
      case AppLanguage.gujarati:
        return 'સચોટ પરિણામ માટે ફોટો કેવી રીતે લેવો?';
      case AppLanguage.english:
        return 'Golden Photography Rules';
    }
  }

  String get generalCareTipsTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'पौधों की स्वस्थ देखभाल के नियम';
      case AppLanguage.gujarati:
        return 'છોડની તંદુરસ્ત સંભાળના નિયમો';
      case AppLanguage.english:
        return 'Daily Plant Health Best Practices';
    }
  }

  // Settings Screen
  String get settingsHeader {
    switch (language) {
      case AppLanguage.hindi:
        return 'ऐप सेटिंग्स';
      case AppLanguage.gujarati:
        return 'એપ સેટિંગ્સ';
      case AppLanguage.english:
        return 'App Settings';
    }
  }

  String get currentLanguageTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'भाषा चुनें (Select Language)';
      case AppLanguage.gujarati:
        return 'ભાષા પસંદ કરો (Select Language)';
      case AppLanguage.english:
        return 'Select Language';
    }
  }

  String get aiModelInfo {
    switch (language) {
      case AppLanguage.hindi:
        return 'एआई मॉडल: गूगल जेमिनी विज़न';
      case AppLanguage.gujarati:
        return 'AI મોડલ: ગૂગલ જેમિની વિઝન';
      case AppLanguage.english:
        return 'AI Engine: Google Gemini Vision';
    }
  }

  String get aboutVaidhaTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य के बारे में';
      case AppLanguage.gujarati:
        return 'વૈદ્ય વિશે';
      case AppLanguage.english:
        return 'About Vaidha';
    }
  }

  String get aboutVaidhaDesc {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य - आपके पौधे का एआई डॉक्टर। यह आधुनिक कृषि विज्ञान और पारंपरिक भारतीय देसी नुस्खों का संगम है।';
      case AppLanguage.gujarati:
        return 'વૈદ્ય - તમારા છોડના AI ડૉક્ટર. આ આધુનિક કૃષિ વિજ્ઞાન અને પરંપરાગત ભારતીય દેશી ઉપાયોનો સંગમ છે.';
      case AppLanguage.english:
        return "Vaidha is your plant's AI Doctor, combining modern agronomy with authentic traditional Desi remedies.";
    }
  }

  String get versionLabel {
    switch (language) {
      case AppLanguage.hindi:
        return 'संस्करण: 1.0.0 (नवीनतम)';
      case AppLanguage.gujarati:
        return 'આવૃત્તિ: 1.0.0 (લેટેસ્ટ)';
      case AppLanguage.english:
        return 'Version: 1.0.0 (Latest)';
    }
  }

  // Guide & Tips Localization
  String get viewGuide {
    switch (language) {
      case AppLanguage.hindi:
        return 'मार्गदर्शिका देखें';
      case AppLanguage.gujarati:
        return 'માર્ગદર્શિકા જુઓ';
      case AppLanguage.english:
        return 'View Guide';
    }
  }

  String get stepSectionTitle {
    switch (language) {
      case AppLanguage.hindi:
        return '1. वैद्य ऐप का उपयोग कैसे करें';
      case AppLanguage.gujarati:
        return '1. વૈદ્ય એપનો ઉપયોગ કેવી રીતે કરવો';
      case AppLanguage.english:
        return '1. How to Use Vaidha App';
    }
  }

  String get stepLabel {
    switch (language) {
      case AppLanguage.hindi:
        return 'चरण';
      case AppLanguage.gujarati:
        return 'પગલું';
      case AppLanguage.english:
        return 'STEP';
    }
  }

  String get step1Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'फोटो लें या गैलरी से चुनें';
      case AppLanguage.gujarati:
        return 'ફોટો લો અથવા ગેલેરીમાંથી પસંદ કરો';
      case AppLanguage.english:
        return 'Capture or Select Photo';
    }
  }

  String get step1Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'संक्रमित पत्ती की स्पष्ट फोटो लेने के लिए कैमरा बटन दबाएं या गैलरी से चुनें। सुनिश्चित करें कि रोग के लक्षण साफ दिखें।';
      case AppLanguage.gujarati:
        return 'રોગગ્રસ્ત પાંદડાનો સ્પષ્ટ ફોટો લેવા માટે કૅમેરા બટન દબાવો અથવા ગૅલેરીમાંથી પસંદ કરો. રોગના ચિહ્નો સ્પષ્ટ દેખાય તેની ખાતરી કરો.';
      case AppLanguage.english:
        return 'Tap the Camera button to take a crisp photo of the infected leaf or choose one from your gallery. Make sure the disease lesions are clearly visible.';
    }
  }

  String get step2Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'सटीक एआई जांच';
      case AppLanguage.gujarati:
        return 'સચોટ AI નિદાન';
      case AppLanguage.english:
        return 'Instant AI Diagnosis';
    }
  }

  String get step2Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैद्य उन्नत विज़न एआई का उपयोग करके पत्तियों के धब्बे, रंग परिवर्तन और फफूंद के लक्षणों का हजारों पादप रोगों से मिलान करता है।';
      case AppLanguage.gujarati:
        return 'વૈદ્ય અદ્યતન વિઝન AI નો ઉપયોગ કરીને પાંદડાના ડાઘ, રંગ પરિવર્તન અને ફૂગના લક્ષણોનું હજારો વનસ્પતિ રોગો સાથે વિશ્લેષણ કરે છે.';
      case AppLanguage.english:
        return 'Vaidha uses advanced Multimodal Vision AI to analyze leaf discoloration, necrosis, pustules, and fungal patterns against thousands of plant pathologies.';
    }
  }

  String get step3Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'वैज्ञानिक व देसी उपचार अपनाएं';
      case AppLanguage.gujarati:
        return 'વૈજ્ઞાનિક અને દેશી ઉપચાર અપનાવો';
      case AppLanguage.english:
        return 'Apply Medical & Desi Remedies';
    }
  }

  String get step3Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'रासायनिक दवाओं के साथ-साथ प्रमाणित भारतीय जैविक देसी उपचार (जैसे नीम तेल, खट्टी छाछ) देखें और एक क्लिक में पीडीएफ रिपोर्ट पाएं।';
      case AppLanguage.gujarati:
        return 'રાસાયણિક દવાઓની સાથે પ્રમાણિત ભારતીય જૈવિક દેશી ઉપાયો (જેમ કે લીમડાનું તેલ, ખાટી છાસ) જુઓ અને પીડીએફ રિપોર્ટ મેળવો.';
      case AppLanguage.english:
        return 'Review scientific chemical active ingredients alongside proven organic Indian Desi solutions (like neem oil or sour buttermilk). Share or export the PDF report.';
    }
  }

  String get photoRulesSectionTitle {
    switch (language) {
      case AppLanguage.hindi:
        return '2. फोटो खींचने के जरूरी नियम';
      case AppLanguage.gujarati:
        return '2. ફોટો પાડવાના મહત્વપૂર્ણ નિયમો';
      case AppLanguage.english:
        return '2. Photography Golden Rules';
    }
  }

  String get photoRule1Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'प्राकृतिक दिन का उजाला';
      case AppLanguage.gujarati:
        return 'કુદરતી દિવસનો પ્રકાશ';
      case AppLanguage.english:
        return 'Natural Daylight';
    }
  }

  String get photoRule1Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'पत्तियों के सही रंग और नसों की पहचान के लिए सुबह या दोपहर के प्राकृतिक उजाले में फोटो लें।';
      case AppLanguage.gujarati:
        return 'પાંદડાના સાચા રંગ માટે સવારે અથવા બપોરના કુદરતી અજવાળામાં ફોટો લો.';
      case AppLanguage.english:
        return 'Take photos outdoors in morning or late afternoon light for accurate leaf vein colors.';
    }
  }

  String get photoRule2Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'नजदीक से फोकस (10-15 सेमी)';
      case AppLanguage.gujarati:
        return 'નજીકથી ફોકસ (10-15 સેમી)';
      case AppLanguage.english:
        return 'Close-up Focus (10–15 cm)';
    }
  }

  String get photoRule2Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'संक्रमित हिस्से के करीब जाएं। फोन की स्क्रीन पर टैप करके रोगग्रस्त भाग पर फोकस सेट करें।';
      case AppLanguage.gujarati:
        return 'રોગગ્રસ્ત ભાગની નજીક જાઓ. સ્ક્રીન પર ટેપ કરીને રોગના ડાઘ પર ફોકસ કરો.';
      case AppLanguage.english:
        return 'Get close to the damaged area. Tap your phone screen to lock autofocus on the spot.';
    }
  }

  String get photoRule3Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'एक समय में एक पत्ती';
      case AppLanguage.gujarati:
        return 'એક સમયે એક પાંદડું';
      case AppLanguage.english:
        return 'One Leaf at a Time';
    }
  }

  String get photoRule3Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'सटीक परिणाम के लिए 1 या 2 प्रभावित पत्तियों को ही फ्रेम में रखें।';
      case AppLanguage.gujarati:
        return 'સચોટ પરિણામ માટે 1 કે 2 પ્રભાવિત પાંદડાને જ ફ્રેમમાં રાખો.';
      case AppLanguage.english:
        return 'Isolate 1 or 2 affected leaves against a neutral background for maximum precision.';
    }
  }

  String get photoRule4Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'दूर से फोटो न लें';
      case AppLanguage.gujarati:
        return 'દૂરથી ફોટો ન લો';
      case AppLanguage.english:
        return 'Avoid Distance Shots';
    }
  }

  String get photoRule4Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'पूरे खेत या पेड़ की दूर से फोटो न लें, पत्ती के पास जाकर फोटो लें।';
      case AppLanguage.gujarati:
        return 'આખા ખેતર કે ઝાડનો દૂરથી ફોટો ન લો, પાંદડાની નજીક જઈને લો.';
      case AppLanguage.english:
        return 'Do not take photos of the entire crop field or tree from meters away.';
    }
  }

  String get photoRule5Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'तेज फ्लैश और धुंधलेपन से बचें';
      case AppLanguage.gujarati:
        return 'વધુ પડતો ફ્લેશ અને અસ્પષ્ટતા ટાળો';
      case AppLanguage.english:
        return 'Avoid Heavy Flash & Blur';
    }
  }

  String get photoRule5Desc {
    switch (language) {
      case AppLanguage.hindi:
        return 'कैमरा फ्लैश से सफेद चमक बनती है जिससे फफूंद और पत्तियों के लक्षण छिप जाते हैं।';
      case AppLanguage.gujarati:
        return 'કેમેરા ફ્લેશથી સફેદ ચમક પડે છે જેનાથી ફૂગ અને રોગના લક્ષણો છુપાઈ જાય છે.';
      case AppLanguage.english:
        return 'Phone flash creates artificial white glare that hides fungal spores and chlorosis.';
    }
  }

  String get desiRemediesSectionTitle {
    switch (language) {
      case AppLanguage.hindi:
        return '3. प्रमुख देसी (जैविक) उपचार';
      case AppLanguage.gujarati:
        return '3. મુખ્ય દેશી (જૈવિક) ઉપચારો';
      case AppLanguage.english:
        return '3. Popular Desi (Organic) Treatments';
    }
  }

  String get remedy1Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'नीम तेल का घोल (5 मिली/लीटर)';
      case AppLanguage.gujarati:
        return 'લીમડાના તેલનો છંટકાવ (5 મિલી/લિટર)';
      case AppLanguage.english:
        return 'Neem Oil Spray (5ml/Litre)';
    }
  }

  String get remedy1BestFor {
    switch (language) {
      case AppLanguage.hindi:
        return 'रस चूसक कीट, माहू, सफेद मक्खी और शुरुआती फफूंद';
      case AppLanguage.gujarati:
        return 'ચૂસિયા જીવાતો, મોલો-મશી, સફેદ માખી અને શરૂઆતની ફૂગ';
      case AppLanguage.english:
        return 'Sucking pests, aphids, whiteflies & early powdery mildew';
    }
  }

  String get remedy1Instructions {
    switch (language) {
      case AppLanguage.hindi:
        return '1 लीटर पानी में 5 मिली नीम का तेल और 2-3 बूंद तरल साबुन मिलाकर शाम के समय पत्तियों के दोनों तरफ छिड़कें।';
      case AppLanguage.gujarati:
        return '1 લિટર પાણીમાં 5 મિલી લીમડાનું તેલ અને 2-3 ટીપાં પ્રવાહી સાબુ મેળવી સાંજના સમયે પાંદડાની બંને બાજુ છાંટો.';
      case AppLanguage.english:
        return 'Mix 5ml cold-pressed neem oil with 2-3 drops of mild liquid soap in 1 litre water. Spray both sides of leaves in late evening.';
    }
  }

  String get remedy2Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'खट्टी छाछ का छिड़काव';
      case AppLanguage.gujarati:
        return 'ખાટી છાસનો છંટકાવ';
      case AppLanguage.english:
        return 'Sour Buttermilk (Chhachh) Spray';
    }
  }

  String get remedy2BestFor {
    switch (language) {
      case AppLanguage.hindi:
        return 'फफूंद झुलसा, चूर्णी फफूंद और पत्तियों के धब्बे';
      case AppLanguage.gujarati:
        return 'ફૂગજન્ય સુકારો, ભૂકી છારો અને પાંદડાના ટપકાં';
      case AppLanguage.english:
        return 'Fungal blights, powdery mildew & leaf spots';
    }
  }

  String get remedy2Instructions {
    switch (language) {
      case AppLanguage.hindi:
        return '1 भाग पुरानी खट्टी छाछ को 4 भाग पानी में मिलाएं। इसका प्राकृतिक लैक्टिक एसिड फफूंद को नष्ट करता है।';
      case AppLanguage.gujarati:
        return '1 ભાગ જૂની ખાટી છાસમાં 4 ભાગ પાણી ઉમેરો. તેમાં રહેલ કુદરતી લેક્ટિક એસિડ ફૂગને અટકાવે છે.';
      case AppLanguage.english:
        return 'Dilute 1 part fermented sour buttermilk in 4 parts water. Natural lactic acid suppresses fungal mycelium propagation.';
    }
  }

  String get remedy3Title {
    switch (language) {
      case AppLanguage.hindi:
        return 'लकड़ी की राख और हल्दी का बुरकाव';
      case AppLanguage.gujarati:
        return 'લાકડાની રાખ અને હળદરનો છંટકાવ';
      case AppLanguage.english:
        return 'Wood Ash & Turmeric Dusting';
    }
  }

  String get remedy3BestFor {
    switch (language) {
      case AppLanguage.hindi:
        return 'जड़ गलन, चींटियां व कीड़े रोकना और घाव भरना';
      case AppLanguage.gujarati:
        return 'મૂળનો સડો, કીડીઓ અટકાવવી અને ઘા રૂઝવવા';
      case AppLanguage.english:
        return 'Damping off, ant deterrence & wound healing';
    }
  }

  String get remedy3Instructions {
    switch (language) {
      case AppLanguage.hindi:
        return 'छानी हुई लकड़ी की राख में थोड़ी हल्दी मिलाकर पौधे की जड़ के पास बुरकें, जिससे मिट्टी के कीट दूर रहते हैं।';
      case AppLanguage.gujarati:
        return 'ચાળેલી રાખમાં થોડી હળદર મિક્સ કરી છોડના થડ પાસે છાંટો, જેથી જમીનના જીવાતો દૂર રહે.';
      case AppLanguage.english:
        return 'Sprinkle fine sieved wood ash mixed with a pinch of turmeric around the plant base to deter soil larvae and slugs.';
    }
  }

  String get targetLabel {
    switch (language) {
      case AppLanguage.hindi:
        return 'रोग/कीट';
      case AppLanguage.gujarati:
        return 'રોગ/જીવાત';
      case AppLanguage.english:
        return 'Target';
    }
  }

  String get organicTag {
    switch (language) {
      case AppLanguage.hindi:
        return 'जैविक';
      case AppLanguage.gujarati:
        return 'જૈવિક';
      case AppLanguage.english:
        return 'Organic';
    }
  }

  String get antifungalTag {
    switch (language) {
      case AppLanguage.hindi:
        return 'फफूंदनाशक';
      case AppLanguage.gujarati:
        return 'ફૂગનાશક';
      case AppLanguage.english:
        return 'Antifungal';
    }
  }

  String get protectiveTag {
    switch (language) {
      case AppLanguage.hindi:
        return 'सुरक्षात्मक';
      case AppLanguage.gujarati:
        return 'રક્ષણાત્મક';
      case AppLanguage.english:
        return 'Protective';
    }
  }

  String get agronomicAdvisoryTitle {
    switch (language) {
      case AppLanguage.hindi:
        return 'कृषि विशेषज्ञ सलाह';
      case AppLanguage.gujarati:
        return 'કૃષિ નિષ્ણાત સલાહ';
      case AppLanguage.english:
        return 'Agronomic Advisory';
    }
  }
}
