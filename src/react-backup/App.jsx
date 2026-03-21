import React, { useState, useMemo, useEffect } from 'react';
import { generateResult } from './utils';
import { 
    fetchUser, fetchActiveCars, fetchAddresses, fetchStores, fetchShippingHistory,
    apiLogin, apiLogout, apiCreateAddress, apiUpdateAddress, apiDeleteAddress,
    apiJoinCar, apiCreateCar, apiCreateShippingRecord, apiAddBalance,
    apiRegister, apiForgotPassword, apiGrantAdmin
} from './api';

import { BottomNav } from './components/layout/BottomNav';
import { ModalPortal } from './components/modals/ModalPortal';
import { HomeView } from './views/HomeView';
import { WarehouseView } from './views/WarehouseView';
import { ShippingSummaryView } from './views/ShippingSummaryView';
import { ProfileView } from './views/ProfileView';
import { ShippingHistoryView } from './views/ShippingHistoryView';
import { AdminView } from './views/AdminView';

export default function App() {
    const [view, setView] = useState('home');
    const [isLoading, setIsLoading] = useState(true);

    const [user, setUser] = useState({ id: null, name: '访客', balance: 0, items: [], isLoggedIn: false, role: 'user' });
    const [activeCars, setActiveCars] = useState([]);
    const [shippingHistory, setShippingHistory] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [stores, setStores] = useState([]);

    const [modal, setModal] = useState(null);
    const [joinCount, setJoinCount] = useState(1);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState([]);
    const [shippingMethod, setShippingMethod] = useState('express');
    const [tempAddress, setTempAddress] = useState({ name: '', phone: '', detail: '', isDefault: false, id: null });
    const [tempStore, setTempStore] = useState({ name: '', address: '', hours: '09:00 - 21:00' });
    const [form, setForm] = useState({ name: '', totalSeats: 10, price: 68, discount: 100, description: '', prizes: [] });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [userData, carsData, addressesData, storesData, historyData] = await Promise.all([
                    fetchUser(),
                    fetchActiveCars(),
                    fetchAddresses(),
                    fetchStores(),
                    fetchShippingHistory()
                ]);
                
                if (userData.success) setUser(userData.data);
                if (carsData.success) setActiveCars(carsData.data);
                if (addressesData.success) {
                    setAddresses(addressesData.data);
                    if (addressesData.data.length > 0) setSelectedAddressId(addressesData.data[0].id);
                }
                if (storesData.success) setStores(storesData.data);
                if (historyData.success) setShippingHistory(historyData.data);
            } catch (error) {
                console.error("加载初始数据失败:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const groupedWarehouse = useMemo(() => {
        if (!user.isLoggedIn || !user.items) return {};
        return user.items.reduce((acc, item) => {
            const key = item.carName || "未知车队";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [user.items, user.isLoggedIn]);

    const checkAuth = () => { if (!user.isLoggedIn) { setModal({ type: 'login' }); return false; } return true; };
    
    const handleAuth = async (action, phone, password) => { 
        let res;
        if (action === 'login') res = await apiLogin(phone, password);
        else if (action === 'register') res = await apiRegister(phone, password);
        else if (action === 'forgot') res = await apiForgotPassword(phone, password);

        if (res.success) {
            if (action === 'forgot') {
                setModal({ type: 'info', title: '操作成功', content: res.message });
            } else {
                setUser(res.data); 
                setModal({ type: 'info', title: '操作成功!', content: res.message }); 
            }
        } else {
            alert(res.message);
        }
    };
    
    const handleGrantAdmin = async (phone) => {
        const res = await apiGrantAdmin(phone);
        if (res.success) {
            setModal({ type: 'info', title: '授权成功', content: res.message });
        } else {
            alert(res.message);
        }
    };
    
    const handleLogout = async () => { 
        const res = await apiLogout();
        if (res.success) {
            setUser({ id: null, name: '访客', balance: 0, items: [], isLoggedIn: false, role: 'user' }); 
            setView('home'); 
            setSelectedInventory([]); 
        }
    };

    const toggleSelection = (t) => setSelectedInventory(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
    const handleSelectAll = () => { if (selectedInventory.length === user.items.length) { setSelectedInventory([]); } else { setSelectedInventory(user.items.map(i => i.timestamp)); } };
    
    const deleteAddress = async (id) => { 
        const res = await apiDeleteAddress(id);
        if (res.success) {
            setAddresses(addresses.filter(a => a.id !== id)); 
        }
    };
    
    const editAddress = (a) => { setTempAddress({ ...a }); setModal({ type: 'address_form' }); };
    
    const addStore = () => { setStores([...stores, { ...tempStore, id: Date.now() }]); setModal(null); setTempStore({ name: '', address: '', hours: '09:00 - 21:00' }); };

    const handleSaveAddress = async () => {
        let updated;
        if (tempAddress.id) { 
            const res = await apiUpdateAddress(tempAddress.id, tempAddress);
            if (res.success) updated = addresses.map(a => a.id === tempAddress.id ? { ...tempAddress } : a); 
        } else { 
            const res = await apiCreateAddress(tempAddress);
            if (res.success) updated = [...addresses, res.data]; 
        }
        
        if (updated) {
            if (tempAddress.isDefault) { 
                updated = updated.map(a => a.id === (tempAddress.id || updated[updated.length - 1].id) ? a : { ...a, isDefault: false }); 
            }
            setAddresses(updated);
            setModal(null);
            setTempAddress({ name: '', phone: '', detail: '', isDefault: false, id: null });
        }
    };

    const handleConfirmShipping = async () => {
        const selectedItems = user.items.filter(item => selectedInventory.includes(item.timestamp));
        if (selectedItems.length === 0) return;

        const res = await apiCreateShippingRecord(selectedItems, shippingMethod);
        if (res.success) {
            setShippingHistory([res.data, ...shippingHistory]);
            setUser(prev => ({ ...prev, items: prev.items.filter(item => !selectedInventory.includes(item.timestamp)) }));
            setSelectedInventory([]);
            setModal({ type: 'info', title: '申请传送!', content: '物资正在打包中！' });
            setView('warehouse');
        }
    };

    const handleCreateCar = async () => {
        const total = form.prizes.reduce((acc, p) => acc + parseInt(p.count || 0), 0);
        if (total !== parseInt(form.totalSeats)) { setModal({ type: 'info', title: '配置错误!', content: `奖品总数(${total})必须等于车位数(${form.totalSeats})。` }); return; }
        
        const carData = { ...form, totalSeats: parseInt(form.totalSeats), occupiedSeats: {}, status: 'open', results: generateResult(form.prizes) };
        const res = await apiCreateCar(carData);
        if (res.success) {
            setActiveCars([res.data, ...activeCars]);
            setView('home');
        }
    };

    const handleJoinByCount = async (carId, count) => {
        const targetCar = activeCars.find(c => c.id === carId);
        const totalPrice = (targetCar.price * (targetCar.discount / 100) * count).toFixed(2);
        
        const res = await apiJoinCar(carId, count, totalPrice);
        if (res.success) {
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
        }
    };

    const handleAddBalance = async () => {
        const res = await apiAddBalance(1000);
        if (res.success) {
            setUser(p => ({ ...p, balance: p.balance + 1000 }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-black">
                <div className="w-16 h-16 border-4 border-black border-t-indigo-500 rounded-full animate-spin shadow-brutal mb-6"></div>
                <h1 className="text-2xl italic tracking-widest animate-pulse">正在连接次元...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden select-none pb-20">
            {view === 'home' && <HomeView activeCars={activeCars} user={user} setModal={setModal} checkAuth={checkAuth} />}
            {view === 'warehouse' && <WarehouseView isLoggedIn={user.isLoggedIn} groupedWarehouse={groupedWarehouse} selectedInventory={selectedInventory} toggleSelection={toggleSelection} setView={setView} setModal={setModal} onSelectAll={handleSelectAll} />}
            {view === 'shipping_summary' && <ShippingSummaryView setView={setView} addresses={addresses} stores={stores} shippingMethod={shippingMethod} setShippingMethod={setShippingMethod} selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} handleConfirmShipping={handleConfirmShipping} setModal={setModal} />}
            {view === 'profile' && <ProfileView user={user} addresses={addresses} setModal={setModal} handleLogout={handleLogout} setUser={setUser} deleteAddress={deleteAddress} setView={setView} editAddress={editAddress} handleAddBalance={handleAddBalance} />}
            {view === 'shipping_history' && <ShippingHistoryView history={shippingHistory} setView={setView} />}
            {view === 'admin' && user.role === 'admin' && <AdminView form={form} setForm={setForm} handleCreateCar={handleCreateCar} stores={stores} setModal={setModal} handleGrantAdmin={handleGrantAdmin} />}

            <BottomNav view={view} setView={setView} userRole={user.role} />
            <ModalPortal modal={modal} setModal={setModal} handleAuth={handleAuth} setJoinCount={setJoinCount} joinCount={joinCount} handleJoinByCount={handleJoinByCount} tempAddress={tempAddress} setTempAddress={setTempAddress} handleSaveAddress={handleSaveAddress} user={user} addresses={addresses} selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} />
        </div>
    );
}