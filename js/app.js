(function() {
  'use strict';

  const $ = id => document.getElementById(id);
  const data = SLEEP_DATA;
  let currentAgeIndex = 0;

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

    // Age display
    $('age-display').textContent = age.ageLabel;

    // Schedule values
    $('wake-window').textContent = formatWakeWindow(age.wakeWindow);
    $('nap-count').textContent = age.naps.label;
    $('day-sleep').textContent = age.napSleepHours.min + '–' + age.napSleepHours.max + ' hours';
    $('night-sleep').textContent = age.nightSleepHours.min + '–' + age.nightSleepHours.max + ' hours';
    $('total-sleep-value').textContent = age.totalSleepHours.min + '–' + age.totalSleepHours.max;

    // Bars (proportional to max possible: 12 hrs night, 8 hrs day, 7 hrs wake)
    const wakeAvg = (age.wakeWindow.min + age.wakeWindow.max) / 2;
    const wakeBarPct = Math.min((wakeAvg / 420) * 100, 100);
    $('bar-wake').style.width = wakeBarPct + '%';

    const napAvg = (age.napSleepHours.min + age.napSleepHours.max) / 2;
    $('bar-nap').style.width = (napAvg / 8) * 100 + '%';

    const nightAvg = (age.nightSleepHours.min + age.nightSleepHours.max) / 2;
    $('bar-night').style.width = (nightAvg / 12) * 100 + '%';

    // Info chips
    $('feedings').textContent = age.feedingsPerNight;
    $('self-soothe').textContent = age.canSelfSoothe ? 'Yes' : 'Not yet';

    // Age note
    $('age-note').textContent = age.notes;

    // Regression alert
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
      if (reg.ageMonths >= age.minMonths && reg.ageMonths <= age.maxMonths) {
        return reg;
      }
      // Also show if within 1 month
      if (Math.abs(reg.ageMonths - age.minMonths) <= 1 || Math.abs(reg.ageMonths - age.maxMonths) <= 1) {
        if (reg.ageMonths >= age.minMonths - 1 && reg.ageMonths <= age.maxMonths + 1) {
          return reg;
        }
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

    // Temperature
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

    // Darkness
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

    // Sound
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

    // Safe sleep
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

    // Find matching routine
    let routine = data.routines[0];
    for (const r of data.routines) {
      if (midAge >= r.minMonths && midAge <= r.maxMonths) {
        routine = r;
        break;
      }
    }
    // Fallback: find closest
    if (midAge > routine.maxMonths) {
      for (let i = data.routines.length - 1; i >= 0; i--) {
        if (midAge >= data.routines[i].minMonths) {
          routine = data.routines[i];
          break;
        }
      }
    }

    $('routine-age-label').textContent = 'For: ' + routine.label + ' (' + routine.ageRange + ')';

    let html = '';

    // Bedtime routine
    html += `
      <div class="routine-section">
        <div class="routine-section-title">🌙 Bedtime Routine</div>
        <div class="routine-duration">About ${routine.bedtime.totalDuration}</div>
        <div class="routine-steps">
          ${renderRoutineSteps(routine.bedtime.steps)}
        </div>
      </div>`;

    // Nap routine
    html += `
      <div class="routine-section">
        <div class="routine-section-title">☀️ Nap Routine</div>
        <div class="routine-duration">About ${routine.nap.totalDuration}</div>
        ${routine.nap.note ? '<div class="routine-nap-note">' + routine.nap.note + '</div>' : ''}
        <div class="routine-steps">
          ${renderRoutineSteps(routine.nap.steps)}
        </div>
      </div>`;

    // Tip
    if (routine.tip) {
      html += `
        <div class="routine-tip">
          <div class="routine-tip-label">Tip</div>
          <div class="routine-tip-text">${routine.tip}</div>
        </div>`;
    }

    $('routines-content').innerHTML = html;
  }

  // --- Init ---
  restoreAge();
  renderTips();
  renderEnvironment();
  updateRoutine();

  // Update tips & routines when age changes
  slider.addEventListener('input', () => {
    renderTips();
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
