// game/translations.ts
import { Language } from './types';

type Translations = {
    [key: string]: {
        [lang in Language]?: string;
    };
};

const translations: Translations = {
    // General UI
    save: { en: 'Save', fa: 'ذخیره' },
    quit: { en: 'Quit', fa: 'خروج' },
    deleteSave: { en: 'Delete Save', fa: 'حذف ذخیره' },
    language: { en: 'فارسی', fa: 'English' },
    cash: { en: 'Cash', fa: 'پول نقد' },
    netWorth: { en: 'Net Worth', fa: 'ارزش خالص' },
    date: { en: 'Date', fa: 'تاریخ' },
    confirm: { en: 'Confirm', fa: 'تایید' },
    actions: { en: 'Actions', fa: 'عملیات' },
    optional: { en: 'Optional', fa: 'اختیاری' },
    cost: { en: 'Cost', fa: 'هزینه' },
    price: { en: 'Price', fa: 'قیمت' },
    type: { en: 'Type', fa: 'نوع' },
    quantity: { en: 'Quantity', fa: 'مقدار' },
    total: { en: 'Total', fa: 'مجموع' },
    level: { en: 'Level', fa: 'سطح' },
    pc: { en: 'PC', fa: 'سرمایه سیاسی'},
    
    // Tabs
    markets: { en: 'Markets', fa: 'بازارها' },
    portfolio: { en: 'Portfolio', fa: 'سبد دارایی' },
    corporate: { en: 'Corporate', fa: 'شرکتی' },
    politics: { en: 'Politics', fa: 'سیاست' },
    bank: { en: 'Bank', fa: 'بانک' },
    news: { en: 'News', fa: 'اخبار' },
    log: { en: 'Log', fa: 'وقایع' },

    // Country Selection
    selectCountry: { en: 'Select Country of Origin', fa: 'کشور مبدا را انتخاب کنید' },
    enterYourName: { en: 'Enter your name to begin.', fa: 'برای شروع نام خود را وارد کنید.' },
    taxRate: { en: 'Tax Rate', fa: 'نرخ مالیات' },
    companyCost: { en: 'Company Cost', fa: 'هزینه شرکت' },

    // Time Controls
    simulating: { en: 'Simulating...', fa: 'شبیه‌سازی...' },
    play: { en: 'Play', fa: 'پخش' },
    pause: { en: 'Pause', fa: 'مکث' },
    skipDay: { en: 'Skip 1 Day', fa: '۱ روز بعد' },
    skip1Week: { en: '1 Week', fa: '۱ هفته' },
    skip2Weeks: { en: '2 Weeks', fa: '۲ هفته' },
    
    // News
    breakingNews: { en: 'BREAKING NEWS', fa: 'خبر فوری' },
    newsArchive: { en: 'News Archive', fa: 'آرشیو اخبار' },
    noNews: { en: 'No news to display.', fa: 'خبری برای نمایش وجود ندارد.' },

    // Markets View
    assets: { en: 'Asset', fa: 'دارایی' },
    change24h: { en: '24h Change', fa: 'تغییر ۲۴ ساعته' },
    marketLocked: { en: 'Market Locked', fa: 'بازار قفل شده' },
    all: { en: 'All', fa: 'همه' },
    tech: { en: 'Tech', fa: 'تکنولوژی' },
    commodity: { en: 'Commodity', fa: 'کالا' },
    crypto: { en: 'Crypto', fa: 'ارز دیجیتال' },
    pharma: { en: 'Pharma', fa: 'دارو' },
    'real estate': { en: 'Real Estate', fa: 'املاک' },
    global: { en: 'Global', fa: 'جهانی' },
    industrial: { en: 'Industrial', fa: 'صنعتی' },
    consumer: { en: 'Consumer', fa: 'مصرفی' },
    finance: { en: 'Finance', fa: 'مالی' },

    // Modals
    trade: { en: 'Trade', fa: 'معامله' },
    order: { en: 'Order', fa: 'سفارش' },
    chart: { en: 'Chart', fa: 'نمودار' },
    buy: { en: 'Buy', fa: 'خرید' },
    sell: { en: 'Sell', fa: 'فروش' },
    short: { en: 'Short', fa: 'فروش استقراضی' },
    leverage: { en: 'Leverage', fa: 'اهرم' },
    stopLoss: { en: 'Stop Loss', fa: 'حد ضرر' },
    takeProfit: { en: 'Take Profit', fa: 'حد سود' },
    margin: { en: 'Margin', fa: 'مارجین' },
    max: { en: 'Max', fa: 'حداکثر' },
    placeOrder: { en: 'Place Order', fa: 'ثبت سفارش' },
    
    // Portfolio
    spotHoldings: { en: 'Spot Holdings', fa: 'دارایی‌های نقدی' },
    avgCost: { en: 'Avg. Cost', fa: 'میانگین هزینه' },
    marketValue: { en: 'Market Value', fa: 'ارزش بازار' },
    unrealizedPNL: { en: 'Unrealized P/L', fa: 'سود/زیان محقق نشده' },
    marginPositions: { en: 'Margin Positions', fa: 'موقعیت‌های مارجین' },
    entryPrice: { en: 'Entry Price', fa: 'قیمت ورود' },
    liquidationPrice: { en: 'Liq. Price', fa: 'قیمت لیکویید' },
    pnl: { en: 'P/L', fa: 'سود/زیان' },
    close: { en: 'Close', fa: 'بستن' },
    pendingOrders: { en: 'Pending Orders', fa: 'سفارشات در انتظار' },

    // Corporate
    corporateHoldings: { en: 'Corporate Holdings', fa: 'دارایی‌های شرکتی' },
    companyName: { en: 'Company Name', fa: 'نام شرکت' },
    monthlyIncome: { en: 'Monthly Income', fa: 'درآمد ماهانه' },
    manage: { en: 'Manage', fa: 'مدیریت' },
    upgrade: { en: 'Upgrade', fa: 'ارتقا' },
    establishCompany: { en: 'Establish Company', fa: 'تاسیس شرکت' },
    establish: { en: 'Establish', fa: 'تاسیس' },
    establishNewCompany: { en: 'Establish New Company', fa: 'تاسیس شرکت جدید' },
    companyType: { en: 'Company Type', fa: 'نوع شرکت' },
    mining: { en: 'Mining', fa: 'معدن' },
    media: { en: 'Media', fa: 'رسانه' },
    real_estate: { en: 'Real Estate', fa: 'املاک' },
    
    // Politics
    nationalPolitics: { en: 'National Politics', fa: 'سیاست داخلی' },
    currentResidency: { en: 'Current Residency', fa: 'اقامت فعلی' },
    politicalCapital: { en: 'Political Capital', fa: 'سرمایه سیاسی' },
    majorParties: { en: 'Major Parties', fa: 'احزاب اصلی' },
    politicalActions: { en: 'Political Actions', fa: 'اقدامات سیاسی' },
    donateToParty: { en: 'Donate to Party', fa: 'کمک مالی به حزب' },
    localLobbying: { en: 'Local Lobbying', fa: 'لابی‌گری محلی' },
    globalOperations: { en: 'Global Operations', fa: 'عملیات جهانی' },
    changeResidency: { en: 'Change Residency', fa: 'تغییر اقامت' },
    donate: { en: 'Donate', fa: 'کمک مالی' },
    
    // Bank
    standardLoan: { en: 'Standard Loan', fa: 'وام استاندارد' },
    loanBalance: { en: 'Loan Balance', fa: 'موجودی وام' },
    interestRate: { en: 'Interest Rate', fa: 'نرخ بهره' },
    maxLoan: { en: 'Max Loan', fa: 'حداکثر وام' },
    takeLoan: { en: 'Take Loan', fa: 'دریافت وام' },
    repayLoan: { en: 'Repay Loan', fa: 'بازپرداخت وام' },
    deferPayment: { en: 'Defer Payment', fa: 'تعویق پرداخت' },
    analystDesk: { en: 'Analyst Desk', fa: 'میز تحلیلگر' },
    
    // Analyst Modal
    trendAnalysis: { en: 'Trend Analysis', fa: 'تحلیل روند' },
    marketPrediction: { en: 'Market Prediction', fa: 'پیش‌بینی بازار' },
    
    // Log
    eventLog: { en: 'Event Log', fa: 'گزارش رویدادها' },
    trades: { en: 'Trades', fa: 'معاملات' },
    system: { en: 'System', fa: 'سیستم' },
    
    // Confirmations
    saveConfirmation: { en: 'Game Saved!', fa: 'بازی ذخیره شد!' },
    quitConfirmation: { en: 'Are you sure you want to quit? Unsaved progress will be lost.', fa: 'آیا مطمئنید می خواهید خارج شوید؟ پیشرفت ذخیره نشده از بین خواهد رفت.' },
    deleteConfirmation: { en: 'Are you sure you want to delete your save file? This action is irreversible.', fa: 'آیا مطمئن هستید که می خواهید فایل ذخیره خود را حذف کنید؟ این عمل غیرقابل بازگشت است.' },
    acknowledge: { en: 'Acknowledge', fa: 'متوجه شدم' },

    // Misc
    positive: { en: 'positive', fa: 'مثبت'},
    negative: { en: 'negative', fa: 'منفی'},
    
    // Immigration
    immigration: { en: 'Immigration', fa: 'مهاجرت' },
    applyForResidency: { en: 'Apply for Residency', fa: 'درخواست اقامت' },
    residencyCost: { en: 'Residency Cost', fa: 'هزینه اقامت' },
    apply: { en: 'Apply', fa: 'درخواست' },
    
    // Upgrade Company
    currentLevel: { en: 'Current Level', fa: 'سطح فعلی' },
    nextLevel: { en: 'Next Level', fa: 'سطح بعدی' },
    newIncome: { en: 'New Income', fa: 'درآمد جدید' },
    upgradeCost: { en: 'Upgrade Cost', fa: 'هزینه ارتقا' },

    // Company Management
    companyManagement: { en: 'Company Management', fa: 'مدیریت شرکت' },
    strategicActions: { en: 'Strategic Actions', fa: 'اقدامات استراتژیک' },
    marketingCampaign: { en: 'Marketing Campaign', fa: 'کمپین بازاریابی' },
    launch: { en: 'Launch', fa: 'راه اندازی' },
    researchAndDevelopment: { en: 'R&D', fa: 'تحقیق و توسعه' },
    invest: { en: 'Invest', fa: 'سرمایه گذاری' },
    governmentLobbying: { en: 'Government Lobbying', fa: 'لابی گری دولتی' },
    lobby: { en: 'Lobby', fa: 'لابی' },

    // Lobbying Modal
    selectAnIndustry: { en: 'Select an industry...', fa: 'یک صنعت را انتخاب کنید...' },

    // Global Influence
    globalInfluence: { en: 'Global Influence', fa: 'نفوذ جهانی' },
    promote: { en: 'Promote', fa: 'ترویج' },
    disrupt: { en: 'Disrupt', fa: 'مختل کردن' },

    // Chart Modal
    priceChart: { en: 'Price Chart', fa: 'نمودار قیمت' },
    noData: { en: 'Not enough data to display chart.', fa: 'داده کافی برای نمایش نمودار وجود ندارد.' },
    sma: { en: '7-Period SMA', fa: 'میانگین متحرک ساده ۷ دوره ای' },
    threeDays: { en: '3D', fa: '۳ روز' },
    oneWeek: { en: '1W', fa: '۱ هفته' },
    oneYear: { en: '1Y', fa: '۱ سال' },

    // Penalty Modal
    loanAbuseTitle: { en: 'Penalty for Loan Abuse', fa: 'جریمه سوء استفاده از وام' },
    loanAbuseDesc: { en: 'Your rapid loan activities have been flagged as suspicious. You must choose a penalty.', fa: 'فعالیت های سریع وام شما مشکوک تشخیص داده شده است. شما باید یک جریمه را انتخاب کنید.' },
    penaltyOptionFine: { en: 'Pay Fine', fa: 'پرداخت جریمه' },
    penaltyOptionBan: { en: 'Accept Ban', fa: 'پذیرش ممنوعیت' },
    
    // Game Over
    gameOver: { en: 'Game Over', fa: 'بازی تمام شد' },
    gameOverExecuted: { en: 'For your crimes against the state and financial system, you have been executed.', fa: 'به دلیل جنایات شما علیه دولت و سیستم مالی، شما اعدام شدید.' },
    gameOverImprisoned: { en: 'Your financial manipulations have led to your downfall. You will spend the rest of your life in prison.', fa: 'دستکاری های مالی شما منجر به سقوط شما شد. بقیه عمر خود را در زندان سپری خواهید کرد.' },
    startNewGame: { en: 'Start New Game', fa: 'شروع بازی جدید' },

    // Event Keys
    event_tech_summit_title: {en: 'Global Tech Summit Concludes', fa: 'اجلاس جهانی فناوری به پایان رسید' },
    event_tech_summit_desc: { en: 'A major international technology summit has concluded, with breakthroughs announced in AI and quantum computing, boosting investor confidence in the tech sector.', fa: 'یک اجلاس بزرگ بین‌المللی فناوری با اعلام پیشرفت‌هایی در هوش مصنوعی و محاسبات کوانتومی به پایان رسید و اعتماد سرمایه‌گذاران به بخش فناوری را افزایش داد.'},
    event_us_fed_hike_title: {en: 'US Federal Reserve Announces Surprise Rate Hike', fa: 'بانک مرکزی آمریکا افزایش غیرمنتظره نرخ بهره را اعلام کرد'},
    event_us_fed_hike_desc: {en: 'In a move to combat rising inflation, the US Federal Reserve has unexpectedly raised interest rates by 50 basis points, sending shockwaves through global markets.', fa: 'بانک مرکزی آمریکا در اقدامی برای مبارزه با تورم فزاینده، نرخ بهره را به طور غیرمنتظره‌ای ۵۰ واحد پایه افزایش داد و بازارهای جهانی را در شوک فرو برد.'},
    event_china_5_year_plan_title: {en: 'China Unveils Ambitious 5-Year Plan', fa: 'چین از برنامه ۵ ساله بلندپروازانه خود رونمایی کرد'},
    event_china_5_year_plan_desc: {en: 'China has released its new five-year plan, emphasizing technological self-reliance and domestic consumption, signaling a major strategic shift for the world\'s second-largest economy.', fa: 'چین برنامه پنج ساله جدید خود را با تاکید بر خودکفایی فناورانه و مصرف داخلی منتشر کرد که نشان دهنده یک تغییر استراتژیک بزرگ برای دومین اقتصاد بزرگ جهان است.'},
    event_opec_cuts_title: {en: 'OPEC+ Announces Surprise Production Cuts', fa: 'اوپک پلاس کاهش غیرمنتظره تولید را اعلام کرد'},
    event_opec_cuts_desc: {en: 'OPEC+ has announced a surprise decision to cut oil production by 2 million barrels per day, sending oil prices soaring.', fa: 'اوپک پلاس تصمیم غیرمنتظره‌ای برای کاهش تولید نفت به میزان ۲ میلیون بشکه در روز را اعلام کرد که باعث افزایش شدید قیمت نفت شد.'},
    event_eu_trade_deal_title: {en: 'EU Signs Major New Trade Deal', fa: 'اتحادیه اروپا قرارداد تجاری بزرگ جدیدی را امضا کرد'},
    event_eu_trade_deal_desc: {en: 'The European Union has finalized a major trade agreement with a key partner, expected to ease supply chain pressures and boost the European economy.', fa: 'اتحادیه اروپا یک توافقنامه تجاری بزرگ با یک شریک کلیدی را نهایی کرده است که انتظار می‌رود فشارهای زنجیره تامین را کاهش داده و اقتصاد اروپا را تقویت کند.'},
    event_cyber_attack_title: {en: 'Major Financial Institutions Hit by Cyber Attack', fa: 'موسسات مالی بزرگ هدف حمله سایبری قرار گرفتند'},
    event_cyber_attack_desc: {en: 'A coordinated cyber attack has targeted major banks and exchanges, causing temporary outages and shaking investor confidence in market security.', fa: 'یک حمله سایبری هماهنگ، بانک‌ها و بورس‌های بزرگ را هدف قرار داده و باعث قطعی‌های موقت و تزلزل اعتماد سرمایه‌گذاران به امنیت بازار شده است.'},
    event_green_energy_title: {en: 'Breakthrough in Green Energy Storage', fa: 'پیشرفت در ذخیره‌سازی انرژی سبز'},
    event_green_energy_desc: {en: 'Scientists have announced a major breakthrough in battery technology, promising cheaper and more efficient energy storage, boosting the renewable energy sector.', fa: 'دانشمندان از یک پیشرفت بزرگ در فناوری باتری خبر داده‌اند که نویدبخش ذخیره‌سازی انرژی ارزان‌تر و کارآمدتر است و بخش انرژی‌های تجدیدپذیر را تقویت می‌کند.'},
    event_g7_summit_title: {en: 'G7 Summit Ends with Joint Declaration on Stability', fa: 'اجلاس G7 با بیانیه مشترک در مورد ثبات به پایان رسید'},
    event_g7_summit_desc: {en: 'Leaders of the G7 nations have concluded their summit, issuing a joint declaration to coordinate efforts to ensure global economic stability.', fa: 'رهبران کشورهای G7 اجلاس خود را با صدور بیانیه‌ای مشترک برای هماهنگی تلاش‌ها برای تضمین ثبات اقتصادی جهانی به پایان رساندند.'},
    event_inflation_surprise_title: {en: 'Inflation Data Comes in Hotter Than Expected', fa: 'داده‌های تورم داغ‌تر از حد انتظار منتشر شد'},
    event_inflation_surprise_desc: {en: 'The latest inflation report shows prices rising faster than economists predicted, increasing pressure on central banks to take action.', fa: 'آخرین گزارش تورم نشان می‌دهد که قیمت‌ها سریع‌تر از پیش‌بینی اقتصاددانان در حال افزایش است و فشار بر بانک‌های مرکزی برای اقدام را افزایش می‌دهد.'},

    electionResults: {en: 'Election Results Are In', fa: 'نتایج انتخابات مشخص شد'},
    election_description: {en: 'After a tense election season in {countryName}, the {winnerName} party has secured a majority and will form the next government.', fa: 'پس از یک فصل انتخاباتی پرتنش در {countryName}، حزب {winnerName} اکثریت را به دست آورد و دولت بعدی را تشکیل خواهد داد.'},
    company_news_positive: {en: '{companyName} reports record profits and announces a new strategic partnership, boosting its market outlook.', fa: '{companyName} سود بی‌سابقه‌ای را گزارش کرده و از یک همکاری استراتژیک جدید خبر می‌دهد که چشم‌انداز بازار آن را بهبود می‌بخشد.'},
    news_earnings_strong: {en: '{assetName} reports stronger than expected Q3 earnings.', fa: '{assetName} درآمدهای سه ماهه سوم قوی‌تر از حد انتظار را گزارش می‌دهد.'},
    news_investigation: {en: '{assetName} faces government investigation over alleged monopolistic practices.', fa: '{assetName} به دلیل اتهامات مربوط به اقدامات انحصاری با تحقیقات دولتی روبرو است.'},
    news_positive_outlook: {en: 'Analysts upgrade {assetName} to "strong buy" citing positive long-term outlook.', fa: 'تحلیلگران با اشاره به چشم انداز مثبت بلندمدت، رتبه {assetName} را به "خرید قوی" ارتقا دادند.'},
    news_supply_concerns: {en: 'Supply chain disruptions continue to raise concerns for {assetName} production lines.', fa: 'اختلالات زنجیره تامین همچنان نگرانی‌هایی را برای خطوط تولید {assetName} ایجاد می‌کند.'},
    news_buyback: {en: '{assetName} board approves a new $10 billion share buyback program.', fa: 'هیئت مدیره {assetName} یک برنامه جدید خرید سهام به ارزش ۱۰ میلیارد دلار را تصویب کرد.' },
    news_regulatory_scrutiny: {en: '{assetName} is facing increased regulatory scrutiny in Europe over data privacy concerns.', fa: '{assetName} به دلیل نگرانی‌های مربوط به حریم خصوصی داده‌ها با نظارت نظارتی فزاینده‌ای در اروپا روبرو است.' },
    news_consumer_confidence: {en: 'A drop in consumer confidence is expected to negatively impact sales for {assetName}.', fa: 'انتظار می‌رود کاهش اعتماد مصرف‌کنندگان بر فروش {assetName} تأثیر منفی بگذارد.' },
    news_new_competition: {en: 'A new startup has emerged as a serious competitor to {assetName} in the domestic market.', fa: 'یک استارتاپ جدید به عنوان یک رقیب جدی برای {assetName} در بازار داخلی ظهور کرده است.' },
    news_upgrade: {en: 'Credit Suisse upgrades {assetName} from Neutral to Outperform.', fa: 'کردیت سوئیس رتبه {assetName} را از خنثی به برتر ارتقا داد.'},
    news_downgrade: {en: 'Morgan Stanley downgrades {assetName} from Overweight to Equal-weight.', fa: 'مورگان استنلی رتبه {assetName} را از اضافه وزن به وزن برابر کاهش داد.'},

    // Analyst reports
    analystPredictionReport: { en: 'Our models indicate a {trend} short-term trend for {assetName}. Market sentiment and recent volatility support this outlook.', fa: 'مدل‌های ما یک روند کوتاه مدت {trend} را برای {assetName} نشان می‌دهند. احساسات بازار و نوسانات اخیر این چشم انداز را تایید می‌کند.'},
    analystTrendReport: { en: 'The primary driver for {assetName} is its {driver1_direction} correlation with {driver1}. A secondary, but significant, factor is its {driver2_direction} relationship with {driver2}.', fa: 'عامل اصلی برای {assetName} همبستگی {driver1_direction} آن با {driver1} است. یک عامل ثانویه اما مهم، رابطه {driver2_direction} آن با {driver2} است.'},

    // Global Factors
    globalstability: {en: 'Global Stability', fa: 'ثبات جهانی'},
    useconomy: {en: 'US Economy', fa: 'اقتصاد آمریکا'},
    chinaeconomy: {en: 'China Economy', fa: 'اقتصاد چین'},
    eueconomy: {en: 'EU Economy', fa: 'اقتصاد اتحادیه اروپا'},
    japaneconomy: {en: 'Japan Economy', fa: 'اقتصاد ژاپن'},
    indiaeconomy: {en: 'India Economy', fa: 'اقتصاد هند'},
    russiaeconomy: {en: 'Russia Economy', fa: 'اقتصاد روسیه'},
    middleeasttension: {en: 'Middle East Tension', fa: 'تنش خاورمیانه'},
    asiatensions: {en: 'Asia Tensions', fa: 'تنش‌های آسیا'},
    techinnovation: {en: 'Tech Innovation', fa: 'نوآوری فناوری'},
    globalsupplychain: {en: 'Global Supply Chain', fa: 'زنجیره تامین جهانی'},
    oilsupply: {en: 'Oil Supply', fa: 'عرضه نفت'},
    usfedpolicy: {en: 'US Fed Policy', fa: 'سیاست فدرال رزرو آمریکا'},
    secregulation: {en: 'SEC Regulation', fa: 'مقررات SEC'},
    usjobgrowth: {en: 'US Job Growth', fa: 'رشد شغلی آمریکا'},
    publicsentiment: {en: 'Public Sentiment', fa: 'احساسات عمومی'},
    climatechangeimpact: {en: 'Climate Change Impact', fa: 'تاثیر تغییرات اقلیمی'},
    pharmademand: {en: 'Pharma Demand', fa: 'تقاضای دارو'},
    inflation: {en: 'Inflation', fa: 'تورم'},

};

export const t = (key: string, lang: Language, options?: Record<string, string | number>): string => {
    // Attempt to find the specific translation
    const translationSet = translations[key];
    if (!translationSet) {
        return key; // Return the key if no translations are found
    }

    const translation = translationSet[lang] || translationSet['en'] || key;

    // Replace placeholders
    if (options && typeof translation === 'string') {
        return Object.entries(options).reduce((acc, [optKey, optValue]) => {
            const regex = new RegExp(`{${optKey}}`, 'g');
            return acc.replace(regex, String(optValue));
        }, translation);
    }

    return translation as string;
};