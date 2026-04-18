// --- QUẢN LÝ NHẠC NỀN & TOAST THÔNG BÁO ---
function showSkillToast(title, desc) {
    const toast = document.getElementById('skill-toast');
    document.getElementById('skill-name').innerText = title;
    document.getElementById('skill-desc').innerText = desc;
    toast.classList.add('skill-toast-active');
    setTimeout(() => { toast.classList.remove('skill-toast-active'); }, 3500);
}

let isMusicPlaying = false;
function toggleMusic() {
    const bgm = document.getElementById('bgm-audio');
    const btn = document.getElementById('music-toggle');
    if (isMusicPlaying) {
        bgm.pause(); btn.innerText = '🔇 Nhạc Nền: Tắt';
    } else {
        bgm.play().then(() => { btn.innerText = '🎵 Nhạc Nền: Bật'; }).catch((err) => {
            showSkillToast("Lỗi Nhạc Nền", "Trình duyệt đang chặn nhạc hoặc không tìm thấy file music/nhacnen.mp3!");
        });
    }
    isMusicPlaying = !isMusicPlaying;
}

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

function playDropSound() { try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine'; const baseFreq = 380 + Math.random() * 180; osc.frequency.setValueAtTime(baseFreq, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, ctx.currentTime + 0.08); gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12); } catch(e) {} }
function playCaptureSound() { try { const ctx = getAudioCtx(); for (let i = 0; i < 3; i++) { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'triangle'; const t = ctx.currentTime + i * 0.07; osc.frequency.setValueAtTime(600 - i * 80, t); osc.frequency.exponentialRampToValueAtTime(200, t + 0.15); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18); osc.start(t); osc.stop(t + 0.2); } } catch(e) {} }
function playWinSound() { try { const ctx = getAudioCtx(); const melody = [523, 659, 784, 1047]; melody.forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'square'; const t = ctx.currentTime + i * 0.18; osc.frequency.setValueAtTime(freq, t); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35); osc.start(t); osc.stop(t + 0.4); }); } catch(e) {} }
function playLoseSound() { try { const ctx = getAudioCtx(); const melody = [400, 330, 260]; melody.forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sawtooth'; const t = ctx.currentTime + i * 0.2; osc.frequency.setValueAtTime(freq, t); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35); osc.start(t); osc.stop(t + 0.4); }); } catch(e) {} }

const fwCanvas = document.getElementById('fireworks-canvas'); const fwCtx = fwCanvas.getContext('2d'); let fwParticles = []; let fwAnimId = null;
function resizeFwCanvas() { fwCanvas.width = window.innerWidth; fwCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeFwCanvas); resizeFwCanvas();
function launchFirework() { const x = Math.random() * fwCanvas.width; const y = Math.random() * fwCanvas.height * 0.55; const colors = ['#ff4e4e','#ffdd57','#48c774','#3273dc','#ff69b4','#ff9f43','#a29bfe','#fd79a8']; const color = colors[Math.floor(Math.random() * colors.length)]; const count = 60 + Math.floor(Math.random() * 40); for (let i = 0; i < count; i++) { const angle = (Math.PI * 2 / count) * i; const speed = 2 + Math.random() * 5; fwParticles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color, radius: 2 + Math.random() * 2.5, decay: 0.012 + Math.random() * 0.01, gravity: 0.08 }); } }
function animateFireworks() { fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height); fwParticles = fwParticles.filter(p => p.alpha > 0.02); fwParticles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= 0.98; p.vy *= 0.98; p.alpha -= p.decay; fwCtx.save(); fwCtx.globalAlpha = Math.max(0, p.alpha); fwCtx.beginPath(); fwCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); fwCtx.fillStyle = p.color; fwCtx.shadowBlur = 8; fwCtx.shadowColor = p.color; fwCtx.fill(); fwCtx.restore(); }); fwAnimId = requestAnimationFrame(animateFireworks); }
let fwIntervalId = null;
function startFireworks() { fwCanvas.style.display = 'block'; animateFireworks(); launchFirework(); fwIntervalId = setInterval(launchFirework, 500); }
function stopFireworks() { clearInterval(fwIntervalId); fwIntervalId = null; if (fwAnimId) { cancelAnimationFrame(fwAnimId); fwAnimId = null; } fwParticles = []; fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height); fwCanvas.style.display = 'none'; }

// --- CỐT TRUYỆN MÀN CHƠI ---
let unlockedLevel = parseInt(localStorage.getItem('oanquan_unlocked_level')) || 1;
let currentCampaignLevel = 1;
let isTimedMode = false;
let selectedChapterData = null;

