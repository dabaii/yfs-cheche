import React, { useState } from 'react';
import { X, User, ScrollText, Minus, Plus, Sparkles } from 'lucide-react';
import { Sticker } from '../ui/Sticker';
import { PRIZE_TYPES } from '../../constants';

export const ModalPortal = ({ modal, setModal, handleAuth, setJoinCount, joinCount, handleJoinByCount, tempAddress, setTempAddress, handleSaveAddress, user, addresses, selectedAddressId, setSelectedAddressId }) => {
    const [authMode, setAuthMode] = useState('login');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitAuth = () => {
        if (!phone || !password) {
            alert("请输入手机号和密码");
            return;
        }
        handleAuth(authMode, phone, password);
    };
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

                {modal.type === 'login' && (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-indigo-100 border-4 border-black text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto rotate-12 shadow-brutal">
                            <User size={40} strokeWidth={4} />
                        </div>
                        <h3 className="text-2xl font-black mb-1 italic underline decoration-indigo-400 decoration-6 underline-offset-4 uppercase">
                            {authMode === 'login' ? '次元入口' : authMode === 'register' ? '注册新勇者' : '重置密码'}
                        </h3>
                        
                        <div className="flex justify-center gap-2 mt-4 mb-6">
                            <button onClick={() => setAuthMode('login')} className={`px-3 py-1 font-black text-xs border-2 border-black rounded-xl ${authMode === 'login' ? 'bg-indigo-500 text-white' : 'bg-white'}`}>登录</button>
                            <button onClick={() => setAuthMode('register')} className={`px-3 py-1 font-black text-xs border-2 border-black rounded-xl ${authMode === 'register' ? 'bg-indigo-500 text-white' : 'bg-white'}`}>注册</button>
                            <button onClick={() => setAuthMode('forgot')} className={`px-3 py-1 font-black text-xs border-2 border-black rounded-xl ${authMode === 'forgot' ? 'bg-indigo-500 text-white' : 'bg-white'}`}>找回</button>
                        </div>

                        <div className="space-y-4">
                            <input 
                                type="text"
                                placeholder="输入手机号码" 
                                className="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black"
                                value={phone} 
                                onChange={e => setPhone(e.target.value)} 
                            />
                            <input 
                                type="password"
                                placeholder={authMode === 'forgot' ? '输入新密码' : '输入密码'} 
                                className="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                            />
                            <button onClick={onSubmitAuth} className="w-full bg-yellow-400 border-4 border-black py-4 rounded-2xl shadow-brutal active:shadow-none transition-all uppercase italic font-black text-lg">
                                {authMode === 'login' ? '确认登录' : authMode === 'register' ? '确认注册' : '确认重置'}
                            </button>
                        </div>
                    </div>
                )}

                {modal.type === 'results' && (<><div className="flex items-center gap-3 mb-6 shrink-0"><div className="w-12 h-12 bg-indigo-100 border-4 border-black text-indigo-600 rounded-2xl flex items-center justify-center rotate-12 shadow-brutal"><ScrollText size={24} strokeWidth={3} /></div><div><h3 className="text-xl font-black italic underline decoration-indigo-400 decoration-4">狩猎战报</h3><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest truncate max-w-[180px]">{modal.data.name}</p></div></div><div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-3 custom-scrollbar content-start pb-4">{Object.entries(modal.data.occupiedSeats).map(([seatNum, occupant]) => { const prize = modal.data.results[parseInt(seatNum) - 1]; const isMe = occupant.uid === user.id; return (<div key={seatNum} className={`p-2 rounded-2xl border-2 border-black flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${isMe ? 'bg-indigo-50' : 'bg-slate-50'}`}><div className="flex items-center justify-between"><div className="w-5 h-5 rounded bg-black text-white font-black text-[9px] flex items-center justify-center italic shrink-0">{seatNum}</div><div className={`px-1.5 py-0.5 rounded text-[7px] font-black text-white border border-black ${PRIZE_TYPES[prize.type]?.color}`}>{prize.type}赏</div></div><div className="min-w-0"><div className="flex items-center gap-1"><span className="font-black text-[9px] truncate">{occupant.name || '路人X'}</span>{isMe && <span className="bg-emerald-500 text-white text-[6px] px-1 rounded font-bold">我</span>}</div><div className="text-[8px] font-bold text-slate-500 truncate mt-0.5 leading-tight">{prize.name}</div></div></div>); })}</div><button onClick={() => setModal(null)} className="w-full bg-black text-white py-4 rounded-3xl font-black shrink-0 shadow-brutal active:translate-y-0.5 transition-all">关闭战报</button></>)}

                {modal.type === 'join' && (
                    <div className="text-center py-4">
                        <h3 className="text-3xl font-black mb-1 italic uppercase underline decoration-rose-500 decoration-6 tracking-tighter">JOIN PARTY!</h3>
                        <div className="flex items-center justify-between bg-slate-100 border-4 border-black p-5 rounded-[2rem] my-8 shadow-inner">
                            <button onClick={() => setJoinCount(Math.max(1, joinCount - 1))} className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black">
                                <Minus size={28} strokeWidth={5} />
                            </button>
                            <span className="text-5xl font-black italic">{joinCount}</span>
                            <button onClick={() => {
                                const maxJoin = modal.data.totalSeats - Object.keys(modal.data.occupiedSeats || {}).length;
                                setJoinCount(Math.min(maxJoin, joinCount + 1));
                            }} className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black">
                                <Plus size={28} strokeWidth={5} />
                            </button>
                        </div>
                        <button onClick={() => handleJoinByCount(modal.data.id, joinCount)} className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] active:translate-y-1 transition-all">
                            确认加入 (¥{(modal.data.price * modal.data.discount / 100 * joinCount).toFixed(1)})
                        </button>
                    </div>
                )}

                {modal.type === 'preview' && (<><button onClick={() => setModal(null)} className="absolute -top-4 -right-4 bg-white border-4 border-black p-2 rounded-full hover:bg-rose-500 hover:text-white transition-colors z-10"><X size={28} strokeWidth={5} /></button><div className="border-4 border-black rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 shadow-brutal"><img src={modal.data.img || 'https://via.placeholder.com/300'} className="w-full aspect-square object-cover" /></div><div className="px-3"><div className="flex items-center gap-4 mb-4"><Sticker className={`${PRIZE_TYPES[modal.data.type]?.color} text-white border-black cursor-default active:translate-y-0`}>{modal.data.type}赏</Sticker><span className="text-slate-400 text-[10px] font-black uppercase italic">传奇掉落</span></div><h4 className="text-3xl font-black text-black mb-3 italic underline decoration-indigo-400 decoration-6 underline-offset-4">{modal.data.name}</h4><p className="text-slate-500 text-[12px] font-bold leading-relaxed italic border-l-8 border-slate-200 pl-4">传说中的秘宝。只有最快集结同伴的勇者方能夺得！</p></div></>)}

                {modal.type === 'info' && (<div className="text-center py-4 text-black"><div className="w-20 h-20 bg-blue-100 border-4 border-black text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto rotate-12 shadow-brutal"><Sparkles size={40} strokeWidth={4} /></div><h3 className="text-2xl font-black mb-4 italic tracking-tighter uppercase underline decoration-blue-400 decoration-6">{modal.title}</h3><p className="text-slate-500 text-[12px] mb-10 px-2 font-black italic leading-relaxed">{modal.content}</p><button onClick={() => setModal(null)} className="w-full bg-black text-white py-5 rounded-[2rem] font-black active:translate-y-1 transition-all uppercase tracking-[0.2em]">收到！</button></div>)}
            </div>
        </div>
    );
};
