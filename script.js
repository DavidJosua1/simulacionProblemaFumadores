let isRunning = false;
let currentSpeed = 1500;

// Semáforos virtuales
let semAgente = 1;
let semF1 = 0;
let semF2 = 0;
let semF3 = 0;

// Referencias del DOM
const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
const speedRange = document.getElementById('speedRange');
const consoleLog = document.getElementById('consoleLog');

const semAgenteEl = document.getElementById('semAgente');
const semF1El = document.getElementById('semF1');
const semF2ElEl = document.getElementById('semF2');
const semF3El = document.getElementById('semF3');

const agentStatus = document.getElementById('agentStatus');
const item1 = document.getElementById('item1');
const item2 = document.getElementById('item2');

const cardF1 = document.getElementById('cardF1');
const cardF2 = document.getElementById('cardF2');
const cardF3 = document.getElementById('cardF3');

const badgeF1 = document.getElementById('badgeF1');
const badgeF2 = document.getElementById('badgeF2');
const badgeF3 = document.getElementById('badgeF3');

// Inicializar iconos de Lucide
lucide.createIcons();

function logMessage(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    let colorClass = 'text-slate-300';
    if (type === 'agent') colorClass = 'text-blue-400 font-semibold';
    if (type === 'success') colorClass = 'text-emerald-400';
    if (type === 'warning') colorClass = 'text-amber-400';
    
    div.className = colorClass;
    div.innerHTML = `<span class="text-slate-600">[${time}]</span> ${msg}`;
    consoleLog.appendChild(div);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function updateSemaphoresUI() {
    semAgenteEl.textContent = semAgente;
    semF1El.textContent = semF1;
    semF2ElEl.textContent = semF2;
    semF3El.textContent = semF3;
}

function sleep(ms) {
    return new Promise(resolve => {
        const check = () => {
            if (!isRunning) {
                setTimeout(check, 100);
            } else {
                setTimeout(resolve, ms);
            }
        };
        check();
    });
}

function setItemContent(el, name, iconName) {
    el.className = "w-20 h-20 bg-slate-900 border border-blue-500/30 rounded-xl flex flex-col items-center justify-center gap-1 opacity-100 shadow-md shadow-blue-500/5 transition-all duration-300";
    el.innerHTML = `
        <i data-lucide="${iconName}" class="w-6 h-6 text-blue-400"></i>
        <span class="text-xs text-slate-300 font-medium">${name}</span>
    `;
    lucide.createIcons();
}

function clearItems() {
    item1.className = "w-20 h-20 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 opacity-40 transition-all duration-300 shadow-inner";
    item1.innerHTML = `<i data-lucide="package" class="w-6 h-6 text-slate-500"></i><span class="text-xs text-slate-500 font-medium"> Vacío </span>`;
    
    item2.className = "w-20 h-20 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 opacity-40 transition-all duration-300 shadow-inner";
    item2.innerHTML = `<i data-lucide="package" class="w-6 h-6 text-slate-500"></i><span class="text-xs text-slate-500 font-medium"> Vacío </span>`;
    lucide.createIcons();
}

function setFumadorState(fumadorNum, state) {
    let card, badge;
    if (fumadorNum === 1) { card = cardF1; badge = badgeF1; }
    if (fumadorNum === 2) { card = cardF2; badge = badgeF2; }
    if (fumadorNum === 3) { card = cardF3; badge = badgeF3; }

    card.className = "bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 shadow-xl";
    
    if (state === 'waiting') {
        badge.className = "mt-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30";
        badge.textContent = "Esperando";
        card.classList.add('fumador-activo');
    } else if (state === 'smoking') {
        badge.className = "mt-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse";
        badge.textContent = "Fumando 🚬";
        card.classList.add('fumador-fumando');
    } else {
        badge.className = "mt-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700";
        badge.textContent = "Durmiendo";
    }
}

async function runSimulationLoop() {
    while (isRunning) {
        // 1. Agente coloca ingredientes (sem_agente down)
        semAgente = 0;
        updateSemaphoresUI();
        agentStatus.textContent = "El agente selecciona 2 ingredientes aleatorios...";
        logMessage("Agente adquiere sem_agente y coloca ingredientes en la mesa.", "agent");
        
        await sleep(currentSpeed * 0.6);
        if (!isRunning) break;

        const choice = Math.floor(Math.random() * 3) + 1; // 1, 2 o 3

        if (choice === 1) {
            setItemContent(item1, 'Papel', 'file-text');
            setItemContent(item2, 'Cerillas', 'flame');
            agentStatus.textContent = "Agente colocó: Papel y Cerillas";
            logMessage("Agente colocó Papel y Cerillas. Despierta Fumador 1 (tiene Tabaco).", "warning");
            
            semF1 = 1;
            updateSemaphoresUI();
            setFumadorState(1, 'waiting');
            
            await sleep(currentSpeed);
            if (!isRunning) break;

            semF1 = 0;
            updateSemaphoresUI();
            setFumadorState(1, 'smoking');
            logMessage("Fumador 1 toma los ingredientes, arma el cigarrillo y fuma.", "success");
            
            await sleep(currentSpeed * 1.2);
            if (!isRunning) break;

            setFumadorState(1, 'sleeping');

        } else if (choice === 2) {
            setItemContent(item1, 'Tabaco', 'box');
            setItemContent(item2, 'Cerillas', 'flame');
            agentStatus.textContent = "Agente colocó: Tabaco y Cerillas";
            logMessage("Agente colocó Tabaco y Cerillas. Despierta Fumador 2 (tiene Papel).", "warning");
            
            semF2 = 1;
            updateSemaphoresUI();
            setFumadorState(2, 'waiting');
            
            await sleep(currentSpeed);
            if (!isRunning) break;

            semF2 = 0;
            updateSemaphoresUI();
            setFumadorState(2, 'smoking');
            logMessage("Fumador 2 toma los ingredientes, arma el cigarrillo y fuma.", "success");
            
            await sleep(currentSpeed * 1.2);
            if (!isRunning) break;

            setFumadorState(2, 'sleeping');

        } else {
            setItemContent(item1, 'Tabaco', 'box');
            setItemContent(item2, 'Papel', 'file-text');
            agentStatus.textContent = "Agente colocó: Tabaco y Papel";
            logMessage("Agente colocó Tabaco y Papel. Despierta Fumador 3 (tiene Cerillas).", "warning");
            
            semF3 = 1;
            updateSemaphoresUI();
            setFumadorState(3, 'waiting');
            
            await sleep(currentSpeed);
            if (!isRunning) break;

            semF3 = 0;
            updateSemaphoresUI();
            setFumadorState(3, 'smoking');
            logMessage("Fumador 3 toma los ingredientes, arma el cigarrillo y fuma.", "success");
            
            await sleep(currentSpeed * 1.2);
            if (!isRunning) break;

            setFumadorState(3, 'sleeping');
        }

        clearItems();
        agentStatus.textContent = "El fumador terminó. El agente es notificado.";
        logMessage("Fumador termina. Libera sem_agente para nuevo ciclo.", "info");

        semAgente = 1;
        updateSemaphoresUI();

        await sleep(currentSpeed * 0.5);
    }
}

// Controles de interfaz
btnStart.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        btnStart.disabled = true;
        btnStart.className = "bg-slate-800 text-slate-500 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-not-allowed";
        btnPause.disabled = false;
        btnPause.className = "bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20";
        
        logMessage("Simulación iniciada.", "success");
        runSimulationLoop();
    }
});

btnPause.addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        btnStart.disabled = false;
        btnStart.className = "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20";
        btnPause.disabled = true;
        btnPause.className = "bg-slate-800 text-slate-500 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-not-allowed";
        
        logMessage("Simulación pausada.", "warning");
        agentStatus.textContent = "Simulación pausada";
    }
});

btnReset.addEventListener('click', () => {
    isRunning = false;
    semAgente = 1;
    semF1 = 0;
    semF2 = 0;
    semF3 = 0;
    updateSemaphoresUI();
    clearItems();

    setFumadorState(1, 'sleeping');
    setFumadorState(2, 'sleeping');
    setFumadorState(3, 'sleeping');

    btnStart.disabled = false;
    btnStart.className = "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20";
    btnPause.disabled = true;
    btnPause.className = "bg-slate-800 text-slate-500 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-not-allowed";

    agentStatus.textContent = "El agente está esperando...";
    logMessage("Simulación reiniciada.", "info");
});

speedRange.addEventListener('input', (e) => {
    currentSpeed = parseInt(e.target.value);
});