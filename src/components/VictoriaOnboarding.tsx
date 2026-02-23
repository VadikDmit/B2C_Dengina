import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronRight, Plus } from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';
import type { CJMData } from './CJMFlow';
import { GOAL_GALLERY_ITEMS, GOAL_TYPE_PENSION } from '../utils/GoalImages';
import type { ClientGoal, Asset } from '../types/client';

type OnboardingStep = 'name' | 'phone' | 'age' | 'gender' | 'goal_selection' | 'goal_params' | 'assets' | 'income' | 'risk_profile' | 'completed';

interface Message {
    id: string;
    text: string;
    sender: 'victoria' | 'user';
    type?: 'text' | 'widget';
    widgetType?: OnboardingStep;
}

interface VictoriaOnboardingProps {
    data: CJMData;
    setData: React.Dispatch<React.SetStateAction<CJMData>>;
    onComplete: () => void;
}

const VictoriaOnboarding: React.FC<VictoriaOnboardingProps> = ({ data, setData, onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<ClientGoal | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    const addMessage = (text: string, sender: 'victoria' | 'user', type: Message['type'] = 'text', widgetType?: OnboardingStep) => {
        const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            sender,
            type,
            widgetType
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const victoriaSay = async (text: string, type: Message['type'] = 'text', widgetType?: OnboardingStep, delay = 800) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, delay));
        setIsTyping(false);
        addMessage(text, 'victoria', type, widgetType);
    };

    // Initial sequence
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const start = async () => {
            await victoriaSay("Привет! Я Виктория — твой персональный финансовый ассистент. 🌸");
            await victoriaSay("Я помогу тебе составить профессиональный финансовый план, как это делает Анна Деньгина. Но для начала, давай познакомимся! Как тебя зовут?");
        };
        start();
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendName = async () => {
        if (!inputValue.trim()) return;
        const name = inputValue.trim();
        addMessage(name, 'user');
        setData(prev => ({ ...prev, fio: name }));
        setInputValue('');
        setCurrentStep('phone');
        await victoriaSay(`Очень приятно, ${name}! А какой у тебя номер телефона? Он нужен для сохранения твоего будущего плана.`);
    };

    const handleSendPhone = async () => {
        if (!inputValue.trim()) return;
        const phone = inputValue.trim();
        addMessage(phone, 'user');
        setData(prev => ({ ...prev, phone }));
        setInputValue('');
        setCurrentStep('age');
        await victoriaSay("Записала. Теперь скажи, сколько тебе лет? Это важно для расчета срока достижения целей.");
    };

    const handleAgeSubmit = async (age: number) => {
        addMessage(`${age} лет`, 'user');
        setData(prev => ({ ...prev, age }));
        setCurrentStep('gender');
        await victoriaSay("Поняла. Выбери твой пол:");
    };

    const handleGenderSelect = async (gender: 'male' | 'female') => {
        addMessage(gender === 'male' ? 'Мужской' : 'Женский', 'user');
        setData(prev => ({ ...prev, gender }));
        setCurrentStep('goal_selection');
        await victoriaSay("Отлично! Теперь самое интересное. Давай выберем твою первую финансовую цель. Что для тебя сейчас важнее всего?", 'widget', 'goal_selection');
    };

    // Widgets component for goal selection
    const GoalSelectionWidget = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', width: '100%', marginTop: '12px' }}>
            {GOAL_GALLERY_ITEMS.slice(0, 8).map(item => (
                <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGoalSelect(item)}
                    style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'center'
                    }}
                >
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.2' }}>{item.title}</span>
                </motion.div>
            ))}
        </div>
    );

    const handleGoalSelect = async (item: typeof GOAL_GALLERY_ITEMS[0]) => {
        const newGoal: ClientGoal = {
            goal_type_id: item.typeId,
            name: item.title,
            initial_capital: 0,
            monthly_replenishment: 0,
            target_amount: item.typeId === GOAL_TYPE_PENSION ? 0 : 3000000,
            term_months: 60,
            desired_monthly_income: item.typeId === GOAL_TYPE_PENSION ? 100000 : 0,
            inflation_rate: 5.6
        };
        setSelectedGoal(newGoal);
        addMessage(`Выбираю: ${item.title}`, 'user');
        setCurrentStep('goal_params');
        await victoriaSay(`Прекрасный выбор! Давай настроим параметры для цели "${item.title}".`, 'widget', 'goal_params');
    };

    const handleGoalParamsSubmit = async (goal: ClientGoal) => {
        setData(prev => ({ ...prev, goals: [...(prev.goals || []), goal] }));
        addMessage("Параметры настроены", 'user');
        setCurrentStep('assets');
        await victoriaSay("Половина пути пройдена! Теперь расскажи, есть ли у тебя уже накопленные активы (депозиты, акции, недвижимость)?", 'widget', 'assets');
    };

    const renderWidget = (type: OnboardingStep) => {
        switch (type) {
            case 'goal_selection':
                return <GoalSelectionWidget />;
            case 'goal_params':
                return selectedGoal ? <GoalParamsWidget goal={selectedGoal} onSubmit={handleGoalParamsSubmit} /> : null;
            case 'assets':
                return <AssetsWidget onSubmit={handleAssetsSubmit} />;
            default:
                return null;
        }
    };

    const handleAssetsSubmit = async (assets: Asset[]) => {
        setData(prev => ({ ...prev, assets }));
        addMessage("Активы добавлены", 'user');
        setCurrentStep('income');
        await victoriaSay("И последний штрих — твой среднемесячный доход. Это поможет мне понять, сколько ты сможешь откладывать на цели каждый месяц.");
    };

    const handleIncomeSubmit = async (income: number) => {
        setData(prev => ({ ...prev, avgMonthlyIncome: income }));
        addMessage(`Мой доход: ${income.toLocaleString()} руб.`, 'user');
        setCurrentStep('risk_profile');
        await victoriaSay("Осталось определить твой риск-профиль. Это займет всего минуту!");
        // Simplified skip or direct call to onComplete for now to fix navigation
        onComplete();
    };

    return (
        <div className="onboarding-chat-container">
            <style>{`
                .onboarding-chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 900px;
                    margin: 0 auto;
                    background: #fff;
                    box-shadow: 0 0 40px rgba(0,0,0,0.05);
                    position: relative;
                }

                @media (max-width: 1024px) {
                    .onboarding-chat-container {
                        max-width: 100%;
                        height: 100dvh;
                    }
                }

                .chat-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: #f8fafc;
                    scrollbar-width: none;
                }

                .message-bubble {
                    max-width: 85%;
                    padding: 16px 20px;
                    border-radius: 20px;
                    font-size: 16px;
                    line-height: 1.5;
                    position: relative;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }

                .message-victoria {
                    align-self: flex-start;
                    background: #fff;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                }

                .message-user {
                    align-self: flex-end;
                    background: var(--primary);
                    color: #000;
                    font-weight: 600;
                    border-bottom-right-radius: 4px;
                }

                .chat-input-area {
                    padding: 24px;
                    background: #fff;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .deepseek-input-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    transition: all 0.2s;
                }

                .deepseek-input-box:focus-within {
                    border-color: var(--primary);
                    background: #fff;
                    box-shadow: 0 4px 25px rgba(255, 199, 80, 0.15);
                }

                .deepseek-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 12px 0;
                    font-size: 16px;
                    outline: none;
                }

                .send-button {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--primary);
                    border: none;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .send-button:hover {
                    transform: scale(1.05);
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 8px 0;
                }
            `}</style>

            <div className="chat-header">
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                    <img src={avatarImage} alt="Victoria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <div style={{ fontWeight: '900', fontSize: '18px', color: '#1e293b' }}>Виктория</div>
                    <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        Ассистент Анны Деньгиной
                    </div>
                </div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                        >
                            <div className={`message-bubble ${m.sender === 'victoria' ? 'message-victoria' : 'message-user'}`}>
                                {m.text}
                                {m.type === 'widget' && m.widgetType && (
                                    <div style={{ marginTop: '16px', width: '100%' }}>
                                        {renderWidget(m.widgetType)}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="message-bubble message-victoria" style={{ width: 'fit-content' }}>
                            <div className="typing-indicator">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="chat-input-area">
                <AnimatePresence mode="wait">
                    {currentStep === 'age' && !isTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ padding: '0 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: '700' }}>Твой возраст</span>
                                <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '24px' }}>{data.age} лет</span>
                            </div>
                            <input type="range" min="18" max="100" value={data.age} onChange={e => setData(prev => ({ ...prev, age: parseInt(e.target.value) }))} style={{ width: '100%' }} />
                            <button onClick={() => handleAgeSubmit(data.age)} className="btn-primary" style={{ width: '100%', marginTop: '16px', borderRadius: '16px' }}>
                                Подтвердить <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 'gender' && !isTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button onClick={() => handleGenderSelect('male')} className="btn-secondary" style={{ padding: '20px', borderRadius: '20px', fontSize: '18px' }}>👨 Мужской</button>
                            <button onClick={() => handleGenderSelect('female')} className="btn-secondary" style={{ padding: '20px', borderRadius: '20px', fontSize: '18px' }}>👩 Женский</button>
                        </motion.div>
                    )}

                    {(currentStep === 'name' || currentStep === 'phone' || currentStep === 'income') && !isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="deepseek-input-box">
                            <input
                                className="deepseek-input"
                                placeholder={
                                    currentStep === 'name' ? "Введи своё имя..." :
                                        currentStep === 'phone' ? "Введи номер телефона (+7...)" :
                                            "Введи свой доход (руб/мес)..."
                                }
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (currentStep === 'name') handleSendName();
                                        else if (currentStep === 'phone') handleSendPhone();
                                        else handleIncomeSubmit(parseInt(inputValue.replace(/\s/g, '')) || 0);
                                    }
                                }}
                            />
                            <button className="send-button" onClick={() => {
                                if (currentStep === 'name') handleSendName();
                                else if (currentStep === 'phone') handleSendPhone();
                                else handleIncomeSubmit(parseInt(inputValue.replace(/\s/g, '')) || 0);
                            }}>
                                <Send size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- WIDGETS ---

