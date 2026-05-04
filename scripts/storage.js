/**
 * @file storage.js
 * @description Gerenciamento de persistência do torneio usando LocalStorage.
 */

const STORAGE_KEY = "riichi_tournament_pro";

/**
 * Carrega dados salvos.
 * @returns {Object}
 */
function load() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (!dados) return criarEstruturaVazia();
        return JSON.parse(dados);
    } catch {
        return criarEstruturaVazia();
    }
}

/**
 * Salva dados no storage.
 * @param {Object} dados
 */
function save(dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

/**
 * Limpa tudo.
 */
function clear() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Estrutura padrão do banco.
 */
function criarEstruturaVazia() {
    return {
        jogadores: [],
        classificacao: {},
        chaveamento: [],
        mesasConcluidas: {},
        pontosDasMesas: {}
    };
}

window.storage = {
    load,
    save,
    clear
};