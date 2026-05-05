/**
 * @file engine.js
 * Motor Riichi PRO - Versão com Trava de Ventos Absoluta
 */

function embaralharJogadores(array) {
    let lista = [...array];
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

function penalizarMesasParecidas(rodadas) {
    let penalidade = 0;
    let mesas = [];
    rodadas.forEach(r => {
        r.forEach(m => {
            mesas.push(m.map(j => (typeof j === 'object' ? j.nome : j)));
        });
    });

    for (let i = 0; i < mesas.length; i++) {
        for (let j = i + 1; j < mesas.length; j++) {
            const A = mesas[i];
            const B = mesas[j];
            const comuns = A.filter(x => B.includes(x)).length;
            if (comuns === 2) penalidade += 10000; 
            if (comuns >= 3) penalidade += 500000;
        }
    }
    return penalidade;
}

function gerarMelhorChaveamento(jogadores) {
    let melhor = null;
    let melhorScore = Infinity;
    let melhorAvaliacao = null;

    console.time("Tempo de Processamento");

    // Aumentei para 500 tentativas para garantir perfeição em 20+ jogadores
    for (let tentativa = 0; tentativa < 500; tentativa++) {
        let base = gerarBase(jogadores);
        if (!base) continue;

        let comVentos = montarMesasComVento(base, jogadores);
        if (!comVentos) continue;

        let avaliacao = avaliarTorneioIndices(base, jogadores, comVentos); 
        let scoreTotal = avaliacao.score + penalizarMesasParecidas(comVentos);

        if (scoreTotal < melhorScore) {
            melhorScore = scoreTotal;
            melhor = comVentos;
            melhorAvaliacao = avaliacao;
        }

        if (melhorScore === 0) break; 
    }

    console.timeEnd("Tempo de Processamento");
    console.log(`📊 Relatório de Qualidade: Nota ${melhorAvaliacao.nota} (Score: ${melhorScore})`);
    
    if (melhorAvaliacao.nota.includes("F")) {
        console.error("❌ ERRO FATAL: O sistema não conseguiu rotacionar os ventos perfeitamente. Tente gerar novamente.");
    }

    return melhor;
}

function gerarBase(jogadores) {
    const total = jogadores.length;
    if (total === 8) return gerarMatriz8_Base();
    if (total === 12) return gerarMatriz12_Base();
    if (total === 16) return gerarMatriz16_Base();
    return gerarSistemaGeral(jogadores);
}

function gerarChaveamentoTorneio(jogadores) {
    console.log("%c⚙️ Iniciando Motor Riichi PRO (Ventos Blindados)...", "color: #2196F3; font-weight: bold;");
    jogadores = embaralharJogadores(jogadores);
    return gerarMelhorChaveamento(jogadores);
}

// --- MATRIZES FIXAS (PERFEITAS) ---
function gerarMatriz8_Base() {
    return [
        [[0,1,2,3],[4,5,6,7]], [[0,4,1,5],[2,6,3,7]],
        [[0,6,1,7],[2,4,3,5]], [[0,5,6,2],[1,7,4,3]]
    ];
}

function gerarMatriz12_Base() {
    return [
        [[0,1,2,3],[4,5,6,7],[8,9,10,11]],
        [[0,4,8,1],[2,6,10,3],[5,9,7,11]],
        [[0,5,10,2],[1,6,11,3],[4,8,9,7]],
        [[0,6,9,3],[1,4,10,7],[2,5,8,11]]
    ];
}

function gerarMatriz16_Base() {
    return [
        [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]],
        [[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15]],
        [[0,5,10,15],[1,4,11,14],[2,7,8,13],[3,6,9,12]],
        [[0,6,11,13],[1,7,10,12],[2,4,9,15],[3,5,8,14]]
    ];
}

