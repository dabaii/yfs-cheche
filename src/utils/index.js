export const generateResult = (prizes) => {
    const result = [];
    prizes.forEach(p => {
        const count = parseInt(p.count || 0);
        for (let i = 0; i < count; i++) {
            result.push({ type: p.type, name: p.name, img: p.img });
        }
    });
    // Fisher-Yates Shuffle
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};
