import { useState } from "react";

const EXPLORER_URL =
    "https://giant-half-dual-testnet.explorer.testnet.skalenodes.com/address/0x894dE66A13414c5F06ec24de238577b3bFEa4EB7";

const SkaleBadge = () => {
    const [flash, setFlash] = useState(false);

    const handleClick = () => {
        setFlash(true);
        setTimeout(() => setFlash(false), 300);
        window.open(EXPLORER_URL, "_blank", "noopener");
    };

    return (
        <button
            onClick={handleClick}
            title="View smart contracts"
            className="skale-badge"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid hsl(153 100% 50% / 0.3)",
                background: flash
                    ? "hsl(153 100% 50% / 0.25)"
                    : "hsl(153 100% 50% / 0.1)",
                cursor: "pointer",
                transition: "transform 0.15s ease, background 0.15s ease",
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "hsl(153 100% 50%)",
                lineHeight: 1,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
        >
            {/* Pulsing red dot */}
            <span className="skale-badge-dot" />
            <span className="skale-badge-full">LIVE • SKALE Testnet</span>
            <span className="skale-badge-short">LIVE</span>

            <style>{`
        .skale-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 4px #ef4444;
          animation: skalePulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes skalePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #ef4444; }
          50%       { opacity: 0.5; box-shadow: 0 0 8px #ef4444, 0 0 16px #ef444466; }
        }
        .skale-badge-short { display: none; }
        @media (max-width: 640px) {
          .skale-badge-full  { display: none; }
          .skale-badge-short { display: inline; }
        }
      `}</style>
        </button>
    );
};

export default SkaleBadge;
