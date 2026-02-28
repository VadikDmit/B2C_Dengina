
// Map specific goal names (from Figma filenames) to Goal Type IDs
// and provide a helper to get the image path.

// Import all images
import gospensiya from '../assets/goals/gospensiya.webp';
import passivnyy from '../assets/goals/passivnyy_dohod_v_buduschem.webp';
import invest from '../assets/goals/sohranit__i_preumnozhit.webp'; // "Сохранить и приумножить"
import rent from '../assets/goals/poluchenie_ezhemesyachnogo_dohoda.webp'; // "Рента"

// Others (mapped to ID 4 or 3 based on logic)
import kvartira from '../assets/goals/kvartira.webp';
import zagorod from '../assets/goals/zagorodnayanedvizhimost.webp';
import avtomobil from '../assets/goals/avtomobil.webp';
import puteshestvie from '../assets/goals/puteshestvie.webp';
import education from '../assets/goals/obrazovanie_rebyonka.webp';
import ipoteka from '../assets/goals/pervyy_vznos_na_ipoteku.webp';
import pereezd from '../assets/goals/pereezd.webp';
import business from '../assets/goals/svoybiznes.webp';
import other from '../assets/goals/drugoe.webp';
import finReserve from '../assets/goals/reserve.webp';
import lifeInsurance from '../assets/goals/lifeinsurance.webp';

// Goal Type IDs
export const GOAL_TYPE_PENSION = 1;
export const GOAL_TYPE_PASSIVE_INCOME = 2;
export const GOAL_TYPE_INVESTMENT = 3;
export const GOAL_TYPE_OTHER = 4; // Major Purchase / Real Estate / Other
export const GOAL_TYPE_LIFE = 5;
export const GOAL_TYPE_FIN_RESERVE = 7;
export const GOAL_TYPE_RENT = 8;
export const GOAL_TYPE_REAL_ESTATE = 9;
export const GOAL_TYPE_MORTGAGE_DOWNPAYMENT = 10;
export const GOAL_TYPE_RELOCATION = 11;
export const GOAL_TYPE_SAVE_AND_MULTIPLY = 12;
export const GOAL_TYPE_FINANCIAL_RESERVE = 13;
export const GOAL_TYPE_VEHICLE = 14;
export const GOAL_TYPE_VACATION_TRAVEL = 15;
export const GOAL_TYPE_BUSINESS_START = 16;


// Config for Grid Display
// Each item represents a card in the gallery
export const GOAL_GALLERY_ITEMS = [
    { id: 'pension', typeId: GOAL_TYPE_PENSION, title: 'Достойная пенсия', image: gospensiya, description: 'На старость' },
    { id: 'passive', typeId: GOAL_TYPE_PASSIVE_INCOME, title: 'Пассивный доход', image: passivnyy, description: 'Жить на проценты' },
    { id: 'rent', typeId: GOAL_TYPE_RENT, title: 'Рента с капитала', image: rent, description: 'Рента' },
    { id: 'edu', typeId: GOAL_TYPE_OTHER, title: 'Образование ребёнка', image: education, description: 'Детям' },
    { id: 'appartment', typeId: GOAL_TYPE_REAL_ESTATE, title: 'Квартира', image: kvartira, description: 'Жить отдельно' },
    { id: 'house', typeId: GOAL_TYPE_REAL_ESTATE, title: 'Загородный дом', image: zagorod, description: 'Трава у дома' },
    { id: 'first_payment', typeId: GOAL_TYPE_MORTGAGE_DOWNPAYMENT, title: 'Первый взнос на ипотеку', image: ipoteka, description: 'Дать старт' },
    { id: 'relocate', typeId: GOAL_TYPE_RELOCATION, title: 'Переезд', image: pereezd, description: 'Сменить место' },
    { id: 'safe_grow', typeId: GOAL_TYPE_SAVE_AND_MULTIPLY, title: 'Сохранить и преумножить', image: invest, description: 'Капитал' },
    // { id: 'reserve', typeId: GOAL_TYPE_FINANCIAL_RESERVE, title: 'Финансовый резерв', image: finReserve, description: 'На всякий случай' },
    { id: 'life', typeId: GOAL_TYPE_LIFE, title: 'Защита жизни', image: lifeInsurance, description: 'На всякий случай' },
    { id: 'auto', typeId: GOAL_TYPE_VEHICLE, title: 'Автомобиль', image: avtomobil, description: 'Средство передвижения' },
    { id: 'travel', typeId: GOAL_TYPE_VACATION_TRAVEL, title: 'Путешествие', image: puteshestvie, description: 'Посмотреть мир' },
    { id: 'business', typeId: GOAL_TYPE_BUSINESS_START, title: 'Свой бизнес', image: business, description: 'Свое дело' },
    { id: 'other', typeId: GOAL_TYPE_OTHER, title: 'Другое', image: other, description: 'Что-то еще' },
];

export const getGoalImage = (goalName: string, typeId: number): string => {
    // Try to find exact match by title first
    const match = GOAL_GALLERY_ITEMS.find(i => i.title === goalName);
    if (match) return match.image;

    // Fallback by Type ID
    if (typeId === GOAL_TYPE_PENSION) return gospensiya;
    if (typeId === GOAL_TYPE_PASSIVE_INCOME) return passivnyy;
    if (typeId === GOAL_TYPE_RENT) return rent;
    if (typeId === GOAL_TYPE_INVESTMENT) return invest;
    if (typeId === GOAL_TYPE_OTHER) return other;
    if (typeId === GOAL_TYPE_FIN_RESERVE) return finReserve;
    if (typeId === GOAL_TYPE_LIFE) return lifeInsurance;

    // Default fallback
    return other;
};
