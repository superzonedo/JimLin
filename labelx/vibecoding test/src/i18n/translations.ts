// Multi-language translations for LabelX

export type SupportedLanguage = "zh-TW" | "zh-CN" | "en";

export interface Translations {
  // Common
  common: {
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    back: string;
    next: string;
    skip: string;
    done: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    search: string;
    settings: string;
    premium: string;
    pro: string;
    free: string;
    upgrade: string;
    guest: string;
  };

  // Navigation / Tab Bar
  navigation: {
    home: string;
    scan: string;
    history: string;
    profile: string;
  };

  // Home Screen
  home: {
    greeting: string;
    todayTip: string;
    quickActions: string;
    scanFood: string;
    viewHistory: string;
    healthScore: string;
    recentScans: string;
    noScansYet: string;
    startScanning: string;
    labelInspection: string;
    analyzeNow: string;
    premiumMember: string;
    unlimitedScans: string;
    advancedAnalysis: string;
    weeklyScans: string;
    weeklyAvg: string;
    weeklyScanDays: string;
    healthGoalScore: string;
    thisWeekAvg: string;
    achievementBadges: string;
  };

  // Camera / Scan
  scan: {
    scanLabel: string;
    takePhoto: string;
    analyzing: string;
    pointCamera: string;
    scanTip: string;
    freeScanUsed: string;
    upgradeToUnlock: string;
    scanLimit: string;
    remainingScans: string;
  };

  // Results
  results: {
    healthScore: string;
    ingredients: string;
    additives: string;
    allergens: string;
    warnings: string;
    safeToEat: string;
    caution: string;
    avoid: string;
    noAllergens: string;
    noAdditives: string;
    healthAnalysis: string;
    personalizedTips: string;
    shareResults: string;
    saveToHistory: string;
  };

  // History
  history: {
    title: string;
    noHistory: string;
    scanHistory: string;
    clearHistory: string;
    deleteItem: string;
    confirmDelete: string;
    scannedOn: string;
  };

  // Profile
  profile: {
    title: string;
    guestUser: string;
    loginRegister: string;
    enjoyFullFeatures: string;
    personalPreferences: string;
    customizeGoals: string;
    totalScans: string;
    avgScore: string;
    streakDays: string;
    healthData: string;
    healthyProducts: string;
    consecutiveScans: string;
    account: string;
    general: string;
    logout: string;
    confirmLogout: string;
    logoutMessage: string;
    version: string;
  };

  // Settings
  settings: {
    title: string;
    personalHealth: string;
    notifications: string;
    privacy: string;
    language: string;
    helpCenter: string;
    about: string;
    restartOnboarding: string;
    restartOnboardingDesc: string;
  };

  // Health Settings
  healthSettings: {
    diseaseCategories: string;
    diseaseDesc: string;
    healthGoals: string;
    healthGoalsDesc: string;
    allergenSettings: string;
    allergenDesc: string;
    customAllergen: string;
    customDisease: string;
    customHealthGoal: string;
    addNew: string;
    noCustomItems: string;
    unlockAllergenAlerts: string;
    premiumFeature: string;
    switchToSimpleMode: string;
    viewFullDiseaseList: string;
    selectedDiseasesCount: string;
    diseasesCount: string;
    selected: string;
  };

  // Disease Categories
  diseaseCategories: {
    cardiovascular: string;
    metabolic: string;
    digestive: string;
    kidney: string;
    respiratory: string;
    neurological: string;
    musculoskeletal: string;
    skin: string;
    immune: string;
    mental: string;
    cancer: string;
    other: string;
  };

  // Expanded Disease List
  expandedDiseases: {
    // Cardiovascular
    hypertension: string;
    highCholesterol: string;
    coronaryHeartDisease: string;
    heartFailure: string;
    arrhythmia: string;
    atherosclerosis: string;
    stroke: string;
    // Metabolic
    diabetes: string;
    prediabetes: string;
    metabolicSyndrome: string;
    obesity: string;
    hyperthyroidism: string;
    hypothyroidism: string;
    gout: string;
    hyperuricemia: string;
    // Digestive
    gastritis: string;
    gastricUlcer: string;
    gerd: string;
    ibs: string;
    ibd: string;
    fattyLiver: string;
    liverDisease: string;
    gallstones: string;
    pancreatitis: string;
    constipation: string;
    // Kidney
    kidneyDisease: string;
    kidneyStones: string;
    nephritis: string;
    kidneyFailure: string;
    dialysis: string;
    // Respiratory
    asthma: string;
    copd: string;
    bronchitis: string;
    sleepApnea: string;
    // Neurological
    migraine: string;
    epilepsy: string;
    parkinsons: string;
    alzheimers: string;
    neuropathy: string;
    multipleSclerosis: string;
    // Musculoskeletal
    osteoporosis: string;
    arthritis: string;
    rheumatoidArthritis: string;
    osteoarthritis: string;
    fibromyalgia: string;
    // Skin
    eczema: string;
    psoriasis: string;
    acne: string;
    rosacea: string;
    dermatitis: string;
    urticaria: string;
    // Immune
    lupus: string;
    sjogrens: string;
    hashimotos: string;
    celiac: string;
    immunodeficiency: string;
    // Mental
    anxiety: string;
    depression: string;
    insomnia: string;
    eatingDisorder: string;
    bipolar: string;
    // Cancer
    cancerTreatment: string;
    cancerSurvivor: string;
    chemotherapy: string;
    // Other
    anemia: string;
    hemochromatosis: string;
    pcos: string;
    endometriosis: string;
    prostate: string;
  };

  // Diseases
  diseases: {
    kidneyDisease: string;
    liverDisease: string;
    skinDisease: string;
    diabetes: string;
    hypertension: string;
    highCholesterol: string;
    stomachSensitivity: string;
    metabolicDisease: string;
  };

  // Health Goals
  healthGoals: {
    lowSodium: string;
    lowSugar: string;
    highFiber: string;
    lowFat: string;
    highProtein: string;
    weightControl: string;
    gutHealth: string;
  };

  // Allergens
  allergens: {
    peanuts: string;
    nuts: string;
    dairy: string;
    eggs: string;
    seafood: string;
    soy: string;
    wheat: string;
    sesame: string;
    sulfites: string;
    preservatives: string;
    artificialColors: string;
    artificialFlavors: string;
    msg: string;
    gluten: string;
  };

  // Language Settings
  languageSettings: {
    title: string;
    changeLanguageNote: string;
    traditionalChinese: string;
    simplifiedChinese: string;
    english: string;
    currentLanguage: string;
  };

  // Notification Settings
  notificationSettings: {
    title: string;
    pushNotifications: string;
    allergenAlerts: string;
    dailyReminder: string;
    weeklyReport: string;
    achievements: string;
  };

  // Privacy
  privacy: {
    title: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    dataManagement: string;
  };

  // Paywall
  paywall: {
    title: string;
    subtitle: string;
    unlockPremium: string;
    monthlyPlan: string;
    annualPlan: string;
    bestValue: string;
    perMonth: string;
    perYear: string;
    continue: string;
    restore: string;
    termsNote: string;
    features: {
      unlimitedScans: string;
      expertAnalysis: string;
      allergenTracking: string;
      customAllergens: string;
      personalizedTips: string;
      diseaseAlerts: string;
      healthTrends: string;
    };
  };

  // Onboarding
  onboarding: {
    welcome: string;
    welcomeSubtitle: string;
    getStarted: string;
    completeSetup: string;
    almostDone: string;
    skip: string;
    continue: string;
    step: string;
    previous: string;
    next: string;
    finish: string;
    // Questions
    q1Title: string;
    q1Option1: string;
    q1Option2: string;
    q2Title: string;
    q2Options: string[];
    q3Title: string;
    q3Option1: string;
    q3Option2: string;
    q4Title: string;
    q4Option1: string;
    q4Option2: string;
    q5Title: string;
    q5Option1: string;
    q5Option2: string;
    q6Title: string;
    q6Subtitle: string;
    q6Options: string[];
    q7Title: string;
    q7Subtitle: string;
    q7Options: string[];
    q8Title: string;
    q8Subtitle: string;
    q8Options: string[];
    q9GenderTitle: string;
    q9GenderOptions: string[];
    q9AgeTitle: string;
    q9AgeOptions: string[];
  };