// --- MOTOR GERAL (Sorteio Inteligente) ---
function gerarSistemaGeral(jogadores) {
    const total = jogadores.length;
    const mesasPorRodada = total / 4;
    const rodadas = 4;

    let melhor = null;
    let melhorScore = Infinity;

    for (let tentativa = 0; tentativa < 1000; tentativa++) {
        let encontros = Array(total).fill(0).map(() => Array(total).fill(0));
        let resultado = [];
        let falhou = false;

        for (let r = 0; r < rodadas; r++) {
            let usados = new Set();
            let rodada = [];

            for (let m = 0; m < mesasPorRodada; m++) {
                let mesa = [];
                let tentativasMesa = 0;

                while (mesa.length < 4) {
                    tentativasMesa++;
                    if (tentativasMesa > 400) { falhou = true; break; }

                    let candidato = Math.floor(Math.random() * total);
                    if (usados.has(candidato)) continue;

                    let conflito = 0;
                    for (let j of mesa) { conflito += encontros[candidato][j]; }

                    if (conflito > 0 && tentativasMesa < 300) continue;

                    mesa.push(candidato);
                    usados.add(candidato);
                }
                if (falhou) break;

                for (let i = 0; i < 4; i++) {
                    for (let j = i + 1; j < 4; j++) {
                        encontros[mesa[i]][mesa[j]]++;
                        encontros[mesa[j]][mesa[i]]++;
                    }
                }
                rodada.push(mesa);
            }
            if (falhou) break;
            resultado.push(rodada);
        }

        if (!falhou) {
            let eval = avaliarTorneioIndices(resultado, jogadores, null);
            if (eval.score < melhorScore) {
                melhorScore = eval.score;
                melhor = resultado;
            }
            if (melhorScore === 0) break;
        }
    }
    return melhor;
}

// --- DISTRIBUIÇÃO DE VENTOS (O CORAÇÃO DO RIICHI) ---
function montarMesasComVento(estrutura, jogadores) {
    if (!estrutura) return null;
    const historico = Array(jogadores.length).fill(null).map(() => [0, 0, 0, 0]);
    const perms = [];
    const gerarP = (arr, m = []) => {
        if (arr.length === 0) return perms.push(m);
        arr.forEach((v, i) => {
            let c = [...arr]; c.splice(i, 1);
            gerarP(c, [...m, v]);
        });
    };
    gerarP([0,1,2,3]);

    return estrutura.map((rodada) =>
        rodada.map((mesa) => {
            let melhorPerm = null;
            let menorCusto = Infinity;

            for (let perm of perms) {
                let custo = 0;
                for (let i = 0; i < 4; i++) {
                    const jIdx = mesa[i];
                    const vento = perm[i];
                    
                    // TRAVA MESTRA: Repetir vento agora é um pecado mortal (10 milhões de multa)
                    if (historico[jIdx][vento] > 0) {
                        custo += (vento === 0) ? 10000000 : 500000;
                    }
                }
                if (custo < menorCusto) {
                    menorCusto = custo;
                    melhorPerm = perm;
                }
                if (custo === 0) break;
            }

            let resultadoMesa = [null, null, null, null];
            melhorPerm.forEach((vento, i) => {
                const jIdx = mesa[i];
                historico[jIdx][vento]++;
                resultadoMesa[vento] = { nome: jogadores[jIdx] };
            });
            return resultadoMesa;
        })
    );
}

// --- AUDITORIA FINAL ---
function avaliarTorneioIndices(rodadas, jogadores, resultadoFinal) {
    let encontros = {};
    let repetidos = 0;
    let score = 0;

    // 1. Checagem de Encontros Repetidos
    rodadas.forEach(rodada => {
        rodada.forEach(mesa => {
            for (let i = 0; i < 4; i++) {
                for (let j = i + 1; j < 4; j++) {
                    const a = mesa[i]; const b = mesa[j];
                    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
                    encontros[key] = (encontros[key] || 0) + 1;
                }
            }
        });
    });

    Object.values(encontros).forEach(qtd => {
        if (qtd === 2) { score += 50000; repetidos++; }
        if (qtd >= 3) { score += 1000000; repetidos += 10; }
    });

    // 2. Checagem de Ventos (Apenas se o resultadoFinal existir)
    if (resultadoFinal) {
        let historicoLeste = Array(jogadores.length).fill(0);
        resultadoFinal.forEach(rodada => {
            rodada.forEach(mesa => {
                // mesa[0] é sempre o Leste no nosso objeto
                let nomeLeste = mesa[0].nome;
                let idx = jogadores.indexOf(nomeLeste);
                historicoLeste[idx]++;
            });
        });

        historicoLeste.forEach(vezes => {
            if (vezes === 0) score += 10000000; // Alguém ficou sem ser Leste!
            if (vezes > 1) score += 10000000;   // Alguém foi Oya duas vezes!
        });
    }

    // Sistema de Notas Atualizado
    let nota = "A+";
    if (score >= 10000000) nota = "F (Erro de Ventos)";
    else if (repetidos > 0) nota = "A";
    else if (repetidos > 5) nota = "B";
    else if (repetidos > 10) nota = "C";

    return { score, nota, repetidos };
}