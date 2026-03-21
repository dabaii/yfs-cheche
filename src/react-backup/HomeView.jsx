import React from 'react';
import { Zap, Heart, Trophy } from 'lucide-react';
import { Sticker } from '../components/ui/Sticker';
import { CardFrame } from '../components/ui/CardFrame';
import { PRIZE_TYPES } from '../constants';

export const HomeView = ({ activeCars, user, setModal, checkAuth }) => (
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