  // Camera Screen
  camera: {
    title: string;
    needPermission: string;
    permissionDesc: string;
    grantPermission: string;
    alignLabel: string;
    aiAnalyzing: string;
    recognizing: string;
    estimatedTime: string;
    cancelAnalysis: string;
    complete: string;
    errorPhoto: string;
    errorPickPhoto: string;
    errorAnalysis: string;
    selectFoodPhoto: string;
    selectFromGallery: string;
    openGallery: string;
  };

  // Result Screen
  result: {
    title: string;
    noResult: string;
    returnToScan: string;
    goodSafety: string;
    mediumSafety: string;
    highRisk: string;
    unknown: string;
    originalScore: string;
    adjustedScore: string;
    includeInAnalysis: string;
    processing: string;
    includedInAnalysis: string;
    productIncluded: string;
    continueScan: string;
    shareReport: string;
    ingredientAnalysis: string;
    safeIngredients: string;
    warningIngredients: string;
    healthBenefits: string;
    healthAdvice: string;
    sharePreview: string;
    shareTo: string;
    shareFailed: string;
    confirmFailed: string;
    unlockPersonalAnalysis: string;
    unlockPersonalAnalysisDesc: string;
    safe: string;
    healthy: string;
    caution: string;
    additive: string;
    healthyPick: string;
    moderateIntake: string;
    suggestAvoid: string;
    safetyLevelGood: string;
    safetyLevelMedium: string;
    safetyLevelHigh: string;
    safetyLevelUnknown: string;
    personalizedHealthAnalysis: string;
    moreHealthyIngredientsCount: string;
    confirmationFailed: string;
    shareFailed2: string;
    errorOccurred: string;
    savedToRecord: string;
    saveAnalysisRecord: string;
    saveHint: string;
    diseaseKeywords: {
      kidneyDisease: string;
      liverDisease: string;
      skinDisease: string;
      diabetes: string;
      hypertension: string;
      highCholesterol: string;
      stomachSensitivity: string;
      metabolicDisease: string;
    };
    riskLevels: {
      safe: string;
      moderate: string;
      warning: string;
    };
  };

  // Smart Alert Banner
  smartAlert: {
    personalizedHealthAlert: string;
    matchesHealthSettings: string;
    allHealthItemsChecked: string;
    diseaseRelatedRisk: string;
    detectedAllergens: string;
    healthGoalCheck: string;
    notMet: string;
    needsAttention: string;
    met: string;
    actual: string;
    recommended: string;
    custom: string;
  };

  // Health Analysis Screen
  healthAnalysis: {
    title: string;
    subtitle: string;
    analyzingAlignment: string;
    analysisFailed: string;
    analysisFailedDesc: string;
    overallRiskAssessment: string;
    safe: string;
    cautionRequired: string;
    warning: string;
    personalizedRecommendation: string;
    diseaseRiskAssessment: string;
    lowRisk: string;
    moderateRisk: string;
    highRisk: string;
    nutritionAlignment: string;
    alignsWithGoals: string;
    needsAttention: string;
    recommendedActions: string;
    bestFor: string;
    backToResults: string;
    saveAnalysis: string;
    analysisSaved: string;
    translateToChineseHK: string;
    translating: string;
  };

