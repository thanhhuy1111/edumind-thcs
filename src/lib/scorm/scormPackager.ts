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
<body class="bg-gradient-to-b from-sky-50/60 via-slate-50 to-indigo-50/40 text-slate-800 min-h-screen flex flex-col justify-between selection:bg-blue-500 selection:text-white">

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
  <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-6 py-3.5 shadow-xs">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V9.75M4.5 21V9.75M12 9v2.25" /></svg>
        </div>
        <div>
          <h1 class="text-sm md:text-base font-extrabold text-slate-900 line-clamp-1" id="headerTitle">EduMind THCS</h1>
          <p class="text-xs font-medium text-slate-500" id="headerSubtitle">Bài giảng điện tử tương tác học sinh</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-3">
        <!-- Voice narration button -->
        <button id="btnVoiceNarrate" onclick="toggleVoiceNarration()" class="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-all cursor-pointer">
          <span id="voiceIcon">
            <svg class="w-3.5 h-3.5 text-blue-600 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-15a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" /></svg>
          </span>
          <span id="voiceLabel">Thuyết minh AI</span>
        </button>

        <span class="text-slate-300">|</span>

        <!-- Score Badge -->
        <div class="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl font-bold">
          <svg class="w-3.5 h-3.5 text-amber-500 inline fill-amber-400" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
          <span>Điểm:</span>
          <span id="scoreDisplay" class="font-extrabold text-amber-700">0/0</span>
        </div>

        <!-- Progress Counter -->
        <span class="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200" id="slideCounter">
          1/1
        </span>
      </div>
    </div>
  </header>

  <!-- Progress Bar -->
  <div class="w-full bg-slate-200/60 h-2">
    <div id="progressBar" class="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 h-full transition-all duration-300 rounded-r-full" style="width: 10%;"></div>
  </div>

  <!-- Main Slide Container -->
  <main class="max-w-5xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
    <div id="slideCard" class="fade-in bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/60 relative overflow-hidden min-h-[520px] flex flex-col justify-between">
      
      <!-- Slide Content Injected by JS -->
      <div id="slideContent"></div>

      <!-- Interactive Quiz Section (Rendered when checkpoint quiz exists) -->
      <div id="quizContainer" class="mt-8 border-t border-slate-100 pt-6 hidden"></div>

    </div>
  </main>

  <!-- Bottom Navigation Bar -->
  <footer class="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-4 shadow-sm">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <button id="btnPrev" onclick="navigateSlide(-1)" class="px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        ← Trang trước
      </button>

      <div class="flex items-center space-x-2 text-xs font-medium text-slate-600">
        <label class="flex items-center space-x-2 cursor-pointer select-none">
          <input type="checkbox" id="chkAutoVoice" checked class="rounded border-slate-300 text-blue-600 focus:ring-0">
          <span>Tự động phát giọng đọc của cô khi chuyển bài</span>
        </label>
      </div>

      <button id="btnNext" onclick="navigateSlide(1)" class="px-6 py-2.5 rounded-2xl text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
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

    var MIC_SVG = '<svg class="w-3.5 h-3.5 text-blue-600 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-15a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" /></svg>';
    var SPEAKER_SVG = '<svg class="w-3.5 h-3.5 text-blue-600 inline animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>';

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
        return '<li class="flex items-start text-slate-700 text-base md:text-lg leading-relaxed"><span class="text-blue-600 mr-3 font-black text-lg">✦</span><span>' + b + '</span></li>';
      }).join('');

      var visualHtml = slide.suggestedVisual ? 
        '<div class="mt-6 p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-xs text-blue-900 flex items-center space-x-2.5 shadow-2xs">' +
          '<svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>' +
          '<div><strong class="font-bold">Minh họa học tập:</strong> <span class="text-blue-800">' + slide.suggestedVisual + '</span></div>' +
        '</div>' : '';

      contentEl.innerHTML = 
        '<div class="space-y-4">' +
          '<div class="flex items-center justify-between">' +
            '<span class="px-3.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Phần ' + (index + 1) + ' / ' + total + '</span>' +
            '<span class="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">' + LESSON.subject + ' ' + LESSON.grade + '</span>' +
          '</div>' +
          '<h2 class="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">' + slide.title + '</h2>' +
          (slide.subtitle ? '<p class="text-base md:text-lg text-blue-700 font-semibold">' + slide.subtitle + '</p>' : '') +
          '<p class="text-slate-700 text-base md:text-lg leading-relaxed pt-2">' + slide.mainContent + '</p>' +
          (bulletsHtml ? '<ul class="space-y-3 pt-3">' + bulletsHtml + '</ul>' : '') +
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
          var btnClass = "w-full text-left p-4 rounded-2xl border-2 text-sm md:text-base font-semibold transition-all ";
          
          if (!answered) {
            btnClass += "bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 shadow-2xs cursor-pointer";
          } else if (label === q.answer) {
            btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs";
          } else if (isChosen && !answered.isCorrect) {
            btnClass += "bg-rose-50 border-rose-400 text-rose-900 font-semibold";
          } else {
            btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
          }

          return '<button onclick="submitAnswer(' + index + ', \\'' + label + '\\')" class="' + btnClass + '">' + opt + '</button>';
        }).join('');

        var explanationHtml = answered ? 
          '<div class="mt-4 p-4 rounded-2xl text-xs md:text-sm ' + (answered.isCorrect ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-2 border-rose-300 text-rose-900') + '">' +
            '<strong class="font-bold flex items-center gap-2">' + 
              (answered.isCorrect ? 
                '<svg class="w-4 h-4 text-emerald-600 inline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Hoan hô em đã trả lời rất chính xác!' : 
                '<svg class="w-4 h-4 text-rose-600 inline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> Chưa chính xác, em hãy xem gợi ý của cô và thử lại nhé:') + 
            '</strong>' +
            '<p class="mt-1.5 text-slate-700 leading-relaxed pl-6">' + q.explanation + '</p>' +
          '</div>' : '';

        quizEl.innerHTML = 
          '<div class="space-y-4 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 border-2 border-amber-300/80 rounded-3xl p-6 md:p-8 shadow-sm">' +
            '<div class="flex items-center space-x-2 text-amber-800 text-xs font-black uppercase tracking-wider">' +
              '<svg class="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>' +
              '<span>Điểm Dừng Kiểm Tra Tương Tác</span>' +
              '<span class="text-amber-700/80 font-normal lowercase">(chọn đáp án đúng để mở trang tiếp)</span>' +
            '</div>' +
            '<p class="text-base md:text-xl font-bold text-slate-900 leading-snug">' + q.question + '</p>' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">' + optionsHtml + '</div>' +
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
        '<div class="text-center py-10 space-y-6">' +
          '<div class="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-200/50">' +
            (isPassed ? 
              '<svg class="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75a1.125 1.125 0 01-1.125 1.125v3.375m9 0h-9M4.5 4.5h15m-15 0v3.75a6.75 6.75 0 006.75 6.75v0a6.75 6.75 0 006.75-6.75V4.5m-13.5 0H3a1.5 1.5 0 00-1.5 1.5v1.5a4.5 4.5 0 004.5 4.5h.75m9.75-7.5H18a1.5 1.5 0 011.5 1.5v1.5a4.5 4.5 0 01-4.5 4.5h-.75" /></svg>' : 
              '<svg class="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>') +
          '</div>' +
          '<h2 class="text-2xl md:text-4xl font-extrabold text-slate-900">' + (isPassed ? 'Chúc Mừng Em Đã Hoàn Thành Xuất Sắc!' : 'Em Đã Hoàn Thành Bài Học!') + '</h2>' +
          '<p class="text-slate-600 max-w-lg mx-auto text-base">Em đã vượt qua tất cả các điểm dừng tương tác của bài học <strong>' + LESSON.lessonTitle + '</strong>.</p>' +
          '<div class="inline-flex items-center space-x-6 p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs">' +
            '<div><span class="block text-xs font-semibold text-slate-500">Điểm số</span><span class="text-3xl font-black text-amber-600">' + scorePercent + '%</span></div>' +
            '<div class="h-10 w-px bg-slate-200"></div>' +
            '<div><span class="block text-xs font-semibold text-slate-500">Số câu đúng</span><span class="text-3xl font-black text-blue-600">' + correctCount + '/' + totalQuizzes + '</span></div>' +
            '<div class="h-10 w-px bg-slate-200"></div>' +
            '<div><span class="block text-xs font-semibold text-slate-500">Trạng thái LMS</span><span class="text-3xl font-black ' + (isPassed ? 'text-emerald-600' : 'text-amber-600') + '">' + (isPassed ? 'ĐẠT' : 'HOÀN TẤT') + '</span></div>' +
          '</div>' +
          '<div class="pt-4"><button onclick="currentIndex=0;renderSlide(0);" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-transform active:scale-95 cursor-pointer">Học lại bài giảng</button></div>' +
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
        document.getElementById("voiceIcon").innerHTML = SPEAKER_SVG;
        document.getElementById("voiceLabel").innerText = "Đang đọc...";
      };
      utterance.onend = utterance.onerror = function() {
        isSpeaking = false;
        document.getElementById("voiceIcon").innerHTML = MIC_SVG;
        document.getElementById("voiceLabel").innerText = "Thuyết minh AI";
      };

      synth.speak(utterance);
    }

    function stopVoice() {
      if (synth) synth.cancel();
      isSpeaking = false;
      document.getElementById("voiceIcon").innerHTML = MIC_SVG;
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
