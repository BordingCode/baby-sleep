(function() {
  'use strict';

  const $ = id => document.getElementById(id);
  const data = SLEEP_DATA;
  let currentAgeIndex = 0;

  // --- Dark Mode ---
  function initTheme() {
    const saved = localStorage.getItem('bs_theme');
    if (saved) {
      document.body.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('data-theme', 'dark');
    }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    $('theme-toggle').textContent = isDark ? '☀️' : '🌙';
    document.querySelector('meta[name="theme-color"]').content = isDark ? '#1A1A2E' : '#F5F3FA';
  }

  $('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('bs_theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('bs_theme', 'dark');
    }
    updateThemeIcon();
  });

  initTheme();

  // --- Navigation ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const screens = document.querySelectorAll('.screen');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-' + target).classList.add('active');
    });
  });

  // --- Age Slider ---
  const slider = $('age-slider');

  function restoreAge() {
    const saved = localStorage.getItem('bs_age');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < data.ageRanges.length) {
        slider.value = idx;
        currentAgeIndex = idx;
      }
    }
    updateSchedule();
  }

  slider.addEventListener('input', () => {
    currentAgeIndex = parseInt(slider.value, 10);
    localStorage.setItem('bs_age', currentAgeIndex);
    updateSchedule();
    renderTips();
    updateRoutine();
  });

  // --- Schedule Screen ---
  function formatWakeWindow(ww) {
    if (ww.min >= 120) {
      const minH = (ww.min / 60).toFixed(ww.min % 60 ? 1 : 0);
      const maxH = (ww.max / 60).toFixed(ww.max % 60 ? 1 : 0);
      return minH + '–' + maxH + ' hours';
    }
    return ww.min + '–' + ww.max + ' min';
  }

  function updateSchedule() {
    const age = data.ageRanges[currentAgeIndex];

    $('age-display').textContent = age.ageLabel;
    $('wake-window').textContent = formatWakeWindow(age.wakeWindow);
    $('nap-count').textContent = age.naps.label;
    $('day-sleep').textContent = age.napSleepHours.min + '–' + age.napSleepHours.max + ' hours';
    $('night-sleep').textContent = age.nightSleepHours.min + '–' + age.nightSleepHours.max + ' hours';
    $('total-sleep-value').textContent = age.totalSleepHours.min + '–' + age.totalSleepHours.max;

    const wakeAvg = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    $('bar-wake').style.width = Math.min((wakeAvg / 420) * 100, 100) + '%';
    const napAvg = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    $('bar-nap').style.width = (napAvg / 8) * 100 + '%';
    const nightAvg = (age.nightSleepHours.min + age.nightSleepHours.max) / 2;
    $('bar-night').style.width = (nightAvg / 12) * 100 + '%';

    $('feedings').textContent = age.feedingsPerNight;
    $('self-soothe').textContent = age.canSelfSoothe ? 'Yes' : 'Not yet';
    $('age-note').textContent = age.notes;

    const regression = findRegression(age);
    const alertEl = $('regression-alert');
    if (regression) {
      alertEl.classList.add('visible');
      $('regression-title').textContent = regression.label;
      $('regression-text').textContent = regression.description + ' Duration: ' + regression.duration + '.';
    } else {
      alertEl.classList.remove('visible');
    }
  }

  function findRegression(age) {
    for (const reg of data.regressions) {
      if (reg.ageMonths >= age.minMonths - 1 && reg.ageMonths <= age.maxMonths + 1) {
        return reg;
      }
    }
    return null;
  }

  // --- Tips Screen ---
  function renderTips() {
    const container = $('tips-list');
    const age = data.ageRanges[currentAgeIndex];
    const midAge = (age.minMonths + age.maxMonths) / 2;

    const html = data.troubleshooting.map(tip => {
      const relevant = midAge >= tip.ageRelevance[0] && midAge <= tip.ageRelevance[1];
      return `
        <div class="tip-card${relevant ? ' relevant' : ''}" onclick="this.classList.toggle('open')">
          <div class="tip-header">
            <div class="tip-icon">${tip.icon}</div>
            <div class="tip-title">${tip.title}</div>
            <span class="tip-relevant">Relevant now</span>
            <svg class="tip-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="tip-body">
            <div class="tip-content">
              <div class="tip-section-label">Common causes</div>
              <ul class="tip-list causes">
                ${tip.causes.map(c => '<li>' + c + '</li>').join('')}
              </ul>
              <div class="tip-section-label">What to try</div>
              <ul class="tip-list solutions">
                ${tip.solutions.map(s => '<li>' + s + '</li>').join('')}
              </ul>
            </div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
  }

  // --- Environment Screen ---
  function renderEnvironment() {
    const container = $('env-list');
    const env = data.environment;
    let html = '';

    html += `
      <div class="env-card">
        <div class="env-header">
          <div class="env-icon">${env.temperature.icon}</div>
          <div class="env-title">${env.temperature.title}</div>
        </div>
        <div class="env-recommendation">${env.temperature.recommendation}</div>
        <div class="env-details">${env.temperature.details}</div>
        <ul class="env-tips">
          ${env.temperature.tips.map(t => '<li>' + t + '</li>').join('')}
        </ul>
        <table class="tog-table">
          <tr><th>Temperature</th><th>Clothing</th><th>Sleep Sack</th></tr>
          ${env.temperature.togGuide.map(r => `<tr><td>${r.temp}</td><td>${r.clothing}</td><td>${r.tog}</td></tr>`).join('')}
        </table>
      </div>`;

    html += `
      <div class="env-card">
        <div class="env-header">
          <div class="env-icon">${env.darkness.icon}</div>
          <div class="env-title">${env.darkness.title}</div>
        </div>
        <div class="env-recommendation">${env.darkness.recommendation}</div>
        <div class="env-details">${env.darkness.details}</div>
        <ul class="env-tips">
          ${env.darkness.tips.map(t => '<li>' + t + '</li>').join('')}
        </ul>
      </div>`;

    html += `
      <div class="env-card">
        <div class="env-header">
          <div class="env-icon">${env.sound.icon}</div>
          <div class="env-title">${env.sound.title}</div>
        </div>
        <div class="env-recommendation">${env.sound.recommendation}</div>
        <div class="env-details">${env.sound.details}</div>
        <ul class="env-tips">
          ${env.sound.tips.map(t => '<li>' + t + '</li>').join('')}
        </ul>
      </div>`;

    html += `
      <div class="env-card">
        <div class="env-header">
          <div class="env-icon">${env.safeSleep.icon}</div>
          <div class="env-title">${env.safeSleep.title}</div>
        </div>
        <div class="env-recommendation">${env.safeSleep.recommendation}</div>
        <div class="env-details">${env.safeSleep.details}</div>
        <ul class="safe-sleep-list">
          ${env.safeSleep.rules.map(r => '<li>' + r + '</li>').join('')}
        </ul>
        <div class="env-source">${env.safeSleep.source}</div>
      </div>`;

    container.innerHTML = html;
  }

  // --- Routines Screen ---
  function renderRoutineSteps(steps) {
    return steps.map(s => `
      <div class="routine-step">
        <div class="routine-step-icon">${s.icon}</div>
        <div class="routine-step-text">${s.step}</div>
        ${s.duration !== '—' ? '<div class="routine-step-duration">' + s.duration + '</div>' : ''}
      </div>`).join('');
  }

  function updateRoutine() {
    const age = data.ageRanges[currentAgeIndex];
    const midAge = (age.minMonths + age.maxMonths) / 2;

    let routine = data.routines[0];
    for (const r of data.routines) {
      if (midAge >= r.minMonths && midAge <= r.maxMonths) {
        routine = r;
        break;
      }
    }
    if (midAge > routine.maxMonths) {
      for (let i = data.routines.length - 1; i >= 0; i--) {
        if (midAge >= data.routines[i].minMonths) {
          routine = data.routines[i];
          break;
        }
      }
    }

    $('routine-age-label').textContent = 'For: ' + routine.label + ' (' + routine.ageRange + ')';

    let html = `
      <div class="routine-section">
        <div class="routine-section-title">🌙 Bedtime Routine</div>
        <div class="routine-duration">About ${routine.bedtime.totalDuration}</div>
        <div class="routine-steps">
          ${renderRoutineSteps(routine.bedtime.steps)}
        </div>
      </div>`;

    html += `
      <div class="routine-section">
        <div class="routine-section-title">☀️ Nap Routine</div>
        <div class="routine-duration">About ${routine.nap.totalDuration}</div>
        ${routine.nap.note ? '<div class="routine-nap-note">' + routine.nap.note + '</div>' : ''}
        <div class="routine-steps">
          ${renderRoutineSteps(routine.nap.steps)}
        </div>
      </div>`;

    if (routine.tip) {
      html += `
        <div class="routine-tip">
          <div class="routine-tip-label">Tip</div>
          <div class="routine-tip-text">${routine.tip}</div>
        </div>`;
    }

    $('routines-content').innerHTML = html;
  }

  // --- My Baby Planner ---
  let mb = { birthday: '', bedtime: '19:00', waketime: '07:00', napCount: 2, napTimes: [] };

  function getAgeMonths(birthday) {
    const today = new Date();
    const b = new Date(birthday + 'T00:00:00');
    const m = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
    return today.getDate() < b.getDate() ? Math.max(m - 1, 0) : m;
  }

  function getAgeWeeks(birthday) {
    return Math.floor((new Date() - new Date(birthday + 'T00:00:00')) / 604800000);
  }

  function ageLabel(birthday) {
    const m = getAgeMonths(birthday);
    const w = getAgeWeeks(birthday);
    if (m < 1) return w + (w === 1 ? ' week' : ' weeks') + ' old';
    if (m < 24) return m + (m === 1 ? ' month' : ' months') + ' old';
    const y = Math.floor(m / 12), r = m % 12;
    return r === 0 ? y + ' years old' : y + 'y ' + r + 'm old';
  }

  function ageRangeFor(months) {
    for (let i = data.ageRanges.length - 1; i >= 0; i--)
      if (months >= data.ageRanges[i].minMonths) return data.ageRanges[i];
    return data.ageRanges[0];
  }

  function t2m(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

  function m2t(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  function durLabel(mins) {
    if (mins < 0) mins += 1440;
    const h = Math.floor(mins / 60), m = Math.round(mins % 60);
    if (h === 0) return m + ' min';
    return m === 0 ? h + 'h' : h + 'h ' + m + 'm';
  }

  // Recommended bedtimes by age (science-based)
  function recBedtime(months) {
    if (months <= 2) return 22 * 60;
    if (months <= 3) return 20 * 60 + 30;
    if (months <= 5) return 19 * 60 + 30;
    if (months <= 12) return 19 * 60;
    if (months <= 24) return 19 * 60 + 30;
    return 20 * 60;
  }

  function recWakeTime(months) {
    return months <= 2 ? 7 * 60 + 30 : 7 * 60;
  }

  function saveMB() { localStorage.setItem('bs_mybaby', JSON.stringify(mb)); }

  function loadMB() {
    try {
      const s = localStorage.getItem('bs_mybaby');
      if (s) mb = { ...mb, ...JSON.parse(s) };
    } catch(e) {}
  }

  function initMyBaby() {
    loadMB();
    if (mb.birthday) $('mb-birthday').value = mb.birthday;
    if (mb.birthday) {
      showRoutineInputs();
    }
  }

  function showRoutineInputs() {
    const months = getAgeMonths(mb.birthday);
    const age = ageRangeFor(months);

    // Set defaults from science if first time
    if (!localStorage.getItem('bs_mybaby')) {
      mb.bedtime = m2t(recBedtime(months));
      mb.waketime = m2t(recWakeTime(months));
      mb.napCount = Math.round((age.naps.min + age.naps.max) / 2);
      mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
    }

    $('mb-bedtime').value = mb.bedtime;
    $('mb-waketime').value = mb.waketime;
    $('mb-nap-count').textContent = mb.napCount;
    $('mb-routine-section').style.display = '';
    renderNapInputs();
    renderResults();
  }

  function buildDefaultNaps(age, count, wakeMin) {
    const ww = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const totalNapH = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    const dur = count > 0 ? Math.round(totalNapH * 60 / count) : 0;
    const naps = [];
    let t = wakeMin;
    for (let i = 0; i < count; i++) {
      t += ww;
      naps.push({ start: m2t(Math.round(t)), duration: Math.min(Math.max(dur, 30), 150) });
      t += dur;
    }
    return naps;
  }

  function renderNapInputs() {
    const el = $('mb-nap-times');
    if (mb.napCount === 0) { el.innerHTML = ''; return; }

    const months = getAgeMonths(mb.birthday);
    const age = ageRangeFor(months);
    if (mb.napTimes.length !== mb.napCount) {
      mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
      saveMB();
    }

    let html = '<div class="nap-times"><div class="nap-times-title">😴 Nap Times</div>';
    for (let i = 0; i < mb.napCount; i++) {
      const n = mb.napTimes[i];
      html += `<div class="nap-time-row">
        <div class="nap-time-label">Nap ${i + 1}</div>
        <div class="nap-time-inputs">
          <input type="time" value="${n.start}" data-nap="${i}">
          <span>${durLabel(n.duration)}</span>
        </div>
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('input[type="time"]').forEach(inp => {
      inp.addEventListener('change', () => {
        mb.napTimes[parseInt(inp.dataset.nap)].start = inp.value;
        saveMB();
        renderResults();
      });
    });
  }

  function renderResults() {
    if (!mb.birthday) return;
    const months = getAgeMonths(mb.birthday);
    const age = ageRangeFor(months);

    const bedMin = t2m(mb.bedtime);
    const wakeMin = t2m(mb.waketime);

    // Actual values
    let actualNight = wakeMin - bedMin;
    if (actualNight <= 0) actualNight += 1440;
    const actualNightH = actualNight / 60;

    let actualNapMins = 0;
    const sortedNaps = (mb.napTimes || []).slice().sort((a, b) => t2m(a.start) - t2m(b.start));
    sortedNaps.forEach(n => { actualNapMins += n.duration; });
    const actualNapH = actualNapMins / 60;
    const actualTotalH = actualNightH + actualNapH;

    // Wake windows
    const wws = [];
    let prev = wakeMin;
    sortedNaps.forEach((n, i) => {
      const s = t2m(n.start);
      let gap = s - prev; if (gap < 0) gap += 1440;
      wws.push({ label: i === 0 ? 'Wake to Nap 1' : 'Nap ' + i + ' to Nap ' + (i + 1), mins: gap });
      prev = s + n.duration;
    });
    let lastGap = bedMin - prev; if (lastGap < 0) lastGap += 1440;
    wws.push({ label: mb.napCount > 0 ? 'Last nap to Bedtime' : 'Wake to Bedtime', mins: lastGap });

    // Recommended values
    const recBed = recBedtime(months);
    const recWake = recWakeTime(months);
    const recNapCount = Math.round((age.naps.min + age.naps.max) / 2);
    const recNapH = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    let recNightMins = recWake - recBed; if (recNightMins <= 0) recNightMins += 1440;
    const recNightH = recNightMins / 60;
    const recTotalH = (age.totalSleepHours.min + age.totalSleepHours.max) / 2;

    // --- Timeline ---
    const blocks = [];
    blocks.push({ type: 'night', start: bedMin, duration: actualNight, label: 'Night' });
    sortedNaps.forEach((n, i) => {
      blocks.push({ type: 'nap', start: t2m(n.start), duration: n.duration, label: 'Nap ' + (i + 1) });
    });

    let tlHtml = '<div class="timeline-section"><div class="timeline-title">Your Baby\'s Day</div>';
    tlHtml += '<div class="timeline-bar">';
    blocks.forEach(b => {
      let off = b.start - bedMin; if (off < 0) off += 1440;
      const left = (off / 1440) * 100;
      const w = Math.max((b.duration / 1440) * 100, 0.5);
      tlHtml += `<div class="timeline-block ${b.type}" style="left:${left}%;width:${w}%">${b.duration >= 60 ? b.label : ''}</div>`;
    });
    tlHtml += '</div>';
    tlHtml += `<div class="timeline-labels"><span>${m2t(bedMin)}</span><span>${m2t(bedMin + 720)}</span><span>${m2t(bedMin)}</span></div>`;
    tlHtml += '<div class="timeline-legend">';
    tlHtml += '<span><span class="legend-dot" style="background:var(--sleep-night)"></span>Night</span>';
    tlHtml += '<span><span class="legend-dot" style="background:var(--sleep-nap)"></span>Naps</span>';
    tlHtml += '<span><span class="legend-dot" style="background:var(--wake);opacity:0.5"></span>Awake</span>';
    tlHtml += '</div></div>';
    $('mb-timeline').innerHTML = tlHtml;

    // --- Comparison cards ---
    let cHtml = '<div class="checks-section">';

    // Compare helper
    function cmp(title, actual, unit, recMin, recMax, lowTip, highTip) {
      const ok = actual >= recMin - 0.3 && actual <= recMax + 0.3;
      const low = actual < recMin - 0.3;
      const val = typeof actual === 'number' ? actual.toFixed(1) : actual;
      cHtml += `<div class="check-card ${ok ? 'good' : 'warn'}">
        <div class="check-icon">${ok ? '✅' : '⚠️'}</div>
        <div class="check-content">
          <div class="check-title">${title}: ${val} ${unit}</div>
          <div class="check-detail">Recommended: ${recMin}–${recMax} ${unit}. ${ok ? 'On track!' : low ? lowTip : highTip}</div>
        </div>
      </div>`;
    }

    cmp('Night sleep', actualNightH, 'hours',
      age.nightSleepHours.min, age.nightSleepHours.max,
      'Try an earlier bedtime — even 15–30 minutes can make a big difference.',
      'Night is a bit long. A slightly later bedtime might help consolidate sleep.'
    );

    if (age.napSleepHours.max > 0) {
      cmp('Daytime nap sleep', actualNapH, 'hours',
        age.napSleepHours.min, age.napSleepHours.max,
        'Naps are short. Try a darker room, white noise, and check wake windows.',
        'Too much daytime sleep can cause night waking or a late bedtime. Try shortening or dropping a nap.'
      );
    }

    cmp('Total sleep', actualTotalH, 'hours',
      age.totalSleepHours.min, age.totalSleepHours.max,
      'Total sleep is low. Consider an earlier bedtime or longer naps.',
      'Above average — fine if baby seems happy, but could cause bedtime resistance.'
    );

    // Nap count
    const napOk = mb.napCount >= age.naps.min && mb.napCount <= age.naps.max;
    cHtml += `<div class="check-card ${napOk ? 'good' : 'warn'}">
      <div class="check-icon">${napOk ? '✅' : '⚠️'}</div>
      <div class="check-content">
        <div class="check-title">Naps: ${mb.napCount}</div>
        <div class="check-detail">Recommended: ${age.naps.label}. ${napOk ? 'Right on track!' :
          mb.napCount < age.naps.min ? 'Your baby may need more naps — watch for overtiredness signs (fussiness, yawning).' :
          'Your baby might be ready to drop a nap. Signs: fighting a nap for 2+ weeks, or last nap pushes bedtime too late.'}</div>
      </div>
    </div>`;

    // Wake windows
    wws.forEach(ww => {
      const ok = ww.mins >= age.wakeWindow.min - 15 && ww.mins <= age.wakeWindow.max + 15;
      const short = ww.mins < age.wakeWindow.min - 15;
      cHtml += `<div class="check-card ${ok ? 'good' : 'warn'}">
        <div class="check-icon">${ok ? '✅' : '⚠️'}</div>
        <div class="check-content">
          <div class="check-title">${ww.label}: ${durLabel(ww.mins)}</div>
          <div class="check-detail">Recommended: ${formatWakeWindow(age.wakeWindow)}. ${ok ? 'Good spacing!' :
            short ? 'Too short — baby may not be tired enough. Try stretching by 10–15 min.' :
            'Too long — baby is likely overtired. Try putting down 15–30 min earlier.'}</div>
        </div>
      </div>`;
    });

    cHtml += '</div>';
    $('mb-comparison').innerHTML = cHtml;

    // --- Advice section ---
    let advHtml = '';
    const tips = [];

    // Bedtime advice
    const bedDiff = bedMin - recBed;
    if (Math.abs(bedDiff) > 30) {
      const dir = bedDiff > 0 ? 'late' : 'early';
      const target = m2t(recBed);
      tips.push({
        icon: '🌙',
        title: 'Adjust bedtime',
        text: `Your bedtime (${m2t(bedMin)}) is ${durLabel(Math.abs(bedDiff))} ${dir}er than recommended (${target}). ${
          dir === 'late' ? 'An earlier bedtime often improves night sleep and reduces early morning waking. Shift by 15 min every 2–3 days.' :
          'A slightly later bedtime may help if baby fights falling asleep or takes a long time to settle.'
        }`
      });
    }

    // Wake time advice
    const wakeDiff = wakeMin - recWake;
    if (Math.abs(wakeDiff) > 30) {
      tips.push({
        icon: '🌅',
        title: 'Adjust wake time',
        text: `Your wake time (${m2t(wakeMin)}) is ${durLabel(Math.abs(wakeDiff))} ${wakeDiff > 0 ? 'later' : 'earlier'} than the typical ${m2t(recWake)}. ${
          wakeDiff < 0 ? 'Early waking is common — ensure the room is very dark, and try not starting the day before 06:00.' :
          'A late wake time pushes the whole day later. Try gradually waking baby 15 min earlier.'
        }`
      });
    }

    // Nap count advice
    if (!napOk) {
      tips.push({
        icon: '😴',
        title: mb.napCount < age.naps.min ? 'Add a nap' : 'Drop a nap',
        text: mb.napCount < age.naps.min ?
          `At ${ageLabel(mb.birthday)}, most babies need ${age.naps.label} naps. An extra short nap (even 20–30 min) in the late afternoon can prevent overtiredness at bedtime.` :
          `At ${ageLabel(mb.birthday)}, most babies do well with ${age.naps.label} naps. If baby fights a nap consistently for 2+ weeks, it\'s time to drop it. Move bedtime earlier during the transition.`
      });
    }

    // Wake window advice
    wws.forEach(ww => {
      if (ww.mins < age.wakeWindow.min - 20) {
        tips.push({
          icon: '⏰',
          title: ww.label + ' is too short',
          text: `${durLabel(ww.mins)} awake is below the recommended ${formatWakeWindow(age.wakeWindow)}. Baby may not be tired enough to sleep well. Try adding 10–15 minutes of play or tummy time.`
        });
      } else if (ww.mins > age.wakeWindow.max + 20) {
        tips.push({
          icon: '⏰',
          title: ww.label + ' is too long',
          text: `${durLabel(ww.mins)} awake is above the recommended ${formatWakeWindow(age.wakeWindow)}. An overtired baby often fights sleep harder. Try putting baby down 15–30 min earlier.`
        });
      }
    });

    // Regression warning
    const regression = findRegression(age);
    if (regression) {
      tips.push({
        icon: '🔄',
        title: regression.label,
        text: regression.description + ' This typically lasts ' + regression.duration + '. Stay consistent with your routine — it will pass.'
      });
    }

    // Build suggested optimal schedule
    const optWake = recWake;
    const optBed = recBed;
    const optWW = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const optNapDur = recNapCount > 0 ? Math.round(recNapH * 60 / recNapCount) : 0;

    let sugHtml = '<div class="suggested-section"><div class="suggested-title">Optimal Schedule for ' + ageLabel(mb.birthday) + '</div>';
    sugHtml += `<div class="suggested-item"><span class="suggested-item-label">🌅 Wake up</span><span class="suggested-item-value">${m2t(optWake)}</span></div>`;

    let ot = optWake;
    for (let i = 0; i < recNapCount; i++) {
      ot += optWW;
      const ns = Math.round(ot), ne = ns + optNapDur;
      sugHtml += `<div class="suggested-item"><span class="suggested-item-label">😴 Nap ${i + 1}</span><span class="suggested-item-value">${m2t(ns)} – ${m2t(ne)} (${durLabel(optNapDur)})</span></div>`;
      ot = ne;
    }
    sugHtml += `<div class="suggested-item"><span class="suggested-item-label">🌙 Bedtime</span><span class="suggested-item-value">${m2t(optBed)}</span></div>`;
    sugHtml += '</div>';

    // Advice cards
    if (tips.length > 0) {
      advHtml += '<div class="suggested-section"><div class="suggested-title">How to Optimize</div>';
      tips.forEach(tip => {
        advHtml += `<div class="check-card warn" style="border-left-color:var(--primary)">
          <div class="check-icon">${tip.icon}</div>
          <div class="check-content">
            <div class="check-title">${tip.title}</div>
            <div class="check-detail">${tip.text}</div>
          </div>
        </div>`;
      });
      advHtml += '</div>';
    } else {
      advHtml += `<div class="check-card good">
        <div class="check-icon">🌟</div>
        <div class="check-content">
          <div class="check-title">Looking great!</div>
          <div class="check-detail">Your baby's routine aligns well with the science-based recommendations for their age. Keep up the consistency!</div>
        </div>
      </div>`;
    }

    // Age note
    advHtml += `<div class="check-card info">
      <div class="check-icon">💡</div>
      <div class="check-content">
        <div class="check-title">What to know at this age</div>
        <div class="check-detail">${age.notes}</div>
      </div>
    </div>`;

    advHtml += sugHtml;

    $('mb-advice').innerHTML = advHtml;
  }

  // Event listeners
  $('mb-birthday').addEventListener('input', function() {
    mb.birthday = this.value;
    saveMB();
    if (this.value) {
      const months = getAgeMonths(this.value);
      const age = ageRangeFor(months);

      $('mb-age-badge').innerHTML = `<div class="check-card info">
        <div class="check-icon">👶</div>
        <div class="check-content">
          <div class="check-title">${ageLabel(this.value)}</div>
          <div class="check-detail">Sleep recommendations for: ${age.ageLabel}</div>
        </div>
      </div>`;

      // Set smart defaults from science
      mb.bedtime = m2t(recBedtime(months));
      mb.waketime = m2t(recWakeTime(months));
      mb.napCount = Math.round((age.naps.min + age.naps.max) / 2);
      mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
      saveMB();
      showRoutineInputs();
    } else {
      $('mb-age-badge').innerHTML = '';
      $('mb-routine-section').style.display = 'none';
      $('mb-timeline').innerHTML = '';
      $('mb-comparison').innerHTML = '';
      $('mb-advice').innerHTML = '';
    }
  });

  $('mb-bedtime').addEventListener('change', function() {
    mb.bedtime = this.value;
    saveMB();
    renderResults();
  });

  $('mb-waketime').addEventListener('change', function() {
    mb.waketime = this.value;
    const age = ageRangeFor(getAgeMonths(mb.birthday));
    mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
    saveMB();
    renderNapInputs();
    renderResults();
  });

  $('mb-nap-minus').addEventListener('click', () => {
    if (mb.napCount > 0) {
      mb.napCount--;
      $('mb-nap-count').textContent = mb.napCount;
      const age = ageRangeFor(getAgeMonths(mb.birthday));
      mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
      saveMB();
      renderNapInputs();
      renderResults();
    }
  });

  $('mb-nap-plus').addEventListener('click', () => {
    if (mb.napCount < 8) {
      mb.napCount++;
      $('mb-nap-count').textContent = mb.napCount;
      const age = ageRangeFor(getAgeMonths(mb.birthday));
      mb.napTimes = buildDefaultNaps(age, mb.napCount, t2m(mb.waketime));
      saveMB();
      renderNapInputs();
      renderResults();
    }
  });

  // --- Init ---
  restoreAge();
  renderTips();
  renderEnvironment();
  updateRoutine();
  initMyBaby();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  }
})();
