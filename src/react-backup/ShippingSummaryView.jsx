import React from 'react';
import { ChevronRight, Truck, MapPin, Map } from 'lucide-react';
import { CardFrame } from '../components/ui/CardFrame';

export const ShippingSummaryView = ({ setView, addresses, stores, shippingMethod, setShippingMethod, selectedAddressId, setSelectedAddressId, handleConfirmShipping, setModal }) => {
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
