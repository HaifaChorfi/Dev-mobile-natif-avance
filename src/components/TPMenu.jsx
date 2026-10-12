import { TP_LIST } from "../data/tps.js";

export default function TPMenu({ activeTp, onSelect }) {
  return (
    <nav className="sidebar">
      {TP_LIST.map((tp) => (
        <button
          key={tp.id}
          className={
            "tp-item" + (tp.id === activeTp ? " active" : "") + (!tp.enabled ? " disabled" : "")
          }
          disabled={!tp.enabled}
          onClick={() => tp.enabled && onSelect(tp.id)}
          title={tp.enabled ? "" : "Bientôt disponible"}
        >
          {tp.label}
          {!tp.enabled && " 🔒"}
        </button>
      ))}
    </nav>
  );
}
