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
    updateMyBaby();
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
  let mbData = { bedtime: '19:00', waketime: '07:00', napCount: 2, naps: [] };

  function restoreMyBaby() {
    const saved = localStorage.getItem('bs_my_baby');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        mbData = { ...mbData, ...parsed };
      } catch(e) {}
    }
    $('mb-bedtime').value = mbData.bedtime;
    $('mb-waketime').value = mbData.waketime;
    $('mb-nap-count').textContent = mbData.napCount;
    renderNapTimes();
    updateMyBaby();
  }

  function saveMyBaby() {
    localStorage.setItem('bs_my_baby', JSON.stringify(mbData));
  }

  function timeToMin(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function minToTime(m) {
    m = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min;
  }

  function minToLabel(m) {
    m = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + ':' + (min < 10 ? '0' : '') + min + ' ' + ampm;
  }

  function durationLabel(mins) {
    if (mins < 0) mins += 1440;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return m + ' min';
    if (m === 0) return h + 'h';
    return h + 'h ' + m + 'm';
  }

  // Default nap times based on age and number of naps
  function getDefaultNapTimes(napCount, wakeMin, age) {
    const wwAvg = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const naps = [];
    let currentTime = wakeMin;

    for (let i = 0; i < napCount; i++) {
      currentTime += wwAvg;
      const napStart = currentTime;
      // Estimate nap duration: total nap hours divided by nap count
      const napDurAvg = ((age.napSleepHours.min + age.napSleepHours.max) / 2) * 60 / Math.max(napCount, 1);
      const napDur = Math.round(Math.min(Math.max(napDurAvg, 30), 150));
      naps.push({ start: minToTime(napStart), duration: napDur });
      currentTime = napStart + napDur;
    }
    return naps;
  }

  function renderNapTimes() {
    const container = $('mb-nap-times');
    if (mbData.napCount === 0) {
      container.innerHTML = '';
      return;
    }

    const age = data.ageRanges[currentAgeIndex];
    // Fill in defaults if naps array doesn't match count
    if (mbData.naps.length !== mbData.napCount) {
      const wakeMin = timeToMin(mbData.waketime);
      mbData.naps = getDefaultNapTimes(mbData.napCount, wakeMin, age);
      saveMyBaby();
    }

    let html = '<div class="nap-times"><div class="nap-times-title">😴 Nap Times</div>';
    for (let i = 0; i < mbData.napCount; i++) {
      const nap = mbData.naps[i];
      html += `
        <div class="nap-time-row">
          <div class="nap-time-label">Nap ${i + 1}</div>
          <div class="nap-time-inputs">
            <input type="time" value="${nap.start}" data-nap="${i}" data-field="start">
            <span>${durationLabel(nap.duration)}</span>
          </div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;

    // Add listeners
    container.querySelectorAll('input[type="time"]').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.dataset.nap);
        mbData.naps[idx].start = input.value;
        saveMyBaby();
        updateMyBaby();
      });
    });
  }

  function updateMyBaby() {
    const age = data.ageRanges[currentAgeIndex];
    const bedMin = timeToMin(mbData.bedtime);
    const wakeMin = timeToMin(mbData.waketime);

    // Calculate night sleep
    let nightSleep = wakeMin - bedMin;
    if (nightSleep <= 0) nightSleep += 1440;

    // Build timeline blocks
    const blocks = [];
    // Night sleep block (bedtime to wake)
    blocks.push({ type: 'night', start: bedMin, duration: nightSleep, label: 'Night' });

    // Sort naps by start time
    const sortedNaps = (mbData.naps || []).slice().sort((a, b) => timeToMin(a.start) - timeToMin(b.start));

    let totalNapMins = 0;
    sortedNaps.forEach((nap, i) => {
      const napStart = timeToMin(nap.start);
      blocks.push({ type: 'nap', start: napStart, duration: nap.duration, label: 'Nap ' + (i + 1) });
      totalNapMins += nap.duration;
    });

    // Render timeline
    renderTimeline(blocks, bedMin);

    // Calculate wake windows
    const wakeWindows = [];
    let prevEnd = wakeMin;
    sortedNaps.forEach((nap, i) => {
      const napStart = timeToMin(nap.start);
      let ww = napStart - prevEnd;
      if (ww < 0) ww += 1440;
      wakeWindows.push({ label: i === 0 ? 'Wake → Nap 1' : 'Nap ' + i + ' → Nap ' + (i + 1), mins: ww });
      prevEnd = napStart + nap.duration;
    });
    // Last wake window to bedtime
    let lastWW = bedMin - prevEnd;
    if (lastWW < 0) lastWW += 1440;
    if (mbData.napCount > 0) {
      wakeWindows.push({ label: 'Nap ' + mbData.napCount + ' → Bedtime', mins: lastWW });
    } else {
      wakeWindows.push({ label: 'Wake → Bedtime', mins: lastWW });
    }

    // Render checks
    renderChecks(age, nightSleep, totalNapMins, wakeWindows);

    // Render suggested schedule
    renderSuggested(age, wakeMin, bedMin);
  }

  function renderTimeline(blocks, dayStartMin) {
    const container = $('mb-timeline');
    const totalMins = 1440;

    let html = '<div class="timeline-section">';
    html += '<div class="timeline-title">Daily Timeline</div>';
    html += '<div class="timeline-bar">';

    blocks.forEach(b => {
      let offset = b.start - dayStartMin;
      if (offset < 0) offset += totalMins;
      const left = (offset / totalMins) * 100;
      const width = Math.max((b.duration / totalMins) * 100, 0.5);
      const label = b.duration >= 60 ? b.label : '';
      html += `<div class="timeline-block ${b.type}" style="left:${left}%;width:${width}%">${label}</div>`;
    });

    html += '</div>';

    // Labels: show bedtime as start, wake, and bedtime again as end
    const bedLabel = minToLabel(dayStartMin);
    const midLabel = minToLabel(dayStartMin + 720);
    html += `<div class="timeline-labels"><span>${bedLabel}</span><span>${midLabel}</span><span>${bedLabel}</span></div>`;

    html += '<div class="timeline-legend">';
    html += '<span><span class="legend-dot" style="background:var(--sleep-night)"></span>Night</span>';
    html += '<span><span class="legend-dot" style="background:var(--sleep-nap)"></span>Naps</span>';
    html += '<span><span class="legend-dot" style="background:var(--wake);opacity:0.5"></span>Awake</span>';
    html += '</div></div>';

    container.innerHTML = html;
  }

  function renderChecks(age, nightSleepMins, totalNapMins, wakeWindows) {
    const container = $('mb-checks');
    let html = '<div class="checks-section">';

    const nightHrs = nightSleepMins / 60;
    const napHrs = totalNapMins / 60;
    const totalHrs = nightHrs + napHrs;

    // Night sleep check
    const nightOk = nightHrs >= age.nightSleepHours.min - 0.5 && nightHrs <= age.nightSleepHours.max + 0.5;
    html += `<div class="check-card ${nightOk ? 'good' : 'warn'}">
      <div class="check-icon">${nightOk ? '✅' : '⚠️'}</div>
      <div class="check-content">
        <div class="check-title">Night sleep: ${nightHrs.toFixed(1)} hours</div>
        <div class="check-detail">Recommended: ${age.nightSleepHours.min}–${age.nightSleepHours.max} hours.
        ${nightOk ? 'Looking good!' : nightHrs < age.nightSleepHours.min ? 'A bit low — try an earlier bedtime.' : 'A bit high — bedtime could be slightly later.'}</div>
      </div>
    </div>`;

    // Nap sleep check
    if (age.napSleepHours.max > 0) {
      const napOk = napHrs >= age.napSleepHours.min - 0.5 && napHrs <= age.napSleepHours.max + 0.5;
      html += `<div class="check-card ${napOk ? 'good' : 'warn'}">
        <div class="check-icon">${napOk ? '✅' : '⚠️'}</div>
        <div class="check-content">
          <div class="check-title">Daytime nap sleep: ${napHrs.toFixed(1)} hours</div>
          <div class="check-detail">Recommended: ${age.napSleepHours.min}–${age.napSleepHours.max} hours.
          ${napOk ? 'On track!' : napHrs < age.napSleepHours.min ? 'Naps are a bit short. Try extending with white noise and dark room.' : 'Naps might be too long — this could push bedtime late or cause night waking.'}</div>
        </div>
      </div>`;
    }

    // Total sleep check
    const totalOk = totalHrs >= age.totalSleepHours.min - 0.5 && totalHrs <= age.totalSleepHours.max + 0.5;
    html += `<div class="check-card ${totalOk ? 'good' : 'warn'}">
      <div class="check-icon">${totalOk ? '✅' : '⚠️'}</div>
      <div class="check-content">
        <div class="check-title">Total sleep: ${totalHrs.toFixed(1)} hours</div>
        <div class="check-detail">Recommended: ${age.totalSleepHours.min}–${age.totalSleepHours.max} hours.
        ${totalOk ? 'Great total!' : totalHrs < age.totalSleepHours.min ? 'Total is a bit low. Consider longer naps or earlier bedtime.' : 'A bit above average — not necessarily a problem if baby seems well-rested.'}</div>
      </div>
    </div>`;

    // Nap count check
    const napCountOk = mbData.napCount >= age.naps.min && mbData.napCount <= age.naps.max;
    html += `<div class="check-card ${napCountOk ? 'good' : 'warn'}">
      <div class="check-icon">${napCountOk ? '✅' : '⚠️'}</div>
      <div class="check-content">
        <div class="check-title">Number of naps: ${mbData.napCount}</div>
        <div class="check-detail">Recommended: ${age.naps.label} naps.
        ${napCountOk ? 'Right on track!' : mbData.napCount < age.naps.min ? 'Your baby might need more naps. Watch for overtiredness.' : 'Your baby might be ready to drop a nap. Watch for signs: fighting a nap for 2+ weeks.'}</div>
      </div>
    </div>`;

    // Wake window checks
    const wwMin = age.wakeWindow.min;
    const wwMax = age.wakeWindow.max;
    wakeWindows.forEach(ww => {
      const ok = ww.mins >= wwMin - 15 && ww.mins <= wwMax + 15;
      const tooShort = ww.mins < wwMin - 15;
      html += `<div class="check-card ${ok ? 'good' : 'warn'}">
        <div class="check-icon">${ok ? '✅' : '⚠️'}</div>
        <div class="check-content">
          <div class="check-title">${ww.label}: ${durationLabel(ww.mins)}</div>
          <div class="check-detail">Recommended wake window: ${formatWakeWindow(age.wakeWindow)}.
          ${ok ? 'Good spacing!' : tooShort ? 'A bit short — baby might not be tired enough. Try stretching by 10–15 min.' : 'A bit long — baby might be overtired. Try moving sleep earlier.'}</div>
        </div>
      </div>`;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  function renderSuggested(age, wakeMin, bedMin) {
    const container = $('mb-suggested');
    const wwAvg = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const recNaps = Math.round((age.naps.min + age.naps.max) / 2);
    const napDurAvg = ((age.napSleepHours.min + age.napSleepHours.max) / 2) * 60 / Math.max(recNaps, 1);

    if (recNaps === 0) {
      container.innerHTML = `<div class="suggested-section">
        <div class="suggested-title">Suggested Schedule</div>
        <div class="suggested-item">
          <span class="suggested-item-label">Wake up</span>
          <span class="suggested-item-value">${minToLabel(wakeMin)}</span>
        </div>
        <div class="suggested-item">
          <span class="suggested-item-label">Bedtime</span>
          <span class="suggested-item-value">${minToLabel(wakeMin + wwAvg)}</span>
        </div>
      </div>`;
      return;
    }

    let html = '<div class="suggested-section"><div class="suggested-title">Suggested Schedule (based on science)</div>';
    html += `<div class="suggested-item">
      <span class="suggested-item-label">🌅 Wake up</span>
      <span class="suggested-item-value">${minToLabel(wakeMin)}</span>
    </div>`;

    let t = wakeMin;
    for (let i = 0; i < recNaps; i++) {
      t += wwAvg;
      const napStart = t;
      const napEnd = napStart + napDurAvg;
      html += `<div class="suggested-item">
        <span class="suggested-item-label">😴 Nap ${i + 1}</span>
        <span class="suggested-item-value">${minToLabel(napStart)} – ${minToLabel(napEnd)}</span>
      </div>`;
      t = napEnd;
    }

    t += wwAvg;
    html += `<div class="suggested-item">
      <span class="suggested-item-label">🌙 Bedtime</span>
      <span class="suggested-item-value">${minToLabel(t)}</span>
    </div>`;

    html += '</div>';
    container.innerHTML = html;
  }

  // My Baby event listeners
  $('mb-bedtime').addEventListener('change', function() {
    mbData.bedtime = this.value;
    saveMyBaby();
    updateMyBaby();
  });

  $('mb-waketime').addEventListener('change', function() {
    mbData.waketime = this.value;
    // Recalculate default naps when wake time changes
    const age = data.ageRanges[currentAgeIndex];
    mbData.naps = getDefaultNapTimes(mbData.napCount, timeToMin(mbData.waketime), age);
    saveMyBaby();
    renderNapTimes();
    updateMyBaby();
  });

  $('mb-nap-minus').addEventListener('click', () => {
    if (mbData.napCount > 0) {
      mbData.napCount--;
      $('mb-nap-count').textContent = mbData.napCount;
      // Recalculate nap times
      const age = data.ageRanges[currentAgeIndex];
      mbData.naps = getDefaultNapTimes(mbData.napCount, timeToMin(mbData.waketime), age);
      saveMyBaby();
      renderNapTimes();
      updateMyBaby();
    }
  });

  $('mb-nap-plus').addEventListener('click', () => {
    if (mbData.napCount < 8) {
      mbData.napCount++;
      $('mb-nap-count').textContent = mbData.napCount;
      const age = data.ageRanges[currentAgeIndex];
      mbData.naps = getDefaultNapTimes(mbData.napCount, timeToMin(mbData.waketime), age);
      saveMyBaby();
      renderNapTimes();
      updateMyBaby();
    }
  });

  // --- Init ---
  restoreAge();
  renderTips();
  renderEnvironment();
  updateRoutine();
  restoreMyBaby();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  }
})();
