const SLEEP_DATA = {
  ageRanges: [
    {
      id: 'newborn',
      label: 'Newborn',
      ageLabel: '0–1 month',
      minMonths: 0,
      maxMonths: 1,
      wakeWindow: { min: 35, max: 60, unit: 'min' },
      naps: { min: 4, max: 8, label: '4–8 (irregular)' },
      napSleepHours: { min: 6, max: 8 },
      nightSleepHours: { min: 8, max: 10 },
      totalSleepHours: { min: 14, max: 17 },
      feedingsPerNight: '2–4+',
      canSelfSoothe: false,
      notes: 'Sleep is irregular and that is completely normal. Day/night confusion is common. No schedule needed yet — follow your baby\'s cues.'
    },
    {
      id: '2mo',
      label: '2 months',
      ageLabel: '2 months',
      minMonths: 2,
      maxMonths: 2,
      wakeWindow: { min: 60, max: 90, unit: 'min' },
      naps: { min: 4, max: 5, label: '4–5' },
      napSleepHours: { min: 4, max: 6 },
      nightSleepHours: { min: 9, max: 11 },
      totalSleepHours: { min: 14, max: 17 },
      feedingsPerNight: '2–3',
      canSelfSoothe: false,
      notes: 'Circadian rhythm is starting to develop. You may notice a longer stretch of sleep at night emerging. Keep daytime bright and nighttime dark.'
    },
    {
      id: '3mo',
      label: '3 months',
      ageLabel: '3 months',
      minMonths: 3,
      maxMonths: 3,
      wakeWindow: { min: 75, max: 105, unit: 'min' },
      naps: { min: 3, max: 4, label: '3–4' },
      napSleepHours: { min: 3.5, max: 5 },
      nightSleepHours: { min: 10, max: 11 },
      totalSleepHours: { min: 14, max: 16 },
      feedingsPerNight: '1–3',
      canSelfSoothe: false,
      notes: 'Sleep patterns become more predictable. A loose routine can start to form around wake windows. The last nap of the day is often the shortest.'
    },
    {
      id: '4mo',
      label: '4 months',
      ageLabel: '4 months',
      minMonths: 4,
      maxMonths: 4,
      wakeWindow: { min: 90, max: 120, unit: 'min' },
      naps: { min: 3, max: 4, label: '3–4' },
      napSleepHours: { min: 3, max: 4 },
      nightSleepHours: { min: 10, max: 11 },
      totalSleepHours: { min: 13, max: 16 },
      feedingsPerNight: '1–2',
      canSelfSoothe: false,
      notes: 'A major developmental shift happens around 4 months — sleep cycles change from newborn to adult-like patterns. This can cause temporary disruption (the "4-month regression").'
    },
    {
      id: '5mo',
      label: '5 months',
      ageLabel: '5 months',
      minMonths: 5,
      maxMonths: 5,
      wakeWindow: { min: 120, max: 150, unit: 'min' },
      naps: { min: 3, max: 3, label: '3' },
      napSleepHours: { min: 2.5, max: 3.5 },
      nightSleepHours: { min: 10, max: 11 },
      totalSleepHours: { min: 13, max: 15 },
      feedingsPerNight: '0–2',
      canSelfSoothe: true,
      notes: 'Most babies settle into a 3-nap pattern. Wake windows become more consistent. Some babies begin to self-soothe at this age.'
    },
    {
      id: '6mo',
      label: '6 months',
      ageLabel: '6 months',
      minMonths: 6,
      maxMonths: 6,
      wakeWindow: { min: 120, max: 150, unit: 'min' },
      naps: { min: 2, max: 3, label: '2–3' },
      napSleepHours: { min: 2.5, max: 3.5 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 13, max: 15 },
      feedingsPerNight: '0–1',
      canSelfSoothe: true,
      notes: 'Many babies transition from 3 to 2 naps around this age. Most are physically capable of sleeping through the night, though some still need one feeding.'
    },
    {
      id: '7-8mo',
      label: '7–8 months',
      ageLabel: '7–8 months',
      minMonths: 7,
      maxMonths: 8,
      wakeWindow: { min: 150, max: 180, unit: 'min' },
      naps: { min: 2, max: 2, label: '2' },
      napSleepHours: { min: 2, max: 3 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 13, max: 15 },
      feedingsPerNight: '0–1',
      canSelfSoothe: true,
      notes: 'Two solid naps are the norm. Separation anxiety may emerge and affect bedtime. Crawling and pulling up can cause temporary sleep disruption.'
    },
    {
      id: '9-10mo',
      label: '9–10 months',
      ageLabel: '9–10 months',
      minMonths: 9,
      maxMonths: 10,
      wakeWindow: { min: 180, max: 210, unit: 'min' },
      naps: { min: 2, max: 2, label: '2' },
      napSleepHours: { min: 2, max: 3 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 13, max: 14 },
      feedingsPerNight: '0–1',
      canSelfSoothe: true,
      notes: 'Wake windows lengthen. Some babies briefly resist the second nap — this is usually not a sign to drop it yet. Keep the 2-nap schedule.'
    },
    {
      id: '11-12mo',
      label: '11–12 months',
      ageLabel: '11–12 months',
      minMonths: 11,
      maxMonths: 12,
      wakeWindow: { min: 180, max: 240, unit: 'min' },
      naps: { min: 1, max: 2, label: '1–2' },
      napSleepHours: { min: 2, max: 3 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 12, max: 14 },
      feedingsPerNight: '0',
      canSelfSoothe: true,
      notes: 'The 12-month regression (walking, standing) can temporarily disrupt sleep. Most babies still need 2 naps — the transition to 1 nap usually happens closer to 14–15 months.'
    },
    {
      id: '13-15mo',
      label: '13–15 months',
      ageLabel: '13–15 months',
      minMonths: 13,
      maxMonths: 15,
      wakeWindow: { min: 210, max: 270, unit: 'min' },
      naps: { min: 1, max: 2, label: '1–2' },
      napSleepHours: { min: 2, max: 3 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 12, max: 14 },
      feedingsPerNight: '0',
      canSelfSoothe: true,
      notes: 'Many babies transition to 1 nap between 14–16 months. Signs of readiness: fighting the second nap for 2+ weeks, or the second nap pushes bedtime too late.'
    },
    {
      id: '16-18mo',
      label: '16–18 months',
      ageLabel: '16–18 months',
      minMonths: 16,
      maxMonths: 18,
      wakeWindow: { min: 240, max: 330, unit: 'min' },
      naps: { min: 1, max: 1, label: '1' },
      napSleepHours: { min: 2, max: 3 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 12, max: 14 },
      feedingsPerNight: '0',
      canSelfSoothe: true,
      notes: 'One midday nap is standard. The 18-month regression (language explosion, independence, teething) can cause bedtime resistance and night waking.'
    },
    {
      id: '19-24mo',
      label: '19–24 months',
      ageLabel: '19–24 months',
      minMonths: 19,
      maxMonths: 24,
      wakeWindow: { min: 300, max: 360, unit: 'min' },
      naps: { min: 1, max: 1, label: '1' },
      napSleepHours: { min: 1.5, max: 2.5 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 11, max: 14 },
      feedingsPerNight: '0',
      canSelfSoothe: true,
      notes: 'Toddlers thrive on routine and consistency. Bedtime resistance ("one more book!") is common. Offering limited choices helps: "Do you want the blue pajamas or the green ones?"'
    },
    {
      id: '2-3yr',
      label: '2–3 years',
      ageLabel: '2–3 years',
      minMonths: 24,
      maxMonths: 36,
      wakeWindow: { min: 300, max: 420, unit: 'min' },
      naps: { min: 0, max: 1, label: '0–1' },
      napSleepHours: { min: 0, max: 2 },
      nightSleepHours: { min: 10, max: 12 },
      totalSleepHours: { min: 11, max: 14 },
      feedingsPerNight: '0',
      canSelfSoothe: true,
      notes: 'Many children drop the nap between 2.5–3.5 years. Signs: nap causes late bedtime, or child is not tired at nap time for 2+ weeks. Introduce quiet time as a nap replacement.'
    }
  ],

  regressions: [
    {
      ageMonths: 4,
      label: '4-Month Regression',
      description: 'Sleep cycles permanently mature from newborn to adult-like patterns. This is the most significant sleep change and often the most disruptive.',
      duration: '2–6 weeks',
      signs: [
        'Frequent night waking (every 1–2 hours)',
        'Short naps (30–45 minutes)',
        'Fussiness at bedtime',
        'Increased hunger or comfort feeding'
      ],
      tips: [
        'This is developmental, not behavioral — it will pass',
        'Keep the room very dark',
        'Maintain a consistent bedtime routine',
        'Offer extra feeds if needed',
        'Practice putting baby down drowsy but awake'
      ]
    },
    {
      ageMonths: 8,
      label: '8-Month Regression',
      description: 'Driven by separation anxiety, crawling, pulling up, and brain development. Baby may stand in the crib and not know how to get back down.',
      duration: '2–4 weeks',
      signs: [
        'Crying when put down',
        'Standing in crib at night',
        'Fighting naps',
        'Increased clinginess during the day'
      ],
      tips: [
        'Practice sitting down from standing during the day',
        'Extra reassurance at bedtime, but try to keep routine consistent',
        'Peek-a-boo and short separations during the day build confidence',
        'Avoid starting new sleep habits you don\'t want long-term'
      ]
    },
    {
      ageMonths: 12,
      label: '12-Month Regression',
      description: 'Often linked to walking, standing, and rapid brain development. Some babies briefly resist the second nap — this doesn\'t mean they\'re ready for one nap.',
      duration: '2–4 weeks',
      signs: [
        'Refusing the second nap',
        'Practicing standing/walking in the crib',
        'Night waking after months of sleeping through',
        'Bedtime resistance'
      ],
      tips: [
        'Keep offering 2 naps — most babies aren\'t ready for 1 nap until 14–16 months',
        'Let baby practice new motor skills during the day',
        'Stay consistent with your bedtime routine',
        'This phase is usually shorter than the 4-month regression'
      ]
    },
    {
      ageMonths: 18,
      label: '18-Month Regression',
      description: 'A language explosion, growing independence ("No!"), teething (molars), and separation anxiety all converge. Often considered the toughest regression for parents.',
      duration: '2–6 weeks',
      signs: [
        'Sudden bedtime battles and screaming',
        'Night waking and difficulty resettling',
        'Nap refusal',
        'Increased tantrums and clinginess'
      ],
      tips: [
        'Stay firm and consistent with boundaries',
        'Keep the routine exactly the same',
        'Offer comfort but avoid creating new sleep crutches',
        'Give extra quality time and connection during the day',
        'Pain relief for teething if needed (consult pediatrician)'
      ]
    },
    {
      ageMonths: 24,
      label: '2-Year Regression',
      description: 'Growing independence, imagination (new fears), and possibly a new sibling or life change. Toddlers may start climbing out of the crib.',
      duration: '2–4 weeks',
      signs: [
        'Stalling at bedtime ("one more story")',
        'New fears (dark, monsters)',
        'Climbing out of crib',
        'Early morning waking'
      ],
      tips: [
        'Offer limited choices to give a sense of control',
        'A small nightlight is fine if afraid of the dark',
        'Use a toddler clock to teach "okay to wake" time',
        'Consistent, calm response to stalling',
        'If climbing out of crib, it may be time for a toddler bed'
      ]
    }
  ],

  troubleshooting: [
    {
      id: 'wont-nap',
      title: "Won't Nap / Fights Naps",
      icon: '😫',
      ageRelevance: [0, 36],
      causes: [
        'Overtired — missed the wake window',
        'Undertired — wake window too short for their age',
        'Sleep environment not dark enough',
        'Hunger',
        'Developmental leap or new skill'
      ],
      solutions: [
        'Check the recommended wake window for your baby\'s age',
        'Make the room very dark (blackout curtains)',
        'Use white noise',
        'Try a short pre-nap routine (5 minutes: diaper, sleep sack, song)',
        'Watch for sleepy cues: yawning, eye rubbing, staring, fussiness'
      ]
    },
    {
      id: 'night-waking',
      title: 'Frequent Night Waking',
      icon: '🌙',
      ageRelevance: [0, 36],
      causes: [
        'Sleep association (needs rocking, feeding, or pacifier to fall back asleep)',
        'Hunger (especially under 6 months)',
        'Overtiredness at bedtime',
        'Room too bright, noisy, or wrong temperature',
        'Developmental regression',
        'Illness or teething pain'
      ],
      solutions: [
        'Work on independent sleep at bedtime — how they fall asleep is how they expect to fall back asleep',
        'Rule out hunger (ensure adequate daytime feeds)',
        'Check wake windows — an overtired baby wakes more',
        'Keep the room dark and use continuous white noise all night',
        'Wait a few minutes before responding — baby may resettle',
        'Keep night interactions boring: dim light, minimal talking'
      ]
    },
    {
      id: 'early-waking',
      title: 'Early Morning Waking',
      icon: '🌅',
      ageRelevance: [3, 36],
      causes: [
        'Bedtime too late (counterintuitively, this causes early waking)',
        'Too much daytime sleep',
        'Light leaking into the room at dawn',
        'Hunger',
        'Habitual waking (body clock set too early)'
      ],
      solutions: [
        'Try an earlier bedtime (even 15–30 minutes can help)',
        'Ensure room is pitch dark (check for light gaps)',
        'Don\'t start the day before 6:00 AM — keep it dark and boring',
        'Check that total daytime nap hours aren\'t too high for their age',
        'A toddler clock can help older children learn when it\'s okay to get up'
      ]
    },
    {
      id: 'bedtime-battles',
      title: 'Bedtime Resistance',
      icon: '🙅',
      ageRelevance: [6, 36],
      causes: [
        'Undertired (bedtime too early or last nap too late)',
        'Overtired (missed the sleep window, now wired)',
        'Too much screen time before bed',
        'Inconsistent routine',
        'Seeking attention or control (toddlers)'
      ],
      solutions: [
        'Adjust bedtime based on when the last nap ended',
        'No screens for at least 1 hour before bed',
        'Follow the same routine in the same order every night',
        'Give toddlers choices within the routine ("Which book tonight?")',
        'Set clear, calm limits: "One book, one song, then sleep"'
      ]
    },
    {
      id: 'short-naps',
      title: 'Short Naps (Under 45 min)',
      icon: '⏱️',
      ageRelevance: [0, 18],
      causes: [
        'Normal for babies under 5 months (sleep cycles are 30–45 min)',
        'Wake window too short (not tired enough for deep sleep)',
        'Wake window too long (overtired, can\'t link cycles)',
        'Sleep environment issues (light, noise)',
        'Hunger'
      ],
      solutions: [
        'Under 5 months: short naps are developmentally normal and will lengthen',
        'Fine-tune wake windows — try adding 10–15 minutes',
        'Make the room completely dark',
        'Use white noise for the entire nap',
        'Try "crib hour": leave baby in crib for 60 min total to practice extending',
        'Ensure baby falls asleep independently (not rocked/fed to sleep)'
      ]
    },
    {
      id: 'nap-transitions',
      title: 'Dropping a Nap',
      icon: '📉',
      ageRelevance: [4, 36],
      causes: [
        'Baby is outgrowing their current schedule',
        'The last nap is pushing bedtime too late',
        'Baby consistently fights one of their naps for 2+ weeks'
      ],
      solutions: [
        '4→3 naps: around 4–5 months. Stretch wake windows gradually',
        '3→2 naps: around 6–8 months. The third catnap drops naturally',
        '2→1 nap: around 14–16 months. Move the single nap to midday',
        '1→0 naps: around 2.5–3.5 years. Replace with quiet time',
        'During transitions, temporarily move bedtime earlier to prevent overtiredness',
        'Transitions take 2–4 weeks — expect some rough days'
      ]
    },
    {
      id: 'regressions',
      title: 'Sleep Regressions',
      icon: '🔄',
      ageRelevance: [3, 30],
      causes: [
        'Developmental milestones (rolling, crawling, walking, talking)',
        'Brain maturation changing sleep architecture (especially 4 months)',
        'Separation anxiety peaks (8 and 18 months)',
        'Growing independence and boundary testing (18–24 months)'
      ],
      solutions: [
        'Stay as consistent as possible with your routine',
        'Offer extra comfort during the day',
        'Don\'t start new sleep habits you\'ll need to undo later',
        'Regressions are temporary — most last 2–6 weeks',
        'See the Schedule tab for regression details at specific ages'
      ]
    },
    {
      id: 'day-night-confusion',
      title: 'Day/Night Confusion',
      icon: '🔀',
      ageRelevance: [0, 3],
      causes: [
        'Completely normal in newborns — their circadian rhythm hasn\'t developed yet',
        'Baby was on a reversed schedule in the womb',
        'Too dark during the day / too bright at night'
      ],
      solutions: [
        'During the day: keep the house bright and don\'t tiptoe around noise',
        'At night: keep lights very dim, minimize stimulation, boring feeds',
        'Get outside in natural daylight during the day',
        'This usually resolves by 6–8 weeks as the circadian rhythm develops',
        'Don\'t cap daytime naps yet for newborns under 4 weeks'
      ]
    }
  ],

  environment: {
    temperature: {
      title: 'Room Temperature',
      icon: '🌡️',
      recommendation: '20–22°C (68–72°F)',
      details: 'A slightly cool room is better for sleep than a warm one. Overheating is a risk factor for SIDS.',
      tips: [
        'Use a room thermometer — your body adjusts to the room and can\'t gauge it accurately',
        'Dress baby in one more layer than you would wear',
        'Feel baby\'s chest or back of neck to check temperature (hands and feet are often cool and not reliable)',
        'No loose blankets under 12 months — use a sleep sack instead'
      ],
      togGuide: [
        { temp: 'Above 24°C (75°F)', clothing: 'Diaper/bodysuit only', tog: '0.5 TOG or none' },
        { temp: '22–24°C (72–75°F)', clothing: 'Short-sleeve bodysuit', tog: '0.5–1.0 TOG' },
        { temp: '20–22°C (68–72°F)', clothing: 'Long-sleeve bodysuit', tog: '1.0 TOG' },
        { temp: '18–20°C (64–68°F)', clothing: 'Long-sleeve bodysuit + pajamas', tog: '1.0–2.5 TOG' },
        { temp: 'Below 18°C (64°F)', clothing: 'Long-sleeve bodysuit + warm pajamas', tog: '2.5 TOG' }
      ]
    },
    darkness: {
      title: 'Darkness',
      icon: '🌑',
      recommendation: 'As dark as possible for sleep',
      details: 'Darkness triggers melatonin production, the hormone that signals sleep. Even small amounts of light can suppress melatonin and disrupt sleep.',
      tips: [
        'Use blackout curtains or blinds — the room should be dark enough that you can\'t read a book',
        'Cover any LED lights on monitors, humidifiers, etc.',
        'For night feedings, use a dim red or orange nightlight (not blue/white light)',
        'Keep the house bright during the day to reinforce the circadian rhythm',
        'A nightlight is fine for toddlers who develop fear of the dark — choose warm/red tones'
      ]
    },
    sound: {
      title: 'White Noise',
      icon: '🔊',
      recommendation: 'Continuous white noise at ~50 dB',
      details: 'White noise mimics the sounds of the womb, helps baby relax, and masks household sounds that could wake them.',
      tips: [
        'Place the sound machine across the room, not right next to the crib',
        'Keep volume around 50 dB (about the level of a shower running)',
        'Use it for all sleep — naps and nighttime',
        'Continuous sound is better than music or sounds that turn off after a timer',
        'Rain, fan, or static sounds are all effective',
        'Don\'t worry about dependency — white noise is easy to wean when the time comes'
      ]
    },
    safeSleep: {
      title: 'Safe Sleep (AAP Guidelines)',
      icon: '🛡️',
      recommendation: 'Follow the ABCs: Alone, on their Back, in a Crib',
      details: 'The American Academy of Pediatrics safe sleep guidelines significantly reduce the risk of SIDS and sleep-related infant deaths.',
      rules: [
        'Always place baby on their back to sleep — until they can roll both ways independently',
        'Use a firm, flat sleep surface (crib, bassinet, or play yard that meets safety standards)',
        'No blankets, pillows, bumpers, stuffed animals, or positioners in the sleep space',
        'Room-sharing (not bed-sharing) is recommended for at least the first 6 months',
        'No sleep positioners, wedges, or inclined sleepers',
        'Offer a pacifier at sleep time — this can reduce SIDS risk',
        'No smoking in the home or around baby',
        'Avoid overheating — no hats indoors for sleep',
        'Once baby rolls independently, it\'s okay if they roll to their stomach during sleep'
      ],
      source: 'American Academy of Pediatrics (AAP), 2022 updated guidelines'
    }
  },

  routines: [
    {
      ageRange: '0–3 months',
      label: 'Newborn',
      minMonths: 0,
      maxMonths: 3,
      bedtime: {
        totalDuration: '15–20 minutes',
        steps: [
          { icon: '💡', step: 'Dim the lights in the house', duration: '30 min before' },
          { icon: '🛁', step: 'Warm bath (optional, 2–3x per week)', duration: '5–10 min' },
          { icon: '👶', step: 'Fresh diaper & pajamas', duration: '3 min' },
          { icon: '🍼', step: 'Feed (breast or bottle)', duration: '15–20 min' },
          { icon: '🌯', step: 'Swaddle (until signs of rolling)', duration: '2 min' },
          { icon: '🔊', step: 'Turn on white noise', duration: '—' },
          { icon: '🛏️', step: 'Place drowsy but awake in crib', duration: '—' }
        ]
      },
      nap: {
        totalDuration: '5 minutes',
        steps: [
          { icon: '🌑', step: 'Darken the room', duration: '—' },
          { icon: '👶', step: 'Fresh diaper & sleep sack', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Place drowsy but awake', duration: '—' }
        ]
      },
      tip: '"Drowsy but awake" is the goal, but don\'t stress if it doesn\'t work every time at this age. You\'re planting seeds for later.'
    },
    {
      ageRange: '4–6 months',
      label: 'Infant',
      minMonths: 4,
      maxMonths: 6,
      bedtime: {
        totalDuration: '20–30 minutes',
        steps: [
          { icon: '💡', step: 'Dim lights, calm the house', duration: '30 min before' },
          { icon: '🛁', step: 'Bath time', duration: '10 min' },
          { icon: '🧴', step: 'Lotion & baby massage (optional)', duration: '3 min' },
          { icon: '👶', step: 'Pajamas & sleep sack', duration: '3 min' },
          { icon: '🍼', step: 'Feed (try to keep baby awake)', duration: '15 min' },
          { icon: '📖', step: 'Short book (1–2 board books)', duration: '3 min' },
          { icon: '🎵', step: 'Song or lullaby', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Place awake in crib, say goodnight', duration: '—' }
        ]
      },
      nap: {
        totalDuration: '5 minutes',
        steps: [
          { icon: '🌑', step: 'Darken the room', duration: '—' },
          { icon: '👶', step: 'Sleep sack on', duration: '2 min' },
          { icon: '📖', step: 'Quick book or song', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Place awake in crib', duration: '—' }
        ]
      },
      tip: 'At this age, try to separate feeding from the moment of falling asleep. Feed earlier in the routine so baby doesn\'t associate eating with sleeping.'
    },
    {
      ageRange: '7–12 months',
      label: 'Older Baby',
      minMonths: 7,
      maxMonths: 12,
      bedtime: {
        totalDuration: '25–30 minutes',
        steps: [
          { icon: '💡', step: 'Dim lights, start winding down', duration: '30 min before' },
          { icon: '🛁', step: 'Bath time', duration: '10 min' },
          { icon: '🧴', step: 'Lotion & gentle massage', duration: '3 min' },
          { icon: '👶', step: 'Pajamas & sleep sack', duration: '3 min' },
          { icon: '🍼', step: 'Milk (bottle or breast)', duration: '10 min' },
          { icon: '🪥', step: 'Brush teeth/gums', duration: '1 min' },
          { icon: '📖', step: 'Read 2–3 books together', duration: '5 min' },
          { icon: '🎵', step: 'Lullaby or quiet song', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Into crib awake, say goodnight', duration: '—' }
        ]
      },
      nap: {
        totalDuration: '5 minutes',
        steps: [
          { icon: '🌑', step: 'Close curtains, darken room', duration: '—' },
          { icon: '👶', step: 'Sleep sack on', duration: '2 min' },
          { icon: '📖', step: 'One short book', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Into crib awake', duration: '—' }
        ]
      },
      tip: 'Consistency is your superpower now. Do the same routine in the same order every night. Baby will start anticipating sleep, which makes the whole process smoother.'
    },
    {
      ageRange: '12–24 months',
      label: 'Toddler',
      minMonths: 12,
      maxMonths: 24,
      bedtime: {
        totalDuration: '25–30 minutes',
        steps: [
          { icon: '📵', step: 'Screens off, start calming down', duration: '1 hour before' },
          { icon: '🍽️', step: 'Snack if needed (nothing sugary)', duration: '5 min' },
          { icon: '🛁', step: 'Bath time', duration: '10 min' },
          { icon: '👶', step: 'Pajamas & sleep sack or blanket', duration: '3 min' },
          { icon: '🪥', step: 'Brush teeth', duration: '2 min' },
          { icon: '📖', step: 'Read 2–3 books (let them choose)', duration: '5–10 min' },
          { icon: '🧸', step: 'Cuddle with lovey/transitional object', duration: '—' },
          { icon: '🎵', step: 'Lullaby or quiet chat about the day', duration: '2 min' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Into crib/bed, say goodnight', duration: '—' }
        ]
      },
      nap: {
        totalDuration: '5–10 minutes',
        steps: [
          { icon: '🌑', step: 'Darken the room', duration: '—' },
          { icon: '👶', step: 'Sleep sack or blanket', duration: '2 min' },
          { icon: '📖', step: 'One book', duration: '3 min' },
          { icon: '🧸', step: 'Lovey', duration: '—' },
          { icon: '🔊', step: 'White noise on', duration: '—' },
          { icon: '🛏️', step: 'Into crib/bed', duration: '—' }
        ]
      },
      tip: 'Give your toddler small choices within the routine — which pajamas, which books, which stuffed animal. This gives them a sense of control and reduces battles.'
    },
    {
      ageRange: '2–3 years',
      label: 'Older Toddler',
      minMonths: 24,
      maxMonths: 36,
      bedtime: {
        totalDuration: '30 minutes',
        steps: [
          { icon: '📵', step: 'Screens off', duration: '1 hour before' },
          { icon: '🍽️', step: 'Light snack & water', duration: '5 min' },
          { icon: '🛁', step: 'Bath or wash up', duration: '10 min' },
          { icon: '🚽', step: 'Potty / diaper', duration: '3 min' },
          { icon: '👶', step: 'Pajamas (let them help)', duration: '3 min' },
          { icon: '🪥', step: 'Brush teeth', duration: '2 min' },
          { icon: '📖', step: 'Read 2–3 books together', duration: '10 min' },
          { icon: '🎵', step: 'One song or quiet talk', duration: '2 min' },
          { icon: '🧸', step: 'Tuck in with lovey', duration: '—' },
          { icon: '😴', step: 'Goodnight — leave the room', duration: '—' }
        ]
      },
      nap: {
        totalDuration: '5 minutes',
        note: 'If dropping the nap, replace with 45–60 min of quiet time (books, puzzles, calm play in their room).',
        steps: [
          { icon: '🌑', step: 'Darken the room', duration: '—' },
          { icon: '📖', step: 'One short book or quiet chat', duration: '3 min' },
          { icon: '🧸', step: 'Tuck in with lovey', duration: '—' },
          { icon: '😴', step: '"Quiet time" or nap', duration: '—' }
        ]
      },
      tip: 'Set clear limits to prevent stalling: "We read two books, then it\'s time to sleep." A toddler clock that changes color at wake-up time can be a game-changer.'
    }
  ]
};
