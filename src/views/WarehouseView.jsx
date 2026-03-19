import React from 'react';
import { Package, Lock, Zap, CheckSquare, Square } from 'lucide-react';
import { Sticker } from '../components/ui/Sticker';
import { CardFrame } from '../components/ui/CardFrame';
import { PRIZE_TYPES } from '../constants';

export const WarehouseView = ({ isLoggedIn, groupedWarehouse, selectedInventory, toggleSelection, setView, setModal, onSelectAll }) => (
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
