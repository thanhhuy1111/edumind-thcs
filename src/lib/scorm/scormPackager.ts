import JSZip from "jszip";
import { GeneratedInteractiveLesson } from "../ai/types";

/**
 * Builds the standard SCORM 1.2 imsmanifest.xml
 */
export function buildSCORM12Manifest(lesson: GeneratedInteractiveLesson): string {
  const safeTitle = lesson.lessonTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const identifier = `EDUMIND_${Date.now()}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1.2"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-${identifier}">
    <organization identifier="ORG-${identifier}">
      <title>${safeTitle} - Môn ${lesson.subject} Lớp ${lesson.grade}</title>
      <item identifier="ITEM-${identifier}" identifierref="RES-${identifier}">
        <title>${safeTitle}</title>
        <adlcp:masteryscore>70</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${identifier}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;
}

/**
 * Builds the interactive HTML5 player embedded with SCORM 1.2 API tracking and Vietnamese Voice narration
 */
export function buildInteractiveHTMLPlayer(lesson: GeneratedInteractiveLesson): string {
  const lessonDataJson = JSON.stringify(lesson).replace(/<\/script>/g, "<\\/script>");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lesson.lessonTitle} - Bài Giảng Tương Tác E-Learning</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .pulse-ring { animation: pulseRing 1.5s infinite; }
    @keyframes pulseRing { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">

  <!-- SCORM API Bridge -->
  <script>
    var SCORM = {
      api: null,
      initialized: false,
      findAPI: function(win) {
        var attempts = 0;
        while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
          attempts++;
          if (attempts > 7) return null;
          win = win.parent;
        }
        return win.API;
      },
      init: function() {
        this.api = this.findAPI(window);
        if (!this.api && window.opener) {
          this.api = this.findAPI(window.opener);
        }
        if (this.api) {
          try {
            var res = this.api.LMSInitialize("");
            this.initialized = (res === "true" || res === true);
            console.log("[SCORM 1.2] LMSInitialize:", this.initialized);
            this.set("cmi.core.lesson_status", "incomplete");
            this.commit();
          } catch(e) { console.warn("[SCORM] Error init:", e); }
        } else {
          console.log("[SCORM 1.2] LMS API not found - running in Standalone HTML5 mode.");
        }
      },
      set: function(param, value) {
        if (this.initialized && this.api) {
          try { return this.api.LMSSetValue(param, value); } catch(e){}
        }
        return false;
      },
      commit: function() {
        if (this.initialized && this.api) {
          try { return this.api.LMSCommit(""); } catch(e){}
        }
      },
      finish: function(score, passed) {
        if (this.initialized && this.api) {
          try {
            this.set("cmi.core.score.raw", score.toString());
            this.set("cmi.core.score.min", "0");
            this.set("cmi.core.score.max", "100");
            this.set("cmi.core.lesson_status", passed ? "passed" : "completed");
            this.commit();
            this.api.LMSFinish("");
            console.log("[SCORM 1.2] Finished lesson with score:", score);
          } catch(e){}
        }
      }
    };
    window.addEventListener("load", function() { SCORM.init(); });
    window.addEventListener("beforeunload", function() { if (SCORM.initialized) SCORM.commit(); });
  </script>

  <!-- Top Navigation & Header -->
  <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-3.5">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          EM
        </div>
        <div>
          <h1 class="text-sm font-bold text-white line-clamp-1" id="headerTitle">EduMind THCS</h1>
          <p class="text-xs text-slate-400" id="headerSubtitle">Bài giảng điện tử chuẩn SCORM 1.2</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-3">
        <!-- Voice narration button -->
        <button id="btnVoiceNarrate" onclick="toggleVoiceNarration()" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all">
          <span id="voiceIcon">🎙️</span>
          <span id="voiceLabel">Thuyết minh AI</span>
        </button>

        <span class="text-slate-700">|</span>

        <!-- Score Badge -->
        <div class="flex items-center space-x-1 text-xs px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg font-medium">
          <span>⭐ Điểm:</span>
          <span id="scoreDisplay" class="font-bold">0/0</span>
        </div>

        <!-- Progress Counter -->
        <span class="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700" id="slideCounter">
          1/1
        </span>
      </div>
    </div>
  </header>

  <!-- Progress Bar -->
  <div class="w-full bg-slate-900 h-1.5">
    <div id="progressBar" class="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300" style="width: 10%;"></div>
  </div>

  <!-- Main Slide Container -->
  <main class="max-w-5xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
    <div id="slideCard" class="fade-in bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[520px] flex flex-col justify-between">
      
      <!-- Slide Content Injected by JS -->
      <div id="slideContent"></div>

      <!-- Interactive Quiz Section (Rendered when checkpoint quiz exists) -->
      <div id="quizContainer" class="mt-8 border-t border-slate-800 pt-6 hidden"></div>

    </div>
  </main>

  <!-- Bottom Navigation Bar -->
  <footer class="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <button id="btnPrev" onclick="navigateSlide(-1)" class="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        ← Trang trước
      </button>

      <div class="flex items-center space-x-2 text-xs text-slate-400">
        <label class="flex items-center space-x-2 cursor-pointer select-none">
          <input type="checkbox" id="chkAutoVoice" checked class="rounded border-slate-700 text-indigo-600 focus:ring-0">
          <span>Tự động phát giọng đọc khi chuyển slide</span>
        </label>
      </div>

      <button id="btnNext" onclick="navigateSlide(1)" class="px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        Trang tiếp →
      </button>
    </div>
  </footer>

  <!-- Application Logic -->
  <script>
    var LESSON = ${lessonDataJson};
    var currentIndex = 0;
    var userAnswers = {};
    var correctCount = 0;
    var totalQuizzes = 0;
    var isSpeaking = false;
    var synth = window.speechSynthesis;

    // Count quizzes
    LESSON.slides.forEach(function(s) {
      if (s.quizQuestion) totalQuizzes++;
    });

    document.getElementById("headerTitle").innerText = LESSON.lessonTitle;
    document.getElementById("headerSubtitle").innerText = "Môn " + LESSON.subject + " " + LESSON.grade + " • Chuẩn SCORM 1.2 GDPT 2018";

    function updateHeaderScore() {
      document.getElementById("scoreDisplay").innerText = correctCount + "/" + totalQuizzes;
    }

    function renderSlide(index) {
      stopVoice();
      var slide = LESSON.slides[index];
      var total = LESSON.slides.length;
      
      document.getElementById("slideCounter").innerText = (index + 1) + "/" + total;
      document.getElementById("progressBar").style.width = (((index + 1) / total) * 100) + "%";
      document.getElementById("btnPrev").disabled = (index === 0);

      var contentEl = document.getElementById("slideContent");
      var quizEl = document.getElementById("quizContainer");

      var bulletsHtml = (slide.bullets || []).map(function(b) {
        return '<li class="flex items-start text-slate-300 text-base md:text-lg"><span class="text-indigo-400 mr-3 font-bold">✦</span><span>' + b + '</span></li>';
      }).join('');

      var visualHtml = slide.suggestedVisual ? 
        '<div class="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-indigo-300 flex items-center space-x-2"><span>💡 Minh họa trực quan:</span> <span class="text-slate-300">' + slide.suggestedVisual + '</span></div>' : '';

      contentEl.innerHTML = 
        '<div class="space-y-4">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold">Mục ' + (index + 1) + ' / ' + total + '</span>' +
            '<span class="text-xs text-slate-400 font-medium">' + LESSON.subject + ' ' + LESSON.grade + '</span>' +
          '</div>' +
          '<h2 class="text-2xl md:text-4xl font-extrabold text-white tracking-tight">' + slide.title + '</h2>' +
          (slide.subtitle ? '<p class="text-sm md:text-base text-indigo-300/90 font-medium">' + slide.subtitle + '</p>' : '') +
          '<p class="text-slate-200 text-base md:text-lg leading-relaxed pt-2">' + slide.mainContent + '</p>' +
          (bulletsHtml ? '<ul class="space-y-2.5 pt-4">' + bulletsHtml + '</ul>' : '') +
          visualHtml +
        '</div>';

      // Checkpoint Quiz Logic
      if (slide.quizQuestion) {
        quizEl.classList.remove("hidden");
        var q = slide.quizQuestion;
        var answered = userAnswers[index];
        var isLocked = !answered || !answered.isCorrect;

        // Next button is locked until answered correctly
        document.getElementById("btnNext").disabled = isLocked;

        var optionsHtml = q.options.map(function(opt, optIdx) {
          var label = String.fromCharCode(65 + optIdx);
          var isChosen = answered && answered.chosen === label;
          var btnClass = "w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ";
          
          if (!answered) {
            btnClass += "bg-slate-800/70 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-slate-200";
          } else if (label === q.answer) {
            btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
          } else if (isChosen && !answered.isCorrect) {
            btnClass += "bg-rose-500/20 border-rose-500 text-rose-300";
          } else {
            btnClass += "bg-slate-800/40 border-slate-700/50 text-slate-400";
          }

          return '<button onclick="submitAnswer(' + index + ', \\'' + label + '\\')" class="' + btnClass + '">' + opt + '</button>';
        }).join('');

        var explanationHtml = answered ? 
          '<div class="mt-4 p-4 rounded-xl text-xs ' + (answered.isCorrect ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300') + '">' +
            '<strong>' + (answered.isCorrect ? '✅ Hoan hô em đã trả lời đúng!' : '❌ Chưa chính xác, em hãy xem giải thích và chọn lại:') + '</strong>' +
            '<p class="mt-1 text-slate-300 leading-relaxed">' + q.explanation + '</p>' +
          '</div>' : '';

        quizEl.innerHTML = 
          '<div class="space-y-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-5">' +
            '<div class="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">' +
              '<span>🎯 Điểm dừng kiểm tra tương tác</span>' +
              '<span class="text-slate-400 font-normal">(Trả lời đúng để tiếp tục)</span>' +
            '</div>' +
            '<p class="text-base font-semibold text-white">' + q.question + '</p>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">' + optionsHtml + '</div>' +
            explanationHtml +
          '</div>';
      } else {
        quizEl.classList.add("hidden");
        document.getElementById("btnNext").disabled = false;
      }

      // Re-trigger KaTeX rendering
      if (window.renderMathInElement) {
        renderMathInElement(document.getElementById("slideCard"), {
          delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}]
        });
      }

      // Auto Voice Narration
      if (document.getElementById("chkAutoVoice").checked) {
        setTimeout(playVoiceNarration, 300);
      }
    }

    function submitAnswer(slideIdx, chosen) {
      var slide = LESSON.slides[slideIdx];
      var q = slide.quizQuestion;
      if (!q) return;

      var isCorrect = (chosen === q.answer);
      if (!userAnswers[slideIdx] && isCorrect) {
        correctCount++;
      }
      userAnswers[slideIdx] = { chosen: chosen, isCorrect: isCorrect };
      updateHeaderScore();

      // Update LMS score
      var scorePercent = Math.round((correctCount / Math.max(totalQuizzes, 1)) * 100);
      SCORM.set("cmi.core.score.raw", scorePercent.toString());
      SCORM.commit();

      renderSlide(slideIdx);
    }

    function navigateSlide(direction) {
      var nextIdx = currentIndex + direction;
      if (nextIdx >= 0 && nextIdx < LESSON.slides.length) {
        currentIndex = nextIdx;
        renderSlide(currentIndex);
      } else if (nextIdx >= LESSON.slides.length) {
        // Complete Lesson
        showCompletionScreen();
      }
    }

    function showCompletionScreen() {
      stopVoice();
      var scorePercent = Math.round((correctCount / Math.max(totalQuizzes, 1)) * 100);
      var isPassed = scorePercent >= 70;
      SCORM.finish(scorePercent, isPassed);

      var contentEl = document.getElementById("slideContent");
      document.getElementById("quizContainer").classList.add("hidden");
      document.getElementById("btnNext").disabled = true;

      contentEl.innerHTML = 
        '<div class="text-center py-12 space-y-6">' +
          '<div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/30">' +
            (isPassed ? '🏆' : '👏') +
          '</div>' +
          '<h2 class="text-3xl font-extrabold text-white">' + (isPassed ? 'Chúc Mừng Em Đã Hoàn Thành Xuất Sắc!' : 'Em Đã Hoàn Thành Bài Học!') + '</h2>' +
          '<p class="text-slate-300 max-w-lg mx-auto">Em đã vượt qua tất cả các điểm dừng tương tác của bài <strong>' + LESSON.lessonTitle + '</strong>.</p>' +
          '<div class="inline-flex items-center space-x-6 p-4 rounded-2xl bg-slate-800 border border-slate-700">' +
            '<div><span class="block text-xs text-slate-400">Kết quả</span><span class="text-2xl font-black text-amber-400">' + scorePercent + '%</span></div>' +
            '<div class="h-8 w-px bg-slate-700"></div>' +
            '<div><span class="block text-xs text-slate-400">Câu đúng</span><span class="text-2xl font-black text-indigo-400">' + correctCount + '/' + totalQuizzes + '</span></div>' +
            '<div class="h-8 w-px bg-slate-700"></div>' +
            '<div><span class="block text-xs text-slate-400">Trạng thái LMS</span><span class="text-2xl font-black ' + (isPassed ? 'text-emerald-400' : 'text-amber-400') + '">' + (isPassed ? 'ĐẠT' : 'HOÀN TẤT') + '</span></div>' +
          '</div>' +
          '<div class="pt-6"><button onclick="currentIndex=0;renderSlide(0);" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30">Học lại từ đầu</button></div>' +
        '</div>';
    }

    // Voice Narration (Text to Speech - Vietnamese)
    function playVoiceNarration() {
      if (!('speechSynthesis' in window)) return;
      stopVoice();

      var slide = LESSON.slides[currentIndex];
      var script = slide.narrationScript || (slide.title + ". " + slide.mainContent);

      var utterance = new SpeechSynthesisUtterance(script);
      utterance.lang = "vi-VN";
      utterance.rate = 0.95;

      // Find Vietnamese voice
      var voices = synth.getVoices();
      var viVoice = voices.find(function(v) { return v.lang.includes("vi"); });
      if (viVoice) utterance.voice = viVoice;

      utterance.onstart = function() {
        isSpeaking = true;
        document.getElementById("voiceIcon").innerText = "🔊";
        document.getElementById("voiceLabel").innerText = "Đang đọc...";
      };
      utterance.onend = utterance.onerror = function() {
        isSpeaking = false;
        document.getElementById("voiceIcon").innerText = "🎙️";
        document.getElementById("voiceLabel").innerText = "Thuyết minh AI";
      };

      synth.speak(utterance);
    }

    function stopVoice() {
      if (synth) synth.cancel();
      isSpeaking = false;
      document.getElementById("voiceIcon").innerText = "🎙️";
      document.getElementById("voiceLabel").innerText = "Thuyết minh AI";
    }

    function toggleVoiceNarration() {
      if (isSpeaking) {
        stopVoice();
      } else {
        playVoiceNarration();
      }
    }

    // Init first slide
    window.addEventListener("DOMContentLoaded", function() {
      updateHeaderScore();
      renderSlide(0);
      if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = function() {};
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Packages the interactive lesson into a compliant SCORM 1.2 ZIP package
 */
export async function createSCORM12Zip(lesson: GeneratedInteractiveLesson): Promise<Blob> {
  const zip = new JSZip();

  const manifestXml = buildSCORM12Manifest(lesson);
  const playerHtml = buildInteractiveHTMLPlayer(lesson);

  zip.file("imsmanifest.xml", manifestXml);
  zip.file("index.html", playerHtml);

  // Optional SCORM metadata files
  zip.file(
    "course_info.json",
    JSON.stringify(
      {
        title: lesson.lessonTitle,
        subject: lesson.subject,
        grade: lesson.grade,
        generator: "EduMind THCS - AI SCORM Packager 2026",
        version: "1.2",
        checkpointsCount: lesson.checkpoints.length,
        slidesCount: lesson.slides.length,
      },
      null,
      2
    )
  );

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return blob;
}
