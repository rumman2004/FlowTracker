import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Lock background scroll
      document.body.style.overflow = "hidden";
      // Always scroll modal to top when it opens
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }, 0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ Use createPortal to render OUTSIDE the sidebar/layout DOM tree
  // This guarantees the modal is always on top of everything
  return createPortal(
    <div
      ref={scrollRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        zIndex: 99999, // ✅ Highest possible z-index
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 0,
          animation: "modalBgIn 0.2s ease both",
        }}
        onClick={onClose}
      />

      {/* ── Scroll container — full height, centers content ───────────── */}
      <div
        className="relative flex justify-center w-full min-h-full"
        style={{
          padding: "24px 16px 40px 16px",
          alignItems: "flex-start",
        }}
      >
        {/* ── Modal Panel ───────────────────────────────────────────────── */}
        <div
          className="relative w-full"
          style={{
            maxWidth: "440px",
            zIndex: 1,
            animation: "modalPanelIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          {/* Glass Card */}
          <div
            style={{
              background:
                "linear-gradient(145deg, rgba(30,27,60,0.97) 0%, rgba(20,18,45,0.99) 100%)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "24px",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), " +
                "0 0 0 1px rgba(255,255,255,0.05), " +
                "inset 0 1px 0 rgba(255,255,255,0.1)",
              padding: "24px",
            }}
          >
            {/* ── Modal Header ──────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "20px" }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Modal Body ────────────────────────────────────────────── */}
            {children}
          </div>
        </div>
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes modalBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalPanelIn {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,

    // ✅ Portal target — renders directly into <body>, bypasses all layout wrappers
    document.body
  );
};

export default Modal;