  // Welcome Screen
  welcome: {
    smartScan: string;
    healthyChoice: string;
    skipOnboarding: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  "zh-TW": {
    common: {
      cancel: "取消",
      confirm: "確認",
      save: "儲存",
      delete: "刪除",
      edit: "編輯",
      add: "新增",
      close: "關閉",
      back: "返回",
      next: "下一步",
      skip: "跳過",
      done: "完成",
      loading: "載入中...",
      error: "錯誤",
      success: "成功",
      retry: "重試",
      search: "搜尋",
      settings: "設定",
      premium: "Premium",
      pro: "PRO",
      free: "免費",
      upgrade: "升級",
      guest: "訪客",
    },
    navigation: {
      home: "首頁",
      scan: "掃描",
      history: "歷史",
      profile: "個人",
    },
    home: {
      greeting: "你好",
      todayTip: "今日小提示",
      quickActions: "快速操作",
      scanFood: "掃描食品",
      viewHistory: "查看歷史",
      healthScore: "健康分數",
      recentScans: "最近掃描",
      noScansYet: "尚未掃描任何食品",
      startScanning: "開始掃描",
      labelInspection: "Label Inspection",
      analyzeNow: "立即分析，守護健康",
      premiumMember: "Premium 會員",
      unlimitedScans: "無限次掃描",
      advancedAnalysis: "進階分析",
      weeklyScans: "本週掃描次數",
      weeklyAvg: "本週平均",
      weeklyScanDays: "每週掃描次數",
      healthGoalScore: "健康目標分數",
      thisWeekAvg: "本週平均",
      achievementBadges: "健康飲食成就徽章",
    },
    scan: {
      scanLabel: "掃描標籤",
      takePhoto: "拍照",
      analyzing: "分析中...",
      pointCamera: "將相機對準食品標籤",
      scanTip: "確保標籤清晰可見",
      freeScanUsed: "免費掃描已使用",
      upgradeToUnlock: "升級解鎖無限掃描",
      scanLimit: "掃描次數限制",
      remainingScans: "剩餘掃描次數",
    },
    results: {
      healthScore: "健康分數",
      ingredients: "成分",
      additives: "添加物",
      allergens: "過敏原",
      warnings: "警告",
      safeToEat: "可安全食用",
      caution: "注意",
      avoid: "建議避免",
      noAllergens: "未檢測到過敏原",
      noAdditives: "無添加物",
      healthAnalysis: "健康分析",
      personalizedTips: "個人化建議",
      shareResults: "分享結果",
      saveToHistory: "儲存至歷史",
    },
    history: {
      title: "掃描歷史",
      noHistory: "尚無掃描記錄",
      scanHistory: "掃描記錄",
      clearHistory: "清除歷史",
      deleteItem: "刪除項目",
      confirmDelete: "確定要刪除此項目嗎？",
      scannedOn: "掃描於",
    },
    profile: {
      title: "個人檔案",
      guestUser: "訪客用戶",
      loginRegister: "登入 / 註冊",
      enjoyFullFeatures: "享受完整功能",
      personalPreferences: "個人化偏好設定",
      customizeGoals: "自訂您的健康目標",
      totalScans: "掃描次數",
      avgScore: "平均評分",
      streakDays: "連續天數",
      healthData: "健康數據",
      healthyProducts: "健康產品",
      consecutiveScans: "連續掃描",
      account: "帳戶",
      general: "一般",
      logout: "登出",
      confirmLogout: "確定要登出嗎？",
      logoutMessage: "登出後您的掃描記錄將會保留\n下次登入時可以繼續查看",
      version: "版本",
    },
    settings: {
      title: "設定",
      personalHealth: "個人健康設定",
      notifications: "通知設定",
      privacy: "隱私與安全",
      language: "語言設定",
      helpCenter: "幫助中心",
      about: "關於 LabelX",
      restartOnboarding: "重新開始引導",
      restartOnboardingDesc: "返回歡迎頁面重新設定",
    },
    healthSettings: {
      diseaseCategories: "疾病類別設定",
      diseaseDesc: "選擇您需要特別注意的健康狀況，系統將為您檢查相關風險成分",
      healthGoals: "健康目標",
      healthGoalsDesc: "選擇您的健康飲食偏好",
      allergenSettings: "過敏原設定",
      allergenDesc: "選擇您需要避免的常見過敏原",
      customAllergen: "自訂過敏原",
      customDisease: "自訂疾病",
      customHealthGoal: "自訂健康目標",
      addNew: "新增",
      noCustomItems: "尚未新增",
      unlockAllergenAlerts: "升級解鎖過敏原提醒",
      premiumFeature: "Premium 功能：設定過敏原提醒",
      switchToSimpleMode: "切換簡易模式",
      viewFullDiseaseList: "查看 100+ 種疾病完整列表",
      selectedDiseasesCount: "已選擇 {count} 種疾病",
      diseasesCount: "{count} 種疾病",
      selected: "已選 {count}",
    },
    diseaseCategories: {
      cardiovascular: "心血管疾病",
      metabolic: "代謝性疾病",
      digestive: "消化系統疾病",
      kidney: "腎臟疾病",
      respiratory: "呼吸系統疾病",
      neurological: "神經系統疾病",
      musculoskeletal: "骨骼肌肉疾病",
      skin: "皮膚疾病",
      immune: "免疫系統疾病",
      mental: "精神心理疾病",
      cancer: "腫瘤相關",
      other: "其他常見疾病",
    },
    expandedDiseases: {
      hypertension: "高血壓",
      highCholesterol: "高血脂/高膽固醇",
      coronaryHeartDisease: "冠心病",
      heartFailure: "心力衰竭",
      arrhythmia: "心律不整",
      atherosclerosis: "動脈硬化",
      stroke: "中風/腦卒中",
      diabetes: "糖尿病",
      prediabetes: "糖尿病前期",
      metabolicSyndrome: "代謝症候群",
      obesity: "肥胖症",
      hyperthyroidism: "甲狀腺亢進",
      hypothyroidism: "甲狀腺低下",
      gout: "痛風",
      hyperuricemia: "高尿酸血症",
      gastritis: "胃炎",
      gastricUlcer: "胃潰瘍",
      gerd: "胃食道逆流",
      ibs: "腸躁症",
      ibd: "發炎性腸病",
      fattyLiver: "脂肪肝",
      liverDisease: "肝病/肝硬化",
      gallstones: "膽結石",
      pancreatitis: "胰臟炎",
      constipation: "慢性便秘",
      kidneyDisease: "慢性腎病",
      kidneyStones: "腎結石",
      nephritis: "腎炎",
      kidneyFailure: "腎衰竭",
      dialysis: "透析患者",
      asthma: "氣喘",
      copd: "慢性阻塞性肺病",
      bronchitis: "慢性支氣管炎",
      sleepApnea: "睡眠呼吸中止症",
      migraine: "偏頭痛",
      epilepsy: "癲癇",
      parkinsons: "帕金森氏症",
      alzheimers: "阿茲海默症",
      neuropathy: "神經病變",
      multipleSclerosis: "多發性硬化症",
      osteoporosis: "骨質疏鬆",
      arthritis: "關節炎",
      rheumatoidArthritis: "類風濕性關節炎",
      osteoarthritis: "退化性關節炎",
      fibromyalgia: "纖維肌痛症",
      eczema: "濕疹",
      psoriasis: "乾癬",
      acne: "痤瘡",
      rosacea: "玫瑰斑",
      dermatitis: "皮膚炎",
      urticaria: "蕁麻疹",
      lupus: "紅斑性狼瘡",
      sjogrens: "乾燥症候群",
      hashimotos: "橋本氏甲狀腺炎",
      celiac: "乳糜瀉",
      immunodeficiency: "免疫缺陷",
      anxiety: "焦慮症",
      depression: "憂鬱症",
      insomnia: "失眠症",
      eatingDisorder: "飲食障礙",
      bipolar: "雙極性情感障礙",
      cancerTreatment: "癌症治療中",
      cancerSurvivor: "癌症康復期",
      chemotherapy: "化療患者",
      anemia: "貧血",
      hemochromatosis: "血色素沉著症",
      pcos: "多囊卵巢症候群",
      endometriosis: "子宮內膜異位症",
      prostate: "前列腺疾病",
    },
    diseases: {
      kidneyDisease: "腎臟病",
      liverDisease: "肝臟病",
      skinDisease: "皮膚疾病",
      diabetes: "糖尿病",
      hypertension: "高血壓",
      highCholesterol: "高膽固醇",
      stomachSensitivity: "腸胃敏感",
      metabolicDisease: "代謝疾病",
    },
    healthGoals: {
      lowSodium: "低鈉飲食",
      lowSugar: "低糖飲食",
      highFiber: "高纖維飲食",
      lowFat: "低脂飲食",
      highProtein: "高蛋白飲食",
      weightControl: "體重控制",
      gutHealth: "腸胃健康",
    },
    allergens: {
      peanuts: "花生",
      nuts: "堅果",
      dairy: "牛奶",
      eggs: "蛋類",
      seafood: "海鮮",
      soy: "大豆",
      wheat: "小麥",
      sesame: "芝麻",
      sulfites: "亞硫酸鹽",
      preservatives: "防腐劑",
      artificialColors: "人工色素",
      artificialFlavors: "人工香料",
      msg: "味精",
      gluten: "麩質",
    },
    languageSettings: {
      title: "語言設定",
      changeLanguageNote: "變更語言後，應用程式介面將立即切換至所選語言。",
      traditionalChinese: "繁體中文",
      simplifiedChinese: "简体中文",
      english: "English",
      currentLanguage: "目前語言",
    },
    notificationSettings: {
      title: "通知設定",
      pushNotifications: "推播通知",
      allergenAlerts: "過敏原警告",
      dailyReminder: "每日提醒",
      weeklyReport: "每週報告",
      achievements: "成就通知",
    },
    privacy: {
      title: "隱私與安全",
      privacyPolicy: "隱私政策",
      termsOfService: "服務條款",
      cookiePolicy: "Cookie 政策",
      dataManagement: "資料管理",
    },
    paywall: {
      title: "解鎖 Premium",
      subtitle: "享受無限掃描和專業分析",
      unlockPremium: "解鎖 Premium 功能",
      monthlyPlan: "月付方案",
      annualPlan: "年付方案",
      bestValue: "最划算",
      perMonth: "/月",
      perYear: "/年",
      continue: "繼續",
      restore: "恢復購買",
      termsNote: "訂閱可隨時取消",
      features: {
        unlimitedScans: "無限次掃描",
        expertAnalysis: "專業成分分析",
        allergenTracking: "過敏原追蹤",
        customAllergens: "自訂過敏原",
        personalizedTips: "個性化健康建議",
        diseaseAlerts: "疾病風險警示",
        healthTrends: "健康趨勢追蹤",
      },
    },
    onboarding: {
      welcome: "歡迎使用 LabelX",
      welcomeSubtitle: "智能食品標籤掃描助手",
      getStarted: "開始使用",
      completeSetup: "完成設定",
      almostDone: "即將完成",
      skip: "跳過",
      continue: "繼續",
      step: "步驟",
      previous: "上一步",
      next: "下一步",
      finish: "完成",
      q1Title: "我不太在意食品安全？",
      q1Option1: "我不太在意",
      q1Option2: "我非常在意食品安全",
      q2Title: "您平常對食品標籤的關注程度？",
      q2Options: [
        "總是仔細閱讀所有成分",
        "偶爾會看營養標示",
        "只注意過敏原資訊",
        "只看熱量和保存期限",
        "很少注意標籤內容",
        "完全不看食品標籤",
      ],
      q3Title: "我不太在意人工色素或防腐劑",
      q3Option1: "我很在意",
      q3Option2: "我不太在意",
      q4Title: "便宜才是重點，食安的事不要想太多",
      q4Option1: "食安更重要",
      q4Option2: "便宜才是重點",
      q5Title: "我不擔心添加劑造成癌症風險",
      q5Option1: "我很擔心",
      q5Option2: "我不擔心",
      q6Title: "您的健康目標是什麼？",
      q6Subtitle: "可選擇多個目標",
      q6Options: [
        "維持健康體重",
        "改善心血管健康",
        "控制血糖",
        "降低鈉攝取",
        "增加纖維攝取",
        "增加蛋白質",
        "改善腸胃健康",
      ],
      q7Title: "您是否有以下健康狀況？",
      q7Subtitle: "可多選，幫助我們提供更精準的健康建議",
      q7Options: [
        "沒有特殊健康狀況",
        "糖尿病",
        "高血壓",
        "高膽固醇",
        "腎臟疾病",
        "肝臟疾病",
        "腸胃敏感",
        "代謝疾病",
      ],
      q8Title: "您心裡最在意誰的健康？",
      q8Subtitle: "幫助我們考慮不同年齡層的營養需求",
      q8Options: [
        "只有自己",
        "伴侶",
        "嬰幼兒 (0-3歲)",
        "學齡兒童 (4-12歲)",
        "青少年 (13-18歲)",
        "長輩 (65歲以上)",
        "孕婦",
      ],
      q9GenderTitle: "您的性別是？",
      q9GenderOptions: ["男性", "女性", "其他", "不願透露"],
      q9AgeTitle: "您的年齡層是？",
      q9AgeOptions: ["18-25歲", "26-35歲", "36-45歲", "46-55歲", "56歲以上"],
    },
    camera: {
      title: "掃描食品標籤",
      needPermission: "需要相機權限",
      permissionDesc: "請允許使用相機以掃描食品標籤",
      grantPermission: "授予權限",
      alignLabel: "將食品標籤對準框內",
      aiAnalyzing: "AI 分析中",
      recognizing: "正在識別成分和添加物",
      estimatedTime: "約需 5-10 秒",
      cancelAnalysis: "取消分析",
      complete: "完成",
      errorPhoto: "拍照失敗，請重試",
      errorPickPhoto: "選擇照片失敗，請重試",
      errorAnalysis: "無法分析此圖片，請確保照片清晰且包含食品標籤",
      selectFoodPhoto: "選擇食品照片",
      selectFromGallery: "請從相冊選擇要分析的食品照片",
      openGallery: "打開相冊",
    },
    result: {
      title: "掃描結果",
      noResult: "無掃描結果",
      returnToScan: "返回掃描",
      goodSafety: "良好安全等級",
      mediumSafety: "中等安全等級",
      highRisk: "較高風險",
      unknown: "未知",
      originalScore: "原始分數",
      adjustedScore: "調整後",
      includeInAnalysis: "納入健康分析",
      processing: "處理中...",
      includedInAnalysis: "已納入健康分析",
      productIncluded: "此產品已納入您的健康數據分析",
      continueScan: "繼續掃描",
      shareReport: "分享報告",
      ingredientAnalysis: "成分分析",
      safeIngredients: "完全成分",
      warningIngredients: "需注意成分",
      healthBenefits: "健康益處",
      healthAdvice: "健康建議",
      sharePreview: "分享預覽",
      shareTo: "分享到...",
      shareFailed: "無法分享報告，請稍後再試",
      confirmFailed: "無法確認購買，請稍後再試",
      unlockPersonalAnalysis: "解鎖個性化健康分析",
      unlockPersonalAnalysisDesc: "根據您的健康設定，為您量身打造過敏原與疾病風險警示",
      safe: "安全",
      healthy: "健康",
      caution: "注意",
      additive: "添加物",
      healthyPick: "健康優選",
      moderateIntake: "適量食用",
      suggestAvoid: "建議避免",
      safetyLevelGood: "安全等級：良好",
      safetyLevelMedium: "安全等級：中等",
      safetyLevelHigh: "安全等級：較高風險",
      safetyLevelUnknown: "安全等級：未知",
      personalizedHealthAnalysis: "個人化健康分析",
      moreHealthyIngredientsCount: "還有 {count} 項安全成分",
      confirmationFailed: "確認失敗",
      shareFailed2: "分享失敗",
      errorOccurred: "發生錯誤，請稍後再試",
      savedToRecord: "已保存到紀錄",
      saveAnalysisRecord: "保存分析紀錄",
      saveHint: "點擊保存後，此紀錄將出現在歷史紀錄中",
      diseaseKeywords: {
        kidneyDisease: "腎臟問題",
        liverDisease: "脂肪肝",
        skinDisease: "痘痘",
        diabetes: "血糖問題",
        hypertension: "血壓問題",
        highCholesterol: "膽固醇問題",
        stomachSensitivity: "腸胃敏感",
        metabolicDisease: "代謝問題",
      },
      riskLevels: {
        safe: "安全",
        moderate: "適量",
        warning: "注意",
      },
    },
    smartAlert: {
      personalizedHealthAlert: "個人化健康警示",
      matchesHealthSettings: "此產品符合您的健康設定！",
      allHealthItemsChecked: "所有健康項目已為您檢查",
      diseaseRelatedRisk: "疾病相關風險成分",
      detectedAllergens: "檢測到過敏原",
      healthGoalCheck: "健康目標檢查",
      notMet: "不符合",
      needsAttention: "需要注意",
      met: "符合",
      actual: "實際",
      recommended: "建議",
      custom: "自訂",
    },
    healthAnalysis: {
      title: "健康對齊分析",
      subtitle: "根據您的健康設定提供個性化建議",
      analyzingAlignment: "正在分析您的健康對齊度...",
      analysisFailed: "分析失敗",
      analysisFailedDesc: "無法取得健康分析。請稍後再試。",
      overallRiskAssessment: "整體風險評估",
      safe: "安全",
      cautionRequired: "需要謹慎",
      warning: "警告",
      personalizedRecommendation: "個性化建議",
      diseaseRiskAssessment: "疾病風險評估",
      lowRisk: "低風險",
      moderateRisk: "中風險",
      highRisk: "高風險",
      nutritionAlignment: "營養對齊度",
      alignsWithGoals: "符合您的目標 ✓",
      needsAttention: "需要注意 ⚠",
      recommendedActions: "建議行動",
      bestFor: "最適合對象",
      backToResults: "返回結果",
      saveAnalysis: "保存分析結果",
      analysisSaved: "健康分析已保存",
      translateToChineseHK: "翻譯英文至繁體中文",
      translating: "翻譯中...",
    },
    welcome: {
      smartScan: "智慧掃描",
      healthyChoice: "健康選擇",
      skipOnboarding: "跳過問卷，直接開始",
    },
  },

  "zh-CN": {
    common: {
      cancel: "取消",
      confirm: "确认",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      close: "关闭",
      back: "返回",
      next: "下一步",
      skip: "跳过",
      done: "完成",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      retry: "重试",
      search: "搜索",
      settings: "设置",
      premium: "Premium",
      pro: "PRO",
      free: "免费",
      upgrade: "升级",
      guest: "访客",
    },
    navigation: {
      home: "首页",
      scan: "扫描",
      history: "历史",
      profile: "我的",
    },
    home: {
      greeting: "你好",
      todayTip: "今日小贴士",
      quickActions: "快速操作",
      scanFood: "扫描食品",
      viewHistory: "查看历史",
      healthScore: "健康评分",
      recentScans: "最近扫描",
      noScansYet: "尚未扫描任何食品",
      startScanning: "开始扫描",
      labelInspection: "Label Inspection",
      analyzeNow: "立即分析，守护健康",
      premiumMember: "Premium 会员",
      unlimitedScans: "无限次扫描",
      advancedAnalysis: "进阶分析",
      weeklyScans: "本周扫描次数",
      weeklyAvg: "本周平均",
      weeklyScanDays: "每周扫描次数",
      healthGoalScore: "健康目标分数",
      thisWeekAvg: "本周平均",
      achievementBadges: "健康饮食成就徽章",
    },
    scan: {
      scanLabel: "扫描标签",
      takePhoto: "拍照",
      analyzing: "分析中...",
      pointCamera: "将相机对准食品标签",
      scanTip: "确保标签清晰可见",
      freeScanUsed: "免费扫描已使用",
      upgradeToUnlock: "升级解锁无限扫描",
      scanLimit: "扫描次数限制",
      remainingScans: "剩余扫描次数",
    },
    results: {
      healthScore: "健康评分",
      ingredients: "成分",
      additives: "添加剂",
      allergens: "过敏原",
      warnings: "警告",
      safeToEat: "可安全食用",
      caution: "注意",
      avoid: "建议避免",
      noAllergens: "未检测到过敏原",
      noAdditives: "无添加剂",
      healthAnalysis: "健康分析",
      personalizedTips: "个性化建议",
      shareResults: "分享结果",
      saveToHistory: "保存至历史",
    },
    history: {
      title: "扫描历史",
      noHistory: "暂无扫描记录",
      scanHistory: "扫描记录",
      clearHistory: "清除历史",
      deleteItem: "删除项目",
      confirmDelete: "确定要删除此项目吗？",
      scannedOn: "扫描于",
    },
    profile: {
      title: "个人资料",
      guestUser: "访客用户",
      loginRegister: "登录 / 注册",
      enjoyFullFeatures: "享受完整功能",
      personalPreferences: "个性化偏好设置",
      customizeGoals: "自定义您的健康目标",
      totalScans: "扫描次数",
      avgScore: "平均评分",
      streakDays: "连续天数",
      healthData: "健康数据",
      healthyProducts: "健康产品",
      consecutiveScans: "连续扫描",
      account: "账户",
      general: "通用",
      logout: "退出登录",
      confirmLogout: "确定要退出登录吗？",
      logoutMessage: "退出后您的扫描记录将会保留\n下次登录时可以继续查看",
      version: "版本",
    },
    settings: {
      title: "设置",
      personalHealth: "个人健康设置",
      notifications: "通知设置",
      privacy: "隐私与安全",
      language: "语言设置",
      helpCenter: "帮助中心",
      about: "关于 LabelX",
      restartOnboarding: "重新开始引导",
      restartOnboardingDesc: "返回欢迎页面重新设置",
    },
    healthSettings: {
      diseaseCategories: "疾病类别设置",
      diseaseDesc: "选择您需要特别注意的健康状况，系统将为您检查相关风险成分",
      healthGoals: "健康目标",
      healthGoalsDesc: "选择您的健康饮食偏好",
      allergenSettings: "过敏原设置",
      allergenDesc: "选择您需要避免的常见过敏原",
      customAllergen: "自定义过敏原",
      customDisease: "自定义疾病",
      customHealthGoal: "自定义健康目标",
      addNew: "添加",
      noCustomItems: "尚未添加",
      unlockAllergenAlerts: "升级解锁过敏原提醒",
      premiumFeature: "Premium 功能：设置过敏原提醒",
      switchToSimpleMode: "切换简易模式",
      viewFullDiseaseList: "查看 100+ 种疾病完整列表",
      selectedDiseasesCount: "已选择 {count} 种疾病",
      diseasesCount: "{count} 种疾病",
      selected: "已选 {count}",
    },
    diseaseCategories: {
      cardiovascular: "心血管疾病",
      metabolic: "代谢性疾病",
      digestive: "消化系统疾病",
      kidney: "肾脏疾病",
      respiratory: "呼吸系统疾病",
      neurological: "神经系统疾病",
      musculoskeletal: "骨骼肌肉疾病",
      skin: "皮肤疾病",
      immune: "免疫系统疾病",
      mental: "精神心理疾病",
      cancer: "肿瘤相关",
      other: "其他常见疾病",
    },
    expandedDiseases: {
      hypertension: "高血压",
      highCholesterol: "高血脂/高胆固醇",
      coronaryHeartDisease: "冠心病",
      heartFailure: "心力衰竭",
      arrhythmia: "心律不齐",
      atherosclerosis: "动脉硬化",
      stroke: "中风/脑卒中",
      diabetes: "糖尿病",
      prediabetes: "糖尿病前期",
      metabolicSyndrome: "代谢综合征",
      obesity: "肥胖症",
      hyperthyroidism: "甲状腺亢进",
      hypothyroidism: "甲状腺低下",
      gout: "痛风",
      hyperuricemia: "高尿酸血症",
      gastritis: "胃炎",
      gastricUlcer: "胃溃疡",
      gerd: "胃食道逆流",
      ibs: "肠易激综合征",
      ibd: "炎症性肠病",
      fattyLiver: "脂肪肝",
      liverDisease: "肝病/肝硬化",
      gallstones: "胆结石",
      pancreatitis: "胰腺炎",
      constipation: "慢性便秘",
      kidneyDisease: "慢性肾病",
      kidneyStones: "肾结石",
      nephritis: "肾炎",
      kidneyFailure: "肾衰竭",
      dialysis: "透析患者",
      asthma: "哮喘",
      copd: "慢性阻塞性肺病",
      bronchitis: "慢性支气管炎",
      sleepApnea: "睡眠呼吸暂停",
      migraine: "偏头痛",
      epilepsy: "癫痫",
      parkinsons: "帕金森病",
      alzheimers: "阿尔茨海默症",
      neuropathy: "神经病变",
      multipleSclerosis: "多发性硬化",
      osteoporosis: "骨质疏松",
      arthritis: "关节炎",
      rheumatoidArthritis: "类风湿关节炎",
      osteoarthritis: "退行性关节炎",
      fibromyalgia: "纤维肌痛",
      eczema: "湿疹",
      psoriasis: "牛皮癣",
      acne: "痤疮",
      rosacea: "玫瑰痤疮",
      dermatitis: "皮炎",
      urticaria: "荨麻疹",
      lupus: "红斑狼疮",
      sjogrens: "干燥综合征",
      hashimotos: "桥本甲状腺炎",
      celiac: "乳糜泻",
      immunodeficiency: "免疫缺陷",
      anxiety: "焦虑症",
      depression: "抑郁症",
      insomnia: "失眠症",
      eatingDisorder: "饮食障碍",
      bipolar: "双相情感障碍",
      cancerTreatment: "癌症治疗中",
      cancerSurvivor: "癌症康复期",
      chemotherapy: "化疗患者",
      anemia: "贫血",
      hemochromatosis: "血色病",
      pcos: "多囊卵巢综合征",
      endometriosis: "子宫内膜异位",
      prostate: "前列腺疾病",
    },
    diseases: {
      kidneyDisease: "肾脏病",
      liverDisease: "肝脏病",
      skinDisease: "皮肤疾病",
      diabetes: "糖尿病",
      hypertension: "高血压",
      highCholesterol: "高胆固醇",
      stomachSensitivity: "肠胃敏感",
      metabolicDisease: "代谢疾病",
    },
    healthGoals: {
      lowSodium: "低钠饮食",
      lowSugar: "低糖饮食",
      highFiber: "高纤维饮食",
      lowFat: "低脂饮食",
      highProtein: "高蛋白饮食",
      weightControl: "体重控制",
      gutHealth: "肠胃健康",
    },
    allergens: {
      peanuts: "花生",
      nuts: "坚果",
      dairy: "牛奶",
      eggs: "蛋类",
      seafood: "海鲜",
      soy: "大豆",
      wheat: "小麦",
      sesame: "芝麻",
      sulfites: "亚硫酸盐",
      preservatives: "防腐剂",
      artificialColors: "人工色素",
      artificialFlavors: "人工香料",
      msg: "味精",
      gluten: "麸质",
    },
    languageSettings: {
      title: "语言设置",
      changeLanguageNote: "更改语言后，应用程序界面将立即切换至所选语言。",
      traditionalChinese: "繁體中文",
      simplifiedChinese: "简体中文",
      english: "English",
      currentLanguage: "当前语言",
    },
    notificationSettings: {
      title: "通知设置",
      pushNotifications: "推送通知",
      allergenAlerts: "过敏原警告",
      dailyReminder: "每日提醒",
      weeklyReport: "每周报告",
      achievements: "成就通知",
    },
    privacy: {
      title: "隐私与安全",
      privacyPolicy: "隐私政策",
      termsOfService: "服务条款",
      cookiePolicy: "Cookie 政策",
      dataManagement: "数据管理",
    },
    paywall: {
      title: "解锁 Premium",
      subtitle: "享受无限扫描和专业分析",
      unlockPremium: "解锁 Premium 功能",
      monthlyPlan: "月付方案",
      annualPlan: "年付方案",
      bestValue: "最划算",
      perMonth: "/月",
      perYear: "/年",
      continue: "继续",
      restore: "恢复购买",
      termsNote: "订阅可随时取消",
      features: {
        unlimitedScans: "无限次扫描",
        expertAnalysis: "专业成分分析",
        allergenTracking: "过敏原追踪",
        customAllergens: "自定义过敏原",
        personalizedTips: "个性化健康建议",
        diseaseAlerts: "疾病风险警示",
        healthTrends: "健康趋势追踪",
      },
    },
    onboarding: {
      welcome: "欢迎使用 LabelX",
      welcomeSubtitle: "智能食品标签扫描助手",
      getStarted: "开始使用",
      completeSetup: "完成设置",
      almostDone: "即将完成",
      skip: "跳过",
      continue: "继续",
      step: "步骤",
      previous: "上一步",
      next: "下一步",
      finish: "完成",
      q1Title: "我不太在意食品安全？",
      q1Option1: "我不太在意",
      q1Option2: "我非常在意食品安全",
      q2Title: "您平常对食品标签的关注程度？",
      q2Options: [
        "总是仔细阅读所有成分",
        "偶尔会看营养标示",
        "只注意过敏原资讯",
        "只看热量和保存期限",
        "很少注意标签内容",
        "完全不看食品标签",
      ],
      q3Title: "我不太在意人工色素或防腐剂",
      q3Option1: "我很在意",
      q3Option2: "我不太在意",
      q4Title: "便宜才是重点，食安的事不要想太多",
      q4Option1: "食安更重要",
      q4Option2: "便宜才是重点",
      q5Title: "我不担心添加剂造成癌症风险",
      q5Option1: "我很担心",
      q5Option2: "我不担心",
      q6Title: "您的健康目标是什么？",
      q6Subtitle: "可选择多个目标",
      q6Options: [
        "维持健康体重",
        "改善心血管健康",
        "控制血糖",
        "降低钠摄取",
        "增加纤维摄取",
        "增加蛋白质",
        "改善肠胃健康",
      ],
      q7Title: "您是否有以下健康状况？",
      q7Subtitle: "可多选，帮助我们提供更精准的健康建议",
      q7Options: [
        "没有特殊健康状况",
        "糖尿病",
        "高血压",
        "高胆固醇",
        "肾脏疾病",
        "肝脏疾病",
        "肠胃敏感",
        "代谢疾病",
      ],
      q8Title: "您心里最在意谁的健康？",
      q8Subtitle: "帮助我们考虑不同年龄层的营养需求",
      q8Options: [
        "只有自己",
        "伴侣",
        "婴幼儿 (0-3岁)",
        "学龄儿童 (4-12岁)",
        "青少年 (13-18岁)",
        "长辈 (65岁以上)",
        "孕妇",
      ],
      q9GenderTitle: "您的性别是？",
      q9GenderOptions: ["男性", "女性", "其他", "不愿透露"],
      q9AgeTitle: "您的年龄层是？",
      q9AgeOptions: ["18-25岁", "26-35岁", "36-45岁", "46-55岁", "56岁以上"],
    },
    camera: {
      title: "扫描食品标签",
      needPermission: "需要相机权限",
      permissionDesc: "请允许使用相机以扫描食品标签",
      grantPermission: "授予权限",
      alignLabel: "将食品标签对准框内",
      aiAnalyzing: "AI 分析中",
      recognizing: "正在识别成分和添加物",
      estimatedTime: "约需 5-10 秒",
      cancelAnalysis: "取消分析",
      complete: "完成",
      errorPhoto: "拍照失败，请重试",
      errorPickPhoto: "选择照片失败，请重试",
      errorAnalysis: "无法分析此图片，请确保照片清晰且包含食品标签",
      selectFoodPhoto: "选择食品照片",
      selectFromGallery: "请从相册选择要分析的食品照片",
      openGallery: "打开相册",
    },
    result: {
      title: "扫描结果",
      noResult: "无扫描结果",
      returnToScan: "返回扫描",
      goodSafety: "良好安全等级",
      mediumSafety: "中等安全等级",
      highRisk: "较高风险",
      unknown: "未知",
      originalScore: "原始分数",
      adjustedScore: "调整后",
      includeInAnalysis: "纳入健康分析",
      processing: "处理中...",
      includedInAnalysis: "已纳入健康分析",
      productIncluded: "此产品已纳入您的健康数据分析",
      continueScan: "继续扫描",
      shareReport: "分享报告",
      ingredientAnalysis: "成分分析",
      safeIngredients: "完全成分",
      warningIngredients: "需注意成分",
      healthBenefits: "健康益处",
      healthAdvice: "健康建议",
      sharePreview: "分享预览",
      shareTo: "分享到...",
      shareFailed: "无法分享报告，请稍后再试",
      confirmFailed: "无法确认购买，请稍后再试",
      unlockPersonalAnalysis: "解锁个性化健康分析",
      unlockPersonalAnalysisDesc: "根据您的健康设定，为您量身打造过敏原与疾病风险警示",
      safe: "安全",
      healthy: "健康",
      caution: "注意",
      additive: "添加物",
      healthyPick: "健康优选",
      moderateIntake: "适量食用",
      suggestAvoid: "建议避免",
      safetyLevelGood: "安全等级：良好",
      safetyLevelMedium: "安全等级：中等",
      safetyLevelHigh: "安全等级：较高风险",
      safetyLevelUnknown: "安全等级：未知",
      personalizedHealthAnalysis: "个性化健康分析",
      moreHealthyIngredientsCount: "还有 {count} 项安全成分",
      confirmationFailed: "确认失败",
      shareFailed2: "分享失败",
      errorOccurred: "发生错误，请稍后再试",
      savedToRecord: "已保存到记录",
      saveAnalysisRecord: "保存分析记录",
      saveHint: "点击保存后，此记录将出现在历史记录中",
      diseaseKeywords: {
        kidneyDisease: "肾脏问题",
        liverDisease: "脂肪肝",
        skinDisease: "痘痘",
        diabetes: "血糖问题",
        hypertension: "血压问题",
        highCholesterol: "胆固醇问题",
        stomachSensitivity: "肠胃敏感",
        metabolicDisease: "代谢问题",
      },
      riskLevels: {
        safe: "安全",
        moderate: "适量",
        warning: "注意",
      },
    },
    smartAlert: {
      personalizedHealthAlert: "个性化健康警示",
      matchesHealthSettings: "此产品符合您的健康设定！",
      allHealthItemsChecked: "所有健康项目已为您检查",
      diseaseRelatedRisk: "疾病相关风险成分",
      detectedAllergens: "检测到过敏原",
      healthGoalCheck: "健康目标检查",
      notMet: "不符合",
      needsAttention: "需要注意",
      met: "符合",
      actual: "实际",
      recommended: "建议",
      custom: "自定义",
    },
    healthAnalysis: {
      title: "健康对齐分析",
      subtitle: "根据您的健康设定提供个性化建议",
      analyzingAlignment: "正在分析您的健康对齐度...",
      analysisFailed: "分析失败",
      analysisFailedDesc: "无法获取健康分析。请稍后再试。",
      overallRiskAssessment: "整体风险评估",
      safe: "安全",
      cautionRequired: "需要谨慎",
      warning: "警告",
      personalizedRecommendation: "个性化建议",
      diseaseRiskAssessment: "疾病风险评估",
      lowRisk: "低风险",
      moderateRisk: "中风险",
      highRisk: "高风险",
      nutritionAlignment: "营养对齐度",
      alignsWithGoals: "符合您的目标 ✓",
      needsAttention: "需要注意 ⚠",
      recommendedActions: "建议行动",
      bestFor: "最适合对象",
      backToResults: "返回结果",
      saveAnalysis: "保存分析结果",
      analysisSaved: "健康分析已保存",
      translateToChineseHK: "翻译英文至简体中文",
      translating: "翻译中...",
    },
    welcome: {
      smartScan: "智慧扫描",
      healthyChoice: "健康选择",
      skipOnboarding: "跳过问卷，直接开始",
    },
  },

  en: {
    common: {
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      close: "Close",
      back: "Back",
      next: "Next",
      skip: "Skip",
      done: "Done",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      retry: "Retry",
      search: "Search",
      settings: "Settings",
      premium: "Premium",
      pro: "PRO",
      free: "Free",
      upgrade: "Upgrade",
      guest: "Guest",
    },
    navigation: {
      home: "Home",
      scan: "Scan",
      history: "History",
      profile: "Profile",
    },
    home: {
      greeting: "Hello",
      todayTip: "Today's Tip",
      quickActions: "Quick Actions",
      scanFood: "Scan Food",
      viewHistory: "View History",
      healthScore: "Health Score",
      recentScans: "Recent Scans",
      noScansYet: "No scans yet",
      startScanning: "Start Scanning",
      labelInspection: "Label Inspection",
      analyzeNow: "Analyze now, protect your health",
      premiumMember: "Premium Member",
      unlimitedScans: "Unlimited Scans",
      advancedAnalysis: "Advanced Analysis",
      weeklyScans: "Weekly Scans",
      weeklyAvg: "Weekly Average",
      weeklyScanDays: "Weekly Scan Days",
      healthGoalScore: "Health Goal Score",
      thisWeekAvg: "This Week's Average",
      achievementBadges: "Healthy Eating Achievement Badges",
    },
    scan: {
      scanLabel: "Scan Label",
      takePhoto: "Take Photo",
      analyzing: "Analyzing...",
      pointCamera: "Point camera at food label",
      scanTip: "Make sure the label is clearly visible",
      freeScanUsed: "Free scan used",
      upgradeToUnlock: "Upgrade to unlock unlimited scans",
      scanLimit: "Scan Limit",
      remainingScans: "Remaining scans",
    },
    results: {
      healthScore: "Health Score",
      ingredients: "Ingredients",
      additives: "Additives",
      allergens: "Allergens",
      warnings: "Warnings",
      safeToEat: "Safe to Eat",
      caution: "Caution",
      avoid: "Avoid",
      noAllergens: "No allergens detected",
      noAdditives: "No additives",
      healthAnalysis: "Health Analysis",
      personalizedTips: "Personalized Tips",
      shareResults: "Share Results",
      saveToHistory: "Save to History",
    },
    history: {
      title: "Scan History",
      noHistory: "No scan history",
      scanHistory: "Scan History",
      clearHistory: "Clear History",
      deleteItem: "Delete Item",
      confirmDelete: "Are you sure you want to delete this item?",
      scannedOn: "Scanned on",
    },
    profile: {
      title: "Profile",
      guestUser: "Guest User",
      loginRegister: "Login / Register",
      enjoyFullFeatures: "Enjoy full features",
      personalPreferences: "Personal Preferences",
      customizeGoals: "Customize your health goals",
      totalScans: "Total Scans",
      avgScore: "Avg Score",
      streakDays: "Streak Days",
      healthData: "Health Data",
      healthyProducts: "Healthy Products",
      consecutiveScans: "Consecutive Scans",
      account: "Account",
      general: "General",
      logout: "Logout",
      confirmLogout: "Confirm Logout?",
      logoutMessage: "Your scan history will be preserved.\nYou can continue viewing it after logging in again.",
      version: "Version",
    },
    settings: {
      title: "Settings",
      personalHealth: "Personal Health Settings",
      notifications: "Notification Settings",
      privacy: "Privacy & Security",
      language: "Language Settings",
      helpCenter: "Help Center",
      about: "About LabelX",
      restartOnboarding: "Restart Onboarding",
      restartOnboardingDesc: "Return to welcome page to reconfigure",
    },
    healthSettings: {
      diseaseCategories: "Disease Categories",
      diseaseDesc: "Select health conditions you need to pay attention to, and we'll check for related risk ingredients",
      healthGoals: "Health Goals",
      healthGoalsDesc: "Select your healthy eating preferences",
      allergenSettings: "Allergen Settings",
      allergenDesc: "Select common allergens you need to avoid",
      customAllergen: "Custom Allergen",
      customDisease: "Custom Disease",
      customHealthGoal: "Custom Health Goal",
      addNew: "Add",
      noCustomItems: "None added yet",
      unlockAllergenAlerts: "Upgrade to unlock allergen alerts",
      premiumFeature: "Premium feature: Set allergen alerts",
      switchToSimpleMode: "Switch to Simple Mode",
      viewFullDiseaseList: "View 100+ Diseases Full List",
      selectedDiseasesCount: "{count} diseases selected",
      diseasesCount: "{count} diseases",
      selected: "{count} selected",
    },
    diseaseCategories: {
      cardiovascular: "Cardiovascular Diseases",
      metabolic: "Metabolic Diseases",
      digestive: "Digestive System Diseases",
      kidney: "Kidney Diseases",
      respiratory: "Respiratory Diseases",
      neurological: "Neurological Diseases",
      musculoskeletal: "Musculoskeletal Diseases",
      skin: "Skin Diseases",
      immune: "Immune System Diseases",
      mental: "Mental Health Conditions",
      cancer: "Cancer Related",
      other: "Other Common Diseases",
    },
    expandedDiseases: {
      hypertension: "Hypertension",
      highCholesterol: "High Cholesterol",
      coronaryHeartDisease: "Coronary Heart Disease",
      heartFailure: "Heart Failure",
      arrhythmia: "Arrhythmia",
      atherosclerosis: "Atherosclerosis",
      stroke: "Stroke",
      diabetes: "Diabetes",
      prediabetes: "Prediabetes",
      metabolicSyndrome: "Metabolic Syndrome",
      obesity: "Obesity",
      hyperthyroidism: "Hyperthyroidism",
      hypothyroidism: "Hypothyroidism",
      gout: "Gout",
      hyperuricemia: "Hyperuricemia",
      gastritis: "Gastritis",
      gastricUlcer: "Gastric Ulcer",
      gerd: "GERD",
      ibs: "Irritable Bowel Syndrome",
      ibd: "Inflammatory Bowel Disease",
      fattyLiver: "Fatty Liver",
      liverDisease: "Liver Disease/Cirrhosis",
      gallstones: "Gallstones",
      pancreatitis: "Pancreatitis",
      constipation: "Chronic Constipation",
      kidneyDisease: "Chronic Kidney Disease",
      kidneyStones: "Kidney Stones",
      nephritis: "Nephritis",
      kidneyFailure: "Kidney Failure",
      dialysis: "Dialysis Patient",
      asthma: "Asthma",
      copd: "COPD",
      bronchitis: "Chronic Bronchitis",
      sleepApnea: "Sleep Apnea",
      migraine: "Migraine",
      epilepsy: "Epilepsy",
      parkinsons: "Parkinson's Disease",
      alzheimers: "Alzheimer's Disease",
      neuropathy: "Neuropathy",
      multipleSclerosis: "Multiple Sclerosis",
      osteoporosis: "Osteoporosis",
      arthritis: "Arthritis",
      rheumatoidArthritis: "Rheumatoid Arthritis",
      osteoarthritis: "Osteoarthritis",
      fibromyalgia: "Fibromyalgia",
      eczema: "Eczema",
      psoriasis: "Psoriasis",
      acne: "Acne",
      rosacea: "Rosacea",
      dermatitis: "Dermatitis",
      urticaria: "Urticaria",
      lupus: "Lupus",
      sjogrens: "Sjögren's Syndrome",
      hashimotos: "Hashimoto's Thyroiditis",
      celiac: "Celiac Disease",
      immunodeficiency: "Immunodeficiency",
      anxiety: "Anxiety Disorder",
      depression: "Depression",
      insomnia: "Insomnia",
      eatingDisorder: "Eating Disorder",
      bipolar: "Bipolar Disorder",
      cancerTreatment: "Cancer Treatment",
      cancerSurvivor: "Cancer Survivor",
      chemotherapy: "Chemotherapy Patient",
      anemia: "Anemia",
      hemochromatosis: "Hemochromatosis",
      pcos: "PCOS",
      endometriosis: "Endometriosis",
      prostate: "Prostate Disease",
    },
    diseases: {
      kidneyDisease: "Kidney Disease",
      liverDisease: "Liver Disease",
      skinDisease: "Skin Disease",
      diabetes: "Diabetes",
      hypertension: "Hypertension",
      highCholesterol: "High Cholesterol",
      stomachSensitivity: "Stomach Sensitivity",
      metabolicDisease: "Metabolic Disease",
    },
    healthGoals: {
      lowSodium: "Low Sodium",
      lowSugar: "Low Sugar",
      highFiber: "High Fiber",
      lowFat: "Low Fat",
      highProtein: "High Protein",
      weightControl: "Weight Control",
      gutHealth: "Gut Health",
    },
    allergens: {
      peanuts: "Peanuts",
      nuts: "Nuts",
      dairy: "Dairy",
      eggs: "Eggs",
      seafood: "Seafood",
      soy: "Soy",
      wheat: "Wheat",
      sesame: "Sesame",
      sulfites: "Sulfites",
      preservatives: "Preservatives",
      artificialColors: "Artificial Colors",
      artificialFlavors: "Artificial Flavors",
      msg: "MSG",
      gluten: "Gluten",
    },
    languageSettings: {
      title: "Language Settings",
      changeLanguageNote: "After changing the language, the app interface will immediately switch to the selected language.",
      traditionalChinese: "繁體中文",
      simplifiedChinese: "简体中文",
      english: "English",
      currentLanguage: "Current Language",
    },
    notificationSettings: {
      title: "Notification Settings",
      pushNotifications: "Push Notifications",
      allergenAlerts: "Allergen Alerts",
      dailyReminder: "Daily Reminder",
      weeklyReport: "Weekly Report",
      achievements: "Achievement Notifications",
    },
    privacy: {
      title: "Privacy & Security",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      cookiePolicy: "Cookie Policy",
      dataManagement: "Data Management",
    },
    paywall: {
      title: "Unlock Premium",
      subtitle: "Enjoy unlimited scans and expert analysis",
      unlockPremium: "Unlock Premium Features",
      monthlyPlan: "Monthly Plan",
      annualPlan: "Annual Plan",
      bestValue: "Best Value",
      perMonth: "/month",
      perYear: "/year",
      continue: "Continue",
      restore: "Restore Purchase",
      termsNote: "Subscription can be canceled anytime",
      features: {
        unlimitedScans: "Unlimited Scans",
        expertAnalysis: "Expert Ingredient Analysis",
        allergenTracking: "Allergen Tracking",
        customAllergens: "Custom Allergens",
        personalizedTips: "Personalized Health Tips",
        diseaseAlerts: "Disease Risk Alerts",
        healthTrends: "Health Trend Tracking",
      },
    },
    onboarding: {
      welcome: "Welcome to LabelX",
      welcomeSubtitle: "Smart Food Label Scanning Assistant",
      getStarted: "Get Started",
      completeSetup: "Complete Setup",
      almostDone: "Almost Done",
      skip: "Skip",
      continue: "Continue",
      step: "Step",
      previous: "Previous",
      next: "Next",
      finish: "Finish",
      q1Title: "I don't care much about food safety?",
      q1Option1: "I don't really care",
      q1Option2: "I care a lot about food safety",
      q2Title: "How much attention do you pay to food labels?",
      q2Options: [
        "Always read all ingredients carefully",
        "Occasionally check nutrition labels",
        "Only look for allergen info",
        "Only check calories and expiry date",
        "Rarely notice label content",
        "Never look at food labels",
      ],
      q3Title: "I don't care much about artificial colors or preservatives",
      q3Option1: "I care a lot",
      q3Option2: "I don't really care",
      q4Title: "Cheap is what matters, don't overthink food safety",
      q4Option1: "Food safety is more important",
      q4Option2: "Cheap is what matters",
      q5Title: "I'm not worried about cancer risks from additives",
      q5Option1: "I'm very worried",
      q5Option2: "I'm not worried",
      q6Title: "What are your health goals?",
      q6Subtitle: "You can select multiple goals",
      q6Options: [
        "Maintain healthy weight",
        "Improve cardiovascular health",
        "Control blood sugar",
        "Reduce sodium intake",
        "Increase fiber intake",
        "Increase protein intake",
        "Improve gut health",
      ],
      q7Title: "Do you have any of these health conditions?",
      q7Subtitle: "Select multiple for more accurate health advice",
      q7Options: [
        "No special health conditions",
        "Diabetes",
        "High blood pressure",
        "High cholesterol",
        "Kidney disease",
        "Liver disease",
        "Digestive sensitivity",
        "Metabolic disease",
      ],
      q8Title: "Whose health do you care about most?",
      q8Subtitle: "Help us consider nutritional needs for different ages",
      q8Options: [
        "Just myself",
        "Partner",
        "Infants (0-3 years)",
        "School-age children (4-12 years)",
        "Teenagers (13-18 years)",
        "Elderly (65+ years)",
        "Pregnant women",
      ],
      q9GenderTitle: "What is your gender?",
      q9GenderOptions: ["Male", "Female", "Other", "Prefer not to say"],
      q9AgeTitle: "What is your age group?",
      q9AgeOptions: ["18-25", "26-35", "36-45", "46-55", "56+"],
    },
    camera: {
      title: "Scan Food Label",
      needPermission: "Camera Permission Required",
      permissionDesc: "Please allow camera access to scan food labels",
      grantPermission: "Grant Permission",
      alignLabel: "Align food label within the frame",
      aiAnalyzing: "AI Analyzing",
      recognizing: "Recognizing ingredients and additives",
      estimatedTime: "About 5-10 seconds",
      cancelAnalysis: "Cancel Analysis",
      complete: "Complete",
      errorPhoto: "Failed to take photo, please try again",
      errorPickPhoto: "Failed to select photo, please try again",
      errorAnalysis: "Unable to analyze this image, please ensure the photo is clear and contains a food label",
      selectFoodPhoto: "Select Food Photo",
      selectFromGallery: "Please select a food photo from gallery to analyze",
      openGallery: "Open Gallery",
    },
    result: {
      title: "Scan Results",
      noResult: "No scan results",
      returnToScan: "Return to Scan",
      goodSafety: "Good Safety Level",
      mediumSafety: "Medium Safety Level",
      highRisk: "Higher Risk",
      unknown: "Unknown",
      originalScore: "Original Score",
      adjustedScore: "Adjusted",
      includeInAnalysis: "Include in Health Analysis",
      processing: "Processing...",
      includedInAnalysis: "Included in Health Analysis",
      productIncluded: "This product has been included in your health data analysis",
      continueScan: "Continue Scanning",
      shareReport: "Share Report",
      ingredientAnalysis: "Ingredient Analysis",
      safeIngredients: "Safe Ingredients",
      warningIngredients: "Ingredients to Watch",
      healthBenefits: "Health Benefits",
      healthAdvice: "Health Advice",
      sharePreview: "Share Preview",
      shareTo: "Share to...",
      shareFailed: "Unable to share report, please try again later",
      confirmFailed: "Unable to confirm purchase, please try again later",
      unlockPersonalAnalysis: "Unlock Personalized Health Analysis",
      unlockPersonalAnalysisDesc: "Get customized allergen and disease risk alerts based on your health settings",
      safe: "Safe",
      healthy: "Healthy",
      caution: "Caution",
      additive: "Additive",
      healthyPick: "Healthy Pick",
      moderateIntake: "Moderate Intake",
      suggestAvoid: "Suggested to Avoid",
      safetyLevelGood: "Safety Level: Good",
      safetyLevelMedium: "Safety Level: Medium",
      safetyLevelHigh: "Safety Level: Higher Risk",
      safetyLevelUnknown: "Safety Level: Unknown",
      personalizedHealthAnalysis: "Personalized Health Analysis",
      moreHealthyIngredientsCount: "{count} more safe ingredients",
      confirmationFailed: "Confirmation Failed",
      shareFailed2: "Share Failed",
      errorOccurred: "An error occurred, please try again later",
      savedToRecord: "Saved to Record",
      saveAnalysisRecord: "Save Analysis Record",
      saveHint: "Tap save to add this record to history",
      diseaseKeywords: {
        kidneyDisease: "Kidney Issues",
        liverDisease: "Fatty Liver",
        skinDisease: "Acne",
        diabetes: "Blood Sugar Issues",
        hypertension: "Blood Pressure Issues",
        highCholesterol: "Cholesterol Issues",
        stomachSensitivity: "Digestive Sensitivity",
        metabolicDisease: "Metabolic Issues",
      },
      riskLevels: {
        safe: "Safe",
        moderate: "Moderate",
        warning: "Warning",
      },
    },
    smartAlert: {
      personalizedHealthAlert: "Personalized Health Alert",
      matchesHealthSettings: "This product matches your health settings!",
      allHealthItemsChecked: "All health items have been checked for you",
      diseaseRelatedRisk: "Disease-Related Risk Ingredients",
      detectedAllergens: "Detected Allergens",
      healthGoalCheck: "Health Goal Check",
      notMet: "Not Met",
      needsAttention: "Needs Attention",
      met: "Met",
      actual: "Actual",
      recommended: "Recommended",
      custom: "Custom",
    },
    healthAnalysis: {
      title: "Health Alignment Analysis",
      subtitle: "Personalized recommendations based on your health settings",
      analyzingAlignment: "Analyzing your health alignment...",
      analysisFailed: "Analysis Failed",
      analysisFailedDesc: "Unable to retrieve health analysis. Please try again later.",
      overallRiskAssessment: "Overall Risk Assessment",
      safe: "Safe",
      cautionRequired: "Caution Required",
      warning: "Warning",
      personalizedRecommendation: "Personalized Recommendation",
      diseaseRiskAssessment: "Disease Risk Assessment",
      lowRisk: "Low Risk",
      moderateRisk: "Moderate Risk",
      highRisk: "High Risk",
      nutritionAlignment: "Nutrition Alignment",
      alignsWithGoals: "Aligns with Your Goals ✓",
      needsAttention: "Needs Attention ⚠",
      recommendedActions: "Recommended Actions",
      bestFor: "Best For",
      backToResults: "Back to Results",
      saveAnalysis: "Save Analysis",
      analysisSaved: "Analysis Saved",
      translateToChineseHK: "Translate English to Traditional Chinese",
      translating: "Translating...",
    },
    welcome: {
      smartScan: "Smart Scan",
      healthyChoice: "Healthy Choice",
      skipOnboarding: "Skip and start now",
    },
  },
};

export default translations;
