/**
 * Módulo de persistência de dados no LocalStorage.
 * Gerencia o estado completo do torneio (jogadores, ranking e progresso das mesas).
 */
const storage = {
    /** @type {string} Nome da chave para persistência no navegador */
    DATABASE_KEY: 'mahjong_pro_db',

    /**
     * Salva o estado atual do banco de dados.
     * @param {Object} bancoDeDados - Objeto contendo o estado do torneio.
     */
    save(bancoDeDados) {
        localStorage.setItem(this.DATABASE_KEY, JSON.stringify(bancoDeDados));
    },

    /**
     * Recupera os dados salvos ou retorna uma estrutura inicial limpa.
     * @returns {Object} Estado atual do torneio.
     */
    load() {
        const dadosArmazenados = localStorage.getItem(this.DATABASE_KEY);
        
        // Retorna os dados processados ou a estrutura padrão para novos torneios
        return dadosArmazenados ? JSON.parse(dadosArmazenados) : { 
            jogadores: [], 
            classificacao: {}, 
            chaveamento: null, 
            mesasConcluidas: {}, // Controle de quais mesas já foram fechadas
            pontosDasMesas: {}   // Registro dos scores brutos de cada mesa
        };
    },

    /**
     * Remove todos os dados do torneio após confirmação do usuário.
     * Realiza o reload da página para limpar o estado da aplicação.
     */
    clear() {
        const confirmacaoUsuario = confirm("Atenção: Reiniciar torneio? Todos os dados atuais serão perdidos permanentemente.");
        
        if (confirmacaoUsuario) {
            localStorage.removeItem(this.DATABASE_KEY);
            location.reload();
        }
    }
};