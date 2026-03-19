import { mockUser, mockCars, mockAddresses, mockStores, mockShippingHistory } from './mockData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 标准 RESTful 外壳封装函数
const createResponse = (data = null, message = "success", code = 200) => ({
    success: code >= 200 && code < 300,
    code,
    data,
    message
});

// --- 获取数据接口 ---
export const fetchUser = async () => {
    await delay();
    return createResponse({ ...mockUser });
};

export const fetchActiveCars = async () => {
    await delay();
    return createResponse([...mockCars]);
};

export const fetchAddresses = async () => {
    await delay();
    return createResponse([...mockAddresses]);
};

export const fetchStores = async () => {
    await delay();
    return createResponse([...mockStores]);
};

export const fetchShippingHistory = async () => {
    await delay(300);
    return createResponse([...mockShippingHistory]);
};

// --- 操作/提交数据接口 ---

export const apiLogin = async (role) => {
    await delay();
    return createResponse({ ...mockUser, isLoggedIn: true, role });
};

export const apiLogout = async () => {
    await delay();
    return createResponse();
};

export const apiCreateAddress = async (addressData) => {
    await delay();
    return createResponse({ ...addressData, id: Date.now() });
};

export const apiUpdateAddress = async (id, addressData) => {
    await delay();
    return createResponse();
};

export const apiDeleteAddress = async (id) => {
    await delay();
    return createResponse();
};

export const apiJoinCar = async (carId, count, totalCost) => {
    await delay();
    return createResponse();
};

export const apiCreateCar = async (carData) => {
    await delay();
    return createResponse({ ...carData, id: `car-${Date.now()}` });
};

export const apiCreateShippingRecord = async (items, method) => {
    await delay();
    const newRecord = { 
        id: Date.now(), 
        items, 
        method, 
        status: '打包中', 
        date: new Date().toLocaleString('zh-CN', { hour12: false }) 
    };
    return createResponse(newRecord);
};

export const apiAddBalance = async (amount) => {
    await delay();
    return createResponse();
};
