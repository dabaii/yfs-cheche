import React from 'react';
import { Lock, History, ChevronRight, Plus, Pencil, Trash2, Award, LogIn } from 'lucide-react';
import { Sticker } from '../components/ui/Sticker';
import { CardFrame } from '../components/ui/CardFrame';

export const ProfileView = ({ user, addresses, setModal, handleLogout, setUser, deleteAddress, setView, editAddress, handleAddBalance }) => (
    <div className="p-6 mb-24 overflow-y-auto animate-in fade-in duration-500 text-black font-black">
        <CardFrame className="bg-indigo-600 p-8 text-white relative overflow-hidden mb-8 border-indigo-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-white border-4 border-black rounded-[2rem] flex items-center justify-center text-black font-black text-3xl shadow-brutal">{user.isLoggedIn ? user.role === 'admin' ? 'BOSS' : 'LV.40' : <Lock size={40} />}</div>
                <div><h2 className="text-3xl font-black italic tracking-tighter uppercase">{user.isLoggedIn ? user.name : '神秘访客'}</h2><Sticker className="bg-white text-black border-black mt-2">{user.isLoggedIn ? (user.role === 'admin' ? '次元管理员' : '资深勇者') : '尚未登录'}</Sticker></div>
            </div>
            {user.isLoggedIn && (
                <div className="grid grid-cols-2 gap-4 relative z-10 mt-8 text-center">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20">
                        <p className="text-indigo-200 text-[9px] font-black uppercase mb-1 italic">金币能量</p>
                        <p className="text-xl font-black text-yellow-400 italic leading-none">¥{user.balance.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border-2 border-white/20">
                        <p className="text-indigo-200 text-[9px] font-black uppercase mb-1 italic">稀有掉落</p>
                        <p className="text-xl font-black text-emerald-400 italic leading-none">{user.items.length}</p>
                    </div>
                </div>
            )}
        </CardFrame>
        {user.isLoggedIn ? (
            <div className="space-y-8">
                <CardFrame className="p-6" onClick={() => setView('shipping_history')}><div className="flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-rose-100 border-4 border-black rounded-2xl flex items-center justify-center shadow-brutal"><History size={24} strokeWidth={3} /></div><span className="font-black text-xl underline decoration-rose-500 decoration-4 underline-offset-4">传送记录</span></div><ChevronRight size={32} strokeWidth={4} /></div></CardFrame>
                <CardFrame className="p-6 cursor-default">
                    <div className="flex justify-between items-center mb-6 text-black font-black"><h3 className="font-black text-lg italic underline decoration-yellow-400 decoration-4">坐标管理</h3><button onClick={() => setModal({ type: 'address_form' })} className="bg-black text-white px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-brutal active:shadow-none"><Plus size={12} strokeWidth={3} /> 添加</button></div>
                    <div className="space-y-4">{addresses.map(a => (
                        <div key={a.id} className={`border-2 border-black p-4 rounded-2xl relative ${a.isDefault ? 'bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(234,179,8,0.3)]' : ''}`}>
                            <div className="flex justify-between items-start pr-8 text-black font-black">
                                <div>
                                    <div className="font-black text-sm">{a.name} {a.phone}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">{a.detail}</div>
                                    {a.isDefault && <span className="text-[8px] text-yellow-600 font-bold block mt-2">默认传送点</span>}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); editAddress(a); }} className="text-blue-500 hover:scale-110 transition-transform"><Pencil size={16} strokeWidth={3} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteAddress(a.id); }} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={16} strokeWidth={3} /></button>
                                </div>
                            </div>
                        </div>
                    ))}</div>
                </CardFrame>
                <button onClick={handleAddBalance} className="w-full bg-white border-4 border-black p-6 rounded-[2rem] flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1"><div className="flex items-center gap-5 text-black"><div className="w-12 h-12 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-brutal"><Award size={24} strokeWidth={3} /></div><span className="font-black text-xl underline decoration-indigo-500 decoration-4">补给魔法 ¥1000</span></div><ChevronRight size={32} strokeWidth={4} /></button>
                <button onClick={handleLogout} className="w-full bg-rose-500 text-white border-4 border-black p-6 rounded-[2rem] font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">注销当前次元</button>
            </div>
        ) : (<button onClick={() => setModal({ type: 'login' })} className="w-full mt-10 bg-yellow-400 border-4 border-black p-8 rounded-[3rem] flex items-center justify-center gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black"><LogIn size={32} strokeWidth={4} /><span className="font-black text-xl italic underline decoration-black decoration-6">冒险登录</span></button>)}
    </div>
);
