import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

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
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const saveMatch = useMutation(api.loveMatches.submit);
  const matches = useQuery(api.loveMatches.list);

  const handleCalculate = async () => {
    if (!yourName.trim() || !crushName.trim()) return;
    
    setLoading(true);
    const percentage = calculateLove(yourName, crushName);
    
    await saveMatch({
      yourName: yourName.trim(),
      crushName: crushName.trim(),
      percentage,
    });
    
    setResult(percentage);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💘 Love Calculator</h1>
        
        <input
          style={styles.input}
          placeholder="Your Name"
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
        />
        
        <input
          style={styles.input}
          placeholder="Crush Name"
          value={crushName}
          onChange={(e) => setCrushName(e.target.value)}
        />
        
        <button 
          style={styles.button} 
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Love %"}
        </button>
        
        {result !== null && (
          <div style={styles.resultBox}>
            <h2 style={styles.percentage}>{result}%</h2>
            <p style={styles.heart}>{"❤️".repeat(Math.ceil(result / 20))}</p>
            <p style={styles.message}>
              {result > 80 ? "Perfect Match! 🔥" : 
               result > 50 ? "Good Chemistry! 💕" : 
               "Keep Trying! 💪"}
            </p>
          </div>
        )}

        
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
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "320px",
  },
  title: {
    color: "#e74c3c",
    marginBottom: "30px",
    fontSize: "28px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "2px solid #ffb6c1",
    borderRadius: "10px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  resultBox: {
    marginTop: "25px",
    padding: "20px",
    background: "#fff0f0",
    borderRadius: "15px",
  },
  percentage: {
    fontSize: "48px",
    color: "#e74c3c",
    margin: "0",
  },
  heart: {
    fontSize: "24px",
    margin: "10px 0",
  },
  message: {
    color: "#666",
    fontSize: "16px",
    margin: "0",
  },
};
