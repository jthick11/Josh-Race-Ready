// api/calendar.js
// Vercel serverless function — serves a live ICS feed
// Subscribe to: https://your-app.vercel.app/api/calendar
// This URL can be added to Google Calendar, Apple Calendar, or Outlook as a subscription

const RACE_DATE = new Date("2025-09-20T07:00:00");
const PLAN_START = new Date("2025-06-21T00:00:00");

const WEEK_SCHEDULE = [
  {
    day: "Monday", type: "recovery", badge: "Recovery Run + Lower Body",
    quote: { text: "Success isn't owned. It's leased — and rent is due every day.", attr: "J.J. Watt" },
    runDetail: "Easy conversational pace. Nose breathing only. If you can't speak in full sentences, slow down.",
    liftDetail: "Single Leg RDL 4×10 · Bulgarian Split Squat 3×8 · Hip Thrust 4×12 · Nordic Curl 3×8 · Eccentric Calf Raise 4×15 · Copenhagen Plank 3×30s",
  },
  {
    day: "Tuesday", type: "hard", badge: "Intervals + Upper Body",
    quote: { text: "The cave you fear to enter holds the treasure you seek.", attr: "Joseph Campbell" },
    runDetail: "Norwegian 4×4: 4 min at 90-95% max HR, 3 min recovery jog. Warm-up 10 min easy, cooldown 10 min easy.",
    liftDetail: "Bench Press 4×6-8 · Weighted Pull-ups 4×8 · DB Shoulder Press 3×10 · Cable Rows 3×10 · Face Pulls 3×15 · Bicep/Tricep superset 3×12",
  },
  {
    day: "Wednesday", type: "rest", badge: "Full Rest",
    quote: { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", attr: "Albert Camus" },
    runDetail: null,
    liftDetail: "No lifting. 20-30 min walk. Foam roll: IT band, quads, hip flexors, calves. Sauna 20 min.",
  },
  {
    day: "Thursday", type: "tempo", badge: "Tempo Run + Upper Body",
    quote: { text: "Suffering is not a problem to be solved. It is a gift that reveals who you are becoming.", attr: "Marcus Aurelius" },
    runDetail: "5-6 miles. Miles 1-2 easy. Miles 3-4 at tempo. Miles 5-6 easy cooldown.",
    liftDetail: "Incline DB Press 3×8 · Cable Row 3×10 · Lateral Raises 3×15 · Pull-ups 3×max · Core circuit",
  },
  {
    day: "Friday", type: "hard", badge: "Hard Effort — Run Only",
    quote: { text: "Do not pray for an easy life. Pray for the strength to endure a difficult one.", attr: "Bruce Lee" },
    runDetail: "Sprint intervals per NRC. Full 12 min warm-up. Max effort on work intervals. 10 min easy cooldown. NO LIFTING TODAY.",
    liftDetail: null,
  },
  {
    day: "Saturday", type: "long", badge: "Long Run — Sacred",
    quote: { text: "The body is the temple. Every mile is a prayer. You are running toward who you are becoming.", attr: "Coach" },
    runDetail: "Most important session of the week. Controlled pace — finish with 10-15% left. Hydrate every 3-4 miles. Gel at 45 min if 8+ miles.",
    liftDetail: null,
  },
  {
    day: "Sunday", type: "rest", badge: "Full Rest",
    quote: { text: "There is a voice that doesn't use words. Listen.", attr: "Rumi" },
    runDetail: null,
    liftDetail: "Complete rest. Light walk if restless. Sauna optional. Meal prep for the week.",
  },
];

function formatPace(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildWeeks() {
  return Array.from({ length: 11 }, (_, i) => {
    const weekNum = i + 1;
    const baseMiles = Math.min(16 + Math.floor(i * 1.6), 32);
    const deload = weekNum % 3 === 0;
    const miles = deload ? Math.round(baseMiles * 0.8) : baseMiles;
    return {
      week: weekNum,
      totalMiles: miles,
      longMiles: Math.min(6 + Math.floor(i * 0.7), 12),
      easyPace: formatPace(Math.max(510, 570 - i * 5)),
      tempoPace: formatPace(Math.max(450, 510 - i * 5)),
      intervalPace: formatPace(Math.max(420, 480 - i * 6)),
      deload,
      phase: weekNum <= 7 ? "build" : weekNum <= 10 ? "peak" : "taper",
    };
  });
}

function escapeICS(str) {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function generateICS(weeks) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Josh Race Ready//Training Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Josh Race Ready Training",
    "X-WR-TIMEZONE:America/New_York",
    "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
    "X-PUBLISHED-TTL:PT4H",
  ];

  weeks.forEach((wk, wi) => {
    WEEK_SCHEDULE.forEach((day, di) => {
      const eventDate = new Date(PLAN_START);
      eventDate.setDate(PLAN_START.getDate() + wi * 7 + di);
      const dateStr = eventDate.toISOString().split("T")[0].replace(/-/g, "");
      const uid = `josh-w${wi + 1}-d${di}@raceready`;

      let desc = `"${day.quote.text}" — ${day.quote.attr}\n\n`;

      if (day.runDetail) {
        const pace = day.type === "tempo"
          ? `Easy: ${wk.easyPace}/mi → Tempo: ${wk.tempoPace}/mi`
          : day.type === "hard" ? `Effort: ${wk.intervalPace}/mi`
          : day.type === "long" ? `${wk.longMiles} miles @ ${wk.easyPace}/mi`
          : `Easy @ ${wk.easyPace}/mi`;
        desc += `RUN — ${pace}\n${day.runDetail}\n\n`;
      }

      if (day.liftDetail) {
        desc += `LIFT\n${day.liftDetail}\n\n`;
      }

      if (!day.runDetail && !day.liftDetail) {
        desc += `REST DAY — Recovery is training.\n\n`;
      }

      desc += `Week ${wk.week} targets: ${wk.totalMiles} miles · Easy ${wk.easyPace} · Tempo ${wk.tempoPace} · Intervals ${wk.intervalPace}`;
      if (wk.deload) desc += `\nDELOAD WEEK — Pull back 20%. Recovery is the workout.`;

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${escapeICS(day.badge)} — Week ${wk.week}`,
        `DESCRIPTION:${escapeICS(desc)}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function handler(req, res) {
  const ics = generateICS(buildWeeks());
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=14400"); // 4 hour cache
  res.setHeader("Content-Disposition", 'inline; filename="josh_race_ready.ics"');
  res.status(200).send(ics);
}
