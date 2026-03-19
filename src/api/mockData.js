export const mockUser = {
    id: 'u1', name: '40岁勇者', balance: 5000, items: [
        { type: 'A', name: '鸣人 仙人模式手办', carName: '火影忍者 - 羁绊之风', seat: '6', timestamp: 1001 },
        { type: 'B', name: '佐助 须佐之男立牌', carName: '火影忍者 - 羁绊之风', seat: '8', timestamp: 1002 },
        { type: 'F', name: '木叶村 徽章', carName: '火影忍者 - 羁绊之风', seat: '10', timestamp: 1003 }
    ], isLoggedIn: true, role: 'user'
};

export const mockCars = [
    { id: 'car-201', name: '海贼王 - 意志的继承', totalSeats: 10, price: 68, discount: 100, description: '大海贼时代的冒险！目前 50% 集结中。', prizes: [{ type: 'A', name: '路飞手办', count: 1, img: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=200' }, { type: 'F', name: '挂件', count: 9 }], occupiedSeats: { '1': { uid: 'u2', name: '欧皇' }, '2': { name: '非酋' }, '3': { name: '路人A' }, '4': { name: '路人B' }, '5': { name: '路人C' } }, status: 'open', results: [] },
    {
        id: 'car-202', name: '火影忍者 - 羁绊之风', totalSeats: 10, price: 58, discount: 80, description: '全员集结完毕，狩猎大成功！', prizes: [{ type: 'A', name: '鸣人手办', count: 1 }, { type: 'B', name: '佐助立牌', count: 1 }, { type: 'F', name: '徽章', count: 8 }],
        occupiedSeats: {
            '1': { name: '小李' }, '2': { name: '鹿丸' }, '3': { name: '雏田' }, '4': { name: '卡卡西' }, '5': { name: '佐井' },
            '6': { uid: 'u1', name: '40岁勇者' }, '7': { name: '自来也' }, '8': { uid: 'u1', name: '40岁勇者' }, '9': { name: '纲手' }, '10': { uid: 'u1', name: '40岁勇者' }
        },
        status: 'unboxed',
        results: [{ type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }, { type: 'A', name: '鸣人手办' }, { type: 'F', name: '徽章' }, { type: 'B', name: '佐助立牌' }, { type: 'F', name: '徽章' }, { type: 'F', name: '徽章' }]
    }
];

export const mockAddresses = [{ id: 1, name: '勇者基地', phone: '13888888888', detail: '次元节点 A-01 号', isDefault: true }];

export const mockStores = [{ id: 1, name: '次元据点1号', address: '秋叶原 1-1-1', hours: '10:00 - 22:00' }];

export const mockShippingHistory = [];
