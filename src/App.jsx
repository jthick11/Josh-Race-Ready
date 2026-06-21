import { useState, useEffect, useRef, useCallback } from "react";
import {
  RACE_DATE, PLAN_START, WEEK_SCHEDULE,
  formatPace, paceToSec, weeksUntilRace, currentWeekNum,
  buildInitialWeeks, generateICS
} from "./data.js";
import { S, typeColor, phaseColor } from "./styles.js";

const STORAGE_WEEKS = "josh_weeks_v2";
const STORAGE_CHAT = "josh_chat_v2";

function loadWeeks() {
  try {
    const s = localStorage.getItem(STORAGE_WEEKS);
    return s ? JSON.parse(s) : buildInitialWeeks();
  } catch { return buildInitialWeeks(); }
}

function loadChat() {
  try {
    const s = localStorage.getItem(STORAGE_CHAT);
    return s ? JSON.parse(s) : [{
      role: "assistant",
      content: "What's good Josh. I'm your coach. Tell me how training is going — drop a note about today's workout, how you're feeling, or anything on your mind. You can upload a screenshot too if you want. Let's get to work."
    }];
  } catch {
    return [{
      role: "assistant",
      content: "What's good Josh. I'm your coach. Tell me how training is going — drop a note about today's workout, how you're feeling, or anything on your mind. You can upload a screenshot too if you want. Let's get to work."
    }];
  }
}

