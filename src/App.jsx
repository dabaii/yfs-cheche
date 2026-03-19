import React, { useState, useEffect, useMemo } from 'react';
import {
    Home, Package, User, Settings, ChevronRight, Truck, Clock, Award, Trophy, Users,
    MessageCircle, AlertCircle, CheckCircle2, X, Tag, Eye, Plus, Minus, Info, Trash2,
    Image as ImageIcon, Star, Zap, Sparkles, Heart, Lock, LogIn, MapPin, Map,
    CheckSquare, Square, ShoppingBag, Circle, ScrollText, History, Layers, Pencil
} from 'lucide-react';

// --- 奖品类型定义 ---
const PRIZE_TYPES = {
    SP: { name: 'SP赏', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
    A: { name: 'A赏', color: 'bg-rose-500', textColor: 'text-rose-500' },
    B: { name: 'B赏', color: 'bg-sky-500', textColor: 'text-sky-500' },
    C: { name: 'C赏', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    D: { name: 'D赏', color: 'bg-amber-500', textColor: 'text-amber-500' },
    F: { name: '小赏', color: 'bg-slate-400', textColor: 'text-slate-400' },
    LAST: { name: '最后赏', color: 'bg-orange-500', textColor: 'text-orange-500' }
};

// --- 洗牌算法：生成箱子结果 ---
const generateResult = (prizes) => {
    const result = [];
    prizes.forEach(p => {
        const count = parseInt(p.count || 0);
        for (let i = 0; i < count; i++) {
            result.push({ type: p.type, name: p.name, img: p.img });
        }
    });
    // Fisher-Yates Shuffle
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

// --- 二次元 UI 装饰组件 ---
const Sticker = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`inline-block px-4 py-1.5 rounded-full border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all ${className}`}>
        {children}
    </div>
);

const CardFrame = ({ children, className = "", onClick }) => (
    <div onClick={onClick} className={`bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${className}`}>
        {children}
    </div>
);

// --- 独立子视图组件 ---

const BottomNav = ({ view, setView, userRole }) => (
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

const HomeView = ({ activeCars, user, setModal, checkAuth }) => (
    <div className="p-5 mb-24 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] animate-in fade-in duration-500">
        <div className="flex justify-between items-start mb-8">
            <div><h1 className="text-3xl font-black italic flex items-center gap-2 text-black"><Zap className="text-yellow-400 fill-yellow-400" /> 一番开车</h1><Sticker className="bg-cyan-300 mt-2 cursor-default active:translate-y-0">冒险布告栏</Sticker></div>
            <CardFrame className="px-4 py-2 bg-yellow-300 text-center min-w-[100px]">
                <span className="text-[10px] font-black block text-black/50 text-center">当前金币</span>
                <span className="text-sm font-black italic block text-center">{user.isLoggedIn ? `¥${user.balance.toLocaleString()}` : '****'}</span>
            </CardFrame>
        </div>
        <div className="space-y-10">
            {activeCars.map(car => {
                const isCompleted = car.status !== 'open';
                const mySeatsCount = user.isLoggedIn ? Object.values(car.occupiedSeats).filter(s => s.uid === user.id).length : 0;
                return (
                    <CardFrame key={car.id} className="p-0 overflow-hidden relative">
                        <div className="absolute -top-3 -right-3"><div className={`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center ${isCompleted ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'}`}>{isCompleted ? <Trophy size={20} /> : <Heart className="fill-white" size={20} />}</div></div>
                        <div className="p-6">
                            <h3 className="font-black text-xl mb-1 text-black underline decoration-indigo-400 decoration-4">{car.name}</h3>
                            <p className="text-[10px] font-bold text-slate-500 mb-4 italic line-clamp-1">{car.description}</p>
                            <div className="flex items-center gap-3 mb-6 bg-slate-50 p-2 rounded-2xl border-2 border-black/5">
                                <div className="flex-1 bg-white border-2 border-black h-3 rounded-full overflow-hidden"><div className={`${isCompleted ? 'bg-indigo-400' : 'bg-rose-400'} h-full border-r-2 border-black transition-all duration-700`} style={{ width: `${(Object.keys(car.occupiedSeats).length / car.totalSeats) * 100}%` }} /></div>
                                <span className="font-black text-[10px] italic text-black">{Object.keys(car.occupiedSeats).length}/{car.totalSeats} 人集结</span>
                                {mySeatsCount > 0 && <Sticker className="bg-emerald-400 py-0.5 ml-1">我的:{mySeatsCount}</Sticker>}
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                {car.prizes.map((p, idx) => (
                                    <div key={idx} onClick={() => setModal({ type: 'preview', data: p })} className="flex-shrink-0 w-24 cursor-pointer group">
                                        <div className="relative border-4 border-black rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform mb-2">
                                            <img src={p.img || 'https://via.placeholder.com/100'} className="w-full aspect-square object-cover" alt={p.name} />
                                            <div className={`absolute top-1 left-1 px-1.5 py-0.5 border-2 border-black rounded-lg text-[8px] font-black text-white ${PRIZE_TYPES[p.type]?.color}`}>{p.type}赏</div>
                                            <div className="absolute bottom-1 right-1 bg-black text-white text-[9px] font-black px-1.5 rounded-md">x{p.count}</div>
                                        </div>
                                        <div className="text-[10px] font-black truncate text-center text-black group-hover:text-blue-500">{p.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-end justify-between mt-2 border-t-2 border-black pt-4">
                                <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase italic">集结单价</span><span className="text-3xl font-black italic text-rose-500 leading-none">¥{(car.price * car.discount / 100).toFixed(1)}</span></div>
                                <button onClick={() => isCompleted ? setModal({ type: 'results', data: car }) : (checkAuth() && setModal({ type: 'join', data: car }))} className={`border-4 border-black px-6 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all ${isCompleted ? 'bg-indigo-400 text-white' : 'bg-yellow-400 text-black'}`}>{isCompleted ? '狩猎成功' : '立即加入'}</button>
                            </div>
                        </div>
                    </CardFrame>
                );
            })}
        </div>
    </div>
);

const WarehouseView = ({ isLoggedIn, groupedWarehouse, selectedInventory, toggleSelection, setView, setModal, onSelectAll }) => (
    <div className="p-6 mb-24 animate-in fade-in duration-500 text-black font-black">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black italic underline decoration-rose-400 decoration-4 text-black"><Package className="text-rose-400" /> 我的宝库</h1>
            <div className="flex items-center gap-3">
                {isLoggedIn && Object.keys(groupedWarehouse).length > 0 && (
                    <Sticker onClick={onSelectAll} className="bg-white text-black border-black h-10 flex items-center justify-center">全选</Sticker>
                )}
                {selectedInventory.length > 0 && (
                    <button onClick={() => setView('shipping_summary')} className="bg-rose-500 text-white border-4 border-black px-4 py-2 rounded-xl text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce active:shadow-none">申请传送 ({selectedInventory.length})</button>
                )}
            </div>
        </div>
        {!isLoggedIn ? (
            <CardFrame className="p-20 text-center border-dashed" onClick={() => setModal({ type: 'login' })}><Lock className="mx-auto mb-4 opacity-10 text-black" size={60} /><p className="font-black text-sm text-black">请登录以开启行囊</p><button className="mt-4 bg-black text-white px-6 py-2 rounded-xl text-xs font-black">前往登录</button></CardFrame>
        ) : Object.keys(groupedWarehouse).length === 0 ? (
            <CardFrame className="p-16 text-center opacity-30 text-black"><Zap size={60} className="mx-auto mb-4" /><p className="font-black">仓库目前空空如也</p></CardFrame>
        ) : (
            <div className="space-y-12">
                {Object.entries(groupedWarehouse).map(([carName, items]) => (
                    <div key={carName}>
                        <div className="flex items-center gap-4 mb-5 text-black">
                            <Sticker className="bg-yellow-300 min-w-[120px] text-center italic cursor-default active:translate-y-0">{carName}</Sticker>
                            <div className="h-1 flex-1 bg-black rounded-full opacity-20"></div>
                        </div>
                        <div className="grid gap-5">
                            {items.map((item) => (
                                <CardFrame key={item.timestamp} className={`p-4 flex items-center gap-4 border-2 ${selectedInventory.includes(item.timestamp) ? 'bg-indigo-50 border-indigo-500 shadow-none translate-x-1' : ''}`} onClick={() => toggleSelection(item.timestamp)}>
                                    <div className="shrink-0">{selectedInventory.includes(item.timestamp) ? <CheckSquare className="text-indigo-600" strokeWidth={3} /> : <Square className="text-slate-300" strokeWidth={3} />}</div>
                                    <div className={`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center text-white text-lg font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${PRIZE_TYPES[item.type]?.color}`}>{item.type}</div>
                                    <div className="flex-1 font-black text-black text-sm truncate">{item.name} <span className="text-[10px] text-slate-400 ml-2">#{item.seat}</span></div>
                                </CardFrame>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const ShippingSummaryView = ({ setView, addresses, stores, shippingMethod, setShippingMethod, selectedAddressId, setSelectedAddressId, handleConfirmShipping, setModal }) => {
    const activeAddr = addresses.find(a => a.id === selectedAddressId) || addresses[0];
    return (
        <div className="p-6 mb-24 animate-in slide-in-from-right duration-300 text-black font-black">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('warehouse')} className="border-4 border-black p-1 rounded-xl active:bg-slate-100"><ChevronRight size={24} className="rotate-180" /></button>
                <h1 className="text-2xl font-black italic">确认传送</h1>
            </div>
            <CardFrame className="p-6 mb-6">
                <h3 className="font-black text-sm mb-4 flex items-center gap-2"><Truck size={18} /> 物流协议</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShippingMethod('express')} className={`p-4 rounded-2xl border-4 border-black font-black text-xs shadow-brutal ${shippingMethod === 'express' ? 'bg-indigo-500 text-white' : 'bg-white'}`}>快递</button>
                    <button onClick={() => setShippingMethod('pickup')} className={`p-4 rounded-2xl border-4 border-black font-black text-xs shadow-brutal ${shippingMethod === 'pickup' ? 'bg-indigo-500 text-white' : 'bg-white'}`}>自提</button>
                </div>
            </CardFrame>
            {shippingMethod === 'express' ? (
                <CardFrame className="p-6 mb-6" onClick={() => setModal({ type: 'select_address' })}>
                    <div className="flex justify-between items-center mb-4 font-black"><h3 className="font-black text-sm flex items-center gap-2"><MapPin size={18} /> 收货坐标</h3><div className="flex items-center gap-1 text-[10px] text-blue-500 underline">切换坐标</div></div>
                    {activeAddr ? (
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-black/5">
                            <div className="font-black text-sm mb-1">{activeAddr.name} {activeAddr.phone}</div>
                            <div className="text-[10px] text-slate-500">{activeAddr.detail}</div>
                            {activeAddr.isDefault && <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold mt-2 inline-block">默认</span>}
                        </div>
                    ) : <div className="text-center py-4 text-xs font-bold text-slate-400">请点击选择传送点</div>}
                </CardFrame>
            ) : (
                <CardFrame className="p-6 mb-6 text-black font-black">
                    <h3 className="font-black text-sm mb-4 flex items-center gap-2"><Map size={18} /> 选择据点</h3>
                    <div className="space-y-3">{stores.map(s => (<div key={s.id} className="bg-slate-50 p-4 rounded-2xl border-2 border-black/5 active:border-indigo-500"><div className="font-black text-sm">{s.name}</div><div className="text-[10px] text-slate-500">{s.address}</div></div>))}</div>
                </CardFrame>
            )}
            <button onClick={handleConfirmShipping} className="w-full mt-8 bg-black text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] active:translate-y-1 transition-all">确认传送指令</button>
        </div>
    );
};

const ProfileView = ({ user, addresses, setModal, handleLogout, setUser, deleteAddress, setView, editAddress }) => (
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
                <button onClick={() => setUser(p => ({ ...p, balance: p.balance + 1000 }))} className="w-full bg-white border-4 border-black p-6 rounded-[2rem] flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1"><div className="flex items-center gap-5 text-black"><div className="w-12 h-12 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-brutal"><Award size={24} strokeWidth={3} /></div><span className="font-black text-xl underline decoration-indigo-500 decoration-4">补给魔法 ¥1000</span></div><ChevronRight size={32} strokeWidth={4} /></button>
                <button onClick={handleLogout} className="w-full bg-rose-500 text-white border-4 border-black p-6 rounded-[2rem] font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1">注销当前次元</button>
            </div>
        ) : (<button onClick={() => setModal({ type: 'login' })} className="w-full mt-10 bg-yellow-400 border-4 border-black p-8 rounded-[3rem] flex items-center justify-center gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black"><LogIn size={32} strokeWidth={4} /><span className="font-black text-xl italic underline decoration-black decoration-6">冒险登录</span></button>)}
    </div>
);

const ShippingHistoryView = ({ history, setView }) => (
    <div className="p-6 mb-24 animate-in slide-in-from-right duration-300 text-black font-black">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('profile')} className="border-4 border-black p-1 rounded-xl active:bg-slate-100 transition-colors"><ChevronRight size={24} className="rotate-180" /></button>
            <h1 className="text-2xl font-black italic">传送记录</h1>
        </div>
        {history.length === 0 ? (
            <CardFrame className="p-20 text-center border-dashed text-slate-300"><History size={64} className="mx-auto mb-4 opacity-10" /><p className="font-black text-sm">尚未发现传送波动</p></CardFrame>
        ) : (
            <div className="space-y-6">
                {history.map(record => (
                    <CardFrame key={record.id} className="p-5 border-black">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Sticker className={`${record.status === '打包中' ? 'bg-amber-300' : 'bg-blue-400'} text-black mb-2 cursor-default active:translate-y-0`}>{record.status}</Sticker>
                                <div className="text-[10px] font-black opacity-40 uppercase">次元码: #{record.id.toString().slice(-6)}</div>
                            </div>
                            <div className="text-right text-[10px] font-black italic opacity-60">{record.date}</div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {record.items.map((item, idx) => (
                                <div key={idx} className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${PRIZE_TYPES[item.type]?.color}`}>{item.type}</div>
                            ))}
                        </div>
                    </CardFrame>
                ))}
            </div>
        )}
    </div>
);

const AdminView = ({ form, setForm, handleCreateCar, stores, setModal }) => (
    <div className="p-6 mb-32 overflow-y-auto animate-in fade-in duration-500 text-black font-black">
        <h1 className="text-3xl font-black mb-10 italic flex items-center gap-3 underline decoration-indigo-400 decoration-4 text-black"><Settings className="text-indigo-500" /> 建造工坊</h1>
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

const ModalPortal = ({ modal, setModal, handleLogin, setJoinCount, joinCount, handleJoinByCount, tempAddress, setTempAddress, handleSaveAddress, user, addresses, selectedAddressId, setSelectedAddressId }) => {
    if (!modal) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={() => setModal(null)}></div>
            <div className="relative bg-white border-4 border-black rounded-[3.5rem] p-8 w-full max-w-sm shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-300 max-h-[85vh] flex flex-col text-black font-black">
                <button onClick={() => setModal(null)} className="absolute -top-4 -right-4 bg-white border-4 border-black p-2 rounded-full hover:bg-rose-500 hover:text-white transition-colors z-10"><X size={24} strokeWidth={5} /></button>

                {modal.type === 'select_address' && (
                    <>
                        <h3 className="text-xl font-black mb-6 underline decoration-indigo-400 decoration-4 italic uppercase">切换传送坐标</h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {addresses.map(a => (
                                <div key={a.id} onClick={() => { setSelectedAddressId(a.id); setModal(null); }} className={`p-4 border-4 border-black rounded-2xl cursor-pointer transition-all ${selectedAddressId === a.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white'}`}>
                                    <div className="font-black text-sm">{a.name} {a.phone}</div>
                                    <div className="text-[10px] text-slate-500">{a.detail}</div>
                                </div>
                            ))}
                            <button onClick={() => setModal({ type: 'address_form' })} className="w-full py-4 border-4 border-dashed border-black rounded-2xl font-black text-xs hover:bg-slate-50 transition-colors">+ 添加新坐标</button>
                        </div>
                    </>
                )}

                {modal.type === 'address_form' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black mb-6 underline decoration-indigo-400 decoration-4 italic uppercase">{tempAddress.id ? '编辑坐标' : '标记新坐标'}</h3>
                        <input placeholder="收件人姓名" className="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white" value={tempAddress.name} onChange={e => setTempAddress({ ...tempAddress, name: e.target.value })} />
                        <input placeholder="联络信号 (手机)" className="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white" value={tempAddress.phone} onChange={e => setTempAddress({ ...tempAddress, phone: e.target.value })} />
                        <textarea placeholder="详细传送地址" className="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm h-20 outline-none focus:bg-white resize-none" value={tempAddress.detail} onChange={e => setTempAddress({ ...tempAddress, detail: e.target.value })} />
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 border-4 border-black rounded appearance-none checked:bg-indigo-500 transition-colors" checked={tempAddress.isDefault} onChange={e => setTempAddress({ ...tempAddress, isDefault: e.target.checked })} /><span>设为默认传送点</span></label>
                        <button onClick={handleSaveAddress} className="w-full bg-black text-white py-4 rounded-2xl font-black shadow-brutal active:translate-y-1 transition-all uppercase">确认记录</button>
                    </div>
                )}

                {modal.type === 'login' && (<div className="text-center py-6"><div className="w-20 h-20 bg-indigo-100 border-4 border-black text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto rotate-12 shadow-brutal"><User size={40} strokeWidth={4} /></div><h3 className="text-2xl font-black mb-1 italic underline decoration-indigo-400 decoration-6 underline-offset-4 uppercase">次元入口</h3><div className="space-y-4 mt-10"><button onClick={() => handleLogin('user')} className="w-full bg-yellow-400 border-4 border-black py-4 rounded-2xl shadow-brutal active:shadow-none transition-all">勇者登录</button><button onClick={() => handleLogin('admin')} className="w-full bg-black text-white py-4 rounded-2xl shadow-brutal active:shadow-none transition-all">管理员登录</button></div></div>)}

                {modal.type === 'results' && (<><div className="flex items-center gap-3 mb-6 shrink-0"><div className="w-12 h-12 bg-indigo-100 border-4 border-black text-indigo-600 rounded-2xl flex items-center justify-center rotate-12 shadow-brutal"><ScrollText size={24} strokeWidth={3} /></div><div><h3 className="text-xl font-black italic underline decoration-indigo-400 decoration-4">狩猎战报</h3><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest truncate max-w-[180px]">{modal.data.name}</p></div></div><div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-3 custom-scrollbar content-start pb-4">{Object.entries(modal.data.occupiedSeats).map(([seatNum, occupant]) => { const prize = modal.data.results[parseInt(seatNum) - 1]; const isMe = occupant.uid === user.id; return (<div key={seatNum} className={`p-2 rounded-2xl border-2 border-black flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${isMe ? 'bg-indigo-50' : 'bg-slate-50'}`}><div className="flex items-center justify-between"><div className="w-5 h-5 rounded bg-black text-white font-black text-[9px] flex items-center justify-center italic shrink-0">{seatNum}</div><div className={`px-1.5 py-0.5 rounded text-[7px] font-black text-white border border-black ${PRIZE_TYPES[prize.type]?.color}`}>{prize.type}赏</div></div><div className="min-w-0"><div className="flex items-center gap-1"><span className="font-black text-[9px] truncate">{occupant.name || '路人X'}</span>{isMe && <span className="bg-emerald-500 text-white text-[6px] px-1 rounded font-bold">我</span>}</div><div className="text-[8px] font-bold text-slate-500 truncate mt-0.5 leading-tight">{prize.name}</div></div></div>); })}</div><button onClick={() => setModal(null)} className="w-full bg-black text-white py-4 rounded-3xl font-black shrink-0 shadow-brutal active:translate-y-0.5 transition-all">关闭战报</button></>)}

                {modal.type === 'join' && (<div className="text-center py-4"><h3 className="text-3xl font-black mb-1 italic uppercase underline decoration-rose-500 decoration-6 tracking-tighter">JOIN PARTY!</h3><div className="flex items-center justify-between bg-slate-100 border-4 border-black p-5 rounded-[2rem] my-8 shadow-inner"><button onClick={() => setJoinCount(Math.max(1, joinCount - 1))} className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black"><Minus size={28} strokeWidth={5} /></button><span className="text-5xl font-black italic">{joinCount}</span><button onClick={() => setJoinCount(joinCount + 1)} className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black"><Plus size={28} strokeWidth={5} /></button></div><button onClick={() => handleJoinByCount(modal.data.id, joinCount)} className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] active:translate-y-1 transition-all">确认加入 (¥{(modal.data.price * modal.data.discount / 100 * joinCount).toFixed(1)})</button></div>)}

                {modal.type === 'preview' && (<><button onClick={() => setModal(null)} className="absolute -top-4 -right-4 bg-white border-4 border-black p-2 rounded-full hover:bg-rose-500 hover:text-white transition-colors z-10"><X size={28} strokeWidth={5} /></button><div className="border-4 border-black rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 shadow-brutal"><img src={modal.data.img || 'https://via.placeholder.com/300'} className="w-full aspect-square object-cover" /></div><div className="px-3"><div className="flex items-center gap-4 mb-4"><Sticker className={`${PRIZE_TYPES[modal.data.type]?.color} text-white border-black cursor-default active:translate-y-0`}>{modal.data.type}赏</Sticker><span className="text-slate-400 text-[10px] font-black uppercase italic">传奇掉落</span></div><h4 className="text-3xl font-black text-black mb-3 italic underline decoration-indigo-400 decoration-6 underline-offset-4">{modal.data.name}</h4><p className="text-slate-500 text-[12px] font-bold leading-relaxed italic border-l-8 border-slate-200 pl-4">传说中的秘宝。只有最快集结同伴的勇者方能夺得！</p></div></>)}

                {modal.type === 'info' && (<div className="text-center py-4 text-black"><div className="w-20 h-20 bg-blue-100 border-4 border-black text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto rotate-12 shadow-brutal"><Sparkles size={40} strokeWidth={4} /></div><h3 className="text-2xl font-black mb-4 italic tracking-tighter uppercase underline decoration-blue-400 decoration-6">{modal.title}</h3><p className="text-slate-500 text-[12px] mb-10 px-2 font-black italic leading-relaxed">{modal.content}</p><button onClick={() => setModal(null)} className="w-full bg-black text-white py-5 rounded-[2rem] font-black active:translate-y-1 transition-all uppercase tracking-[0.2em]">收到！</button></div>)}
            </div>
        </div>
    );
};

export default function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState({
        id: 'u1', name: '40岁勇者', balance: 5000, items: [
            { type: 'A', name: '鸣人 仙人模式手办', carName: '火影忍者 - 羁绊之风', seat: '6', timestamp: 1001 },
            { type: 'B', name: '佐助 须佐之男立牌', carName: '火影忍者 - 羁绊之风', seat: '8', timestamp: 1002 },
            { type: 'F', name: '木叶村 徽章', carName: '火影忍者 - 羁绊之风', seat: '10', timestamp: 1003 }
        ], isLoggedIn: true, role: 'user'
    });

    const [activeCars, setActiveCars] = useState([
        { id: 'car-201', name: '海贼王 - 意志的继承', totalSeats: 10, price: 68, discount: 100, description: '大海贼时代的冒险！目前 50% 集结中。', prizes: [{ type: 'A', name: '路飞手办', count: 1, img: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=200' }, { type: 'F', name: '挂件', count: 9 }], occupiedSeats: { '1': { uid: 'u2', name: '欧皇' }, '2': { name: '非酋' }, '3': { name: '路人A' }, '4': { name: '路人B' }, '5': { name: '路人C' } }, status: 'open', results: [] },
        {
            id: 'car-202', name: '火影忍者 - 羁绊之风', totalSeats: 10, price: 58, discount: 80, description: '全员集结完毕，狩猎大成功！', prizes: [{ type: 'A', name: '鸣人手办', count: 1 }, { type: 'B', name: '佐助立牌', count: 1 }, { type: 'F', name: '徽章', count: 8 }],
            // 修复：补全 10 个席位的英雄数据，使其显示 10/10
            occupiedSeats: {
                '1': { name: '小李' }, '2': { name: '鹿丸' }, '3': { name: '雏田' }, '4': { name: '卡卡西' }, '5': { name: '佐井' },
                '6': { uid: 'u1', name: '40岁勇者' }, '7': { name: '自来也' }, '8': { uid: 'u1', name: '40岁勇者' }, '9': { name: '纲手' }, '10': { uid: 'u1', name: '40岁勇者' }
            },
            status: 'unboxed',
            results: [{ type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'A', name: '鸣人手办' }, { type: 'F', name: '徽章' }, { type: 'B', name: '佐助立牌' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }]
        }
    ]);

    const [modal, setModal] = useState(null);
    const [joinCount, setJoinCount] = useState(1);
    const [shippingHistory, setShippingHistory] = useState([]);
    const [addresses, setAddresses] = useState([{ id: 1, name: '勇者基地', phone: '13888888888', detail: '次元节点 A-01 号', isDefault: true }]);
    const [selectedAddressId, setSelectedAddressId] = useState(1);
    const [stores, setStores] = useState([{ id: 1, name: '次元据点1号', address: '秋叶原 1-1-1', hours: '10:00 - 22:00' }]);
    const [selectedInventory, setSelectedInventory] = useState([]);
    const [shippingMethod, setShippingMethod] = useState('express');
    const [tempAddress, setTempAddress] = useState({ name: '', phone: '', detail: '', isDefault: false, id: null });
    const [tempStore, setTempStore] = useState({ name: '', address: '', hours: '09:00 - 21:00' });
    const [form, setForm] = useState({ name: '', totalSeats: 10, price: 68, discount: 100, description: '', prizes: [] });

    const groupedWarehouse = useMemo(() => {
        if (!user.isLoggedIn) return {};
        return user.items.reduce((acc, item) => {
            const key = item.carName || "未知车队";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [user.items, user.isLoggedIn]);

    const checkAuth = () => { if (!user.isLoggedIn) { setModal({ type: 'login' }); return false; } return true; };
    const handleLogin = (r) => { setUser({ ...user, isLoggedIn: true, role: r }); setModal({ type: 'info', title: '登录成功!', content: '欢迎回来！' }); };
    const handleLogout = () => { setUser({ id: null, name: '访客', balance: 0, items: [], isLoggedIn: false, role: 'user' }); setView('home'); setSelectedInventory([]); };
    const toggleSelection = (t) => setSelectedInventory(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
    const handleSelectAll = () => { if (selectedInventory.length === user.items.length) { setSelectedInventory([]); } else { setSelectedInventory(user.items.map(i => i.timestamp)); } };
    const deleteAddress = (id) => setAddresses(addresses.filter(a => a.id !== id));
    const editAddress = (a) => { setTempAddress({ ...a }); setModal({ type: 'address_form' }); };
    const addStore = () => { setStores([...stores, { ...tempStore, id: Date.now() }]); setModal(null); setTempStore({ name: '', address: '', hours: '09:00 - 21:00' }); };

    const handleSaveAddress = () => {
        let updated;
        if (tempAddress.id) { updated = addresses.map(a => a.id === tempAddress.id ? { ...tempAddress } : a); }
        else { updated = [...addresses, { ...tempAddress, id: Date.now() }]; }
        if (tempAddress.isDefault) { updated = updated.map(a => a.id === (tempAddress.id || updated[updated.length - 1].id) ? a : { ...a, isDefault: false }); }
        setAddresses(updated);
        setModal(null);
        setTempAddress({ name: '', phone: '', detail: '', isDefault: false, id: null });
    };

    const handleConfirmShipping = () => {
        const selectedItems = user.items.filter(item => selectedInventory.includes(item.timestamp));
        if (selectedItems.length === 0) return;
        const newRecord = { id: Date.now(), items: selectedItems, method: shippingMethod, status: '打包中', date: new Date().toLocaleString('zh-CN', { hour12: false }) };
        setShippingHistory([newRecord, ...shippingHistory]);
        setUser(prev => ({ ...prev, items: prev.items.filter(item => !selectedInventory.includes(item.timestamp)) }));
        setSelectedInventory([]);
        setModal({ type: 'info', title: '申请传送!', content: '物资正在打包中！' });
        setView('warehouse');
    };

    const handleCreateCar = () => {
        const total = form.prizes.reduce((acc, p) => acc + parseInt(p.count || 0), 0);
        if (total !== parseInt(form.totalSeats)) { setModal({ type: 'info', title: '配置错误!', content: `奖品总数(${total})必须等于车位数(${form.totalSeats})。` }); return; }
        setActiveCars([{ id: `car-${Date.now()}`, ...form, totalSeats: parseInt(form.totalSeats), occupiedSeats: {}, status: 'open', results: generateResult(form.prizes) }, ...activeCars]);
        setView('home');
    };

    const handleJoinByCount = (carId, count) => {
        const targetCar = activeCars.find(c => c.id === carId);
        const totalPrice = (targetCar.price * (targetCar.discount / 100) * count).toFixed(2);
        let newOccupied = { ...targetCar.occupiedSeats };
        let allocated = 0, isLast = false;
        for (let i = 1; i <= targetCar.totalSeats; i++) {
            if (!newOccupied[i] && allocated < count) {
                newOccupied[i] = { uid: user.id, name: user.name };
                allocated++;
                if (i === targetCar.totalSeats) isLast = true;
            }
        }
        const isFull = Object.keys(newOccupied).length === targetCar.totalSeats;
        setActiveCars(p => p.map(c => c.id === carId ? { ...c, occupiedSeats: newOccupied, status: isFull ? 'unboxed' : 'open' } : c));
        setUser(prev => ({ ...prev, balance: prev.balance - totalPrice }));
        setModal(null);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden select-none pb-20">
            {view === 'home' && <HomeView activeCars={activeCars} user={user} setModal={setModal} checkAuth={checkAuth} />}
            {view === 'warehouse' && <WarehouseView isLoggedIn={user.isLoggedIn} groupedWarehouse={groupedWarehouse} selectedInventory={selectedInventory} toggleSelection={toggleSelection} setView={setView} setModal={setModal} onSelectAll={handleSelectAll} />}
            {view === 'shipping_summary' && <ShippingSummaryView setView={setView} addresses={addresses} stores={stores} shippingMethod={shippingMethod} setShippingMethod={setShippingMethod} selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} handleConfirmShipping={handleConfirmShipping} setModal={setModal} />}
            {view === 'profile' && <ProfileView user={user} addresses={addresses} setModal={setModal} handleLogout={handleLogout} setUser={setUser} deleteAddress={deleteAddress} setView={setView} editAddress={editAddress} />}
            {view === 'shipping_history' && <ShippingHistoryView history={shippingHistory} setView={setView} />}
            {view === 'admin' && user.role === 'admin' && <AdminView form={form} setForm={setForm} handleCreateCar={handleCreateCar} stores={stores} setModal={setModal} />}

            <BottomNav view={view} setView={setView} userRole={user.role} />
            <ModalPortal modal={modal} setModal={setModal} handleLogin={handleLogin} setJoinCount={setJoinCount} joinCount={joinCount} handleJoinByCount={handleJoinByCount} tempAddress={tempAddress} setTempAddress={setTempAddress} handleSaveAddress={handleSaveAddress} user={user} addresses={addresses} selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} />
        </div>
    );
}