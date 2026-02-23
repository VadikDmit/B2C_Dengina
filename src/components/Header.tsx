import React from 'react';
import { User, LogOut } from 'lucide-react';

interface HeaderProps {
    activePage?: 'past' | 'present' | 'future';
    onNavigate?: (page: 'past' | 'present' | 'future') => void;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage = 'present', onNavigate, onLogout }) => {
    const handleNavClick = (page: 'past' | 'present' | 'future', e: React.MouseEvent) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(page);
        }
    };

    const getLinkStyle = (page: string) => ({
        color: activePage === page ? '#111' : '#666',
        fontWeight: activePage === page ? 'bold' : 'normal',
        textDecoration: 'none',
        fontSize: '14px',
        cursor: 'pointer'
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
    };

    return (
        <header style={{
            height: '64px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{ color: '#D946EF' }}>Anna</span> Dengina
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', gap: '24px' }}>
                <a href="#" onClick={(e) => handleNavClick('past', e)} style={getLinkStyle('past')}>Прошлое</a>
                <a href="#" onClick={(e) => handleNavClick('present', e)} style={getLinkStyle('present')}>Настоящее</a>
                <a href="#" onClick={(e) => handleNavClick('future', e)} style={getLinkStyle('future')}>Будущее</a>
            </nav>

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                }}>
                    <User size={18} />
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        transition: 'color 0.2s'
                    }}
                    title="Выйти"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
};

export default Header;
