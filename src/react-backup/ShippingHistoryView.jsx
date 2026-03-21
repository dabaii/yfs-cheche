import React from 'react';
import { ChevronRight, History } from 'lucide-react';
import { Sticker } from '../components/ui/Sticker';
import { CardFrame } from '../components/ui/CardFrame';
import { PRIZE_TYPES } from '../constants';

export const ShippingHistoryView = ({ history, setView }) => (
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
