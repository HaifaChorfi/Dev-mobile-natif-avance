import { useState } from "react";
import TPMenu from "./TPMenu.jsx";
import ResultsTable from "./ResultsTable.jsx";
import { getTp } from "../data/tps.js";

export default function TeacherDashboard({ onLogout }) {
  const [activeTp, setActiveTp] = useState("tp2");

  return (
    <div className="dashboard">
      <TPMenu activeTp={activeTp} onSelect={setActiveTp} />

      <div className="dashboard-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Tableau de bord enseignant
          </span>
          <button className="btn btn-ghost" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>

        <div style={{ marginTop: "0.6rem" }}>
          <ResultsTable key={activeTp} tp={getTp(activeTp)} />
        </div>
      </div>
    </div>
  );
}
