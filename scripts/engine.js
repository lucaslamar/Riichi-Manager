/**
 * @file engine.js
 * @description Motor Riichi Tournament Pro - Justiça total com otimização global.
 */

/**
 * Embaralha lista de jogadores.
 * @param {string[]} array
 * @returns {string[]}
 */
function embaralharJogadores(array) {
    let lista = [...array];
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

/**
 * Gera estrutura base de mesas.
 * @param {number} total
 * @returns {number[][][]}
 */
function gerarEstruturaBase(total) {
    const rodadas = 4;
    let estrutura = [];

    if (total === 16) {
        return [
            [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]],
            [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]],
            [[0,5,10,15],[1,4,11,14],[2,7,8,13],[3,6,9,12]],
            [[0,6,11,13],[1,7,10,12],[2,4,9,15],[3,5,8,14]]
        ];
    }

    if (total === 8) {
        return [
            [[0,1,2,3],[4,5,6,7]],
            [[0,4,5,1],[2,6,7,3]],
            [[0,6,1,7],[4,2,5,3]],
            [[0,5,6,2],[1,7,4,3]]
        ];
    }

    // genérico
    const saltos = [1, 3, 5, 7];

    for (let r = 0; r < rodadas; r++) {
        let rodada = [];
        let usados = new Set();
        let pulo = saltos[r];

        for (let m = 0; m < total / 4; m++) {
            let mesa = [];
            for (let v = 0; v < 4; v++) {
                let idx = (m + v * pulo * (total / 4)) % total;

                while (usados.has(idx)) {
                    idx = (idx + 1) % total;
                }

                mesa.push(idx);
                usados.add(idx);
            }
            rodada.push(mesa);
        }

        estrutura.push(rodada);
    }

    return estrutura;
}

/**
 * Backtracking para garantir ventos perfeitos.
 */
function gerarVentosBacktracking(estrutura, jogadores) {
    const total = jogadores.length;
    const historico = Array.from({ length: total }, () => [0,0,0,0]);

    const perms = [];
    const gerar = (a, m=[]) => {
        if (!a.length) return perms.push(m);
        a.forEach((v,i)=>{
            let c=[...a]; c.splice(i,1);
            gerar(c,[...m,v]);
        });
    };
    gerar([0,1,2,3]);

    const resultado = estrutura.map(r => r.map(()=>new Array(4)));

    function bt(r,m){
        if(r===estrutura.length) return true;

        let nr = m===estrutura[r].length-1 ? r+1 : r;
        let nm = m===estrutura[r].length-1 ? 0 : m+1;

        const mesa = estrutura[r][m];

        for(let perm of perms){
            let ok=true;

            for(let i=0;i<4;i++){
                if(historico[mesa[i]][perm[i]]>0){
                    ok=false; break;
                }
            }

            if(!ok) continue;

            // aplica
            for(let i=0;i<4;i++){
                historico[mesa[i]][perm[i]]++;
                resultado[r][m][perm[i]] = { nome: jogadores[mesa[i]] };
            }

            if(bt(nr,nm)) return true;

            // desfaz
            for(let i=0;i<4;i++){
                historico[mesa[i]][perm[i]]--;
            }
        }

        return false;
    }

    if(!bt(0,0)) throw new Error("Falha nos ventos");

    return resultado;
}

/**
 * Avalia qualidade (encontros repetidos).
 */
function avaliar(rodadas) {
    let mapa = {};
    let score = 0;

    for (let r of rodadas) {
        for (let mesa of r) {
            let nomes = mesa.map(j=>j.nome);

            for (let i=0;i<4;i++){
                for (let j=i+1;j<4;j++){
                    let chave = [nomes[i],nomes[j]].sort().join("-");
                    mapa[chave] = (mapa[chave]||0)+1;

                    if(mapa[chave]===2) score+=5;
                    if(mapa[chave]>=3) score+=1000;
                }
            }
        }
    }

    return score;
}

/**
 * Gera o melhor torneio possível.
 */
function gerarChaveamentoTorneio(jogadores) {
    let melhor = null;
    let melhorScore = Infinity;

    for(let i=0;i<100;i++){
        let embaralhados = embaralharJogadores(jogadores);
        let estrutura = gerarEstruturaBase(embaralhados.length);

        let tentativa;
        try{
            tentativa = gerarVentosBacktracking(estrutura, embaralhados);
        }catch{
            continue;
        }

        let score = avaliar(tentativa);

        if(score < melhorScore){
            melhorScore = score;
            melhor = tentativa;
        }

        if(score === 0) break;
    }

    return melhor;
}