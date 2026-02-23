import { useState, useCallback, useEffect } from 'react'
import './App.css'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import CJMFlow from './components/CJMFlow'
import ResultPage from './components/ResultPage'
import Header from './components/Header'
import MyPlansPage from './components/MyPlansPage'
import PresentPage from './components/PresentPage'
import PastPage from './components/PastPage'
import type { Client } from './types/client'
import { clientApi } from './api/clientApi'

type Page = 'login' | 'register' | 'past' | 'present' | 'future' | 'cjm' | 'result'

function App() {
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        return localStorage.getItem('token') ? 'present' : 'login';
    });
    const [calculationResult, setCalculationResult] = useState<any>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [clientData, setClientData] = useState<Client | null>(null);
    const [autoOpenAddGoal, setAutoOpenAddGoal] = useState(false);

    const loadClientData = useCallback(async () => {
        try {
            const data = await clientApi.getMyPlan();
            setClientData(data);
            setSelectedClient(data);
            if (data?.goals_summary) {
                setCalculationResult(data.goals_summary);
                setCurrentPage('present');
            } else {
                // If no plan exists, redirect to onboarding
                setCurrentPage('cjm');
            }
        } catch (err: any) {
            console.error('Failed to load client data:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                setCurrentPage('login');
            } else if (err.response?.status === 404) {
                setClientData(null);
                setCurrentPage('cjm');
            }
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            loadClientData();
        }
    }, [loadClientData]);

    const handleNavigate = (page: 'past' | 'present' | 'future') => {
        setAutoOpenAddGoal(false); // Reset on normal nav
        if (page === 'future') {
            // Force go to result if we have any data to show
            if (calculationResult || clientData?.goals_summary) {
                if (!calculationResult && clientData?.goals_summary) {
                    setCalculationResult(clientData.goals_summary);
                }
                setCurrentPage('result');
            } else {
                // Only go to my plans if absolutely no summary exists
                setCurrentPage('future');
            }
        } else {
            setCurrentPage(page);
        }
    };

    const handleAddGoalClick = () => {
        setAutoOpenAddGoal(true);
        setCurrentPage('future');
    };

    const handleLoginSuccess = () => {
        loadClientData();
    };

    const handleRegisterSuccess = () => {
        loadClientData();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentPage('login');
        setCalculationResult(null);
        setSelectedClient(null);
        setClientData(null);
    };

    const handleCalculationComplete = async (result: any) => {
        console.log('Calculation Complete. Result:', result);

        const clientId = result?.client_id || result?.id || result?.summary?.client_id;

        if (clientId) {
            try {
                const fullClient = await clientApi.getMyPlan();
                setSelectedClient(fullClient);
            } catch (err) {
                console.error('Failed to fetch client after calculation:', err);
            }
            setCalculationResult(result);
        } else if (result?.client) {
            setSelectedClient(result.client);
            setCalculationResult(result);
        } else {
            setCalculationResult(result);
        }

        setCurrentPage('result');
    };

    const handleViewPlan = (client: Client, result: any) => {
        setSelectedClient(client);
        setCalculationResult(result);
        setCurrentPage('result');
    };

    const handleRecalculate = useCallback(async (payload: any) => {
        console.log('handleRecalculate called with payload:', payload);

        const goalId = payload?.goal_id;

        if (!goalId) {
            console.error('No goal_id found in payload!');
            alert('Ошибка: ID цели не найден.');
            return null;
        }

        setLoadingPlan(true);
        try {
            const result = await clientApi.recalculate(goalId, payload);
            console.log('Recalculate success:', result);
            setCalculationResult(result);
            return result;
        } catch (error) {
            console.error('Recalculation failed:', error);
            alert('Не удалось произвести пересчёт. Проверьте данные.');
            return null;
        } finally {
            setLoadingPlan(false);
        }
    }, []);

    // Auth pages (no header)
    if (currentPage === 'login') {
        return (
            <div className="app-container">
                <LoginPage
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setCurrentPage('register')}
                />
            </div>
        );
    }

    if (currentPage === 'register') {
        return (
            <div className="app-container">
                <RegisterPage
                    onRegisterSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setCurrentPage('login')}
                />
            </div>
        );
    }

    // Main app with header
    const activeHeaderPage = (currentPage === 'past' || currentPage === 'present' || currentPage === 'future' || currentPage === 'result')
        ? (currentPage === 'result' ? 'future' : currentPage)
        : 'present';

    return (
        <div className="app-container">
            <Header
                activePage={activeHeaderPage}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            {currentPage === 'past' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <PastPage />
                </div>
            )}

            {currentPage === 'present' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <PresentPage
                        clientData={clientData}
                        onViewPlan={handleViewPlan}
                        onStartCJM={() => setCurrentPage('cjm')}
                        onAddGoalClick={handleAddGoalClick}
                    />
                </div>
            )}

            {currentPage === 'future' && (
                <MyPlansPage
                    onCreatePlan={() => setCurrentPage('cjm')}
                    onViewPlan={handleViewPlan}
                    autoOpenAddGoal={autoOpenAddGoal}
                    onOpenAddGoalHandled={() => setAutoOpenAddGoal(false)}
                />
            )}

            {currentPage === 'cjm' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <CJMFlow
                        onComplete={handleCalculationComplete}
                        onBack={() => setCurrentPage('present')}
                        isNewClient={!clientData?.goals_summary}
                    />
                </div>
            )}

            {currentPage === 'result' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    {loadingPlan && (
                        <div style={{
                            position: 'fixed',
                            top: '80px',
                            right: '40px',
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000
                        }}>
                            Обновление расчёта...
                        </div>
                    )}
                    <ResultPage
                        data={calculationResult}
                        client={selectedClient}
                        onRestart={() => setCurrentPage('present')}
                        onRecalculate={handleRecalculate}
                        isCalculating={loadingPlan}
                    />
                </div>
            )}
        </div>
    );
}


export default App;