function generateBoard(val) { 
    if (Array.isArray(val)) {
        return [ 
            { quan: 1, dan: 0 }, 
            { quan: 0, dan: val[0] }, { quan: 0, dan: val[1] }, { quan: 0, dan: val[2] }, { quan: 0, dan: val[3] }, { quan: 0, dan: val[4] }, 
            { quan: 1, dan: 0 }, 
            { quan: 0, dan: val[5] }, { quan: 0, dan: val[6] }, { quan: 0, dan: val[7] }, { quan: 0, dan: val[8] }, { quan: 0, dan: val[9] } 
        ];
    }
    return [ 
        { quan: 1, dan: 0 }, 
        { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val }, 
        { quan: 1, dan: 0 }, 
        { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val }, { quan: 0, dan: val } 
    ]; 
}

let campaignLevels = [];
for(let i=1; i<=27; i++) {
    let diff = i <= 9 ? 'easy' : (i <= 18 ? 'medium' : 'hard'); 
    let levelInChapter = ((i - 1) % 9) + 1; 
    let boardData;
    if (levelInChapter >= 4) {
        let randomPits = [];
        for(let p = 0; p < 10; p++) {
            randomPits.push(Math.floor(Math.random() * 5) + 1); 
        }
        boardData = generateBoard(randomPits); 
    } else {
        boardData = generateBoard(5); 
    }
    campaignLevels.push({ id: i, name: `Ải ${i}`, diff: diff, board: boardData });
}

const storyChapters = [
    { id: 1, name: "Màn 1: Thuở nhỏ tầm sư", desc: "Bắt đầu với những viên sỏi lề đường. Học cách giữ chữ Tín, không gian lận trong từng nước cờ.", fullStory: "Cậu bé làng quê nghèo bắt đầu học tính toán bằng những viên sỏi nhặt nơi bờ ao. Thầy đồ làng từng dạy: 'Cầm quân cờ cũng như cầm nhân cách, đi sai một bước, gian lận một viên sỏi là đánh mất một chữ Tín'. Cậu khắc ghi lời thầy, tuyệt đối không gian lận, rèn luyện sự trung thực trong từng nước cờ.", start: 1, end: 9 },
    { id: 2, name: "Màn 2: Lều chõng quả cuốn", desc: "Cọ xát chốn trường thi kỳ Hương, kỳ Hội. Rèn luyện Nghĩa Khí, đương đầu thử thách.", fullStory: "Lớn lên, chàng trai khăn gói lều chõng lên kinh ứng thí. Dọc đường gió bụi, chàng gặp vô số sĩ tử khác cũng chung chí hướng. Bàn cờ Ô ăn quan trở thành nơi kết giao bằng hữu. Chàng luôn sẵn lòng chỉ dẫn người mới, nhường bước kẻ yếu. Chữ 'Nghĩa Khí' nay đã thấm sâu vào máu thịt, biến chàng thành một kỳ thủ được mọi người nể trọng.", start: 10, end: 18 },
    { id: 3, name: "Màn 3: Vinh quy bái tổ", desc: "Sân Đình tranh tài cùng Quan Chủ Khảo. Dùng Trí Tuệ và Trách Nhiệm để giành lấy Bảng Vàng.", fullStory: "Vượt qua ngàn người ở kỳ thi Hương, thi Hội, nay hiên ngang đứng trước sân Đình, đối mặt trực tiếp với Quan Chủ Khảo. Chàng thấu hiểu rằng, thi đỗ không chỉ mang lại vinh hoa cho bản thân, mà còn gánh trên vai chữ 'Trách Nhiệm' to lớn: dùng trí tuệ tính toán từng đường đi nước bước để lo cho dân, bảo vệ nước nhà.", start: 19, end: 27 }
];

function showCampaignScreen() {
    document.getElementById('story-view').style.display = 'block'; document.getElementById('level-view').style.display = 'none';
    const list = document.getElementById('chapter-list'); list.innerHTML = '';
    
    storyChapters.forEach(chap => {
        let isChapterLocked = unlockedLevel < chap.start; let box = document.createElement('div');
        box.className = 'chapter-box' + (isChapterLocked ? ' chapter-locked' : '');
        
        let progressText = "Đã Khóa";
        if (!isChapterLocked) { let passedInChap = Math.min(unlockedLevel - chap.start, 9); progressText = `${passedInChap}/9 Ải`; }

        box.innerHTML = `<div class="chapter-progress">${progressText}</div><h3 class="chapter-title">${chap.name}</h3><p class="chapter-desc">${chap.desc}</p>`;
        if(!isChapterLocked) box.onclick = () => openStoryModal(chap);
        list.appendChild(box);
    }); showScreen('campaign-menu');
}

function openStoryModal(chap) {
    selectedChapterData = chap;
    document.getElementById('story-modal-title').innerText = chap.name; document.getElementById('story-modal-content').innerText = chap.fullStory;
    document.getElementById('story-modal').style.display = 'flex';
}

