import React from 'react';
import { Settings, Plus, Trash2, Shield } from 'lucide-react';
import { CardFrame } from '../components/ui/CardFrame';
import { PRIZE_TYPES } from '../constants';

export const AdminView = ({ form, setForm, handleCreateCar, stores, setModal, handleGrantAdmin }) => {
    const [adminPhone, setAdminPhone] = React.useState('');

    return (
        <div className="p-6 mb-32 overflow-y-auto animate-in fade-in duration-500 text-black font-black">
            <h1 className="text-3xl font-black mb-10 italic flex items-center gap-3 underline decoration-indigo-400 decoration-4 text-black"><Settings className="text-indigo-500" /> 建造工坊</h1>
            
            <CardFrame className="p-8 border-indigo-400 mb-10">
                <div className="flex items-center gap-3 mb-6"><Shield className="text-emerald-500" strokeWidth={5} /><span className="font-black text-xl uppercase italic">角色权限管理</span></div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="输入需要提权的手机号码" 
                        className="flex-1 bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black"
                        value={adminPhone} 
                        onChange={e => setAdminPhone(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            if (!adminPhone) return alert('请输入手机号码');
                            handleGrantAdmin(adminPhone);
                            setAdminPhone('');
                        }}
                        className="bg-black text-white px-6 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:translate-y-1 transition-all uppercase italic font-black whitespace-nowrap"
                    >
                        赋予管理员
                    </button>
                </div>
            </CardFrame>

            <CardFrame className="p-8 border-indigo-400 mb-10">
            <div className="flex items-center gap-3 mb-10"><Plus className="text-rose-500" strokeWidth={5} /><span className="font-black text-xl uppercase italic">部署新物语</span></div>
            <div className="space-y-8 font-black text-black">
                <div><label className="text-[11px] text-slate-400 block italic uppercase">任务名称</label><input className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[11px] text-slate-400 block italic uppercase">席位数</label><input type="number" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white" value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} /></div>
                    <div><label className="text-[11px] text-slate-400 block italic uppercase">单价 (¥)</label><input type="number" className="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                <button onClick={() => setForm(p => ({ ...p, prizes: [...p.prizes, { type: 'F', name: '', count: 1, img: '' }] }))} className="bg-indigo-500 text-white font-black text-[10px] px-4 py-2 rounded-xl border-2 border-black shadow-brutal active:shadow-none">添加奖项</button>
                <div className="space-y-6">
                    {form.prizes.map((p, idx) => (
                        <div key={idx} className="bg-slate-50 border-4 border-black rounded-3xl p-6 relative shadow-brutal">
                            <button onClick={() => setForm(p => ({ ...p, prizes: p.prizes.filter((_, i) => i !== idx) }))} className="absolute -top-3 -right-3 bg-white border-4 border-black p-1.5 rounded-full text-rose-500 shadow-brutal"><Trash2 size={16} strokeWidth={4} /></button>
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                <select className="bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black outline-none" value={p.type} onChange={e => setForm(f => ({ ...f, prizes: f.prizes.map((x, i) => i === idx ? { ...x, type: e.target.value } : x) }))}>{Object.keys(PRIZE_TYPES).filter(k => k !== 'LAST').map(t => <option key={t} value={t}>{t}</option>)}</select>
                                <input placeholder="名称" className="col-span-2 bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black" value={p.name} onChange={e => setForm(f => ({ ...f, prizes: f.prizes.map((x, i) => i === idx ? { ...x, name: e.target.value } : x) }))} />
                                <input type="number" placeholder="数" className="bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black text-center" value={p.count} onChange={e => setForm(f => ({ ...f, prizes: f.prizes.map((x, i) => i === idx ? { ...x, count: e.target.value } : x) }))} />
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleCreateCar} className="w-full bg-black text-white py-6 rounded-[2.5rem] text-lg shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] active:translate-y-1 transition-all uppercase italic">确认部署关卡</button>
            </div>
        </CardFrame>
    </div>
    );
};