const GoalParamsWidget: React.FC<{ goal: ClientGoal, onSubmit: (g: ClientGoal) => void }> = ({ goal, onSubmit }) => {
    const [localGoal, setLocalGoal] = useState(goal);
    const isPension = goal.goal_type_id === GOAL_TYPE_PENSION;

    return (
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Настройка: {goal.name}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isPension ? (
                    <div>
                        <label style={{ fontSize: '13px', color: '#64748b' }}>Желаемый ежемесячный доход</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <input
                                type="number"
                                value={localGoal.desired_monthly_income}
                                onChange={e => setLocalGoal({ ...localGoal, desired_monthly_income: parseInt(e.target.value) })}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            <span>руб.</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <label style={{ fontSize: '13px', color: '#64748b' }}>Целевая сумма</label>
                            <input
                                type="number"
                                value={localGoal.target_amount}
                                onChange={e => setLocalGoal({ ...localGoal, target_amount: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '13px', color: '#64748b' }}>Срок (месяцев)</label>
                            <input
                                type="number"
                                value={localGoal.term_months}
                                onChange={e => setLocalGoal({ ...localGoal, term_months: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                            />
                        </div>
                    </>
                )}
                <button
                    onClick={() => onSubmit(localGoal)}
                    className="btn-primary"
                    style={{ padding: '12px', borderRadius: '12px', width: '100%' }}
                >
                    Готово
                </button>
            </div>
        </div>
    );
};

const RiskProfileWidget: React.FC<{ onSubmit: (p: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE') => void }> = ({ onSubmit }) => {
    const profiles = [
        { id: 'CONSERVATIVE', title: 'Консервативный', desc: 'Минимум риска, стабильность', emoji: '🛡️' },
        { id: 'BALANCED', title: 'Умеренный', desc: 'Баланс риска и доходности', emoji: '⚖️' },
        { id: 'AGGRESSIVE', title: 'Агрессивный', desc: 'Высокий риск ради прибыли', emoji: '🚀' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {profiles.map(p => (
                <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSubmit(p.id as any)}
                    style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <span style={{ fontSize: '24px' }}>{p.emoji}</span>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{p.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p.desc}</div>
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

const AssetsWidget: React.FC<{ onSubmit: (a: Asset[]) => void }> = ({ onSubmit }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newAsset, setNewAsset] = useState<Asset>({ name: '', current_value: 0, type: 'CASH' });

    const handleAdd = () => {
        if (!newAsset.name) return;
        setAssets([...assets, newAsset]);
        setNewAsset({ name: '', current_value: 0, type: 'CASH' });
        setIsAdding(false);
    };

    return (
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {assets.map((a, i) => (
                    <div key={i} style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                        {a.name}: {a.current_value?.toLocaleString()} ₽
                    </div>
                ))}
            </div>

            {isAdding ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input placeholder="Название (напр. Депозит)" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="number" placeholder="Сумма" value={newAsset.current_value} onChange={e => setNewAsset({ ...newAsset, current_value: parseInt(e.target.value) })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <button onClick={handleAdd} className="btn-primary" style={{ padding: '10px', borderRadius: '8px' }}>Добавить</button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsAdding(true)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: 'transparent', cursor: 'pointer' }}>
                        <Plus size={16} /> Добавить актив
                    </button>
                    <button onClick={() => onSubmit(assets)} className="btn-primary" style={{ flex: 1, borderRadius: '12px' }}>Продолжить</button>
                </div>
            )}
        </div>
    );
};

export default VictoriaOnboarding;