function closeStoryModal() {
    document.getElementById('story-modal').style.display = 'none';
    document.getElementById('story-view').style.display = 'none'; document.getElementById('level-view').style.display = 'flex';
    document.getElementById('current-chapter-title').innerText = selectedChapterData.name;
    
    const grid = document.getElementById('campaign-grid'); grid.innerHTML = '';
    for(let i = selectedChapterData.start; i <= selectedChapterData.end; i++) {
        let lvl = campaignLevels[i - 1]; let isUnlocked = lvl.id <= unlockedLevel; let isPassed = lvl.id < unlockedLevel;
        let btnClass = 'level-btn'; if (!isUnlocked) btnClass += ' locked'; else if (isPassed) btnClass += ' passed';
        let btn = document.createElement('button'); btn.className = btnClass; btn.innerText = `Ải ${lvl.id}`;
        if(isUnlocked) btn.onclick = () => startCampaignLevel(lvl.id);
        grid.appendChild(btn);
    }
}

function backToStoryView() { document.getElementById('level-view').style.display = 'none'; document.getElementById('story-view').style.display = 'block'; showCampaignScreen(); }

function startCampaignLevel(levelId) {
    currentCampaignLevel = levelId; let lvl = campaignLevels[levelId - 1]; botDifficulty = lvl.diff; names.p1 = "Sĩ tử"; names.p2 = "Quan Chủ Khảo"; isTimedMode = true; 
    startGame('campaign', lvl.board);
}

// --- HỆ THỐNG KỸ NĂNG ---
const SKILL_DATA = {
    thienThoi: { name: "Thiên thời", desc: "Thêm 1 dân vào tất cả các ô của bạn.", icon: "🌤️", effect: () => { for(let i=7; i<=11; i++) if(board[i].dan > 0) board[i].dan++; } },
    diaLoi: { name: "Địa lợi", desc: "Trừ 1 dân ở tất cả các ô của đối thủ.", icon: "⛰️", effect: () => { for(let i=1; i<=5; i++) if(board[i].dan > 0) board[i].dan--; } },
    nhanHoa: { name: "Nhân hòa", desc: "Cộng ngay 10 điểm vào quỹ điểm.", icon: "🤝", effect: () => { scores.p1 += 10; } },
    locVua: { name: "Lộc vua", desc: "Phần thưởng lớn: Cộng ngay 15 điểm.", icon: "👑", effect: () => { scores.p1 += 15; } },
    rutCui: { name: "Rút củi", desc: "Trừ 5 điểm từ quỹ điểm của Chủ Khảo.", icon: "🔥", effect: () => { scores.p2 = Math.max(0, scores.p2 - 5); } }
};

let savedSkills = JSON.parse(localStorage.getItem('oanquan_skills')) || { thienThoi: 0, diaLoi: 0, nhanHoa: 0, locVua: 0, rutCui: 0 };

function updateSkillUI() {
    const inv = document.getElementById('skill-inventory');
    if (gameMode !== 'campaign') { inv.style.display = 'none'; return; }
    inv.style.display = 'flex';
    inv.innerHTML = '';
    for (let key in SKILL_DATA) {
        let count = savedSkills[key] || 0;
        let btn = document.createElement('button');
        btn.className = 'skill-btn' + (count > 0 ? ' has-skill' : '');
        btn.innerHTML = `${SKILL_DATA[key].icon} ${SKILL_DATA[key].name} <span class="skill-badge">${count}</span><span class="tooltip-text">${SKILL_DATA[key].desc}</span>`;
        if (count > 0) { btn.onclick = () => useSkill(key); }
        inv.appendChild(btn);
    }
}

function showSkillDiscovery(icon, name, desc) {
    isPaused = true; 
    document.getElementById('sd-icon').innerText = icon;
    document.getElementById('sd-name').innerText = name;
    document.getElementById('sd-desc').innerText = desc;
    document.getElementById('skill-discovery-modal').style.display = 'flex';
}

function closeSkillDiscovery() {
    document.getElementById('skill-discovery-modal').style.display = 'none';
    isPaused = false; 
    if ((gameMode === 'offline' || gameMode === 'campaign') && currentPlayer === 'p2') {
        clearTimeout(botTimeoutId);
        botTimeoutId = setTimeout(botMove, 500);
    }
}

function triggerRandomSkill() {
    if (gameMode !== 'campaign' || currentPlayer !== 'p1') return;
    if (Math.random() < 0.15) {
        const keys = Object.keys(SKILL_DATA);
        let randomKey = keys[Math.floor(Math.random() * keys.length)];
        let skill = SKILL_DATA[randomKey];
        
        savedSkills[randomKey] = (savedSkills[randomKey] || 0) + 1;
        localStorage.setItem('oanquan_skills', JSON.stringify(savedSkills));
        updateSkillUI();
        playWinSound();

        let discoveredSkills = JSON.parse(localStorage.getItem('oanquan_discovered_skills')) || {};
        
        if (!discoveredSkills[randomKey]) {
            discoveredSkills[randomKey] = true;
            localStorage.setItem('oanquan_discovered_skills', JSON.stringify(discoveredSkills));
            showSkillDiscovery(skill.icon, skill.name, skill.desc);
        } else {
            showSkillToast(`Nhặt được: ${skill.name}`, "Đã cất vào Túi Kỹ Năng!");
        }
    }
}

