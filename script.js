// --- SISTEMA DE ÁUDIO SINTÉTICO (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'click') {
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }
}

// --- ESTADO DO JOGO ---
let timeLeft = 25 * 60;
let timerInterval = null;
let currentRoom = 0;
let hintsLeft = 2;
let hintsUsedCount = 0;
let unlockedDigits = ["_", "_", "_", "_", "_"];

const rooms = [
  {
    title: "Sala 1: O Texto da Lei (Direito Social)",
    desc: "Leia o trecho da legislação e descubra qual palavra preenche a lacuna:",
    content: "'O esporte e o lazer são direitos ________ de todos os cidadãos, devendo o Poder Público focar prioritariamente no atendimento à infância e juventude.'\n\n📌 Descubra a palavra e CONTE SUAS LETRAS para obter o 1º Dígito:\n(A) Privados | (B) Sociais | (C) Opcionais",
    answer: "7", // "Sociais" tem 7 letras
    hint: "A palavra correta é SOCIAIS. Conte a quantidade de letras dessa palavra."
  },
  {
    title: "Sala 2: O Mapa do Bairro (Infraestrutura)",
    desc: "Examine a lista de equipamentos do bairro:",
    content: "1. Clube Privado (Mensalidade R$ 200)\n2. Praça Pública Aberta\n3. Academia Comercial\n4. Quadra Escolar Aberta nos Fins de Semana\n5. Parque Municipal Gratuito\n6. Campo Sintético Pago\n7. Condomínio Fechado\n\n📌 Quantos desses 7 locais são ESPAÇOS PÚBLICOS E GRATUITOS?",
    answer: "3", // Praça, Quadra Escolar, Parque
    hint: "Descarte locais privados ou que cobram taxa de entrada."
  },
  {
    title: "Sala 3: Inspeção de Acessibilidade (Universalidade)",
    desc: "A foto da quadra apresenta as seguintes irregularidades:",
    content: "• Degrau sem rampa na entrada principal\n• Bebedouro em altura inacessível\n• Porta de entrada estreita sem largura para cadeira\n• Banheiro público sem barra de apoio\n\n📌 Digite o NÚMERO TOTAL de barreiras de acessibilidade identificadas.",
    answer: "4",
    hint: "Conte quantas barreiras foram citadas nos marcadores."
  },
  {
    title: "Sala 4: Depoimento de Esporte Adaptado (Inclusão)",
    desc: "Ouça a transcrição do depoimento do atleta Lucas:",
    content: "'Nosso time de basquete em cadeira de rodas tentou agendar a quadra, mas fomos informados de que o espaço foi reservado exclusivamente para um torneio privado pelos próximos 8 meses.'\n\n📌 Há quantos MESES a quadra está interditada para uso comunitário?",
    answer: "8",
    hint: "O número exato de meses é informado no final do depoimento."
  },
  {
    title: "Sala 5: Grade de Gestão (Equidade)",
    desc: "Organize o cronograma semanal de uso comunitário:",
    content: "• Segunda-feira (Dia 1): Manutenção\n• Terça-feira (Dia 2): Horário livre para trabalhadores (Noturno)\n• Quarta-feira (Dia 3): Grupo de Dança\n• Sexta-feira (Dia 5): Escolha de Vôlei\n\n📌 Em qual dia útil (número de 1 a 5) o treino de Basquete Adaptado deve ocorrer para garantir o horário noturno vago?",
    answer: "2",
    hint: "O dia vago citado com horário noturno é a Terça-feira (Dia 2)."
  }
];

