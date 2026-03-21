export const apiRequest = async (url, options = {}) => {
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
    return await apiRequest('/user/profile');
};

export const fetchActiveCars = async () => {
    return await apiRequest('/cars/active/');
};

export const fetchAddresses = async () => {
    return await apiRequest('/user/address/');
};

export const fetchStores = async () => {
    return await apiRequest('/stores');
};

export const fetchShippingHistory = async () => {
    return await apiRequest('/user/shipping-history');
};

// --- 操作/提交数据接口 ---

export const apiLogin = async (phone, code) => {
    return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
    });
};

export const apiSendCode = async (phone) => {
    return await apiRequest('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
};

export const apiForgotPassword = async (phone, code) => {
    return await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
    });
};

export const apiGrantAdmin = async (phone) => {
    return await apiRequest('/admin/grant', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
};

export const apiLogout = async () => {
    return await apiRequest('/auth/logout', {
        method: 'POST',
    });
};

export const apiCreateAddress = async (addressData) => {
    // 假设 addressData 恰好匹配后端的 address 模型字段名
    return await apiRequest('/user/address/', {
        method: 'POST',
        body: JSON.stringify(addressData),
    });
};

export const apiUpdateAddress = async (id, addressData) => {
    return await apiRequest(`/user/address/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
    });
};

export const apiDeleteAddress = async (id) => {
    return await apiRequest(`/user/address/${id}/`, {
        method: 'DELETE',
    });
};

export const apiJoinCar = async (carId, count, totalCost) => {
    return await apiRequest(`/cars/${carId}/join`, {
        method: 'POST',
        body: JSON.stringify({ count, totalCost }),
    });
};

export const apiCreateCar = async (carData) => {
    return await apiRequest('/admin/cars', {
        method: 'POST',
        body: JSON.stringify(carData),
    });
};

export const apiCreateShippingRecord = async (items, method, receiver_info) => {
    return await apiRequest('/user/shipping', {
        method: 'POST',
        body: JSON.stringify({ items, method, receiver_info }),
    });
};

export const apiAddBalance = async (amount) => {
    return await apiRequest('/user/balance/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
};

export const apiFetchAllShippings = async () => {
    return await apiRequest('/admin/shippings');
};

export const apiUpdateShippingRecordAdmin = async (id, data) => {
    return await apiRequest(`/admin/shippings/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
