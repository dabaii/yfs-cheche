const request = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(`/api/v1${url}`, {
            ...options,
            headers,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        return { success: false, code: 500, message: 'Network error', data: null };
    }
};

// --- 获取数据接口 ---
export const fetchUser = async () => {
    return await request('/user/profile');
};

export const fetchActiveCars = async () => {
    return await request('/cars/active/');
};

export const fetchAddresses = async () => {
    return await request('/user/address/');
};

export const fetchStores = async () => {
    return await request('/stores');
};

export const fetchShippingHistory = async () => {
    return await request('/user/shipping-history');
};

// --- 操作/提交数据接口 ---

export const apiLogin = async (phone, password) => {
    return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
    });
};

export const apiRegister = async (phone, password) => {
    return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
    });
};

export const apiForgotPassword = async (phone, password) => {
    return await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
    });
};

export const apiGrantAdmin = async (phone) => {
    return await request('/admin/grant', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
};

export const apiLogout = async () => {
    return await request('/auth/logout', {
        method: 'POST',
    });
};

export const apiCreateAddress = async (addressData) => {
    // 假设 addressData 恰好匹配后端的 address 模型字段名
    return await request('/user/address/', {
        method: 'POST',
        body: JSON.stringify(addressData),
    });
};

export const apiUpdateAddress = async (id, addressData) => {
    return await request(`/user/address/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
    });
};

export const apiDeleteAddress = async (id) => {
    return await request(`/user/address/${id}/`, {
        method: 'DELETE',
    });
};

export const apiJoinCar = async (carId, count, totalCost) => {
    return await request(`/cars/${carId}/join`, {
        method: 'POST',
        body: JSON.stringify({ count, totalCost }),
    });
};

export const apiCreateCar = async (carData) => {
    return await request('/admin/cars', {
        method: 'POST',
        body: JSON.stringify(carData),
    });
};

export const apiCreateShippingRecord = async (items, method) => {
    return await request('/user/shipping', {
        method: 'POST',
        body: JSON.stringify({ items, method }),
    });
};

export const apiAddBalance = async (amount) => {
    return await request('/user/balance/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
};
