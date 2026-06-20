import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import "./App.css";

function calculateLove(name1: string, name2: string): number {
  const combined = (name1 + name2).toLowerCase().replace(/\s/g, "");
  let sum = 0;
  for (let char of combined) {
    sum += char.charCodeAt(0);
  }
  return sum % 101;
}

export default function App() {
  const [yourName, setYourName] = useState("");
  const [crushName, setCrushName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [displayResult, setDisplayResult] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [shake, setShake] = useState(false);

  const saveMatch = useMutation(api.loveMatches.submit);
  const countRafRef = useRef<number | null>(null);

  // Fetch IP address on mount
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIpAddress(data.ip))
      .catch(() => setIpAddress("unknown"));
  }, []);

  // Animate the percentage counting up whenever a new result lands
  useEffect(() => {
    if (result === null) return;

    if (countRafRef.current) cancelAnimationFrame(countRafRef.current);

    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-quint for a snappy-then-settle feel
      const eased = 1 - Math.pow(1 - progress, 5);
      setDisplayResult(Math.round(eased * result));

      if (progress < 1) {
        countRafRef.current = requestAnimationFrame(tick);
      }
    };

    countRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (countRafRef.current) cancelAnimationFrame(countRafRef.current);
    };
  }, [result]);

  const handleCalculate = async () => {
    if (!yourName.trim() || !crushName.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    const percentage = calculateLove(yourName, crushName);

    // Capture device info
    const deviceInfo = {
      yourName: yourName.trim(),
      crushName: crushName.trim(),
      percentage,
      email: email.trim() || undefined,
      ipAddress: ipAddress || undefined,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
    };

    await saveMatch(deviceInfo);

    setResult(null);
    setDisplayResult(0);
    // Force a tick so the reveal animation restarts cleanly on repeat clicks
    requestAnimationFrame(() => setResult(percentage));
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const tier =
    result === null
      ? null
      : result > 80
      ? "perfect"
      : result > 50
      ? "good"
      : "try";

  const tierMessage =
    tier === "perfect"
      ? "Perfect Match! 🔥"
      : tier === "good"
      ? "Good Chemistry! 💕"
      : tier === "try"
      ? "Keep Trying! 💪"
      : "";

  return (
    <div style={styles.container}>
      <div className="ambient-backdrop">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="floating-hearts">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="bg-heart"
              style={{
                left: `${(i * 8.3) % 100}%`,
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${9 + (i % 5)}s`,
                fontSize: `${12 + (i % 4) * 6}px`,
              }}
            >
              ❤
            </span>
          ))}
        </div>
      </div>

      <div
        style={styles.card}
        className={`card-anim ${shake ? "shake" : ""}`}
      >
        <div className="title-wrap">
          <span className="title-emoji">💘</span>
          <h1 style={styles.title}>Love Calculator</h1>
          <p style={styles.subtitle}>
            Two names. One purely scientific result.
          </p>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="your-name">
            Your name
          </label>
          <input
            id="your-name"
            style={styles.input}
            className="input-anim"
            placeholder="e.g. Alex"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="crush-name">
            Crush's name
          </label>
          <input
            id="crush-name"
            style={styles.input}
            className="input-anim"
            placeholder="e.g. Jordan"
            value={crushName}
            onChange={(e) => setCrushName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="email">
            Email <span className="optional-tag">(optional)</span>
          </label>
          <input
            id="email"
            style={styles.input}
            className="input-anim"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          style={styles.button}
          className="btn-anim"
          onClick={handleCalculate}
          disabled={loading}
        >
          <span className="btn-label">
            {loading ? (
              <>
                <span className="spinner" /> Calculating
              </>
            ) : (
              "Calculate Love %"
            )}
          </span>
        </button>

        {result !== null && (
          <div
            key={result}
            style={styles.resultBox}
            className={`result-anim tier-${tier}`}
          >
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{ width: `${displayResult}%` }}
              />
            </div>
            <h2 style={styles.percentage} className="percentage-pop">
              {displayResult}%
            </h2>
            <p style={styles.heart} className="result-hearts">
              {"❤️".repeat(Math.ceil(result / 20))}
            </p>
            <p style={styles.message} className="result-message">
              {tierMessage}
            </p>
          </div>
        )}

        {/* Saved matches removed for privacy */}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  card: {
    background: "#fff8f9",
    padding: "40px",
    borderRadius: "24px",
    boxShadow:
      "0 30px 60px -12px rgba(120, 10, 40, 0.45), 0 0 0 1px rgba(255,255,255,0.06)",
    textAlign: "center",
    width: "380px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
  },
  title: {
    color: "#d6294a",
    margin: "6px 0 4px",
    fontSize: "30px",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
  },
  subtitle: {
    color: "#9a8189",
    fontSize: "13px",
    margin: "0 0 26px",
    fontFamily: "'DM Sans', sans-serif",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    border: "2px solid #ffd6df",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    background: "#fffbfc",
    color: "#3a2a2e",
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "#e8264a",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: "'Fredoka', sans-serif",
    marginTop: "4px",
  },
  resultBox: {
    marginTop: "24px",
    padding: "22px 20px",
    background: "#fff0f2",
    borderRadius: "16px",
  },
  percentage: {
    fontSize: "50px",
    color: "#e8264a",
    margin: "10px 0 0",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
  },
  heart: {
    fontSize: "22px",
    margin: "10px 0",
  },
  message: {
    color: "#7a5a60",
    fontSize: "15px",
    margin: "0",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
};