function useSkill(skillKey) {
    if (gameMode !== 'campaign' || currentPlayer !== 'p1' || isAnimating || isPaused) return;
    if (savedSkills[skillKey] > 0) {
        savedSkills[skillKey]--;
        localStorage.setItem('oanquan_skills', JSON.stringify(savedSkills));
        
        let skill = SKILL_DATA[skillKey];
        skill.effect();
        
        updateBoardUI();
        updateSkillUI();
        
        showSkillToast(`Sử dụng: ${skill.name}`, skill.desc);
        playDropSound(); 
    }
}

// --- CÁC HÀM CƠ BẢN QUẢN LÝ TRÒ CHƠI ---
function showWinModal(result) {
    const modal = document.getElementById('win-modal'); const trophy = document.getElementById('win-trophy'); const title = document.getElementById('win-title'); const sub = document.getElementById('win-subtitle');
    const wc1 = document.getElementById('wcard-p1'); const wc2 = document.getElementById('wcard-p2'); const btnContainer = document.getElementById('win-btn-container');

    document.getElementById('wname-p1').innerText = names.p1; document.getElementById('wname-p2').innerText = names.p2;
    document.getElementById('wval-p1').innerText  = scores.p1; document.getElementById('wval-p2').innerText  = scores.p2;
    wc1.classList.remove('winner'); wc2.classList.remove('winner'); stopTurnTimer(); document.getElementById('borrow-btn').style.display = 'none';

    if (gameMode === 'campaign') {
        let lvlName = campaignLevels[currentCampaignLevel - 1].name;
        if (result === 'win') { trophy.innerText = '📜'; title.innerText = 'VƯỢT ẢI!'; sub.innerText = `Sĩ tử đã thành công qua: ${lvlName}`; wc1.classList.add('winner'); playWinSound(); startFireworks(); } 
        else if (result === 'lose') { trophy.innerText = '🙇'; title.innerText = 'THI TRƯỢT!'; sub.innerText = `Quan chủ khảo đã đánh bại bạn ở: ${lvlName}`; wc2.classList.add('winner'); playLoseSound(); } 
        else { trophy.innerText = '🤝'; title.innerText = 'HÒA NHAU!'; sub.innerText = 'Gần thành công rồi! Hãy ôn luyện và thi lại.'; playWinSound(); }
    } else {
        if (result === 'win') { trophy.innerText = '🏆'; title.innerText = 'CHIẾN THẮNG!'; sub.innerText = 'Xuất sắc lắm! Bạn đã thắng!'; if (gameMode === 'online') { if (myRole === 'p1') wc1.classList.add('winner'); else wc2.classList.add('winner'); } else { wc1.classList.add('winner'); } playWinSound(); startFireworks(); } 
        else if (result === 'lose') { trophy.innerText = '😢'; title.innerText = 'THUA RỒI!'; sub.innerText = 'Đáng tiếc! Hãy thử lại nhé!'; if (gameMode === 'online') { if (myRole === 'p2') wc1.classList.add('winner'); else wc2.classList.add('winner'); } else { wc2.classList.add('winner'); } playLoseSound(); } 
        else { trophy.innerText = '🤝'; title.innerText = 'HÒA NHAU!'; sub.innerText = 'Hai bên ngang tài ngang sức!'; playWinSound(); }
    }

    btnContainer.innerHTML = `<button onclick="backToMainMenu()" style="background:#2e7d32; border-color:#1b5e20;">🏠 Menu</button>
                              <button onclick="restartGame()">🔄 Chơi lại</button>`;
    if (gameMode === 'campaign' && result === 'win' && currentCampaignLevel < 27) {
        btnContainer.innerHTML += `<button onclick="hideWinModal(); startCampaignLevel(${currentCampaignLevel + 1})" style="background:#e65100; border-color:#bf360c;">⏩ Cửa tiếp</button>`;
    }
    modal.style.display = 'flex';
}

function hideWinModal() { document.getElementById('win-modal').style.display = 'none'; stopFireworks(); }
function restartGame() { hideWinModal(); if (gameMode === 'campaign') { startCampaignLevel(currentCampaignLevel); } else { startGame(gameMode); } }

const socket = typeof io !== 'undefined' ? io() : null; let gameMode = 'offline'; let myRole = 'p1'; let currentRoom = ''; let names = { p1: "Bạn", p2: "Máy" }; let botDifficulty = 'easy';

let board = []; let scores = { p1: 0, p2: 0 }; let currentPlayer = 'p1'; let isAnimating = false; let isPaused = false; let currentMoveId = 0; 
const TURN_TIME_LIMIT = 15; let currentTimer = 0; let timerInterval = null;
let botTimeoutId = null;

