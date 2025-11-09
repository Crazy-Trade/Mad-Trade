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

        // Header
        language: 'FA',

        // Tabs
        markets: 'Markets',
        portfolio: 'Portfolio',
        corporate: 'Corporate',
        politics: 'Politics',
        bank: 'Bank',
        log: 'Log',

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

        // Corporate View
        corporateHoldings: 'Corporate Holdings',
        establishCompany: 'Establish New Company',
        companyName: 'Company Name',
        type: 'Type',
        level: 'Level',
        monthlyIncome: 'Monthly Income',
        upgrade: 'Upgrade',
        // Fix: Added missing key.
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
        
        // Log View
        eventLog: 'Event Log',

        // Modals
        tradeAsset: 'Trade Asset',
        buy: 'Buy',
        sell: 'Sell',
        // Fix: Added missing key.
        short: 'Short',
        total: 'Total',
        max: 'Max',
        // Fix: Added missing key.
        margin: 'Margin',
        
        establishNewCompany: 'Establish New Company',
        companyType: 'Company Type',
        tech: 'Tech Startup',
        mining: 'Mining Operation',
        pharma: 'Pharmaceutical Lab',
        media: 'Media Group',
        // Fix: Added missing key.
        cost: 'Cost',

        upgradeCompany: 'Upgrade Company',
        // Fix: Added missing key.
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

        // Time Controls
        skipDay: 'Skip to Next Day',
        play: 'Play',
        pause: 'Pause',
    },
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

        // Header
        language: 'EN',

        // Tabs
        markets: 'بازارها',
        portfolio: 'سبد سهام',
        corporate: 'شرکت‌ها',
        politics: 'سیاست',
        bank: 'بانک',
        log: 'گزارش',

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

        // Corporate View
        corporateHoldings: 'دارایی‌های شرکتی',
        establishCompany: 'تاسیس شرکت جدید',
        companyName: 'نام شرکت',
        type: 'نوع',
        level: 'سطح',
        monthlyIncome: 'درآمد ماهانه',
        upgrade: 'ارتقا',
        // Fix: Added missing key.
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

        // Log View
        eventLog: 'گزارش رویدادها',

        // Modals
        tradeAsset: 'معامله دارایی',
        buy: 'خرید',
        sell: 'فروش',
        // Fix: Added missing key.
        short: 'فروش استقراضی',
        total: 'مجموع',
        max: 'حداکثر',
        // Fix: Added missing key.
        margin: 'مارجین',

        establishNewCompany: 'تاسیس شرکت جدید',
        companyType: 'نوع شرکت',
        tech: 'استارتاپ تکنولوژی',
        mining: 'عملیات استخراج معدن',
        pharma: 'آزمایشگاه داروسازی',
        media: 'گروه رسانه‌ای',
        // Fix: Added missing key.
        cost: 'هزینه',
        
        upgradeCompany: 'ارتقای شرکت',
        // Fix: Added missing key.
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
        
        // Time Controls
        skipDay: 'پرش به روز بعد',
        play: 'اجرا',
        pause: 'توقف',
    },
};

export const t = (key: keyof typeof translations.en, lang: Language) => {
    return translations[lang][key] || key;
}