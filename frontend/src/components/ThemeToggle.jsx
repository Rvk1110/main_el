import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        cursor: "pointer",
        marginBottom: "20px"
      }}
    >
      {dark ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