function showDifficultyModal() { document.getElementById('difficulty-modal').style.display = 'flex'; }
function hideDifficultyModal() { document.getElementById('difficulty-modal').style.display = 'none'; }
function startOfflineGame(difficulty) { botDifficulty = difficulty; isTimedMode = document.getElementById('offline-timer').checked; hideDifficultyModal(); startGame('offline'); }

function startTurnTimer() {
    stopTurnTimer();
    if (!isTimedMode || (gameMode === 'online' && currentPlayer !== myRole) || ((gameMode === 'offline' || gameMode === 'campaign') && currentPlayer !== 'p1')) { document.getElementById('timer-container').style.display = 'none'; return; }
    document.getElementById('timer-container').style.display = 'block'; currentTimer = TURN_TIME_LIMIT; updateTimerUI();
    timerInterval = setInterval(() => { if (isPaused || isAnimating) return; currentTimer--; updateTimerUI(); if (currentTimer <= 0) { stopTurnTimer(); handleTimeoutForceMove(); } }, 1000);
}

function updateTimerUI() {
    const path = document.getElementById('timer-path'); const text = document.getElementById('timer-text'); const container = document.getElementById('timer-container');
    text.innerText = currentTimer; const percentage = (currentTimer / TURN_TIME_LIMIT) * 100; path.style.strokeDasharray = `${percentage}, 100`;
    if (currentTimer <= 5) container.classList.add('timer-warning'); else container.classList.remove('timer-warning');
}

function stopTurnTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = null; }

