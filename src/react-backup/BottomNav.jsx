import React from 'react';
import { Home, Package, User, Settings } from 'lucide-react';

export const BottomNav = ({ view, setView, userRole }) => (
    <div className="fixed bottom-4 left-4 right-4 bg-white border-4 border-black rounded-3xl flex justify-around items-center h-18 z-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {[
            { id: 'home', icon: Home, label: '大厅' },
            { id: 'warehouse', icon: Package, label: '行囊' },
            { id: 'profile', icon: User, label: '勇者' },
            ...(userRole === 'admin' ? [{ id: 'admin', icon: Settings, label: '工厂' }] : [])
        ].map(nav => (
            <button key={nav.id} onClick={() => setView(nav.id)} className={`flex flex-col items-center transition-all ${view === nav.id || (view === 'shipping_history' && nav.id === 'profile') ? 'text-blue-500 scale-110' : 'text-slate-400'}`}>
                <nav.icon size={20} strokeWidth={3} />
                <span className="text-[10px] mt-1 font-black">{nav.label}</span>
            </button>
        ))}
    </div>
);
