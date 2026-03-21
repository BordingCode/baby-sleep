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
  function getAgeInMonths(birthday) {
    const today = new Date();
    const birth = new Date(birthday);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const dayDiff = today.getDate() - birth.getDate();
    return dayDiff < 0 ? Math.max(months - 1, 0) : months;
  }

  function getAgeInWeeks(birthday) {
    const today = new Date();
    const birth = new Date(birthday);
    return Math.floor((today - birth) / (7 * 24 * 60 * 60 * 1000));
  }

  function getAgeLabelFromBirthday(birthday) {
    const months = getAgeInMonths(birthday);
    const weeks = getAgeInWeeks(birthday);
    if (months < 1) return weeks + (weeks === 1 ? ' week' : ' weeks') + ' old';
    if (months < 24) return months + (months === 1 ? ' month' : ' months') + ' old';
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return years + (years === 1 ? ' year' : ' years') + ' old';
    return years + 'y ' + rem + 'm old';
  }

  function findAgeRangeForMonths(months) {
    for (let i = data.ageRanges.length - 1; i >= 0; i--) {
      if (months >= data.ageRanges[i].minMonths) return data.ageRanges[i];
    }
    return data.ageRanges[0];
  }

  function minToLabel(m) {
    m = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (min < 10 ? '0' : '') + min;
  }

  function durationLabel(mins) {
    if (mins < 0) mins += 1440;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return m + ' min';
    if (m === 0) return h + 'h';
    return h + 'h ' + m + 'm';
  }

  // Standard bedtimes by age (science-based recommendations)
  function getStandardBedtime(months) {
    if (months <= 2) return 22 * 60;       // 22:00 — newborns have late bedtimes
    if (months <= 3) return 20 * 60 + 30;  // 20:30
    if (months <= 5) return 19 * 60 + 30;  // 19:30
    if (months <= 12) return 19 * 60;      // 19:00
    if (months <= 24) return 19 * 60 + 30; // 19:30
    return 20 * 60;                        // 20:00 for 2-3yr
  }

  function getStandardWakeTime(months) {
    if (months <= 2) return 7 * 60 + 30;   // 07:30
    return 7 * 60;                         // 07:00
  }

  function buildSchedule(age, months) {
    const wakeMin = getStandardWakeTime(months);
    const bedMin = getStandardBedtime(months);
    const wwAvg = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const recNaps = Math.round((age.naps.min + age.naps.max) / 2);
    const totalNapHrs = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    const napDurMin = recNaps > 0 ? Math.round((totalNapHrs * 60) / recNaps) : 0;

    const items = [];
    items.push({ icon: '🌅', label: 'Wake up', time: wakeMin });

    let t = wakeMin;
    const naps = [];
    for (let i = 0; i < recNaps; i++) {
      t += wwAvg;
      const napStart = Math.round(t);
      const napEnd = napStart + napDurMin;
      items.push({ icon: '😴', label: 'Nap ' + (i + 1), time: napStart, endTime: napEnd, duration: napDurMin });
      naps.push({ start: napStart, end: napEnd, duration: napDurMin });
      t = napEnd;
    }

    items.push({ icon: '🌙', label: 'Bedtime', time: bedMin });

    // Night sleep
    let nightSleep = wakeMin - bedMin;
    if (nightSleep <= 0) nightSleep += 1440;

    return { items, naps, wakeMin, bedMin, nightSleep, recNaps, napDurMin, totalNapMins: recNaps * napDurMin, wwAvg };
  }

  function restoreMyBaby() {
    const saved = localStorage.getItem('bs_birthday');
    if (saved) {
      $('mb-birthday').value = saved;
      renderMyBaby();
    }
  }

  $('mb-birthday').addEventListener('change', function() {
    localStorage.setItem('bs_birthday', this.value);
    renderMyBaby();
  });

  function renderMyBaby() {
    const birthday = $('mb-birthday').value;
    if (!birthday) {
      $('mb-age-display').innerHTML = '';
      $('mb-schedule').innerHTML = '';
      $('mb-timeline').innerHTML = '';
      $('mb-notes').innerHTML = '';
      return;
    }

    const months = getAgeInMonths(birthday);
    const ageLabel = getAgeLabelFromBirthday(birthday);
    const age = findAgeRangeForMonths(months);

    if (months > 42) {
      $('mb-age-display').innerHTML = `<div class="check-card info">
        <div class="check-icon">👋</div>
        <div class="check-content">
          <div class="check-title">${ageLabel}</div>
          <div class="check-detail">This app covers sleep from birth to 3 years. Your child is beyond this range — they likely have a settled sleep pattern by now!</div>
        </div>
      </div>`;
      $('mb-schedule').innerHTML = '';
      $('mb-timeline').innerHTML = '';
      $('mb-notes').innerHTML = '';
      return;
    }

    // Age display
    $('mb-age-display').innerHTML = `<div class="check-card info">
      <div class="check-icon">👶</div>
      <div class="check-content">
        <div class="check-title">${ageLabel}</div>
        <div class="check-detail">Sleep recommendations for: ${age.ageLabel}</div>
      </div>
    </div>`;

    const sched = buildSchedule(age, months);

    // Schedule card
    let html = '<div class="suggested-section"><div class="suggested-title">Recommended Daily Schedule</div>';
    sched.items.forEach(item => {
      if (item.endTime !== undefined) {
        html += `<div class="suggested-item">
          <span class="suggested-item-label">${item.icon} ${item.label}</span>
          <span class="suggested-item-value">${minToLabel(item.time)} – ${minToLabel(item.endTime)} <small style="color:var(--text-muted)">(${durationLabel(item.duration)})</small></span>
        </div>`;
      } else {
        html += `<div class="suggested-item">
          <span class="suggested-item-label">${item.icon} ${item.label}</span>
          <span class="suggested-item-value">${minToLabel(item.time)}</span>
        </div>`;
      }
    });
    html += '</div>';

    // Summary stats
    html += '<div class="suggested-section">';
    html += `<div class="suggested-item">
      <span class="suggested-item-label">🌙 Night sleep</span>
      <span class="suggested-item-value">${(sched.nightSleep / 60).toFixed(1)} hours</span>
    </div>`;
    html += `<div class="suggested-item">
      <span class="suggested-item-label">☀️ Nap sleep</span>
      <span class="suggested-item-value">${(sched.totalNapMins / 60).toFixed(1)} hours (${sched.recNaps} ${sched.recNaps === 1 ? 'nap' : 'naps'})</span>
    </div>`;
    html += `<div class="suggested-item">
      <span class="suggested-item-label">⏰ Wake window</span>
      <span class="suggested-item-value">${formatWakeWindow(age.wakeWindow)}</span>
    </div>`;
    const totalHrs = sched.nightSleep / 60 + sched.totalNapMins / 60;
    html += `<div class="suggested-item">
      <span class="suggested-item-label"><strong>Total sleep</strong></span>
      <span class="suggested-item-value"><strong>${totalHrs.toFixed(1)} hours</strong></span>
    </div>`;
    if (age.feedingsPerNight !== '0') {
      html += `<div class="suggested-item">
        <span class="suggested-item-label">🍼 Night feedings</span>
        <span class="suggested-item-value">${age.feedingsPerNight}</span>
      </div>`;
    }
    html += '</div>';

    $('mb-schedule').innerHTML = html;

    // Timeline
    const blocks = [];
    blocks.push({ type: 'night', start: sched.bedMin, duration: sched.nightSleep, label: 'Night' });
    sched.naps.forEach((nap, i) => {
      blocks.push({ type: 'nap', start: nap.start, duration: nap.duration, label: 'Nap ' + (i + 1) });
    });

    const totalMins = 1440;
    let tlHtml = '<div class="timeline-section"><div class="timeline-title">Visual Timeline</div>';
    tlHtml += '<div class="timeline-bar">';
    blocks.forEach(b => {
      let offset = b.start - sched.bedMin;
      if (offset < 0) offset += totalMins;
      const left = (offset / totalMins) * 100;
      const width = Math.max((b.duration / totalMins) * 100, 0.5);
      const label = b.duration >= 60 ? b.label : '';
      tlHtml += `<div class="timeline-block ${b.type}" style="left:${left}%;width:${width}%">${label}</div>`;
    });
    tlHtml += '</div>';
    tlHtml += `<div class="timeline-labels"><span>${minToLabel(sched.bedMin)}</span><span>${minToLabel(sched.bedMin + 720)}</span><span>${minToLabel(sched.bedMin)}</span></div>`;
    tlHtml += '<div class="timeline-legend">';
    tlHtml += '<span><span class="legend-dot" style="background:var(--sleep-night)"></span>Night</span>';
    tlHtml += '<span><span class="legend-dot" style="background:var(--sleep-nap)"></span>Naps</span>';
    tlHtml += '<span><span class="legend-dot" style="background:var(--wake);opacity:0.5"></span>Awake</span>';
    tlHtml += '</div></div>';
    $('mb-timeline').innerHTML = tlHtml;

    // Notes
    let notesHtml = '';

    // Regression check
    const regression = findRegression(age);
    if (regression) {
      notesHtml += `<div class="check-card warn">
        <div class="check-icon">⚠️</div>
        <div class="check-content">
          <div class="check-title">${regression.label}</div>
          <div class="check-detail">${regression.description} Duration: ${regression.duration}.</div>
        </div>
      </div>`;
    }

    // Age note
    notesHtml += `<div class="check-card info">
      <div class="check-icon">💡</div>
      <div class="check-content">
        <div class="check-title">What to know at this age</div>
        <div class="check-detail">${age.notes}</div>
      </div>
    </div>`;

    $('mb-notes').innerHTML = notesHtml;
  }

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