function handleTimeoutForceMove() {
    let myPits = myRole === 'p1' ? [7, 8, 9, 10, 11] : [1, 2, 3, 4, 5];
    if (myPits.every(i => board[i].dan === 0)) { let quanHasPoints = (board[0].quan > 0 || board[0].dan > 0 || board[6].quan > 0 || board[6].dan > 0); if (quanHasPoints) borrowStones(); }
    let validPits = myPits.filter(i => board[i].dan > 0);
    if (validPits.length > 0) { const randomPit = validPits[Math.floor(Math.random() * validPits.length)]; const randomDir = Math.random() > 0.5 ? 1 : -1; document.getElementById(`pit-${randomPit}`).classList.add('cell-active'); handlePlayerMove(randomPit, randomDir); } 
    else { currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1'; updateTurnIndicator(); }
}

function checkBorrowCondition() {
    document.getElementById('borrow-btn').style.display = 'none';
    if (isAnimating || isPaused) return;
    let quanHasPoints = (board[0].quan > 0 || board[0].dan > 0 || board[6].quan > 0 || board[6].dan > 0);
    if (!quanHasPoints) return;
    if (gameMode === 'online') { if (currentPlayer !== myRole) return; let pits = (myRole === 'p1') ? [7,8,9,10,11] : [1,2,3,4,5]; if (pits.every(i => board[i].dan === 0)) document.getElementById('borrow-btn').style.display = 'inline-block'; } 
    else { if (currentPlayer === 'p1') { if ([7,8,9,10,11].every(i => board[i].dan === 0)) document.getElementById('borrow-btn').style.display = 'inline-block'; } }
}

function borrowStones() { document.getElementById('borrow-btn').style.display = 'none'; if (gameMode === 'online') { socket.emit('makeMove', { roomCode: currentRoom, isBorrow: true, player: currentPlayer }); } executeBorrow(currentPlayer); }

function executeBorrow(player) {
    if (player === 'p1') { scores.p1 -= 5; for(let i=7; i<=11; i++) board[i].dan++; } 
    else { scores.p2 -= 5; for(let i=1; i<=5; i++) board[i].dan++; }
    playDropSound(); updateBoardUI();
}

function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function startMultiplayer() { if (!socket) return alert("Không tìm thấy server. Hãy chạy file start.bat!"); showScreen('multiplayer-menu'); }
function createRoom() { const pName = document.getElementById('player-name').value.trim() || "Chủ phòng"; const isTimed = document.getElementById('online-timer').checked ? "1" : "0"; socket.emit('createRoom', pName + "|||" + isTimed); }
function joinRoom() { const code = document.getElementById('room-input').value.trim(); const pName = document.getElementById('player-name').value.trim() || "Khách"; if(code.length !== 4) return alert("Mã PIN phải gồm 4 số!"); socket.emit('joinRoom', { code: code, name: pName }); document.getElementById('room-status').innerText = "Đang kết nối..."; }

if(socket) {
    socket.on('roomCreated', (code) => { currentRoom = code; myRole = 'p1'; document.getElementById('setup-room').style.display = 'none'; document.getElementById('waiting-room').style.display = 'flex'; document.getElementById('display-room-code').innerText = code; });
    socket.on('roomJoined', (role) => { currentRoom = document.getElementById('room-input').value.trim(); myRole = role; });
    socket.on('roomError', (msg) => { document.getElementById('room-status').innerText = msg; });
    socket.on('gameStart', (data) => { let p1Data = data.p1Name.split("|||"); names.p1 = p1Data[0]; isTimedMode = (p1Data[1] === "1"); names.p2 = data.p2Name; alert(`Đã kết nối! Trò chơi bắt đầu.\nChế độ: ${isTimedMode ? "CÓ TÍNH GIỜ (15s)" : "KHÔNG TÍNH GIỜ"}`); startGame('online'); });
    socket.on('receiveMove', (data) => { if (data.isBorrow) executeBorrow(data.player); else startMove(data.index, data.direction); });
    socket.on('opponentDisconnected', () => { if (gameMode === 'online') { alert("Đối thủ đã thoát!"); window.location.reload(); } });
}

function startGame(mode, customBoard = null) {
    hideWinModal(); currentMoveId++; gameMode = mode; scores = { p1: 0, p2: 0 }; currentPlayer = 'p1'; isAnimating = false; isPaused = false; 
    document.getElementById('hand-cursor').style.display = 'none'; document.getElementById('borrow-btn').style.display = 'none'; stopTurnTimer(); clearTimeout(botTimeoutId);
    if(mode === 'offline') { names.p1 = "Bạn"; names.p2 = "Máy"; }
    if (gameMode === 'online' && myRole === 'p2') { document.getElementById('board-ui').classList.add('flipped'); } else { document.getElementById('board-ui').classList.remove('flipped'); }
    if (customBoard) { board = JSON.parse(JSON.stringify(customBoard)); } 
    else { board = [ { quan: 1, dan: 0 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 1, dan: 0 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 }, { quan: 0, dan: 5 } ]; }
    for (let i = 0; i < 12; i++) document.getElementById(`pit-${i}`).innerHTML = '';
    
    updateSkillUI();
    closeOptions(); showScreen('game-screen'); updateBoardUI(); updateTurnIndicator();
}

function updateBoardUI() {
    if (gameMode === 'online' && myRole === 'p2') { document.getElementById('name-bot').innerText = names.p2; document.getElementById('score-bot').innerText = scores.p2; document.getElementById('name-top').innerText = names.p1; document.getElementById('score-top').innerText = scores.p1; } 
    else { document.getElementById('name-bot').innerText = names.p1; document.getElementById('score-bot').innerText = scores.p1; document.getElementById('name-top').innerText = names.p2; document.getElementById('score-top').innerText = scores.p2; }

    for (let i = 0; i < 12; i++) {
        const cell = document.getElementById(`pit-${i}`); cell.classList.remove('cell-active'); const oldArrows = cell.querySelector('.arrows'); if (oldArrows) oldArrows.remove();
        let quanEl = cell.querySelector('.stone-quan');
        if (board[i].quan > 0) { if (!quanEl) { quanEl = document.createElement('div'); quanEl.className = 'stone-quan'; quanEl.style.left = '50%'; quanEl.style.top = '50%'; cell.appendChild(quanEl); } } else if (quanEl) quanEl.remove();
        
        let existingDan = cell.querySelectorAll('.stone-dan'); let targetDan = board[i].dan;
        if (existingDan.length < targetDan) {
            for(let j = existingDan.length; j < targetDan; j++) {
                const danEl = document.createElement('div'); danEl.className = 'stone-dan';
                const xPercent = 20 + Math.random() * 60; const yPercent = 20 + Math.random() * 60;
                danEl.style.left = `${xPercent}%`; danEl.style.top = `${yPercent}%`;
                danEl.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`; cell.appendChild(danEl);
            }
        } else if (existingDan.length > targetDan) { for(let j = existingDan.length - 1; j >= targetDan; j--) existingDan[j].remove(); }
        
        let countBadge = cell.querySelector('.count-badge'); let totalValue = board[i].dan + (board[i].quan * 10);
        if (totalValue > 0) { if (!countBadge) { countBadge = document.createElement('div'); countBadge.className = 'count-badge'; cell.appendChild(countBadge); } countBadge.innerText = totalValue; cell.appendChild(countBadge); } else if (countBadge) countBadge.remove();
    }
}

function selectPit(index) {
    if (isAnimating || isPaused) return;
    if (gameMode === 'online') { if (currentPlayer !== myRole) return; if (myRole === 'p1' && (index < 7 || index > 11)) return; if (myRole === 'p2' && (index < 1 || index > 5)) return; } 
    else { if (currentPlayer !== 'p1') return; if (index < 7 || index > 11) return; }
    if (board[index].dan > 0) {
        updateBoardUI(); const cell = document.getElementById(`pit-${index}`); cell.classList.add('cell-active');
        const arrows = document.createElement('div'); arrows.className = 'arrows';
        arrows.innerHTML = `<button class="arrow-btn" onclick="handlePlayerMove(${index}, 1); event.stopPropagation();">◀</button><button class="arrow-btn" onclick="handlePlayerMove(${index}, -1); event.stopPropagation();">▶</button>`;
        cell.appendChild(arrows);
    }
}

function handlePlayerMove(index, direction) { if (gameMode === 'online') socket.emit('makeMove', { roomCode: currentRoom, index: index, direction: direction }); startMove(index, direction); }

async function checkPauseAndCancel(moveId) { while (isPaused) { if (moveId !== currentMoveId) return true; await sleep(100); } return moveId !== currentMoveId; }

async function startMove(startIndex, direction) {
    if(isAnimating || isPaused) return;
    isAnimating = true; stopTurnTimer(); document.getElementById('borrow-btn').style.display = 'none';
    currentMoveId++; let myMoveId = currentMoveId; updateBoardUI(); const hand = document.getElementById('hand-cursor'); hand.style.display = 'block';

    async function dropStones(count, currentIndex) {
        let curr = currentIndex;
        while (count > 0) {
            if (await checkPauseAndCancel(myMoveId)) return null; curr = (curr + direction + 12) % 12;
            await moveHandTo(curr); if (await checkPauseAndCancel(myMoveId)) return null; 
            board[curr].dan++; count--; playDropSound(); updateBoardUI(); await sleep(200); 
        } return curr; 
    }

    async function handlePostDrop(lastIndex) {
        if (lastIndex === null || await checkPauseAndCancel(myMoveId)) return;
        let nextIndex = (lastIndex + direction + 12) % 12;
        if (nextIndex === 0 || nextIndex === 6) return; 
        if (board[nextIndex].dan > 0) {
            let nextStones = board[nextIndex].dan; board[nextIndex].dan = 0;
            document.getElementById(`pit-${nextIndex}`).classList.add('cell-active'); updateBoardUI();
            await moveHandTo(nextIndex); if (await checkPauseAndCancel(myMoveId)) return; await sleep(250); 
            let newLastIndex = await dropStones(nextStones, nextIndex); await handlePostDrop(newLastIndex); return;
        }
        if (board[nextIndex].dan === 0) {
            let targetIndex = (nextIndex + direction + 12) % 12;
            while ((board[targetIndex].dan > 0 || board[targetIndex].quan > 0) && board[nextIndex].dan === 0) {
                if (await checkPauseAndCancel(myMoveId)) return;
                let capturedDan = board[targetIndex].dan; let capturedQuan = board[targetIndex].quan;
                board[targetIndex].dan = 0; board[targetIndex].quan = 0; let points = capturedDan + (capturedQuan * 10);
                if (currentPlayer === 'p1') scores.p1 += points; else scores.p2 += points;
                await moveHandTo(targetIndex); playCaptureSound(); showScoreEffect(targetIndex, points); updateBoardUI(); await sleep(400); 
                nextIndex = (targetIndex + direction + 12) % 12; targetIndex = (nextIndex + direction + 12) % 12;
            }
        }
    }

    let initialPieces = board[startIndex].dan; board[startIndex].dan = 0; updateBoardUI();
    await moveHandTo(startIndex); await sleep(200); 
    let lastDropIndex = await dropStones(initialPieces, startIndex); await handlePostDrop(lastDropIndex);
    if (myMoveId !== currentMoveId) return;

    hand.style.display = 'none'; 
    isAnimating = false; 
    
    triggerRandomSkill();
    checkWinCondition();
    currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1'; 
    updateTurnIndicator(); 
    
    if ((gameMode === 'offline' || gameMode === 'campaign') && currentPlayer === 'p2') {
        clearTimeout(botTimeoutId);
        botTimeoutId = setTimeout(botMove, 800);
    }
}

function botMove() {
    clearTimeout(botTimeoutId);
    if (gameMode === 'online' || currentPlayer !== 'p2' || isAnimating || isPaused) return;
    let validPits = [1, 2, 3, 4, 5].filter(i => board[i].dan > 0);
    if (validPits.length === 0) { 
        let quanHasPoints = (board[0].quan > 0 || board[0].dan > 0 || board[6].quan > 0 || board[6].dan > 0); 
        if (quanHasPoints) { 
            executeBorrow('p2'); botTimeoutId = setTimeout(botMove, 500); return; 
        } else { 
            currentPlayer = 'p1'; updateTurnIndicator(); return; 
        } 
    }
    let chosenPit, chosenDir;
    if (botDifficulty === 'easy') { chosenPit = validPits[Math.floor(Math.random() * validPits.length)]; chosenDir = Math.random() > 0.5 ? 1 : -1; } 
    else if (botDifficulty === 'medium') { let bestScore = -1; chosenPit = validPits[0]; chosenDir = 1; for (let pit of validPits) { for (let dir of [1, -1]) { let simScore = simulateScore(pit, dir); if (simScore > bestScore) { bestScore = simScore; chosenPit = pit; chosenDir = dir; } } } if (bestScore === 0 && Math.random() < 0.5) { chosenPit = validPits[Math.floor(Math.random() * validPits.length)]; chosenDir = Math.random() > 0.5 ? 1 : -1; } } 
    else { let bestScore = -Infinity; chosenPit = validPits[0]; chosenDir = 1; for (let pit of validPits) { for (let dir of [1, -1]) { let simScore = simulateScore(pit, dir); if (simScore > bestScore) { bestScore = simScore; chosenPit = pit; chosenDir = dir; } } } }
    
    document.getElementById(`pit-${chosenPit}`).classList.add('cell-active'); 
    botTimeoutId = setTimeout(() => { startMove(chosenPit, chosenDir); }, 400);
}

function simulateScore(startIndex, direction) {
    let b = board.map(c => ({ dan: c.dan, quan: c.quan })); let count = b[startIndex].dan; b[startIndex].dan = 0; let curr = startIndex;
    while (count > 0) { curr = (curr + direction + 12) % 12; b[curr].dan++; count--; }
    let earned = 0; let next = (curr + direction + 12) % 12;
    while (next !== 0 && next !== 6 && b[next].dan === 0) { let target = (next + direction + 12) % 12; if (b[target].dan > 0 || b[target].quan > 0) { earned += b[target].dan + b[target].quan * 10; b[target].dan = 0; b[target].quan = 0; next = (target + direction + 12) % 12; } else break; } return earned;
}

function moveHandTo(index) { return new Promise(resolve => { const hand = document.getElementById('hand-cursor'); const targetCell = document.getElementById(`pit-${index}`); const rect = targetCell.getBoundingClientRect(); hand.style.top = `${rect.top + window.scrollY - 25}px`; hand.style.left = `${rect.left + window.scrollX + (rect.width/2) - 20}px`; setTimeout(resolve, 200); }); }
function showScoreEffect(index, amount) { const cell = document.getElementById(`pit-${index}`); const rect = cell.getBoundingClientRect(); const anim = document.createElement('div'); anim.className = 'score-anim'; anim.innerText = `+${amount}`; anim.style.top = `${rect.top + window.scrollY - 20}px`; anim.style.left = `${rect.left + window.scrollX + 20}px`; document.body.appendChild(anim); setTimeout(() => anim.remove(), 1500); }

function checkWinCondition() {
    if(board[0].quan === 0 && board[0].dan === 0 && board[6].quan === 0 && board[6].dan === 0) {
        stopTurnTimer(); document.getElementById('borrow-btn').style.display = 'none';
        
        let p1Remaining = 0; let p2Remaining = 0;
        for (let i = 7; i <= 11; i++) { p1Remaining += board[i].dan; board[i].dan = 0; }
        for (let i = 1; i <= 5; i++) { p2Remaining += board[i].dan; board[i].dan = 0; }
        scores.p1 += p1Remaining; scores.p2 += p2Remaining;
        updateBoardUI();

        setTimeout(() => {
            let result; if (gameMode === 'online') { const myScore = myRole === 'p1' ? scores.p1 : scores.p2; const oppScore = myRole === 'p1' ? scores.p2 : scores.p1; result = myScore > oppScore ? 'win' : myScore < oppScore ? 'lose' : 'draw'; } else { result = scores.p1 > scores.p2 ? 'win' : scores.p1 < scores.p2 ? 'lose' : 'draw'; }
            if (gameMode === 'campaign' && result === 'win') { if (currentCampaignLevel === unlockedLevel && unlockedLevel < 27) { unlockedLevel++; localStorage.setItem('oanquan_unlocked_level', unlockedLevel); } } showWinModal(result);
        }, 500);
    }
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (gameMode === 'online') { if (currentPlayer === myRole) { indicator.innerText = "Lượt của Bạn!"; indicator.style.color = "#2e7d32"; } else { indicator.innerText = `Lượt của ${currentPlayer === 'p1' ? names.p1 : names.p2}...`; indicator.style.color = "#c62828"; } } 
    else if (gameMode === 'campaign') { if (currentPlayer === 'p1') { indicator.innerText = "Sĩ tử xuất chiêu!"; indicator.style.color = "#2e7d32"; } else { indicator.innerText = "Chủ khảo đang rải..."; indicator.style.color = "#c62828"; } } 
    else { if (currentPlayer === 'p1') { indicator.innerText = "Lượt của Bạn!"; indicator.style.color = "#2e7d32"; } else { indicator.innerText = "Máy đang rải quân..."; indicator.style.color = "#c62828"; } }
    startTurnTimer(); checkBorrowCondition(); 
}

function openOptions() { isPaused = true; document.getElementById('options-modal').style.display = 'flex'; }
function closeOptions() { isPaused = false; document.getElementById('options-modal').style.display = 'none'; }
function backToMainMenu() { stopTurnTimer(); currentMoveId++; isPaused = false; hideWinModal(); clearTimeout(botTimeoutId); window.location.reload(); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }