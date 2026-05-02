const storage = {
    save(db) {
        localStorage.setItem('mahjong_db', JSON.stringify(db));
    },
    load() {
        return JSON.parse(localStorage.getItem('mahjong_db')) || { matches: [], ranking: {}, players: [] };
    },
    clear() {
        localStorage.clear();
        location.reload();
    }
};