let timeLeft = 25 * 60; // 25 minutos em segundos
let timerInterval = null;
let currentRoom = 0;
let hintsLeft = 2;
let unlockedDigits = ["_", "_", "_", "_", "_"];

// Estrutura dos 5 Enigmas
const rooms = [
  {
    title: "Sala 1: O Texto da Lei (Barreira Normativa)",
    desc: "Para descobrir o 1º dígito, leia o trecho da legislação e descubra qual palavra preenche a lacuna:\n\n'O esporte e o lazer são direitos ________ de todos os cidadãos, devendo o Poder Público focar prioritariamente no atendimento à infância e juventude.'",
    content: "Dica de contagem: Conte quantas letras tem a palavra correta para achar o número:\n(A) Privados\n(B) Sociais\n(C) Opcionais",
    answer: "7", // "Sociais" tem 7 letras
    hint: "A resposta é a quantidade de letras da palavra referente a um direito constitucional básico de todos (S-O-C-I-A-I-S)."
  },
  {
    title: "Sala 2: O Mapa do Bairro (Barreira Territorial)",
    desc: "Análise de Espaços do Bairro:\n1. Clube Privado com mensalidade R$ 200\n2. Praça Pública Aberta\n3. Academia Comercial\n4. Quadra Escolar Aberta aos Fins de Semana\n5. Parque Municipal Gratuito\n6. Campo de Futebol Privado\n7. Condomínio Fechado com quadra",
    content: "Quantos dos 7 locais acima são espaços de lazer PÚBLICOS e GRATUITOS para toda a comunidade?",
    answer: "3", // Praça Pública, Quadra Escolar e Parque Municipal
    hint: "Descarte locais privados, comerciais ou com cobrança de mensalidade/entrada."
  },
  {
    title: "Sala 3: A Inspeção Visual (Barreira de Acessibilidade)",
    desc: "A foto da quadra mostra 4 barreiras arquitetônicas de acessibilidade:\n- Degrau sem rampa na entrada\n- Bebedouro muito alto\n- Porta estreita sem largura para cadeira\n- Banheiro sem barra de apoio",
    content: "Digite exatamente quantas barreiras de acessibilidade impedem o uso autônomo por pessoas com deficiência nesta quadra.",
    answer: "4",
    hint: "A resposta é o número total de barreiras listadas no texto de inspeção."
  },
  {
    title: "Sala 4: O Depoimento (Barreira Social)",
    desc: "Áudio/Depoimento de Lucas (estudante): 'Nosso grupo de esporte adaptado tentou usar a quadra, mas fomos informados de que o espaço estava reservado apenas para campeonatos masculinos de futebol durante os próximos 8 meses.'",
    content: "Quantos meses a quadra ficou interditada para outros grupos comunitários segundo o relato?",
    answer: "8",
    hint: "Preste atenção no número exato de meses mencionado ao final da fala de Lucas."
  },
  {
    title: "Sala 5: A Grade de Horários (Barreira de Gestão)",
    desc: "Resolva a distribuição de uso do espaço para liberar o último dígito:\n- O grupo de dança usa a quadra na Quarta (3º dia útil).\n- A escolinha de vôlei treina no 5º dia útil (Sexta).\n- Em qual dia da semana (representado pelo número do dia útil: 1 a 5) o grupo de Basquete Adaptado deve treinar para garantir equidade?",
    content: "Análise os dias úteis (1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex). Se a Terça-feira (dia 2) é o único dia com horário noturno vago para trabalhadores e estudantes, qual é esse número?",
    answer: "2",
    hint: "O número corresponde à Terça-feira na contagem dos dias úteis."
  }
];

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false, "⏰ O tempo de 25 minutos acabou! A quadra continuará trancada.");
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer-display").innerText = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function loadRoom() {
  if (currentRoom >= rooms.length) {
    clearInterval(timerInterval);
    endGame(true, `🎉 PARABÉNS! Você encontrou os 5 dígitos (${unlockedDigits.join('')}) e reabriu a quadra escolar para toda a comunidade!`);
    return;
  }

  const room = rooms[currentRoom];
  document.getElementById("room-title").innerText = room.title;
  document.getElementById("room-desc").innerText = room.desc;
  document.getElementById("enigma-content").innerText = room.content;
  document.getElementById("answer-input").value = "";
  document.getElementById("hint-text").classList.add("hidden");
}

function checkAnswer() {
  const userInput = document.getElementById("answer-input").value.trim();
  const room = rooms[currentRoom];

  if (userInput === room.answer) {
    unlockedDigits[currentRoom] = room.answer;
    document.getElementById(`digit-${currentRoom + 1}`).innerText = room.answer;
    currentRoom++;
    loadRoom();
  } else {
    // Penalidade de 1 minuto (60 segundos) por resposta errada
    timeLeft = Math.max(0, timeLeft - 60);
    updateTimerDisplay();
    alert("❌ Resposta incorreta! Penalidade de -1 minuto no cronômetro.");
  }
}

function useHint() {
  if (hintsLeft > 0) {
    hintsLeft--;
    document.getElementById("hints-count").innerText = hintsLeft;
    const hintText = document.getElementById("hint-text");
    hintText.innerText = `💡 Dica: ${rooms[currentRoom].hint}`;
    hintText.classList.remove("hidden");
    if (hintsLeft === 0) {
      document.getElementById("hint-btn").disabled = true;
    }
  }
}

function endGame(isWin, message) {
  const modal = document.getElementById("end-modal");
  document.getElementById("modal-title").innerText = isWin ? "🏆 Vitória!" : "❌ Fim de Jogo!";
  document.getElementById("modal-text").innerText = message;
  modal.classList.remove("hidden");
}

function restartGame() {
  timeLeft = 25 * 60;
  currentRoom = 0;
  hintsLeft = 2;
  unlockedDigits = ["_", "_", "_", "_", "_"];
  
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`digit-${i}`).innerText = "_";
  }
  
  document.getElementById("hints-count").innerText = hintsLeft;
  document.getElementById("hint-btn").disabled = false;
  document.getElementById("end-modal").classList.add("hidden");
  
  clearInterval(timerInterval);
  startTimer();
  loadRoom();
}

window.onload = () => {
  startTimer();
  loadRoom();
};