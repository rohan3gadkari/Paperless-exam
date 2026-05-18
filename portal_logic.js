const urlParams = new URLSearchParams(window.location.search);
document.getElementById("display-name").innerText = urlParams.get('student_name') || "विद्यार्थी";
document.getElementById("display-roll").innerText = urlParams.get('roll_no') || "0000";
const subCode = urlParams.get('subject') || "Examination";
document.getElementById("display-subject").innerText = `डिजिटल परीक्षा: ${subCode}`;

// डीफॉल्ट प्रश्नपत्रिका
const defaultQuestions = [
    { q: "फ्लूइड मेकॅनिक्समध्ये, आयडियल फ्लूइडची (Ideal Fluid) विस्कॉसिटी (Viscosity) किती असते?", o: ["शून्य (Zero)", "एक (One)", "अनंत (Infinite)", "तापमानावर अवलंबून"], a: 0 },
    { q: "हूकचा नियम (Hooke's Law) प्रामुख्याने कोणत्या मर्यादेत वैध असतो?", o: ["प्लास्टिक लिमिट", "प्रपोर्शनॅलिटी लिमिट", "यिल्ड पॉईंट", "अल्टिमेट लिमिट"], a: 1 },
    { q: "बर्नोलीचे समीकरण (Bernoulli's Equation) कोणत्या तत्त्वावर काम करते?", o: ["वस्तुमान संवर्धन", "मोमेंटम संवर्धन", "ऊर्जा संवर्धन", "दाब संवर्धन"], a: 2 },
    { q: "इलेक्ट्रिक व्हेईकलमध्ये (EV) प्रामुख्याने कोणत्या प्रकारची मोटर वापरली जाती?", o: ["DC Shunt Motor", "BLDC Motor", "Universal Motor", "Slip Ring Motor"], a: 1 },
    { q: "कॅन्टीलीव्हर बीमचे (Cantilever Beam) किती टोके फिक्स असतात?", o: ["दोन्ही टोके", "एकही नाही", "एकोक फिक्स, एक मोकळे", "तीन टोके"], a: 2 }
];

const questions = JSON.parse(localStorage.getItem('custom_exam_questions')) || defaultQuestions;

let currentIndex = 0;
let userAnswers = new Array(questions.length).fill(null);
let warningCount = 0;
let timeLeft = 300; 
let isSubmitted = false;

function initExam() {
    renderPalette();
    loadQuestion(0);
    startTimer();
    setupSecurity();
}

function loadQuestion(index) {
    currentIndex = index;
    document.getElementById("question-number-title").innerText = `प्रश्न ${index + 1} / ${questions.length}`;
    document.getElementById("question-body").innerText = questions[index].q;
    
    const optionsBlock = document.getElementById("options-block");
    optionsBlock.innerHTML = "";
    
    questions[index].o.forEach((opt, idx) => {
        const isChecked = userAnswers[index] === idx ? "checked" : "";
        const div = document.createElement("div");
        div.innerHTML = `
            <label class="flex items-center p-3.5 bg-slate-750 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/60 transition">
                <input type="radio" name="opt" value="${idx}" ${isChecked} onchange="saveAnswer(${idx})" class="h-4 w-4 text-blue-600 bg-slate-900 border-slate-700">
                <span class="ml-3 text-sm text-slate-200">${opt}</span>
            </label>
        `;
        optionsBlock.appendChild(div);
    });

    document.getElementById("prev-btn").disabled = (index === 0);
    document.getElementById("next-btn").innerText = (index === questions.length - 1) ? "सबमिट कडे जा" : "पुढे जा";
    updatePaletteUI();
}

function saveAnswer(selectedIdx) {
    userAnswers[currentIndex] = selectedIdx;
    updatePaletteUI();
}

function changeQuestion(direction) {
    let nextIdx = currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < questions.length) {
        loadQuestion(nextIdx);
    }
}

function renderPalette() {
    const grid = document.getElementById("palette-grid");
    grid.innerHTML = "";
    questions.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.id = `palette-btn-${idx}`;
        btn.innerText = idx + 1;
        btn.onclick = () => loadQuestion(idx);
        btn.className = "w-10 h-10 rounded-md text-sm font-bold border border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 transition";
        grid.appendChild(btn);
    });
}

function updatePaletteUI() {
    questions.forEach((_, idx) => {
        const btn = document.getElementById(`palette-btn-${idx}`);
        if (!btn) return;
        if (idx === currentIndex) {
            btn.className = "w-10 h-10 rounded-md text-sm font-bold border-2 border-blue-500 bg-slate-700 text-white shadow";
        } else if (userAnswers[idx] !== null) {
            btn.className = "w-10 h-10 rounded-md text-sm font-bold border border-emerald-600 bg-emerald-600/20 text-emerald-400";
        } else {
            btn.className = "w-10 h-10 rounded-md text-sm font-bold border border-slate-700 bg-slate-900 text-slate-400";
        }
    });
}

function startTimer() {
    const timerBox = document.getElementById("timer-box");
    const interval = setInterval(() => {
        if (isSubmitted) return clearInterval(interval);
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerBox.innerText = "वेळ संपली!";
            alert("वेळ संपली आहे! तुमचा पेपर आपोआप सबमिट होत आहे.");
            finishExam();
        } else {
            let min = Math.floor(timeLeft / 60);
            let sec = timeLeft % 60;
            timerBox.innerText = `शिल्लक वेळ: ${min < 10 ? '0':''}${min}:${sec < 10 ? '0':''}${sec}`;
            timeLeft--;
        }
    }, 1000);
}

function setupSecurity() {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && !isSubmitted) {
            warningCount++;
            alert(`🚨 वॉर्निंग [${warningCount}/3]: तुम्ही परीक्षा स्क्रीन बदलण्याचा प्रयत्न केला! ३ वॉर्निंग्सनंतर पेपर आपोआप सबमिट होईल.`);
            if (warningCount >= 3) {
                finishExam();
            }
        }
    });
    document.addEventListener('contextmenu', e => e.preventDefault());
}

function triggerManualSubmit() {
    if (confirm("तुम्हाला खात्री आहे की तुम्हाला पेपर सबमिट करायचा आहे?")) {
        finishExam();
    }
}

function finishExam() {
    isSubmitted = true;
    document.getElementById("res-warn").innerText = warningCount;
    document.getElementById("final-screen").classList.remove("hidden");
}

window.onload = initExam;