// --- NAVEGAÇÃO DE TELAS ---
function showScreen(screenId) {
  playSound('click');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// --- LÓGICA DO JOGO ---
function startGame() {
  timeLeft = 25 * 60;
  currentRoom = 0;
  hintsLeft = 2;
  hintsUsedCount = 0;
  unlockedDigits = ["_", "_", "_", "_", "_"];
  
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`digit-${i}`).innerText = "_";
  }
  
  document.getElementById("hints-count").innerText = hintsLeft;
  document.getElementById("hint-btn").disabled = false;
  
  showScreen('screen-game');
  loadRoom();
  
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timer-display").innerText = 
    `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    endGame(false);
  }
}

function loadRoom() {
  if (currentRoom >= rooms.length) {
    clearInterval(timerInterval);
    endGame(true);
    return;
  }

  const room = rooms[currentRoom];
  document.getElementById("room-title").innerText = room.title;
  document.getElementById("room-desc").innerText = room.desc;
  document.getElementById("enigma-content").innerText = room.content;
  document.getElementById("answer-input").value = "";
  document.getElementById("hint-text").classList.add("hidden");

  // Barra de progresso
  const progressPercent = ((currentRoom + 1) / rooms.length) * 100;
  document.getElementById("progress-fill").style.width = `${progressPercent}%`;
}

function checkAnswer() {
  const input = document.getElementById("answer-input").value.trim();
  const room = rooms[currentRoom];

  if (input === room.answer) {
    playSound('success');
    unlockedDigits[currentRoom] = room.answer;
    document.getElementById(`digit-${currentRoom + 1}`).innerText = room.answer;
    currentRoom++;
    loadRoom();
  } else {
    playSound('error');
    timeLeft = Math.max(0, timeLeft - 60); // Penalidade -1 min
    alert("❌ Senha Incorreta! Penalidade de -1 minuto.");
  }
}

function useHint() {
  if (hintsLeft > 0) {
    playSound('click');
    hintsLeft--;
    hintsUsedCount++;
    document.getElementById("hints-count").innerText = hintsLeft;
    const hText = document.getElementById("hint-text");
    hText.innerText = `💡 Dica: ${rooms[currentRoom].hint}`;
    hText.classList.remove("hidden");
    if (hintsLeft === 0) document.getElementById("hint-btn").disabled = true;
  }
}

function endGame(isWin) {
  showScreen('screen-end');
  
  const title = document.getElementById("end-title");
  const msg = document.getElementById("end-message");
  const badgesContainer = document.getElementById("badges-container");
  badgesContainer.innerHTML = "";

  if (isWin) {
    playSound('success');
    title.innerText = "🏆 QUADRA DESBLOQUEADA!";
    title.style.color = "#10b981";
    msg.innerText = `Parabéns! Sua equipe encontrou a combinação (${unlockedDigits.join('')}) e reabriu a quadra escolar para toda a comunidade!`;

    // Salvar Recorde
    const timeSpent = (25 * 60) - timeLeft;
    const minSpent = Math.floor(timeSpent / 60);
    const secSpent = timeSpent % 60;
    const timeString = `${minSpent.toString().padStart(2, '0')}:${secSpent.toString().padStart(2, '0')}`;
    
    document.getElementById("final-time").innerText = timeString;
    document.getElementById("final-hints").innerText = hintsUsedCount;
    
    localStorage.setItem('quadra_best_time', timeString);
    updateBestTimeDisplay();

    // Conquistas
    if (hintsUsedCount === 0) badgesContainer.innerHTML += `<span class="badge-item">🧠 Mestre sem Dicas</span>`;
    if (timeLeft > 15 * 60) badgesContainer.innerHTML += `<span class="badge-item">⚡ Velozes & Cidadãos</span>`;
    badgesContainer.innerHTML += `<span class="badge-item">🎓 Defensor do Lazer</span>`;

  } else {
    playSound('error');
    title.innerText = "❌ TEMPO ESGOTADO!";
    title.style.color = "#ef4444";
    msg.innerText = "O tempo acabou e a quadra continua trancada. Revise os conceitos dos direitos sociais e tente novamente!";
    document.getElementById("final-time").innerText = "25:00";
    document.getElementById("final-hints").innerText = hintsUsedCount;
  }
}

function updateBestTimeDisplay() {
  const best = localStorage.getItem('quadra_best_time');
  if (best) {
    document.getElementById("best-time-display").innerText = best;
  }
}

window.onload = () => {
  updateBestTimeDisplay();
};