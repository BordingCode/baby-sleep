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
      closeClockEdit(); // Bug #3: close popup on tab switch
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
      const predictFirst = tip.id === 'early-waking';
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
              ${predictFirst ? `
              <div class="predict-gate">
                <div class="predict-question">Gæt først: hjælper en <b>senere</b> sengetid babyen med at sove længere om morgenen?</div>
                <div class="predict-btns">
                  <button class="predict-btn" data-guess="yes">Ja, senere sengetid giver mere søvn</button>
                  <button class="predict-btn" data-guess="no">Nej, det giver tidligere opvågnen</button>
                </div>
                <div class="predict-feedback"></div>
              </div>
              <div class="predict-locked">` : ''}
              <div class="tip-section-label">Common causes</div>
              <ul class="tip-list causes">
                ${tip.causes.map((c, i) => predictFirst && i === 0 ? `<li class="cause-highlight">${c}</li>` : '<li>' + c + '</li>').join('')}
              </ul>
              <div class="tip-section-label">What to try</div>
              <ul class="tip-list solutions">
                ${tip.solutions.map(s => '<li>' + s + '</li>').join('')}
              </ul>
              ${predictFirst ? `</div>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.predict-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gate = btn.closest('.predict-gate');
        const locked = gate.parentElement.querySelector('.predict-locked');
        const correct = btn.dataset.guess === 'no';
        gate.querySelectorAll('.predict-btn').forEach(b => (b.disabled = true));
        gate.classList.add('answered');
        btn.classList.add(correct ? 'correct' : 'incorrect');
        gate.querySelector('.predict-feedback').innerHTML = correct
          ? '✅ Rigtigt gættet. En for sen sengetid gør babyen overtræt — kortisolniveauet stiger, og det sætter kroppens vågne-drive tidligere i gang, ikke senere.'
          : '❌ Faktisk omvendt: en for sen sengetid gør babyen overtræt — kortisolniveauet stiger, og det sætter kroppens vågne-drive tidligere i gang, ikke senere.';
        locked.classList.add('revealed');
      });
    });
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
  let mb = { birthday: '', bedtime: '19:00', waketime: '07:00', napCount: 2, napTimes: [], history: [] };

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

  function t2m(t) {
    if (!t || typeof t !== 'string') return 0;
    const p = t.split(':');
    const h = parseInt(p[0], 10), m = parseInt(p[1], 10);
    return (isNaN(h) || isNaN(m)) ? 0 : h * 60 + m;
  }

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
    if (!Array.isArray(mb.history)) mb.history = [];
  }

  // Keep at most one entry per calendar day (the latest edit that day wins),
  // so a run of edits in one sitting doesn't look like several visits.
  function recordHistory(snapshot) {
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, ...snapshot };
    if (mb.history.length && mb.history[mb.history.length - 1].date === today) {
      mb.history[mb.history.length - 1] = entry;
    } else {
      mb.history.push(entry);
      if (mb.history.length > 10) mb.history.shift();
    }
    saveMB();
  }

  // A pattern needs 3 consecutive visits moving the same way before we name it —
  // one odd night is noise, three in a row is a trend worth interrupting for.
  function detectTrend(history) {
    if (history.length < 3) return null;
    const last3 = history.slice(-3);

    const bed = last3.map(h => h.bedMin);
    const bedStep1 = bed[1] - bed[0], bedStep2 = bed[2] - bed[1];
    if (bedStep1 !== 0 && Math.sign(bedStep1) === Math.sign(bedStep2) && Math.abs(bed[2] - bed[0]) >= 20) {
      const dir = bed[2] > bed[0] ? 'later' : 'earlier';
      return `Bedtime has crept ${durLabel(Math.abs(bed[2] - bed[0]))} ${dir} over the last 3 visits.`;
    }

    const night = last3.map(h => h.nightH);
    const nightStep1 = night[1] - night[0], nightStep2 = night[2] - night[1];
    if (nightStep1 !== 0 && Math.sign(nightStep1) === Math.sign(nightStep2) && Math.abs(night[2] - night[0]) >= 0.5) {
      const dir = night[2] > night[0] ? 'up' : 'down';
      return `Night sleep is trending ${dir} over the last 3 visits (${night[0].toFixed(1)}h → ${night[2].toFixed(1)}h).`;
    }

    return null;
  }

  function initMyBaby() {
    loadMB();
    if (mb.birthday) {
      $('mb-birthday').value = mb.birthday;
      const months = getAgeMonths(mb.birthday);
      const age = ageRangeFor(months);
      $('mb-age-badge').innerHTML = `<div class="check-card info">
        <div class="check-icon">👶</div>
        <div class="check-content">
          <div class="check-title">${ageLabel(mb.birthday)}</div>
          <div class="check-detail">Sleep recommendations for: ${age.ageLabel}</div>
        </div>
      </div>`;
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

  // Get the appropriate wake window for a position in the day
  // pos: 0 = first (after morning wake), last = before bedtime, middle = everything else
  function getWW(age, pos, total) {
    const wws = age.wakeWindows;
    if (!wws) return (age.wakeWindow.min + age.wakeWindow.max) / 2;
    if (pos === 0) return wws.first;
    if (pos >= total) return wws.last; // last WW is before bedtime
    return wws.mid;
  }

  function buildDefaultNaps(age, count, wakeMin) {
    const totalNapH = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    const dur = count > 0 ? Math.round(totalNapH * 60 / count) : 0;
    const naps = [];
    let t = wakeMin;
    for (let i = 0; i < count; i++) {
      t += getWW(age, i, count); // graduated: first WW shortest, last longest
      const start = Math.round(t);
      const d = Math.min(Math.max(dur, 30), 150);
      naps.push({ start: m2t(start), end: m2t(start + d) });
      t = start + d;
    }
    return naps;
  }

  // Recalculate the schedule from a given nap index onward.
  // When a nap changes, we recompute all later naps using wake windows,
  // and drop naps that don't fit before bedtime.
  function recalcFromNap(changedIdx) {
    if (!mb.birthday) return;
    const months = getAgeMonths(mb.birthday);
    const age = ageRangeFor(months);
    const bedMin = t2m(mb.bedtime);
    const wakeMin = t2m(mb.waketime);
    const totalNapH = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    const recNapCount = Math.round((age.naps.min + age.naps.max) / 2);
    const avgNapDur = recNapCount > 0 ? Math.round(totalNapH * 60 / recNapCount) : 60;

    const changedNap = mb.napTimes[changedIdx];
    if (!changedNap) return;
    let cursor = t2m(changedNap.end);

    // Keep naps up to and including the changed one
    const kept = mb.napTimes.slice(0, changedIdx + 1);

    // Calculate total sleep so far (night + kept naps)
    let nightMins = wakeMin - bedMin;
    if (nightMins <= 0) nightMins += 1440;
    let totalSleepSoFar = nightMins;
    kept.forEach(n => { totalSleepSoFar += napDuration(n); });

    // Try to fit remaining naps
    for (let i = changedIdx + 1; i < age.naps.max; i++) {
      const wwForThis = getWW(age, i, recNapCount);
      const nextStart = cursor + wwForThis;
      const nextEnd = nextStart + avgNapDur;

      // Would adding this nap exceed 23h total sleep?
      if (totalSleepSoFar + avgNapDur > 23 * 60) break;

      // Does this nap fit before bedtime?
      const lastWW = getWW(age, recNapCount, recNapCount);
      let timeToBed = bedMin - nextEnd;
      if (timeToBed < 0) timeToBed += 1440;
      if (timeToBed < lastWW * 0.4 || timeToBed > 720) break;

      kept.push({ start: m2t(Math.round(nextStart)), end: m2t(Math.round(nextEnd)) });
      totalSleepSoFar += avgNapDur;
      cursor = nextEnd;
    }

    mb.napTimes = kept;
    mb.napCount = kept.length;
    $('mb-nap-count').textContent = mb.napCount;
    saveMB();
    renderNapInputs();
    renderResults();
  }

  function napDuration(nap) {
    let d = t2m(nap.end) - t2m(nap.start);
    if (d <= 0) d += 1440;
    // Clamp: if "duration" > 12 hours, the user probably set times wrong — assume short nap
    if (d > 720) d = 1440 - d;
    return d;
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
    mb.napTimes = mb.napTimes.slice(0, mb.napCount);

    let html = '<div class="nap-times"><div class="nap-times-title">😴 Nap Times</div>';
    for (let i = 0; i < mb.napCount; i++) {
      const n = mb.napTimes[i];
      const dur = napDuration(n);
      html += `<div class="nap-time-row">
        <div class="nap-time-label">Nap ${i + 1}<br><small style="color:var(--text-muted);font-weight:400">${durLabel(dur)}</small></div>
        <div class="nap-time-inputs">
          <input type="time" value="${n.start}" data-nap="${i}" data-field="start">
          <span style="color:var(--text-muted)">→</span>
          <input type="time" value="${n.end}" data-nap="${i}" data-field="end">
        </div>
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('input[type="time"]').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.dataset.nap);
        const field = inp.dataset.field;
        mb.napTimes[idx][field] = inp.value;
        saveMB();

        // If end time changed (or start), recalculate later naps
        recalcFromNap(idx);
      });
    });
  }

  // --- Circular 24h Clock ---
  const CLK = { R: 120, r: 85, cx: 140, cy: 140, size: 280 };

  function minToAngle(m) { return ((m % 1440) / 1440) * 360 - 90; }
  function polar(angle, radius) {
    const rad = angle * Math.PI / 180;
    return { x: CLK.cx + radius * Math.cos(rad), y: CLK.cy + radius * Math.sin(rad) };
  }

  function arcPath(startMin, durMin) {
    const sa = minToAngle(startMin), ea = minToAngle(startMin + durMin);
    const sw = durMin >= 720 ? 1 : 0;
    const os = polar(sa, CLK.R), oe = polar(ea, CLK.R);
    const is_ = polar(ea, CLK.r), ie = polar(sa, CLK.r);
    return `M${os.x} ${os.y} A${CLK.R} ${CLK.R} 0 ${sw} 1 ${oe.x} ${oe.y} L${is_.x} ${is_.y} A${CLK.r} ${CLK.r} 0 ${sw} 0 ${ie.x} ${ie.y}Z`;
  }

  let clockEditOpen = null; // { type, idx } or null

  function closeClockEdit() {
    $('mb-clock-popup').innerHTML = '';
    clockEditOpen = null;
  }

  function showClockEdit(type, idx) {
    // If same popup is already open, close it
    if (clockEditOpen && clockEditOpen.type === type && clockEditOpen.idx === idx) {
      closeClockEdit();
      return;
    }

    clockEditOpen = { type, idx };
    const container = $('mb-clock-popup');
    const popup = document.createElement('div');
    popup.className = 'clock-edit-popup';

    if (type === 'night') {
      popup.innerHTML = `
        <div class="clock-edit-title">🌙 Night Sleep</div>
        <div class="clock-edit-row">
          <label>Bedtime</label>
          <input type="time" value="${mb.bedtime}" data-field="bedtime">
        </div>
        <div class="clock-edit-row">
          <label>Wake up</label>
          <input type="time" value="${mb.waketime}" data-field="waketime">
        </div>`;
    } else {
      const nap = mb.napTimes[idx];
      if (!nap) { closeClockEdit(); return; }
      popup.innerHTML = `
        <div class="clock-edit-title">😴 Nap ${idx + 1}</div>
        <div class="clock-edit-row">
          <label>Start</label>
          <input type="time" value="${nap.start}" data-field="nap-start" data-idx="${idx}">
        </div>
        <div class="clock-edit-row">
          <label>End</label>
          <input type="time" value="${nap.end}" data-field="nap-end" data-idx="${idx}">
        </div>`;
    }

    container.innerHTML = '';
    container.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('visible'));

    popup.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        const field = inp.dataset.field;
        const reopenType = clockEditOpen ? clockEditOpen.type : null;
        const reopenIdx = clockEditOpen ? clockEditOpen.idx : 0;

        if (field === 'bedtime') {
          mb.bedtime = inp.value;
          $('mb-bedtime').value = inp.value;
          saveMB();
          renderNapInputs();
          renderResults();
          // Re-open same popup after re-render
          clockEditOpen = null;
          showClockEdit(reopenType, reopenIdx);
        } else if (field === 'waketime') {
          mb.waketime = inp.value;
          $('mb-waketime').value = inp.value;
          saveMB();
          renderNapInputs();
          renderResults();
          clockEditOpen = null;
          showClockEdit(reopenType, reopenIdx);
        } else if (field === 'nap-start') {
          const i = parseInt(inp.dataset.idx);
          mb.napTimes[i].start = inp.value;
          saveMB();
          recalcFromNap(i);
          // Re-open if nap still exists
          clockEditOpen = null;
          if (mb.napTimes[i]) showClockEdit('nap', i);
        } else if (field === 'nap-end') {
          const i = parseInt(inp.dataset.idx);
          mb.napTimes[i].end = inp.value;
          saveMB();
          recalcFromNap(i);
          clockEditOpen = null;
          if (mb.napTimes[i]) showClockEdit('nap', i);
        }
      });
    });

    // Close when tapping outside
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        const popupEl = $('mb-clock-popup').querySelector('.clock-edit-popup');
        if (popupEl && !popupEl.contains(e.target) && !e.target.closest('.clock-arc')) {
          closeClockEdit();
          document.removeEventListener('click', handler);
        }
      });
    }, 200);
  }

  function renderClock(bedMin, wakeMin, naps, totalH, nightH, napH) {
    const el = $('mb-clock');
    const { R, r, cx, cy, size } = CLK;

    let nightDur = wakeMin - bedMin;
    if (nightDur <= 0) nightDur += 1440;

    let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;

    // Background donut
    svg += `<path d="${arcPath(0, 1440)}" fill="var(--surface-alt)" opacity="0.5"/>`;

    // Night arc — tappable
    svg += `<path d="${arcPath(bedMin, nightDur)}" fill="var(--sleep-night)" opacity="0.9" class="clock-arc" data-type="night"/>`;

    // Nap arcs — tappable
    naps.forEach((n, i) => {
      svg += `<path d="${arcPath(t2m(n.start), napDuration(n))}" fill="var(--sleep-nap)" opacity="0.85" class="clock-arc" data-type="nap" data-idx="${i}"/>`;
    });

    // Hour ticks
    for (let h = 0; h < 24; h++) {
      const a = minToAngle(h * 60);
      const o = polar(a, R + 2), i_ = polar(a, R - 3);
      const major = h % 6 === 0;
      svg += `<line x1="${o.x}" y1="${o.y}" x2="${i_.x}" y2="${i_.y}" stroke="var(--text-muted)" stroke-width="${major ? 1.5 : 0.5}" opacity="${major ? 0.7 : 0.3}"/>`;
      if (major) {
        const lp = polar(a, R + 14);
        svg += `<text x="${lp.x}" y="${lp.y}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="500" fill="var(--text-muted)">${h || '0'}</text>`;
      }
    }

    // Nap labels
    naps.forEach((n, i) => {
      const dur = napDuration(n);
      if (dur >= 25) {
        const p = polar(minToAngle(t2m(n.start) + dur / 2), (R + r) / 2);
        svg += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="600" fill="white" pointer-events="none">N${i + 1}</text>`;
      }
    });

    // Night label
    const nightMid = polar(minToAngle(bedMin + nightDur / 2), (R + r) / 2);
    svg += `<text x="${nightMid.x}" y="${nightMid.y}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="white" pointer-events="none">Night</text>`;

    svg += '</svg>';

    let html = '<div class="sleep-clock-wrap"><div class="sleep-clock">';
    html += svg;
    html += `<div class="clock-center">
      <div class="clock-total">${totalH.toFixed(1)}<span class="clock-total-unit">h</span></div>
      <div class="clock-sub">🌙 ${nightH.toFixed(1)}h night${napH > 0 ? '<br>☀️ ' + napH.toFixed(1) + 'h naps' : ''}</div>
    </div>`;
    html += '</div></div>';
    html += '<div class="clock-legend">';
    html += '<span><span class="legend-dot" style="background:var(--sleep-night)"></span>Night</span>';
    html += '<span><span class="legend-dot" style="background:var(--sleep-nap)"></span>Naps</span>';
    html += '<span><span class="legend-dot" style="background:var(--surface-alt)"></span>Awake</span>';
    html += '</div>';
    html += '<div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:4px">Tap any sleep block to edit times</div>';

    el.innerHTML = html;

    // Tap to edit
    el.querySelectorAll('.clock-arc').forEach(arc => {
      arc.style.cursor = 'pointer';
      arc.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = arc.dataset.type;
        const idx = parseInt(arc.dataset.idx || '0');
        showClockEdit(type, idx);
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
    sortedNaps.forEach(n => { actualNapMins += napDuration(n); });
    const actualNapH = actualNapMins / 60;
    const actualTotalH = actualNightH + actualNapH;

    // Validation: check for overlapping naps and >24h
    const warnings = [];
    for (let i = 1; i < sortedNaps.length; i++) {
      const prevEnd = t2m(sortedNaps[i - 1].end);
      const thisStart = t2m(sortedNaps[i].start);
      let gap = thisStart - prevEnd;
      if (gap < 0) gap += 1440;
      if (gap > 720) {
        warnings.push(`Nap ${i} and Nap ${i + 1} overlap — check your times.`);
      }
    }
    // Check naps don't overlap with night sleep
    sortedNaps.forEach((n, i) => {
      const ns = t2m(n.start), ne = t2m(n.end);
      const dur = napDuration(n);
      // Nap during night sleep?
      let napInNight = false;
      if (actualNight >= 720) {
        // Night wraps midnight
        if (ns >= bedMin || ns < wakeMin) napInNight = true;
      }
      if (napInNight) {
        warnings.push(`Nap ${i + 1} overlaps with night sleep — check your times.`);
      }
      if (dur > 240) {
        warnings.push(`Nap ${i + 1} is ${durLabel(dur)} — that seems very long. Check the start and end times.`);
      }
    });
    if (actualTotalH > 22) {
      warnings.push(`Total sleep is ${actualTotalH.toFixed(1)} hours — this exceeds a full day. Check your bedtime, wake time, and nap times.`);
    }

    // Wake windows
    const wws = [];
    let prev = wakeMin;
    sortedNaps.forEach((n, i) => {
      const s = t2m(n.start);
      let gap = s - prev; if (gap < 0) gap += 1440;
      if (gap > 720) gap = 1440 - gap; // Fix negative/wrapped wake windows
      wws.push({ label: i === 0 ? 'Wake to Nap 1' : 'Nap ' + i + ' to Nap ' + (i + 1), mins: gap });
      prev = t2m(n.end);
    });
    let lastGap = bedMin - prev; if (lastGap < 0) lastGap += 1440;
    if (lastGap > 720) lastGap = 1440 - lastGap;
    wws.push({ label: mb.napCount > 0 ? 'Last nap to Bedtime' : 'Wake to Bedtime', mins: lastGap });

    // Recommended values
    const recBed = recBedtime(months);
    const recWake = recWakeTime(months);
    const recNapCount = Math.round((age.naps.min + age.naps.max) / 2);
    const recNapH = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    let recNightMins = recWake - recBed; if (recNightMins <= 0) recNightMins += 1440;
    const recNightH = recNightMins / 60;
    const recTotalH = (age.totalSleepHours.min + age.totalSleepHours.max) / 2;

    recordHistory({ bedMin, nightH: actualNightH, totalH: actualTotalH, napH: actualNapH });

    // --- Circular Clock ---
    renderClock(bedMin, wakeMin, sortedNaps, actualTotalH, actualNightH, actualNapH);

    // --- Validation warnings ---
    let cHtml = '';
    if (warnings.length > 0) {
      warnings.forEach(w => {
        cHtml += `<div class="check-card warn">
          <div class="check-icon">⚠️</div>
          <div class="check-content">
            <div class="check-title">Check your schedule</div>
            <div class="check-detail">${w}</div>
          </div>
        </div>`;
      });
    }

    // --- Comparison cards ---
    // Every goal still gets checked, but only real deviations get their own
    // card — the ones on track collapse into a single count, so a good week
    // doesn't read as loud as a bad one.
    const results = [];

    function cmp(title, actual, unit, recMin, recMax, lowTip, highTip) {
      const ok = actual >= recMin - 0.3 && actual <= recMax + 0.3;
      const low = actual < recMin - 0.3;
      const val = typeof actual === 'number' ? actual.toFixed(1) : actual;
      results.push({ ok, html: `<div class="check-card warn">
        <div class="check-icon">⚠️</div>
        <div class="check-content">
          <div class="check-title">${title}: ${val} ${unit}</div>
          <div class="check-detail">Recommended: ${recMin}–${recMax} ${unit}. ${low ? lowTip : highTip}</div>
        </div>
      </div>` });
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
    results.push({ ok: napOk, html: `<div class="check-card warn">
      <div class="check-icon">⚠️</div>
      <div class="check-content">
        <div class="check-title">Naps: ${mb.napCount}</div>
        <div class="check-detail">Recommended: ${age.naps.label}. ${
          mb.napCount < age.naps.min ? 'Your baby may need more naps — watch for overtiredness signs (fussiness, yawning).' :
          'Your baby might be ready to drop a nap. Signs: fighting a nap for 2+ weeks, or last nap pushes bedtime too late.'}</div>
      </div>
    </div>` });

    // Wake windows — compare each against the correct graduated window
    const totalWWs = wws.length;
    wws.forEach((ww, idx) => {
      const expectedWW = getWW(age, idx, totalWWs - 1);
      const tolerance = 20;
      const ok = ww.mins >= expectedWW - tolerance && ww.mins <= expectedWW + tolerance;
      const short = ww.mins < expectedWW - tolerance;
      const posLabel = idx === 0 ? 'first (shortest)' : idx === totalWWs - 1 ? 'last (longest)' : 'middle';
      results.push({ ok, html: `<div class="check-card warn">
        <div class="check-icon">⚠️</div>
        <div class="check-content">
          <div class="check-title">${ww.label}: ${durLabel(ww.mins)}</div>
          <div class="check-detail">Recommended ${posLabel} wake window: ~${durLabel(expectedWW)}. ${
            short ? 'Too short — baby may not have enough sleep pressure built up. Try stretching by 10–15 min.' :
            'Too long — cortisol may kick in from overtiredness, making sleep harder. Try putting down 15–30 min earlier.'}</div>
        </div>
      </div>` });
    });

    cHtml += '<div class="checks-section">';

    const trend = detectTrend(mb.history);
    if (trend) {
      cHtml += `<div class="check-card trend">
        <div class="check-icon">${trend.includes('later') || trend.includes('trending up') ? '📈' : '📉'}</div>
        <div class="check-content">
          <div class="check-title">Trend</div>
          <div class="check-detail">${trend}</div>
        </div>
      </div>`;
    }

    const goodCount = results.filter(r => r.ok).length;
    cHtml += `<div class="check-card good">
      <div class="check-icon">✅</div>
      <div class="check-content">
        <div class="check-title">${goodCount} of ${results.length} goals on track</div>
      </div>
    </div>`;

    results.filter(r => !r.ok).forEach(r => { cHtml += r.html; });

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

    // Wake window advice — using graduated windows
    wws.forEach((ww, idx) => {
      const expectedWW = getWW(age, idx, wws.length - 1);
      const posLabel = idx === 0 ? 'first' : idx === wws.length - 1 ? 'last' : 'middle';
      if (ww.mins < expectedWW - 25) {
        tips.push({
          icon: '⏰',
          title: ww.label + ' is too short',
          text: `${durLabel(ww.mins)} awake vs ~${durLabel(expectedWW)} recommended for the ${posLabel} wake window. Baby may not have built enough sleep pressure. Try stretching by 10–15 min with play or tummy time.`
        });
      } else if (ww.mins > expectedWW + 25) {
        tips.push({
          icon: '⏰',
          title: ww.label + ' is too long',
          text: `${durLabel(ww.mins)} awake vs ~${durLabel(expectedWW)} recommended for the ${posLabel} wake window. Cortisol rises when babies are overtired, making them wired instead of sleepy. Try putting baby down 15–30 min earlier.`
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

    // Build suggested optimal schedule using graduated wake windows
    const optWake = recWake;
    const optNapDur = recNapCount > 0 ? Math.round(recNapH * 60 / recNapCount) : 0;

    let sugHtml = '<div class="suggested-section"><div class="suggested-title">Optimal Schedule for ' + ageLabel(mb.birthday) + '</div>';
    sugHtml += `<div class="suggested-item"><span class="suggested-item-label">🌅 Wake up</span><span class="suggested-item-value">${m2t(optWake)}</span></div>`;

    let ot = optWake;
    for (let i = 0; i < recNapCount; i++) {
      ot += getWW(age, i, recNapCount); // graduated: first WW shortest
      const ns = Math.round(ot), ne = ns + optNapDur;
      sugHtml += `<div class="suggested-item"><span class="suggested-item-label">😴 Nap ${i + 1}</span><span class="suggested-item-value">${m2t(ns)} – ${m2t(ne)} (${durLabel(optNapDur)})</span></div>`;
      ot = ne;
    }
    // Bedtime = last nap end + last wake window
    ot += getWW(age, recNapCount, recNapCount);
    const optBed = Math.round(ot);
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
  function onBirthdayChange() {
    closeClockEdit(); // Bug #4: close popup on birthday change
    const val = $('mb-birthday').value;
    mb.birthday = val;
    saveMB();
    if (val) {
      const months = getAgeMonths(val);
      const age = ageRangeFor(months);

      $('mb-age-badge').innerHTML = `<div class="check-card info">
        <div class="check-icon">👶</div>
        <div class="check-content">
          <div class="check-title">${ageLabel(val)}</div>
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
      $('mb-clock').innerHTML = '';
      $('mb-comparison').innerHTML = '';
      $('mb-advice').innerHTML = '';
    }
  }
  $('mb-birthday').addEventListener('input', onBirthdayChange);
  $('mb-birthday').addEventListener('change', onBirthdayChange);

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
    if (!mb.birthday) return;
    closeClockEdit();
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
    if (!mb.birthday) return;
    closeClockEdit();
    const age = ageRangeFor(getAgeMonths(mb.birthday));
    if (mb.napCount < age.naps.max) {
      mb.napCount++;
      $('mb-nap-count').textContent = mb.napCount;
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
