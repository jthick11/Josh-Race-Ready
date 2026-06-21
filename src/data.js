// ── CONSTANTS ──────────────────────────────────────────────────────────────

export const RACE_DATE = new Date("2025-09-20T07:00:00");
export const PLAN_START = new Date("2025-06-21T00:00:00");

export const WEEK_SCHEDULE = [
  {
    day: "Monday",
    short: "MON",
    type: "recovery",
    badge: "Recovery + Lower Body",
    color: "#4AACFF",
    run: true,
    lift: "Lower Body",
    quote: { text: "Success isn't owned. It's leased — and rent is due every day.", attr: "J.J. Watt" },
    runDetail: "Easy conversational pace. Nose breathing only. If you can't speak in full sentences, slow down. This builds your aerobic base — not a test of toughness.",
    liftDetail: "Single Leg RDL 4×10 each · Bulgarian Split Squat 3×8 each · Hip Thrust 4×12 · Nordic Hamstring Curl 3×8 · Eccentric Calf Raise 4×15 slow · Copenhagen Plank 3×30s each",
    meal: {
      preRun: "2 eggs + banana or overnight oats with protein powder",
      postWorkout: "40g whey shake + grilled chicken thighs over white rice — season heavy, make enough for 2 meals",
      lunch: "Leftover chicken thighs, white rice, roasted vegetables with hot sauce",
      dinner: "Pan-seared salmon fillet, roasted sweet potato, sautéed spinach with garlic",
      snack: "Greek yogurt + granola or almonds + string cheese"
    }
  },
  {
    day: "Tuesday",
    short: "TUE",
    type: "hard",
    badge: "Intervals + Upper Body",
    color: "#E8FF47",
    run: true,
    lift: "Upper Body",
    quote: { text: "The cave you fear to enter holds the treasure you seek.", attr: "Joseph Campbell" },
    runDetail: "Norwegian 4×4 — 4 min at 90-95% max HR (165-175+ bpm), 3 min active recovery jog between. You should NOT be able to speak during the 4 min efforts. Warm-up 10 min easy, cooldown 10 min easy.",
    liftDetail: "Bench Press 4×6-8 · Weighted Pull-ups 4×8 · DB Shoulder Press 3×10 · Cable Rows 3×10 · Incline DB Fly 3×12 · Face Pulls 3×15 · Bicep Curl + Tricep Pushdown superset 3×12",
    meal: {
      preRun: "Toast + peanut butter + banana or rice cakes + honey",
      postWorkout: "40g whey immediately + smoked wings off the RecTeq, white rice within 60 min",
      lunch: "Albacore tuna wrap — avocado, jalapeño, whole grain tortilla",
      dinner: "Smoked chicken thighs, roasted potatoes, charred broccolini with lemon",
      snack: "Cottage cheese + pineapple or hard-boiled eggs"
    }
  },
  {
    day: "Wednesday",
    short: "WED",
    type: "rest",
    badge: "Full Rest",
    color: "#3DFFA0",
    run: false,
    lift: null,
    quote: { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", attr: "Albert Camus" },
    runDetail: null,
    liftDetail: "No lifting. 20-30 min walk + foam roll IT band, quads, hip flexors, calves. Sauna at Crunch 20 min. Recovery machines if available.",
    meal: {
      preRun: null,
      postWorkout: null,
      lunch: "Salmon rice bowl — seared salmon, jasmine rice, cucumber, avocado, sesame, soy-ginger drizzle",
      dinner: "Baked cod or tilapia, roasted asparagus, quinoa",
      snack: "Apple + almond butter or Greek yogurt. 100+ oz water today."
    }
  },
  {
    day: "Thursday",
    short: "THU",
    type: "tempo",
    badge: "Tempo + Upper Body",
    color: "#4AACFF",
    run: true,
    lift: "Upper Body (Lower Vol)",
    quote: { text: "Suffering is not a problem to be solved. It is a gift that reveals who you are becoming.", attr: "Marcus Aurelius (paraphrased)" },
    runDetail: "5-6 miles total. Miles 1-2 easy. Miles 3-4 at tempo effort — comfortably hard, can speak in short phrases but wouldn't want to. Miles 5-6 easy cooldown. Extend tempo segment as weeks progress.",
    liftDetail: "Incline DB Press 3×8 · Seated Cable Row 3×10 · Lateral Raises 3×15 · Pull-ups 3×max · Core: Dead Bugs 3×12, Pallof Press 3×12, Plank 3×45s",
    meal: {
      preRun: "Banana + protein shake or 2 rice cakes with peanut butter",
      postWorkout: "Whey shake + NY strip or ribeye on the charcoal grill, roasted potatoes, side salad",
      lunch: "Turkey or chicken wrap with rice, avocado, hot sauce",
      dinner: "Shrimp stir fry — garlic, ginger, soy, sesame oil, snap peas, bell pepper over jasmine rice",
      snack: "Mixed nuts + string cheese or protein bar"
    }
  },
  {
    day: "Friday",
    short: "FRI",
    type: "hard",
    badge: "Hard Effort — Run Only",
    color: "#FF5252",
    run: true,
    lift: null,
    quote: { text: "Do not pray for an easy life. Pray for the strength to endure a difficult one.", attr: "Bruce Lee" },
    runDetail: "Sprint intervals or sustained hard effort per NRC coach. Full 12 min dynamic warm-up. Max effort during work intervals — hold nothing back. Full recovery between efforts. 10 min easy jog cooldown. No lifting today — full stop.",
    liftDetail: null,
    meal: {
      preRun: "High carb — oatmeal + banana + honey or bagel with eggs",
      postWorkout: "Whey shake immediately + real meal within 60 min",
      lunch: "Pasta or rice heavy — chicken pasta marinara or rice bowl. Start loading glycogen for Saturday.",
      dinner: "PRE-LOAD TONIGHT: Smoked salmon + white rice + roasted vegetables. Carb-heavy, clean. This fuels Saturday's long run. 80/20 flex — go enjoy dinner with Gray, just keep it carb-leaning.",
      snack: "Fruit + electrolytes. Hydrate hard tonight."
    }
  },
  {
    day: "Saturday",
    short: "SAT",
    type: "long",
    badge: "Long Run — Sacred",
    color: "#FF9A3C",
    run: true,
    lift: null,
    quote: { text: "The body is the temple. Every mile is a prayer. You are not running away from anything — you are running toward who you are becoming.", attr: "Coach" },
    runDetail: "The most important session of the week. Run controlled — finish knowing you had 10-15% left in the tank. This is not a race. Hydrate every 3-4 miles. At 8+ miles introduce a gel at the 45 min mark. Practice race day fueling every long run.",
    liftDetail: null,
    meal: {
      preRun: "90 min before: 2 eggs + oatmeal + banana + honey. Substantial — you're going long.",
      postWorkout: "Whey shake + banana within 30 min. Then fire up the RecTeq — smoked chicken thighs or ribs, sweet potato, corn on the cob.",
      lunch: null,
      dinner: "You earned this. Ribeye or NY strip on the charcoal grill, roasted potatoes, salad. 80/20 meal — dessert, a drink, whatever. Celebrate the long run.",
      snack: "Cold water or ice bath 10 min post-run. Legs elevated 20 min. Sauna in the evening (not immediately)."
    }
  },
  {
    day: "Sunday",
    short: "SUN",
    type: "rest",
    badge: "Full Rest",
    color: "#3DFFA0",
    run: false,
    lift: null,
    quote: { text: "There is a voice that doesn't use words. Listen.", attr: "Rumi" },
    runDetail: null,
    liftDetail: "Complete rest. Light walk if restless. Sauna optional. Meal prep for the week. Review training data.",
    meal: {
      preRun: null,
      postWorkout: null,
      lunch: "Grilled wings or chicken thighs + rice + vegetables. Meal prep here for Mon/Tue if you want.",
      dinner: "80/20 — whatever you want. You put in the work. Enjoy Sunday.",
      snack: "100+ oz water. Electrolytes if Saturday's long run left you depleted."
    }
  }
];

// ── HELPERS ────────────────────────────────────────────────────────────────

export function formatPace(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function paceToSec(str) {
  if (!str || !str.includes(":")) return 540;
  const [m, s] = str.split(":").map(Number);
  return m * 60 + (s || 0);
}

export function weeksUntilRace() {
  const now = new Date();
  const diff = RACE_DATE - now;
  return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

export function currentWeekNum() {
  const now = new Date();
  const diff = now - PLAN_START;
  return Math.min(11, Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
}

export function buildInitialWeeks() {
  return Array.from({ length: 11 }, (_, i) => {
    const weekNum = i + 1;
    const baseMiles = Math.min(16 + Math.floor(i * 1.6), 32);
    const deload = weekNum % 3 === 0;
    const miles = deload ? Math.round(baseMiles * 0.8) : baseMiles;
    const easyPaceSec = Math.max(510, 570 - i * 5);
    const tempoPaceSec = Math.max(450, 510 - i * 5);
    const intervalPaceSec = Math.max(420, 480 - i * 6);
    const longMiles = Math.min(6 + Math.floor(i * 0.7), 12);
    return {
      week: weekNum,
      totalMiles: miles,
      longMiles,
      easyPace: formatPace(easyPaceSec),
      tempoPace: formatPace(tempoPaceSec),
      intervalPace: formatPace(intervalPaceSec),
      deload,
      phase: weekNum <= 7 ? "build" : weekNum <= 10 ? "peak" : "taper",
      completed: false,
      actualMiles: null,
      notes: ""
    };
  });
}

// ── ICS GENERATOR ─────────────────────────────────────────────────────────

export function generateICS(weeks, schedule) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Josh Race Ready//Training Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Josh Race Ready Training",
    "X-WR-TIMEZONE:America/New_York",
    "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
    "X-PUBLISHED-TTL:PT4H"
  ];

  const startDate = new Date(PLAN_START);

  weeks.forEach((wk, wi) => {
    schedule.forEach((day, di) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + wi * 7 + di);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, "").split("T")[0];
      const uid = `josh-raceready-w${wi}-d${di}@raceready.vercel.app`;

      let desc = `"${day.quote.text}" — ${day.quote.attr}\\n\\n`;

      if (day.run) {
        const pace = day.type === "tempo" ? `Easy: ${wk.easyPace} → Tempo: ${wk.tempoPace}`
          : day.type === "hard" ? `Effort: ${wk.intervalPace}/mi`
          : day.type === "long" ? `${wk.longMiles} mi @ ${wk.easyPace}/mi`
          : `Easy @ ${wk.easyPace}/mi`;
        desc += `RUN — ${day.badge}\\nPace: ${pace}\\n${day.runDetail}\\n\\n`;
      }

      if (day.lift) {
        desc += `LIFT — ${day.lift}\\n${day.liftDetail}\\n\\n`;
      }

      if (!day.run && !day.lift) {
        desc += `REST DAY\\n${day.liftDetail}\\n\\n`;
      }

      desc += `MEALS\\n`;
      if (day.meal.preRun) desc += `Pre-Run: ${day.meal.preRun}\\n`;
      if (day.meal.postWorkout) desc += `Post-Workout: ${day.meal.postWorkout}\\n`;
      if (day.meal.lunch) desc += `Lunch: ${day.meal.lunch}\\n`;
      if (day.meal.dinner) desc += `Dinner: ${day.meal.dinner}\\n`;
      if (day.meal.snack) desc += `Snack/Recovery: ${day.meal.snack}\\n`;
      desc += `\\nWeek ${wk.week} Targets: ${wk.totalMiles} total miles · Easy ${wk.easyPace} · Tempo ${wk.tempoPace} · Intervals ${wk.intervalPace}`;
      if (wk.deload) desc += `\\nDELOAD WEEK — Pull back 20% on effort. Recovery is the workout.`;
      if (wk.notes) desc += `\\nCoach Notes: ${wk.notes}`;

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${day.badge} — Week ${wk.week}`,
        `DESCRIPTION:${desc}`,
        `CATEGORIES:Training`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
