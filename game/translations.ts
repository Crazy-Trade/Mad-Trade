// game/translations.ts
import { Language } from './types';

const translations = {
    en: {
        // General
        cash: 'Cash',
        netWorth: 'Net Worth',
        date: 'Date',
        close: 'Close',
        confirm: 'Confirm',
        cancel: 'Cancel',
        error: 'Error',
        success: 'Success',
        notEnoughCash: 'Not enough cash.',
        positive: 'positive',
        negative: 'negative',
        rise: 'RISE',
        fall: 'FALL',

        // Header
        language: 'FA',

        // Tabs
        markets: 'Markets',
        portfolio: 'Portfolio',
        corporate: 'Corporate',
        politics: 'Politics',
        bank: 'Bank',
        log: 'Log',
        news: 'News',

        // Country Selection
        selectCountry: 'Select Starting Country',
        startAs: 'Start as',
        taxRate: 'Tax Rate',
        companyCost: 'Company Cost',
        localMarkets: 'Local Markets',
        
        // Markets View
        all: 'All',
        assets: 'Assets',
        price: 'Price',
        change24h: '24h Change',
        actions: 'Actions',
        trade: 'Trade',
        order: 'Order',
        marketLocked: 'Market Locked',

        // Portfolio View
        spotHoldings: 'Spot Holdings',
        quantity: 'Quantity',
        avgCost: 'Avg. Cost',
        marketValue: 'Market Value',
        unrealizedPNL: 'Unrealized P/L',
        marginPositions: 'Margin Positions',
        entryPrice: 'Entry Price',
        leverage: 'Leverage',
        liquidationPrice: 'Liq. Price',
        pnl: 'P/L',
        pendingOrders: 'Pending Orders',

        // Corporate View
        corporateHoldings: 'Corporate Holdings',
        establishCompany: 'Establish New Company',
        companyName: 'Company Name',
        type: 'Type',
        level: 'Level',
        monthlyIncome: 'Monthly Income',
        upgrade: 'Upgrade',
        establish: 'Establish',
        
        // Politics View
        nationalPolitics: 'National Politics',
        currentResidency: 'Current Residency',
        politicalCapital: 'Political Capital',
        majorParties: 'Major Parties',
        politicalActions: 'Political Actions',
        donateToParty: 'Donate to Party',
        localLobbying: 'Local Lobbying',
        globalOperations: 'Global Influence Operations',
        changeResidency: 'Change Residency',

        // Bank View
        bankingServices: 'Banking Services',
        currentLoan: 'Current Loan',
        interestRate: 'Interest Rate (Annual)',
        loanLimit: 'Loan Limit',
        takeLoan: 'Take Loan',
        repayLoan: 'Repay Loan',
        amount: 'Amount',
        analyst: 'Analyst',
        marketPrediction: 'Market Prediction',
        trendAnalysis: 'Trend Analysis',
        hireAnalyst: 'Hire Analyst',
        
        // Log View
        eventLog: 'Event Log',
        
        // News View
        newsArchive: 'News Archive',
        noNews: 'No news to display.',

        // Modals
        tradeAsset: 'Trade Asset',
        buy: 'Buy',
        sell: 'Sell',
        short: 'Short',
        total: 'Total',
        max: 'Max',
        margin: 'Margin',
        placeOrder: 'Place Order',
        
        establishNewCompany: 'Establish New Company',
        companyType: 'Company Type',
        tech: 'Tech Startup',
        mining: 'Mining Operation',
        pharma: 'Pharmaceutical Lab',
        media: 'Media Group',
        finance: 'Finance Group',
        real_estate: 'Real Estate Development',
        cost: 'Cost',

        upgradeCompany: 'Upgrade Company',
        currentLevel: 'Current Level',
        nextLevel: 'Next Level',
        upgradeCost: 'Upgrade Cost',
        newIncome: 'New Monthly Income',

        immigration: 'Immigration',
        applyForResidency: 'Apply for Residency in another country',
        residencyCost: 'Residency Cost',
        minNetWorth: 'Minimum Net Worth',
        apply: 'Apply',

        donate: 'Donate',
        party: 'Party',

        breakingNews: 'BREAKING NEWS',
        acknowledge: 'Acknowledge',

        analystReport: 'Analyst Report',
        selectAsset: 'Select an asset for analysis',
        getAnalysis: 'Get Analysis',
        getPrediction: 'Get Prediction',
        // FIX: Corrected placeholder syntax for dynamic strings.
        analyst_prediction_log: 'Analyst Prediction: Our models suggest ${{assetName}} is likely to ${{prediction}} in the short term.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        analyst_analysis_log: 'Analyst Analysis for ${{assetName}}: The primary driver for this asset is its ${{impact}} correlation with ${{driver}}.',
        
        // Global Factors (user-friendly names)
        globalstability: 'Global Stability',
        useconomy: 'US Economy',
        chinaeconomy: 'China Economy',
        eueconomy: 'EU Economy',
        japaneconomy: 'Japan Economy',
        indiaeconomy: 'India Economy',
        russiaeconomy: 'Russia Economy',
        middleeasttension: 'Middle East Tension',
        asiatensions: 'Asia Tensions',
        techinnovation: 'Tech Innovation',
        globalsupplychain: 'Global Supply Chain',
        oilsupply: 'Oil Supply',
        usfedpolicy: 'US Fed Policy',
        secregulation: 'SEC Regulation',
        usjobgrowth: 'US Job Growth',
        publicsentiment: 'Public Sentiment',
        climatechangeimpact: 'Climate Change Impact',
        pharmademand: 'Pharma Demand',
        inflation: 'Inflation',
        
        // Global Influence Modal
        globalInfluence: 'Global Influence Operations',
        promote: 'Promote',
        disrupt: 'Disrupt',
        pc: 'PC',
        // FIX: Corrected placeholder syntax for dynamic strings.
        influence_success: 'SUCCESS: Our operation to ${{direction}} ${{factor}} has yielded the desired results.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        influence_fail: 'FAILURE: Our operation to ${{direction}} ${{factor}} failed to produce any significant effect.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        influence_backfire: 'DISASTER: Our operation to ${{direction}} ${{factor}} has backfired, causing the opposite effect!',

        // Time Controls
        skipDay: 'Skip to Next Day',
        play: 'Play',
        pause: 'Pause',

        // Events
        // FIX: Corrected placeholder syntax for dynamic strings.
        election_title: '${{country}} ${{year}} Presidential Election Results',
        // FIX: Corrected placeholder syntax for dynamic strings.
        election_desc: 'After a heated election season, ${{winner}} has been declared the winner. Markets are expected to react to the new administration\'s anticipated policies.',
        event_ai_breakthrough_title: "Global Tech Summit Announces Breakthrough in AI",
        event_ai_breakthrough_desc: "A major breakthrough in artificial intelligence has been announced, promising to revolutionize various industries. Tech stocks are expected to react strongly.",
        // FIX: Corrected placeholder syntax for dynamic strings.
        event_scam_title: "Fraud Allegations Surface Around ${{assetName}}",
        // FIX: Corrected placeholder syntax for dynamic strings.
        event_scam_desc: "Regulators have frozen trading for ${{assetName}} amid widespread allegations of fraud. The company's value has plummeted as investors rush to exit.",
        
        // News Ticker
        mn1_headline: 'Analysts debate the impact of recent inflation data on consumer spending.',
        mn1_source: 'Market Watch',
        mn2_headline: 'Minor disruptions reported in key shipping lanes, but supply chains remain stable.',
        mn2_source: 'Global Trade Org',
        mn3_headline: 'Speculation grows about the next generation of consumer electronics.',
        mn3_source: 'Tech Chronicle',
        mn4_headline: 'OPEC+ meeting concludes with no change to production quotas.',
        mn4_source: 'Energy Tribune',
        mn5_headline: 'Central bank hints at maintaining current interest rates for the foreseeable future.',
        mn5_source: 'Financial Times',
        mn6_headline: 'Early-stage clinical trial for a new drug shows promising, but inconclusive, results.',
        mn6_source: 'Pharma Journal',
        mn7_headline: 'Diplomatic talks between two nations conclude with a statement of mutual cooperation.',
        mn7_source: 'World News',
        mn8_headline: 'New report suggests a slight increase in global manufacturing output.',
        mn8_source: 'Economic Forum',
        
        // Company Generated News
        // FIX: Corrected placeholder syntax for dynamic strings.
        cntech: '${{companyName}} announces a breakthrough in their flagship software, boosting productivity.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        cnmining: 'A new, highly efficient extraction method has been patented by ${{companyName}}.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        cnpharma: '${{companyName}} reports highly successful Phase II trials for their new blockbuster drug.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        cnmedia: 'Hit show from ${{companyName}} breaks viewership records worldwide.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        cnfinance: '${{companyName}} algorithm correctly predicts market micro-trend, yielding massive returns.',
        // FIX: Corrected placeholder syntax for dynamic strings.
        cnreal_estate: 'Luxury development by ${{companyName}} sells out in record time, setting new price benchmarks.',
    },
    // FIX: Corrected all key-value pairs in the 'fa' object to use colons instead of commas, and fixed placeholder syntax.
    fa: {
        // General
        cash: 'وجه نقد',
        netWorth: 'ارزش خالص دارایی',
        date: 'تاریخ',
        close: 'بستن',
        confirm: 'تایید',
        cancel: 'لغو',
        error: 'خطا',
        success: 'موفقیت',
        notEnoughCash: 'وجه نقد کافی نیست.',
        positive: 'مثبت',
        negative: 'منفی',
        rise: 'افزایش',
        fall: 'کاهش',

        // Header
        language: 'EN',

        // Tabs
        markets: 'بازارها',
        portfolio: 'سبد سهام',
        corporate: 'شرکت‌ها',
        politics: 'سیاست',
        bank: 'بانک',
        log: 'وقایع',
        news: 'اخبار',

        // Country Selection
        selectCountry: 'کشور محل اقامت خود را انتخاب کنید',
        startAs: 'شروع به عنوان',
        taxRate: 'نرخ مالیات',
        companyCost: 'هزینه شرکت',
        localMarkets: 'بازارهای محلی',

        // Markets View
        all: 'همه',
        assets: 'دارایی‌ها',
        price: 'قیمت',
        change24h: 'تغییر ۲۴ ساعته',
        actions: 'عملیات',
        trade: 'معامله',
        order: 'سفارش',
        marketLocked: 'بازار قفل شده',

        // Portfolio View
        spotHoldings: 'دارایی‌های نقدی',
        quantity: 'تعداد',
        avgCost: 'قیمت تمام شده',
        marketValue: 'ارزش بازار',
        unrealizedPNL: 'سود/زیان محقق نشده',
        marginPositions: 'پوزیشن‌های اهرمی',
        entryPrice: 'قیمت ورود',
        leverage: 'اهرم',
        liquidationPrice: 'قیمت لیکویید شدن',
        pnl: 'سود/زیان',
        pendingOrders: 'سفارشات در انتظار',

        // Corporate View
        corporateHoldings: 'دارایی‌های شرکتی',
        establishCompany: 'تاسیس شرکت جدید',
        companyName: 'نام شرکت',
        type: 'نوع',
        level: 'سطح',
        monthlyIncome: 'درآمد ماهانه',
        upgrade: 'ارتقا',
        establish: 'تاسیس',

        // Politics View
        nationalPolitics: 'سیاست ملی',
        currentResidency: 'اقامت فعلی',
        politicalCapital: 'سرمایه سیاسی',
        majorParties: 'احزاب اصلی',
        politicalActions: 'اقدامات سیاسی',
        donateToParty: 'کمک مالی به حزب',
        localLobbying: 'لابی‌گری محلی',
        globalOperations: 'عملیات نفوذ جهانی',
        changeResidency: 'تغییر اقامت',

        // Bank View
        bankingServices: 'خدمات بانکی',
        currentLoan: 'وام فعلی',
        interestRate: 'نرخ بهره (سالانه)',
        loanLimit: 'سقف وام',
        takeLoan: 'دریافت وام',
        repayLoan: 'بازپرداخت وام',
        amount: 'مبلغ',
        analyst: 'تحلیلگر',
        marketPrediction: 'پیش‌بینی بازار',
        trendAnalysis: 'تحلیل روند',
        hireAnalyst: 'استخدام تحلیلگر',

        // Log View
        eventLog: 'گزارش رویدادها',
        
        // News View
        newsArchive: 'آرشیو اخبار',
        noNews: 'خبری برای نمایش وجود ندارد.',

        // Modals
        tradeAsset: 'معامله دارایی',
        buy: 'خرید',
        sell: 'فروش',
        short: 'فروش استقراضی',
        total: 'مجموع',
        max: 'حداکثر',
        margin: 'مارجین',
        placeOrder: 'ثبت سفارش',

        establishNewCompany: 'تاسیس شرکت جدید',
        companyType: 'نوع شرکت',
        tech: 'استارتاپ تکنولوژی',
        mining: 'عملیات استخراج معدن',
        pharma: 'آزمایشگاه داروسازی',
        media: 'گروه رسانه‌ای',
        finance: 'گروه مالی',
        real_estate: 'توسعه املاک و مستغلات',
        cost: 'هزینه',
        
        upgradeCompany: 'ارتقای شرکت',
        currentLevel: 'سطح فعلی',
        nextLevel: 'سطح بعدی',
        upgradeCost: 'هزینه ارتقا',
        newIncome: 'درآمد ماهانه جدید',

        immigration: 'مهاجرت',
        applyForResidency: 'درخواست اقامت در کشور دیگر',
        residencyCost: 'هزینه اقامت',
        minNetWorth: 'حداقل ارزش خالص دارایی',
        apply: 'درخواست',

        donate: 'کمک مالی',
        party: 'حزب',

        breakingNews: 'خبر فوری',
        acknowledge: 'متوجه شدم',
        
        analystReport: 'گزارش تحلیلگر',
        selectAsset: 'یک دارایی برای تحلیل انتخاب کنید',
        getAnalysis: 'دریافت تحلیل',
        getPrediction: 'دریافت پیش‌بینی',
        analyst_prediction_log: 'پیش‌بینی تحلیلگر: مدل‌های ما نشان می‌دهد که ${{assetName}} در کوتاه‌مدت احتمالاً ${{prediction}} خواهد داشت.',
        analyst_analysis_log: 'تحلیل برای ${{assetName}}: عامل اصلی برای این دارایی، همبستگی ${{impact}} آن با ${{driver}} است.',
        
        // Global Factors (user-friendly names)
        globalstability: 'ثبات جهانی',
        useconomy: 'اقتصاد آمریکا',
        chinaeconomy: 'اقتصاد چین',
        eueconomy: 'اقتصاد اروپا',
        japaneconomy: 'اقتصاد ژاپن',
        indiaeconomy: 'اقتصاد هند',
        russiaeconomy: 'اقتصاد روسیه',
        middleeasttension: 'تنش در خاورمیانه',
        asiatensions: 'تنش در آسیا',
        techinnovation: 'نوآوری در فناوری',
        globalsupplychain: 'زنجیره تامین جهانی',
        oilsupply: 'عرضه نفت',
        usfedpolicy: 'سیاست فدرال رزرو آمریکا',
        secregulation: 'مقررات SEC',
        usjobgrowth: 'رشد شغلی در آمریکا',
        publicsentiment: 'احساسات عمومی',
        climatechangeimpact: 'تأثیر تغییرات اقلیمی',
        pharmademand: 'تقاضا برای دارو',
        inflation: 'تورم',

        // Global Influence Modal
        globalInfluence: 'عملیات نفوذ جهانی',
        promote: 'ترویج',
        disrupt: 'اخلال',
        pc: 'سرمایه سیاسی',
        influence_success: 'موفقیت: عملیات ما برای ${{direction}} در ${{factor}} به نتایج مطلوب دست یافت.',
        influence_fail: 'شکست: عملیات ما برای ${{direction}} در ${{factor}} نتوانست تأثیر قابل توجهی داشته باشد.',
        influence_backfire: 'فاجعه: عملیات ما برای ${{direction}} در ${{factor}} نتیجه معکوس داد و باعث اثر متضاد شد!',
        
        // Time Controls
        skipDay: 'پرش به روز بعد',
        play: 'اجرا',
        pause: 'توقف',

        // Events
        election_title: 'نتایج انتخابات ریاست جمهوری ${{year}} ${{country}}',
        election_desc: 'پس از یک فصل انتخاباتی داغ، ${{winner}} به عنوان برنده اعلام شد. انتظار می‌رود بازارها به سیاست‌های پیش‌بینی شده دولت جدید واکنش نشان دهند.',
        event_ai_breakthrough_title: "اجلاس جهانی فناوری از پیشرفت بزرگ در هوش مصنوعی خبر داد",
        event_ai_breakthrough_desc: "یک پیشرفت بزرگ در هوش مصنوعی اعلام شده است که قول می‌دهد صنایع مختلف را متحول کند. انتظار می‌رود سهام شرکت‌های فناوری به شدت واکنش نشان دهند.",
        event_scam_title: "ادعای کلاهبرداری در مورد ${{assetName}} مطرح شد",
        event_scam_desc: "نهادهای نظارتی معاملات ${{assetName}} را در بحبوحه ادعاهای گسترده کلاهبرداری متوقف کرده‌اند. ارزش شرکت با خروج سرمایه‌گذاران به شدت سقوط کرده است.",

        // News Ticker
        mn1_headline: 'تحلیلگران در مورد تأثیر داده‌های اخیر تورم بر هزینه‌های مصرف‌کننده بحث می‌کنند.',
        mn1_source: 'دیده‌بان بازار',
        mn2_headline: 'اختلالات جزئی در مسیرهای اصلی کشتیرانی گزارش شده، اما زنجیره‌های تأمین پایدار باقی مانده‌اند.',
        mn2_source: 'سازمان تجارت جهانی',
        mn3_headline: 'گمانه‌زنی‌ها در مورد نسل بعدی لوازم الکترونیکی مصرفی در حال افزایش است.',
        mn3_source: 'وقایع‌نامه فناوری',
        mn4_headline: 'نشست اوپک پلاس بدون تغییر در سهمیه‌های تولید به پایان رسید.',
        mn4_source: 'تریبون انرژی',
        mn5_headline: 'بانک مرکزی به حفظ نرخ‌های بهره فعلی در آینده قابل پیش‌بینی اشاره کرد.',
        mn5_source: 'فایننشال تایمز',
        mn6_headline: 'آزمایش بالینی مرحله اولیه برای یک داروی جدید نتایج امیدوارکننده اما غیرقطعی نشان می‌دهد.',
        mn6_source: 'مجله داروسازی',
        mn7_headline: 'مذاکرات دیپلماتیک بین دو کشور با بیانیه‌ای مبنی بر همکاری متقابل به پایان رسید.',
        mn7_source: 'اخبار جهان',
        mn8_headline: 'گزارش جدید حاکی از افزایش جزئی در تولیدات صنعتی جهانی است.',
        mn8_source: 'مجمع اقتصادی',

        // Company Generated News
        cntech: '${{companyName}} از یک پیشرفت در نرم‌افزار پرچمدار خود خبر داد که بهره‌وری را افزایش می‌دهد.',
        cnmining: 'یک روش استخراج جدید و بسیار کارآمد توسط ${{companyName}} به ثبت رسید.',
        cnpharma: '${{companyName}} از آزمایش‌های فاز دوم بسیار موفق برای داروی پرفروش جدید خود خبر داد.',
        cnmedia: 'سریال موفق ${{companyName}} رکوردهای تماشا را در سراسر جهان شکست.',
        cnfinance: 'الگوریتم ${{companyName}} یک روند کوچک در بازار را به درستی پیش‌بینی کرد و بازدهی عظیمی به همراه داشت.',
        cnreal_estate: 'پروژه لوکس ${{companyName}} در زمان رکورد به فروش رفت و معیارهای جدیدی برای قیمت تعیین کرد.',
    },
};

export const t = (key: keyof typeof translations.en, lang: Language, options?: Record<string, string | number>) => {
    let translation = translations[lang][key] || key;
    if (options && typeof translation === 'string') {
        Object.keys(options).forEach(optionKey => {
            const regex = new RegExp(`\\$\\{\\{${optionKey}\\}\\}`, 'g');
            translation = translation.replace(regex, String(options[optionKey]));
        });
    }
    return translation;
}