export default function App() {
  const [tab, setTab] = useState("today");
  const [weeks, setWeeks] = useState(loadWeeks);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [editingWeek, setEditingWeek] = useState(null);
  const [chat, setChat] = useState(loadChat);
  const [chatInput, setChatInput] = useState("");
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  const curWeekIdx = currentWeekNum() - 1;
  const curWeek = weeks[curWeekIdx] || weeks[0];
  const todaySched = WEEK_SCHEDULE[selectedDay];
  const weeksLeft = weeksUntilRace();

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_WEEKS, JSON.stringify(weeks)); } catch {}
  }, [weeks]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_CHAT, JSON.stringify(chat.slice(-50))); } catch {}
  }, [chat]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const updateWeek = (idx, field, val) =>
    setWeeks(prev => prev.map((w, i) => i === idx ? { ...w, [field]: val } : w));

  // Overtraining check
  const overtranedWeeks = weeks.reduce((acc, w, i) => {
    if (i === 0) return acc;
    const prev = weeks[i - 1].totalMiles;
    if (prev > 0 && ((w.totalMiles - prev) / prev) > 0.10) acc.push(w.week);
    return acc;
  }, []);

  const downloadICS = () => {
    const ics = generateICS(weeks, WEEK_SCHEDULE);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "josh_race_ready.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text && !imageData) return;

    const userMsg = { role: "user", content: text || "Here's my workout screenshot.", image: imageData };
    const newChat = [...chat, userMsg];
    setChat(newChat);
    setChatInput("");
    setImageData(null);
    setLoading(true);

    const wk = weeks[curWeekIdx] || weeks[0];
    const dayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const todayDay = WEEK_SCHEDULE[dayIdx];

    const systemPrompt = `You are Josh's personal half marathon and strength coach. Here's everything you know about him:

ATHLETE: Josh, 27yo, 5'11" 185 lbs, 15% body fat. Former D1 cornerback at Holy Cross. Former fitness coach. Strong athletic background — trains like an athlete in the gym. Currently transitioning to distance running.

RACE: September 20, 2025 — DC Half Marathon. Goal: Sub 1:45 (8:00/mi avg).

CURRENT TRAINING:
- Week ${wk.week} of 11
- Weekly mileage target: ${wk.totalMiles} miles
- Easy pace: ${wk.easyPace}/mi
- Tempo pace: ${wk.tempoPace}/mi  
- Interval effort: ${wk.intervalPace}/mi
- Long run: ${wk.longMiles} miles
- Phase: ${wk.phase}
${wk.deload ? "- THIS IS A DELOAD WEEK — 20% pullback on volume" : ""}

WEEKLY STRUCTURE:
- Monday: Recovery run (easy) + Lower body lift (run first, 15 min transition)
- Tuesday: Norwegian 4x4 intervals + Upper body lift (run first)
- Wednesday: Full rest / active recovery
- Thursday: Tempo run + Upper body lift lower volume (run first)
- Friday: Hard effort sprint intervals — NO LIFTING
- Saturday: Long run — NO LIFTING
- Sunday: Full rest

TODAY: ${todayDay.day} — ${todayDay.badge}
${todayDay.runDetail ? `Run: ${todayDay.runDetail}` : ""}
${todayDay.liftDetail ? `Lift: ${todayDay.liftDetail}` : ""}

KEY COACHING PRINCIPLES:
- Easy runs must stay easy — nose breathing, conversational
- Run always before lifting
- Never exceed 10% weekly mileage increase
- Upper body 2x/week for muscle maintenance (he has significant upper body muscle he wants to keep)
- No lower body lifting on interval/sprint days
- Friday = run only, protect Saturday long run
- Hamstring and achilles are his highest injury risk areas given DB/speed background

COACH PERSONALITY: Direct, no fluff, but warm and genuinely encouraging. You know this athlete well. You acknowledge hard days honestly. You give specific tactical feedback — not generic motivation. When he logs a workout, tell him what it means, whether to adjust, what to watch for next session. Keep responses to 3-5 sentences usually unless a detailed adjustment is needed. Occasionally drop something spiritual or meaningful when the moment calls for it — not forced, just real. Think trusted coach who's also a real one, not a chatbot.

IMPORTANT: Reference his specific paces and targets when giving feedback. If he's running too fast on easy days, call it out. If he crushed intervals, tell him what that means for his race trajectory. Make it personal and specific.`;

    try {
      const messages = newChat.slice(-12).map(m => {
        if (m.image) {
          return {
            role: m.role,
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: m.image } },
              { type: "text", text: m.content }
            ]
          };
        }
        return { role: m.role, content: m.content };
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages
        })
      });

      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text
        || "Something went wrong on my end. Try again.";
      setChat(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChat(prev => [...prev, { role: "assistant", content: "Connection issue. Give it a sec and try again." }]);
    }
    setLoading(false);
  }, [chatInput, imageData, chat, weeks, curWeekIdx]);

  // ── RENDER ─────────────────────────────────────────────────────────────

  return (
    <div style={S.app}>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <h1 style={S.h1}>JOSH <span style={S.accent}>// RACE READY</span></h1>
            <div style={S.sub}>Half Marathon · Sept 20, 2025 · DC · Sub 1:45</div>
          </div>
          <button style={{ ...S.btnOutline, marginTop: 0 }} onClick={downloadICS}>⬇ ICS</button>
        </div>
        <div style={S.statsRow}>
          {[
            { val: `${weeksLeft}`, label: "Weeks Left" },
            { val: `${curWeek.totalMiles}mi`, label: "This Week", color: "#E8FF47" },
            { val: curWeek.easyPace, label: "Easy", color: "#4AACFF" },
            { val: curWeek.tempoPace, label: "Tempo", color: "#E8FF47" },
            { val: `${curWeek.longMiles}mi`, label: "Long Run", color: "#FF9A3C" },
            { val: curWeek.phase.toUpperCase(), label: "Phase", color: phaseColor(curWeek.phase) },
          ].map(({ val, label, color }) => (
            <div key={label} style={S.statBox}>
              <div style={{ ...S.statVal, ...(color ? { color } : {}) }}>{val}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>
        {overtranedWeeks.length > 0 && (
          <div style={{ ...S.flag, marginTop: 12, marginBottom: 0 }}>
            ⚠️ <strong>Overtraining Flag — Week{overtranedWeeks.length > 1 ? "s" : ""} {overtranedWeeks.join(", ")}:</strong> Exceeds 10% mileage jump. Go to Full Plan tab and adjust those weeks before you get there.
          </div>
        )}
      </div>

      {/* NAV */}
      <div style={S.nav}>
        {[
          { id: "today", label: "Today" },
          { id: "week", label: "This Week" },
          { id: "plan", label: "Full Plan" },
          { id: "coach", label: "Coach" },
          { id: "meals", label: "Meals" },
        ].map(({ id, label }) => (
          <button key={id} style={S.navBtn(tab === id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div style={S.main}>

        {/* ── TODAY ── */}
        {tab === "today" && (
          <div>
            {/* Day tiles */}
            <div style={S.dayGrid}>
              {WEEK_SCHEDULE.map((d, i) => (
                <div key={i} style={S.dayTile(selectedDay === i, typeColor(d.type))} onClick={() => setSelectedDay(i)}>
                  <div style={{ fontSize: 9, color: selectedDay === i ? "#AAA" : "#333", fontWeight: 700, letterSpacing: "0.05em" }}>{d.short}</div>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: selectedDay === i ? typeColor(d.type) : "#222", margin: "6px auto 0" }} />
                </div>
              ))}
            </div>

            {/* Quote */}
            <div style={S.quoteBlock}>
              <div style={{ fontSize: 9, color: "#E8FF47", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Today's Fuel</div>
              <div style={{ fontSize: 13, color: "#AAA", fontStyle: "italic", lineHeight: 1.65 }}>"{todaySched.quote.text}"</div>
              <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>— {todaySched.quote.attr}</div>
            </div>

            {/* Badges */}
            <div style={{ marginBottom: 12 }}>
              <span style={S.pill(typeColor(todaySched.type))}>{todaySched.badge}</span>
              {todaySched.lift && <span style={S.pill("#C06EFF")}>{todaySched.lift}</span>}
              {curWeek.deload && <span style={S.pill("#FF9A3C")}>Deload Week</span>}
            </div>

            {/* Run block */}
            {todaySched.run && (
              <div style={{ ...S.card, borderLeft: `3px solid ${typeColor(todaySched.type)}` }}>
                <div style={{ ...S.cardTitle, color: typeColor(todaySched.type) }}>
                  Run First
                  {todaySched.lift ? " — 15 Min Transition to Lift" : ""}
                </div>

                {todaySched.type === "recovery" && (
                  <div style={{ fontSize: 12, color: "#AAA", marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#4AACFF", fontWeight: 600 }}>{curWeek.easyPace}/mi</span> — conversational, nose breathing. Should feel almost too easy.
                  </div>
                )}
                {todaySched.type === "tempo" && (
                  <div style={{ fontSize: 12, color: "#AAA", marginBottom: 8, lineHeight: 1.5 }}>
                    Easy <span style={{ color: "#4AACFF", fontWeight: 600 }}>{curWeek.easyPace}/mi</span> → Tempo <span style={{ color: "#E8FF47", fontWeight: 600 }}>{curWeek.tempoPace}/mi</span>
                  </div>
                )}
                {todaySched.type === "hard" && (
                  <div style={{ fontSize: 12, color: "#AAA", marginBottom: 8, lineHeight: 1.5 }}>
                    Effort pace: <span style={{ color: "#FF5252", fontWeight: 600 }}>{curWeek.intervalPace}/mi</span> — max output, full recovery between reps
                  </div>
                )}
                {todaySched.type === "long" && (
                  <div style={{ fontSize: 12, color: "#AAA", marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#FF9A3C", fontWeight: 600 }}>{curWeek.longMiles} miles @ {curWeek.easyPace}/mi</span> — controlled. Finish with gas left.
                  </div>
                )}

                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>{todaySched.runDetail}</div>
              </div>
            )}

            {/* Lift block */}
            {todaySched.lift && (
              <div style={{ ...S.card, borderLeft: "3px solid #C06EFF" }}>
                <div style={{ ...S.cardTitle, color: "#C06EFF" }}>{todaySched.lift}</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.75 }}>{todaySched.liftDetail}</div>
              </div>
            )}

            {/* Rest / no run */}
            {!todaySched.run && (
              <div style={{ ...S.card, borderLeft: "3px solid #3DFFA0" }}>
                <div style={{ ...S.cardTitle, color: "#3DFFA0" }}>Rest Day Protocol</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.75 }}>{todaySched.liftDetail}</div>
              </div>
            )}

            {/* No lift warning */}
            {todaySched.run && !todaySched.lift && (
              <div style={{ ...S.card, borderColor: "#FF444420", background: "#0D0808" }}>
                <div style={{ fontSize: 12, color: "#FF8080", lineHeight: 1.6 }}>
                  <strong>No lifting today.</strong> {todaySched.day === "Friday"
                    ? "Friday is run only. Your job tonight is to recover and be ready for Saturday's long run."
                    : todaySched.day === "Saturday"
                    ? "Saturday is run only. Foam roll, eat, recover. The RecTeq goes on tonight."
                    : "Rest and recover."}
                </div>
              </div>
            )}

            <button style={S.btn()} onClick={() => setTab("coach")}>Log with Coach →</button>
          </div>
        )}

        {/* ── THIS WEEK ── */}
        {tab === "week" && (
          <div>
            <div style={{ ...S.card, borderTop: `3px solid ${phaseColor(curWeek.phase)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ ...S.cardTitle, color: phaseColor(curWeek.phase), marginBottom: 6 }}>
                    Week {curWeek.week} — {curWeek.phase.toUpperCase()} PHASE
                  </div>
                  {curWeek.deload && <span style={S.pill("#FF9A3C")}>Deload Week — Pull Back 20%</span>}
                </div>
                <div style={{ ...S.statVal, fontSize: 28 }}>
                  {curWeek.totalMiles}<span style={{ fontSize: 13, color: "#444" }}>mi</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 10 }}>
                {[
                  { label: "Easy Pace", val: curWeek.easyPace, color: "#4AACFF" },
                  { label: "Tempo Pace", val: curWeek.tempoPace, color: "#E8FF47" },
                  { label: "Interval Effort", val: curWeek.intervalPace, color: "#FF5252" },
                  { label: "Long Run", val: `${curWeek.longMiles} mi`, color: "#FF9A3C" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ ...S.statBox, textAlign: "left", padding: "10px 12px" }}>
                    <div style={{ ...S.statVal, fontSize: 17, color }}>{val}</div>
                    <div style={S.statLabel}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {WEEK_SCHEDULE.map((day, i) => (
              <div key={i} style={{ ...S.card, borderLeft: `3px solid ${typeColor(day.type)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ ...S.cardTitle, color: typeColor(day.type), margin: 0 }}>{day.day}</div>
                  <span style={S.pill(typeColor(day.type))}>{day.badge}</span>
                </div>
                {day.run && (
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>
                    🏃 {day.type === "long" ? `${curWeek.longMiles} mi @ ${curWeek.easyPace}/mi`
                      : day.type === "tempo" ? `Tempo: ${curWeek.tempoPace}/mi`
                      : day.type === "hard" ? `Effort @ ${curWeek.intervalPace}/mi`
                      : `Easy @ ${curWeek.easyPace}/mi`}
                  </div>
                )}
                {day.lift && <div style={{ fontSize: 12, color: "#555" }}>💪 {day.lift} (after run)</div>}
                {!day.run && !day.lift && <div style={{ fontSize: 12, color: "#333" }}>Full rest. Recovery is training.</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── FULL PLAN ── */}
        {tab === "plan" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#333", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tap any week to adjust</div>
              <button style={S.btnOutline} onClick={downloadICS}>⬇ Download ICS (All Weeks)</button>
            </div>

            {weeks.map((wk, wi) => {
              const isOpen = editingWeek === wi;
              const isCurrent = wi === curWeekIdx;
              const prevMiles = wi > 0 ? weeks[wi - 1].totalMiles : 0;
              const increase = prevMiles > 0 ? ((wk.totalMiles - prevMiles) / prevMiles) * 100 : 0;
              const overFlag = increase > 10;

              return (
                <div key={wi}>
                  <div style={S.weekCard(isOpen || isCurrent, wk.phase)}
                    onClick={() => setEditingWeek(isOpen ? null : wi)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Arial Black', sans-serif", fontSize: 20, fontWeight: 900, color: phaseColor(wk.phase) }}>
                          W{wk.week}
                        </span>
                        <span style={S.pill(phaseColor(wk.phase))}>{wk.phase}</span>
                        {wk.deload && <span style={S.pill("#FF9A3C")}>Deload</span>}
                        {isCurrent && <span style={S.pill("#3DFFA0")}>Current</span>}
                        {wk.completed && <span style={S.pill("#555")}>✓ Done</span>}
                        {overFlag && <span style={S.pill("#FF5252")}>⚠ +{increase.toFixed(0)}%</span>}
                      </div>
                      <div style={{ display: "flex", gap: 14 }}>
                        {[
                          { val: `${wk.totalMiles}mi`, label: "Total", color: "#E8FF47" },
                          { val: wk.easyPace, label: "Easy", color: "#4AACFF" },
                          { val: `${wk.longMiles}mi`, label: "Long", color: "#FF9A3C" },
                        ].map(({ val, label, color }) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <div style={{ ...S.statVal, fontSize: 15, color }}>{val}</div>
                            <div style={S.statLabel}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ ...S.card, marginTop: -2, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                      <div style={{ ...S.cardTitle, color: "#E8FF47" }}>Edit Week {wk.week}</div>

                      {overFlag && (
                        <div style={S.flag}>
                          ⚠️ Week {wk.week} is <strong>{increase.toFixed(0)}% above</strong> last week. Max safe increase is 10%. Recommended max: <strong>{Math.round(prevMiles * 1.1)} miles.</strong>
                        </div>
                      )}

                      {[
                        { field: "totalMiles", label: "Total Miles", min: 8, max: 36, val: wk.totalMiles, display: `${wk.totalMiles} mi` },
                        { field: "longMiles", label: "Long Run Miles", min: 3, max: 13, val: wk.longMiles, display: `${wk.longMiles} mi` },
                      ].map(({ field, label, min, max, val, display }) => (
                        <div key={field}>
                          <label style={S.label}>{label}</label>
                          <div style={S.sliderRow}>
                            <input type="range" min={min} max={max} value={val} style={S.slider}
                              onChange={e => updateWeek(wi, field, Number(e.target.value))} />
                            <span style={S.sliderVal}>{display}</span>
                          </div>
                        </div>
                      ))}

                      {[
                        { field: "easyPace", label: "Easy Pace", min: 480, max: 660, color: "#4AACFF" },
                        { field: "tempoPace", label: "Tempo Pace", min: 390, max: 600, color: "#E8FF47" },
                        { field: "intervalPace", label: "Interval Effort Pace", min: 330, max: 510, color: "#FF5252" },
                      ].map(({ field, label, min, max, color }) => (
                        <div key={field}>
                          <label style={S.label}>{label}</label>
                          <div style={S.sliderRow}>
                            <input type="range" min={min} max={max} value={paceToSec(wk[field])} style={S.slider}
                              onChange={e => updateWeek(wi, field, formatPace(Number(e.target.value)))} />
                            <span style={{ ...S.sliderVal, color }}>{wk[field]}</span>
                          </div>
                        </div>
                      ))}

                      <label style={S.label}>Actual Miles Completed</label>
                      <input style={S.input} type="number" placeholder="How many miles did you actually run?"
                        value={wk.actualMiles || ""}
                        onChange={e => updateWeek(wi, "actualMiles", e.target.value)} />

                      <label style={S.label}>Week Notes</label>
                      <textarea style={S.textarea}
                        placeholder="How did this week go? Injuries, breakthroughs, adjustments..."
                        value={wk.notes}
                        onChange={e => updateWeek(wi, "notes", e.target.value)} />

                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <button style={S.btn()} onClick={() => setEditingWeek(null)}>Save & Close</button>
                        <button style={S.btnOutline} onClick={() => updateWeek(wi, "completed", !wk.completed)}>
                          {wk.completed ? "✓ Completed" : "Mark Complete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── COACH ── */}
        {tab === "coach" && (
          <div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.cardTitle, color: "#E8FF47" }}>Your Coach</div>
              <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65 }}>
                Tell me how the workout went. A few sentences, how you felt, what was hard, what felt good. Upload a screenshot if you have one. I'll give you real feedback specific to where you are in the plan.
              </div>
            </div>

            {/* Chat history */}
            <div style={{ marginBottom: 14 }}>
              {chat.map((msg, i) => (
                <div key={i} style={S.chatBubble(msg.role)}>
                  {msg.image && (
                    <img
                      src={`data:image/jpeg;base64,${msg.image}`}
                      alt="workout"
                      style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
                    />
                  )}
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div style={S.chatBubble("assistant")}>
                  <span style={{ color: "#333" }}>Coach is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Image preview */}
            {imageData && (
              <div style={{ marginBottom: 8, position: "relative", display: "inline-block" }}>
                <img src={`data:image/jpeg;base64,${imageData}`}
                  style={{ height: 72, borderRadius: 6, border: "1px solid #2A2A2A" }} alt="preview" />
                <button onClick={() => setImageData(null)}
                  style={{ position: "absolute", top: 3, right: 3, background: "#000", color: "#AAA", border: "1px solid #333", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ×
                </button>
              </div>
            )}

            <textarea
              style={S.textarea}
              value={chatInput}
              placeholder={`How did ${WEEK_SCHEDULE[selectedDay]?.day}'s ${WEEK_SCHEDULE[selectedDay]?.badge.toLowerCase()} go?`}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
              <button style={S.btn()} onClick={sendChat} disabled={loading}>
                {loading ? "..." : "Send"}
              </button>
              <button style={S.btnOutline} onClick={() => fileRef.current?.click()}>
                📸 Screenshot
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              <button
                style={{ ...S.btnOutline, color: "#333", borderColor: "#1A1A1A", marginLeft: "auto" }}
                onClick={() => { if (confirm("Clear chat history?")) setChat([{ role: "assistant", content: "Fresh start. What's on your mind?" }]); }}>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── MEALS ── */}
        {tab === "meals" && (
          <div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.cardTitle, color: "#E8FF47" }}>80/20 Nutrition</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65, marginBottom: 12 }}>
                5-6 clean days. <strong style={{ color: "#FF9A3C" }}>Friday dinner + Sunday</strong> are your built-in 20% flex days. Built around your proteins and your grills.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {[
                  { val: "2,800–3,100", label: "Calories", sub: "Hard/long run days → 3,100", color: "#E8FF47" },
                  { val: "185–205g", label: "Protein", sub: "1–1.1g per lb minimum", color: "#4AACFF" },
                  { val: "320–360g", label: "Carbs", sub: "Higher on run days", color: "#FF9A3C" },
                  { val: "65–80g", label: "Fat", sub: "Avocado, salmon, olive oil", color: "#3DFFA0" },
                ].map(({ val, label, sub, color }) => (
                  <div key={label} style={{ ...S.statBox, textAlign: "left", padding: "12px" }}>
                    <div style={{ ...S.statVal, fontSize: 15, color }}>{val}</div>
                    <div style={S.statLabel}>{label}/day</div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 3 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {WEEK_SCHEDULE.map((day, i) => (
              <div key={i} style={{ ...S.card, borderLeft: `3px solid ${typeColor(day.type)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ ...S.cardTitle, color: typeColor(day.type), margin: 0 }}>{day.day}</div>
                  {(day.day === "Friday" || day.day === "Sunday") && (
                    <span style={S.pill("#FF9A3C")}>80/20 Flex</span>
                  )}
                </div>
                {[
                  { key: "preRun", label: "Pre-Run", color: "#3DFFE0" },
                  { key: "postWorkout", label: "Post-Workout", color: "#4AACFF" },
                  { key: "lunch", label: "Lunch", color: "#3DFFA0" },
                  { key: "dinner", label: "Dinner", color: "#FF9A3C" },
                  { key: "snack", label: "Snack / Recovery", color: "#555" },
                ].map(({ key, label, color }) =>
                  day.meal[key] ? (
                    <div key={key} style={S.mealBlock(color)}>
                      <span style={S.mealLabel(color)}>{label}</span>
                      {day.meal[key]}
                    </div>
                  ) : null
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
