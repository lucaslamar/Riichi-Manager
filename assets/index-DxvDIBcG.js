(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();const v=["Leste","Sul","Oeste","Norte"],ee=4,j=3e4,q="riichi-tournament-pro-ts",te=2200,ne=20,ae=1,J=90*60,x=5*60,Y=[{label:"1h",seconds:60*60},{label:"1h30",seconds:J},{label:"2h",seconds:120*60}],oe=[];function F(e,t){return`${e}_${t}`}function S(e=0,t=J,n={}){return{totalSeconds:t,remainingSeconds:t,roundIndex:e,isRunning:!1,startedAt:null,tableExtensions:n}}function M(){return{players:[],schedule:[],quality:null,classification:{},completedTables:{},tableScores:{},roundTimer:S()}}function re(){var t;const e=window.localStorage.getItem(q);if(!e)return M();try{const n=JSON.parse(e);return{...M(),...n,classification:n.classification??{},completedTables:n.completedTables??{},tableScores:n.tableScores??{},roundTimer:{...S(),...n.roundTimer??{},tableExtensions:((t=n.roundTimer)==null?void 0:t.tableExtensions)??{}}}}catch{return M()}}function se(e){window.localStorage.setItem(q,JSON.stringify(e))}function ie(){window.localStorage.removeItem(q)}let O=re(),N="home";function $(){return O}function G(e){O=e,se(O)}function y(e){G(e(O))}function ce(){ie(),O=M()}function le(){return N}function de(e){N=e}function ue(){N="fastSetup"}function I(){N="home"}function V(e=$()){return e.schedule.length>0&&e.players.length>0}function pe(){ce()}function R(e){if(!e.isRunning||!e.startedAt)return e.remainingSeconds;const t=Math.floor((Date.now()-e.startedAt)/1e3);return Math.max(0,e.remainingSeconds-t)}function me(){y(e=>{const t=e.roundTimer;return t.isRunning?{...e,roundTimer:{...t,remainingSeconds:R(t),isRunning:!1,startedAt:null}}:{...e,roundTimer:{...t,isRunning:!0,startedAt:Date.now()}}})}function fe(){y(e=>{const t=e.roundTimer;return{...e,roundTimer:S(t.roundIndex,t.totalSeconds,t.tableExtensions)}})}function be(e){y(t=>{const n=t.roundTimer;return{...t,roundTimer:S(e,n.totalSeconds,n.tableExtensions)}})}function he(e){y(t=>{const n=t.roundTimer;return{...t,roundTimer:S(n.roundIndex,e,n.tableExtensions)}})}function ge(){Se(x)}function ve(e,t){const n=F(e,t);y(a=>({...a,roundTimer:{...a.roundTimer,tableExtensions:{...a.roundTimer.tableExtensions,[n]:(a.roundTimer.tableExtensions[n]??0)+1}}}))}function ye(e,t){const n=e.tableExtensions[t]??0;return R(e)+n*x}function Te(){y(e=>{const t=e.roundTimer;return!t.isRunning||R(t)>0?e:{...e,roundTimer:{...t,remainingSeconds:0,isRunning:!1,startedAt:null}}})}function Se(e){y(t=>{const n=t.roundTimer,a=R(n)+e;return{...t,roundTimer:{...n,totalSeconds:n.totalSeconds+e,remainingSeconds:a,startedAt:n.isRunning?Date.now():null}}})}function $e(e){const t=window;if(!t.jspdf){window.alert("Biblioteca PDF ainda nao carregou. Tente novamente em alguns segundos.");return}const n=new t.jspdf.jsPDF,a=Object.entries(e.classification).sort(([,o],[,r])=>r-o).map(([o,r],i)=>[`${i+1}o`,o,r.toFixed(1)]);n.setFontSize(18),n.setTextColor(33,150,243),n.text("Classificacao Geral - Riichi Tournament Pro",14,20),n.setFontSize(10),n.setTextColor(100),n.text(`Relatorio oficial gerado em: ${new Date().toLocaleString("pt-BR")}`,14,28),n.autoTable({startY:35,head:[["Rank","Nome do Atleta","Pontuacao (PT)"]],body:a,theme:"striped",headStyles:{fillColor:[33,150,243],textColor:[255,255,255],fontStyle:"bold"},styles:{font:"helvetica",fontSize:10,cellPadding:4},columnStyles:{0:{halign:"center",cellWidth:20},2:{halign:"right",fontStyle:"bold"}},didDrawPage:o=>{const r=`Pagina ${n.internal.getNumberOfPages()}`;n.setFontSize(8),n.text(r,o.settings.margin.left,n.internal.pageSize.height-10)}}),n.save(`ranking_mahjong_${Date.now()}.pdf`)}function U(e){return new Intl.NumberFormat("pt-BR").format(e)}function Re(e){return Number.parseInt(e.replace(/[\.,]/g,""),10)||0}function _(){return U(j)}function T(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function D(e){const t=Math.max(0,e),n=Math.floor(t/3600),a=Math.floor(t%3600/60),o=t%60,r=[a,o].map(i=>String(i).padStart(2,"0"));return n>0?`${String(n).padStart(2,"0")}:${r.join(":")}`:r.join(":")}function C(e){const t=[...e];for(let n=t.length-1;n>0;n-=1){const a=Math.floor(Math.random()*(n+1));[t[n],t[a]]=[t[a],t[n]]}return t}function W(e,t){return[e,t].sort((n,a)=>n.localeCompare(a)).join("::")}function Ee(e){const[t,n]=e.split("::");return[t,n]}function Pe(e){return[...e].sort((t,n)=>t.localeCompare(n)).join("::")}function we(e){const t=new Map;for(const n of e)for(const a of n.tables){const o=a.seats.map(r=>r.player);for(let r=0;r<o.length;r+=1)for(let i=r+1;i<o.length;i+=1){const l=W(o[r],o[i]);t.set(l,(t.get(l)??0)+1)}}return t}function xe(e){const t=new Map;for(const n of e)for(const a of n.tables)for(const o of a.seats){const r=t.get(o.player)??new Map;r.set(o.wind,(r.get(o.wind)??0)+1),t.set(o.player,r)}return t}function Oe(e){const t=new Map;for(const n of e){const[a,o]=n.players,r=t.get(a)??new Set,i=t.get(o)??new Set;r.add(o),i.add(a),t.set(a,r),t.set(o,i)}return[...t.entries()].map(([n,a])=>({player:n,count:a.size,opponents:[...a].sort((o,r)=>o.localeCompare(r))})).sort((n,a)=>a.count-n.count||n.player.localeCompare(a.player))}function Ce(e){return e>=ne?ae:null}function ke(e){var H;const t=we(e),n=xe(e),a=n.size,o=e.length*(a/v.length)*6,r=a*(a-1)/2,i=Math.max(0,o-r),l=new Map;let f=0,d=0,u=0,s=0,c=0;const p=[];for(const[m,b]of t.entries())s=Math.max(s,b),b>1&&(f+=1,p.push({players:Ee(m),count:b})),b===2&&(d+=1),b>=3&&(u+=1);for(const m of n.values())for(const b of v){const w=m.get(b)??0;w!==1&&(c+=Math.abs(w-1))}for(const m of e)for(const b of m.tables){const w=Pe(b.seats.map(Z=>Z.player));l.set(w,(l.get(w)??0)+1)}const g=Oe(p),h=Ce(a),E=h===null?[]:g.filter(m=>m.count>h),A=E.reduce((m,b)=>m+(b.count-(h??0)),0),P=((H=g[0])==null?void 0:H.count)??0,k=[...l.values()].filter(m=>m>1).length,L=[...n.values()].every(m=>(m.get("Leste")??0)===1);return{score:u*12e3+Math.max(0,s-2)*6e3+A*3500+d*85+f*30+k*900+c*2e4,maxPairRepeats:s,repeatedPairs:p.sort((m,b)=>b.count-m.count||m.players.join(" ").localeCompare(b.players.join(" "))),repeatedPairCount:f,idealRepeatedPairCount:i,twicePairCount:d,triplePairCount:u,exactEast:L,windRepeats:c,fullTableRepeats:k,repeatedOpponentLimit:h,maxRepeatedOpponentsByPlayer:P,repeatedOpponentOverload:E}}function Le(e){return e.triplePairCount>0||e.windRepeats>0||e.repeatedOpponentOverload.length>0?"Precisa melhorar":e.twicePairCount>e.idealRepeatedPairCount+2?"Aceitavel":"Boa grade"}function Me(e,t){let n=0;for(let a=0;a<e.length;a+=1)for(let o=a+1;o<e.length;o+=1){const r=t.get(W(e[a],e[o]))??0;n+=r*r}return n}function je(e,t){for(let n=0;n<e.length;n+=1)for(let a=n+1;a<e.length;a+=1){const o=W(e[n],e[a]);t.set(o,(t.get(o)??0)+1)}}function Ne(e,t,n,a){var f;const o=new Map(v.map(d=>[d,[]])),r=[];for(const d of t){const u=v[(e+(n.get(d)??0))%v.length];(f=o.get(u))==null||f.push(d)}const i=new Map(v.map(d=>[d,C(o.get(d)??[])])),l=t.length/v.length;for(let d=0;d<l;d+=1){const u=[];for(const c of C(v)){const p=i.get(c)??[],g=u.map(P=>P.player);let h=0,E=Number.POSITIVE_INFINITY;p.forEach((P,k)=>{const L=Me([...g,P],a),B=Math.random()*.01;L+B<E&&(E=L+B,h=k)});const[A]=p.splice(h,1);u.push({player:A,wind:c,score:j})}const s=u.sort((c,p)=>v.indexOf(c.wind)-v.indexOf(p.wind));je(s.map(c=>c.player),a),r.push({id:r.length+1,seats:s})}return{id:e+1,tables:r}}function Q(e){const t=new Map;C(e).forEach((r,i)=>{t.set(r,i%v.length)});const a=new Map,o=Array.from({length:ee},(r,i)=>Ne(i,e,t,a));return{rounds:o,quality:ke(o)}}function K(e){let t=Q(e);for(let n=1;n<te;n+=1){const a=Q(e);if(a.quality.score<t.quality.score&&(t=a),t.quality.maxPairRepeats<=2&&t.quality.twicePairCount<=t.quality.idealRepeatedPairCount+2&&t.quality.fullTableRepeats===0&&t.quality.windRepeats===0&&t.quality.repeatedOpponentOverload.length===0)break}return t}function Ae(e){return e.trim().toLowerCase().split(/\s+/).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}function Be(e){return e.split(/\n|,/).map(Ae).filter(Boolean)}function Ie(e){const t=new Set(e.map(n=>n.toLowerCase()));return e.length<8||e.length%4!==0?`Erro: minimo 8 jogadores e o total deve ser multiplo de 4.
Quantidade: ${e.length}`:t.size!==e.length?"Existem nomes repetidos na lista de jogadores.":null}function _e(e){const t=[8,4,-4,-8];return[...e].sort((a,o)=>o.score-a.score).map((a,o)=>({player:a.player,points:Number(((a.score-j)/1e3+t[o]).toFixed(1))}))}function De(e){const t=Be(e),n=Ie(t);if(n)return n;const a=C(t),o=K(a);return G({players:a,schedule:o.rounds,quality:o.quality,classification:Object.fromEntries(a.map(r=>[r,0])),completedTables:{},tableScores:{},roundTimer:S()}),null}function qe(){const e=$();if(!V(e))return!1;const t=C(e.players),n=K(t);return G({...e,players:t,schedule:n.rounds,quality:n.quality,classification:Object.fromEntries(t.map(a=>[a,0])),completedTables:{},tableScores:{},roundTimer:S(0,e.roundTimer.totalSeconds)}),!0}function Fe(e,t,n,a){var d;const o=$(),r=(d=o.schedule[e])==null?void 0:d.tables[t];if(!r)return;const i=F(e,t);if(o.completedTables[i])return;const l=r.seats.map((u,s)=>{const c=Re(n(s)||String(j));return{player:u.player,score:c,text:U(c)}}),f=l.map(u=>`${u.player}: ${u.text}`).join(`
`);a(f)&&y(u=>{const s={...u.classification};for(const c of _e(l))s[c.player]=(s[c.player]??0)+c.points;return{...u,classification:s,completedTables:{...u.completedTables,[i]:!0},tableScores:{...u.tableScores,[i]:l.map(c=>c.text)}}})}function Ge(e){var t,n,a,o,r,i,l,f,d,u;(t=document.querySelector("#quickTournamentButton"))==null||t.addEventListener("click",()=>{ue(),e()}),document.querySelectorAll(".app-screen-button").forEach(s=>{s.addEventListener("click",()=>{const c=s.dataset.screen;(c==="swiss"||c==="handTools"||c==="yakuReference")&&(de(c),e())})}),document.querySelectorAll("#backToHomeButton, .home-back-button").forEach(s=>{s.addEventListener("click",()=>{I(),e()})}),(n=document.querySelector("#startButton"))==null||n.addEventListener("click",()=>{const s=document.querySelector("#playerList"),c=De((s==null?void 0:s.value)??"");if(c){window.alert(c);return}I(),e()}),(a=document.querySelector("#resetButton"))==null||a.addEventListener("click",()=>{pe(),I(),e()}),(o=document.querySelector("#exportPdfButton"))==null||o.addEventListener("click",()=>$e($())),(r=document.querySelector("#rerollScheduleButton"))==null||r.addEventListener("click",()=>{window.confirm(`Refazer o sorteio mantendo os mesmos nomes?
Isso apaga resultados, ranking e acrescimos da grade atual.`)&&(qe(),e())}),(i=document.querySelector("#toggleRoundTimerButton"))==null||i.addEventListener("click",()=>{me(),e()}),(l=document.querySelector("#addGlobalTimeButton"))==null||l.addEventListener("click",()=>{ge(),e()}),(f=document.querySelector("#resetRoundTimerButton"))==null||f.addEventListener("click",()=>{fe(),e()}),(d=document.querySelector("#roundTimerSelect"))==null||d.addEventListener("change",s=>{const c=s.currentTarget;be(Number(c.value)),e()}),(u=document.querySelector("#roundTimerDurationSelect"))==null||u.addEventListener("change",s=>{const c=s.currentTarget;he(Number(c.value)),e()}),document.querySelectorAll(".table-time-button").forEach(s=>{s.addEventListener("click",()=>{const c=Number(s.dataset.round),p=Number(s.dataset.table);ve(c,p),e()})}),document.querySelectorAll(".save-button").forEach(s=>{s.addEventListener("click",()=>{const c=Number(s.dataset.round),p=Number(s.dataset.table);Fe(c,p,g=>{var h;return((h=document.querySelector(`#score_${c}_${p}_${g}`))==null?void 0:h.value)??_()},g=>window.confirm(`Confirmar resultados da Mesa ${p+1}?
${g}`)),e()})}),document.querySelectorAll(".player-row input").forEach(s=>{s.addEventListener("focus",()=>{s.value===_()&&(s.value="")}),s.addEventListener("blur",()=>{s.value.trim()===""&&(s.value=_())}),s.addEventListener("input",()=>{s.value=s.value.replace(/[^-0-9.,]/g,"")})})}const Ve={swiss:{title:"Sistema suico",icon:"fa-trophy",description:"Modo competitivo por rodadas progressivas: primeira rodada aleatoria e proximas por ranking, sem mostrar confrontos futuros antes dos resultados.",bullets:["Configurar nomes e quantidade de rodadas.","Gerar apenas a rodada atual e parear melhores contra melhores.","Exportar/importar checkpoint JSON para torneios de varios dias."]},handTools:{title:"Calculadora e validador de mao",icon:"fa-calculator",description:"Uma tela unica para calcular pontuacao, validar se a mao fecha e explorar possibilidades de yaku.",bullets:["Contar han/fu quando o jogador ja sabe a mao.","Validar agari e listar yakus possiveis a partir dos tiles.","Ajudar iniciantes a aprender leitura e possibilidades de mao."]},yakuReference:{title:"Referencia de yaku",icon:"fa-book",description:"Biblioteca de consulta para yaku, exemplos e regras usadas nos encontros do clube.",bullets:["Lista de yaku por categoria e dificuldade.","Exemplos visuais de maos validas.","Links entre referencia, validador e calculadora."]}};function Ue(e){const t=Ve[e];return t?`
    <section class="card feature-placeholder" aria-label="${t.title}">
      <div class="feature-placeholder-icon" aria-hidden="true">
        <i class="fas ${t.icon}"></i>
      </div>
      <div class="feature-placeholder-copy">
        <span class="home-menu-kicker">Modulo em desenho</span>
        <h2>${t.title}</h2>
        <p>${t.description}</p>
      </div>
      <ul class="home-menu-notes feature-placeholder-list">
        ${t.bullets.map(n=>`<li>${n}</li>`).join("")}
      </ul>
      <div class="actions feature-placeholder-actions">
        <button class="btn-outline home-back-button" type="button">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar ao menu
        </button>
      </div>
    </section>
  `:""}function We(){return`
    <header class="main-header">
      <div class="header-content">
        <div class="mahjong-tile" aria-hidden="true">&#20013;</div>
        <div class="title-container">
          <span class="version-tag">v5.0.0</span>
          <h1 class="main-title">Riichi Manager</h1>
        </div>
      </div>
    </header>
  `}function ze(){return`
    <section class="card home-menu" aria-label="Menu inicial">
      <div class="home-menu-hero">
        <h2>Um ecossistema para clubes de Riichi Mahjong</h2>
        <p>
          Organize torneios, acompanhe partidas e evolua para ferramentas de estudo,
          calculadora e referencia de yaku no mesmo lugar.
        </p>
      </div>

      <div class="home-menu-actions">
        <button class="btn-primary home-menu-button" id="quickTournamentButton" type="button">
          <i class="fas fa-bolt" aria-hidden="true"></i>
          Torneio fast
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="swiss" type="button">
          <i class="fas fa-trophy" aria-hidden="true"></i>
          Sistema suico
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="handTools" type="button">
          <i class="fas fa-calculator" aria-hidden="true"></i>
          Calculadora e validador de mao
        </button>
        <button class="btn-outline home-menu-button app-screen-button" data-screen="yakuReference" type="button">
          <i class="fas fa-book" aria-hidden="true"></i>
          Referencia de yaku
        </button>
      </div>
    </section>
  `}function He(e){const t=e.repeatedPairs??[];return`
    <section class="card quality-panel" aria-label="Diagnostico da grade">
      <div class="section-title-container">
        <i class="fas fa-clipboard-check section-icon" aria-hidden="true"></i>
        <h2>Diagnostico da Grade</h2>
        <span class="status-pill">${Le(e)}</span>
      </div>
      <dl class="metrics">
        <div>
          <dt>Leste exato</dt>
          <dd>${e.exactEast?"Sim":"Nao"}</dd>
        </div>
        <div>
          <dt>Max. encontros por par</dt>
          <dd>${e.maxPairRepeats}</dd>
        </div>
        <div>
          <dt>Pares 2x</dt>
          <dd>${e.twicePairCount}/${e.idealRepeatedPairCount}</dd>
        </div>
        <div>
          <dt>Jogador com pares 2x</dt>
          <dd>${Ye(e)}</dd>
        </div>
        <div>
          <dt>Pares 3x+</dt>
          <dd>${e.triplePairCount}</dd>
        </div>
        <div>
          <dt>Mesas iguais</dt>
          <dd>${e.fullTableRepeats}</dd>
        </div>
      </dl>
      <div class="quality-actions">
        <p>Nota ruim ou mesa monotona? Gere outro sorteio com os mesmos nomes.</p>
        <button class="btn-outline" id="rerollScheduleButton" type="button">
          <i class="fas fa-shuffle" aria-hidden="true"></i>
          Refazer sorteio
        </button>
      </div>
      ${Qe(e)}
      ${Je(t)}
    </section>
  `}function Ye(e){return e.repeatedOpponentLimit===null?`${e.maxRepeatedOpponentsByPlayer}`:`${e.maxRepeatedOpponentsByPlayer}/${e.repeatedOpponentLimit}`}function Qe(e){return e.repeatedOpponentOverload.length===0?"":`
    <div class="pair-details repeated-opponent-warning">
      <h3>Jogadores com repeticao concentrada</h3>
      <p>
        Para torneios com 20+ jogadores, o alvo e cada jogador repetir no maximo
        ${e.repeatedOpponentLimit} adversario. Isso evita mesas monotonas.
      </p>
      <div class="pair-list">
        ${e.repeatedOpponentOverload.map(t=>`
              <span class="pair-chip danger">
                ${T(t.player)} repetiu ${t.count} jogadores
                <strong>${T(t.opponents.join(", "))}</strong>
              </span>
            `).join("")}
      </div>
    </div>
  `}function Je(e){return e.length===0?`
      <div class="pair-details">
        <h3>Quem se repetiu</h3>
        <p>Nenhum par repetiu. Grade excelente nesse criterio.</p>
      </div>
    `:`
    <div class="pair-details">
      <h3>Quem se viu mais</h3>
      <div class="pair-list">
        ${e.map(t=>`
              <span class="pair-chip ${t.count>=3?"danger":""}">
                ${T(t.players[0])} + ${T(t.players[1])}
                <strong>${t.count}x</strong>
              </span>
            `).join("")}
      </div>
    </div>
  `}function Ke(e,t){return`
    <section id="championship" class="card ${e?"":"hidden"}" aria-label="Classificacao geral">
      <div class="section-title-container">
        <i class="fas fa-chart-bar section-icon" aria-hidden="true"></i>
        <h2>Classificacao Geral</h2>
      </div>

      <div class="actions ranking-actions">
        <button class="btn-primary export-button" id="exportPdfButton" type="button">
          <i class="fas fa-download" aria-hidden="true"></i>
          Exportar PDF
        </button>
      </div>

      <table id="rankingTable">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Jogador</th>
            <th>Pontos PT</th>
          </tr>
        </thead>
        <tbody>
          ${Xe(t)}
        </tbody>
      </table>

      <div class="actions ranking-reset">
        <button class="btn-outline danger-button" id="resetButton" type="button">
          <i class="fas fa-undo" aria-hidden="true"></i>
          Reiniciar torneio
        </button>
      </div>
    </section>
  `}function Xe(e){return Object.entries(e.classification).sort(([,t],[,n])=>n-t).map(([t,n],a)=>`
        <tr>
          <td>${a+1}o</td>
          <td>${T(t)}</td>
          <td>${n.toFixed(1)}</td>
        </tr>
      `).join("")}function Ze(e){if(e.schedule.length===0)return"";const t=e.roundTimer,n=R(t),a=t.isRunning?"Pausar":"Iniciar",o=t.isRunning?"fa-pause":"fa-play",r=Y.some(i=>i.seconds===t.totalSeconds);return`
    <section class="card timer-card" aria-label="Timer base da rodada">
      <div class="timer-header">
        <div>
          <span class="timer-kicker">Timer base</span>
          <h2>Rodada ${t.roundIndex+1}</h2>
        </div>
        <output class="timer-display" id="roundTimerDisplay" aria-live="polite">
          ${D(n)}
        </output>
      </div>

      <div class="timer-controls">
        <label class="timer-picker">
          Rodada
          <select id="roundTimerSelect" aria-label="Escolher rodada do timer">
            ${e.schedule.map((i,l)=>`
                  <option value="${l}" ${l===t.roundIndex?"selected":""}>
                    Rodada ${i.id}
                  </option>
                `).join("")}
          </select>
        </label>
        <label class="timer-picker">
          Tempo inicial
          <select id="roundTimerDurationSelect" aria-label="Escolher tempo inicial da rodada">
            ${Y.map(i=>`
                <option value="${i.seconds}" ${i.seconds===t.totalSeconds?"selected":""}>
                  ${i.label}
                </option>
              `).join("")}
            ${r?"":`<option value="${t.totalSeconds}" selected>Atual (${D(t.totalSeconds)})</option>`}
          </select>
        </label>
        <button class="btn-primary" id="toggleRoundTimerButton" type="button">
          <i class="fas ${o}" aria-hidden="true"></i>
          ${a}
        </button>
        <button class="btn-outline" id="addGlobalTimeButton" type="button">
          <i class="fas fa-plus" aria-hidden="true"></i>
          +${x/60} min global
        </button>
        <button class="btn-outline" id="resetRoundTimerButton" type="button">
          <i class="fas fa-rotate-left" aria-hidden="true"></i>
          Resetar timer
        </button>
      </div>

      <p class="timer-help">
        O timer base vale para mesas sem acrescimo. O +5 min da mesa nao muda este relogio; ele aparece apenas no cartao da mesa que recebeu tempo extra.
      </p>
    </section>
  `}function et(e,t,n,a,o){const r=`round-${e.id}`,i=F(n,a),l=!!o.completedTables[i],f=o.tableScores[i],d=o.roundTimer.tableExtensions[i]??0,u=d*(x/60),s=n===o.roundTimer.roundIndex,c=ye(o.roundTimer,i);return`
    <article class="mesa-box ${r}">
      <header>
        <span>Rodada ${e.id}</span>
        <strong>Mesa ${t.id}</strong>
      </header>
      <div class="table-time-summary ${s?"":"table-time-summary-muted"}">
        <span>${s?"Tempo da mesa":"Timer de outra rodada"}</span>
        <strong>${s?D(c):`Rodada ${e.id}`}</strong>
        <small>
          ${s?`Acréscimo: +${u} min`:`Selecione a Rodada ${e.id} no timer para iniciar ou dar acrescimo.`}
        </small>
      </div>
      <div class="seat-list">
        ${t.seats.map((p,g)=>{const h=(f==null?void 0:f[g])??U(p.score);return`
              <div class="player-row">
                <span class="vento-tag ${p.wind.toLowerCase()}">${p.wind}</span>
                <strong class="player-name">${T(p.player)}</strong>
                <input
                  id="score_${n}_${a}_${g}"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  aria-label="Pontuacao de ${T(p.player)}"
                  value="${h}"
                  class="${l?"input-locked":""}"
                  ${l?"disabled":""}
                />
              </div>
            `}).join("")}
      </div>
      <div class="table-actions">
        <button
          class="btn-outline table-time-button"
          data-round="${n}"
          data-table="${a}"
          type="button"
          ${s?"":"disabled"}
        >
          <i class="fas fa-clock" aria-hidden="true"></i>
          +${x/60} min mesa${d>0?` (${d}x)`:""}
        </button>
        <button
          class="btn-primary save-button ${l?"btn-locked":""}"
          data-round="${n}"
          data-table="${a}"
          type="button"
        >
          <i class="fas ${l?"fa-check-circle":"fa-save"}" aria-hidden="true"></i>
          ${l?"Mesa arquivada":"Guardar mesa"}
        </button>
      </div>
    </article>
  `}function tt(e,t){const n=e[t.roundTimer.roundIndex]??e[0];return`
    <section id="tablesContainer" aria-label="Grade completa de rodadas">
      <div class="section-title">
        <i class="fas fa-th-large section-icon" aria-hidden="true"></i>
        <div>
          <h2>Grade Completa de Rodadas</h2>
          <p class="section-subtitle">
            Todas as mesas ficam visiveis para conferir ventos e jogadores; o timer esta apontando para a Rodada ${(n==null?void 0:n.id)??1}.
          </p>
        </div>
      </div>
      <div id="roundsContainer" class="rounds-container">
        ${e.map((a,o)=>a.tables.map((r,i)=>et(a,r,o,i,t)).join("")).join("")}
      </div>
    </section>
  `}function nt(e,t=!0){return`
    <section id="setupContainer" class="card ${e||!t?"hidden":""}" aria-label="Configuracao do torneio">
      <div class="section-title-container">
        <i class="fas fa-cog section-icon" aria-hidden="true"></i>
        <h2>Configuracao do Torneio</h2>
      </div>

      <div class="alert-info">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        Regra: minimo de 8 jogadores e sempre multiplo de 4 para mesas completas.
      </div>

      <textarea
        id="playerList"
        spellcheck="false"
        placeholder="Digite os nomes dos jogadores, um por linha ou separados por virgula..."
      >${oe.join(`
`)}</textarea>

      <div class="actions">
        <button class="btn-outline" id="backToHomeButton" type="button">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          Voltar
        </button>
        <button class="btn-primary" id="startButton" type="button">
          <i class="fas fa-dice" aria-hidden="true"></i>
          Iniciar torneio
        </button>
      </div>
    </section>
  `}function at(e){const t=$(),n=V(t),a=le();e.innerHTML=`
    ${We()}
    <main class="content-wrapper">
      ${!n&&a==="home"?ze():""}
      ${!n&&a==="fastSetup"?nt(n,!0):""}
      ${n?"":Ue(a)}
      ${Ke(n,t)}
      ${n?Ze(t):""}
      ${n&&t.quality?He(t.quality):""}
      ${n?tt(t.schedule,t):""}
    </main>
  `}const X=document.querySelector("#app");if(!X)throw new Error("Elemento #app nao encontrado.");const ot=X;function z(){at(ot),Ge(z)}function rt(){const e=$();!V(e)||!e.roundTimer.isRunning||(R(e.roundTimer)<=0&&Te(),z())}z();window.setInterval(rt,1e3);
