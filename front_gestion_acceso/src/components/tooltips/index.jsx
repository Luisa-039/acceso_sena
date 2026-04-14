import { useEffect, useRef, useState } from "react";

const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseEnter = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
    setVisible(true);
  };

  useEffect(() => {
    if (!visible) return;

    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const tipRect = tooltipRef.current?.getBoundingClientRect();
    if (!triggerRect || !tipRect) return;

    const margin = 8;
    const gap = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = triggerRect.right + gap;
    let top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;

    if (left + tipRect.width + margin > viewportWidth) {
      left = triggerRect.left - tipRect.width - gap;
    }

    if (left < margin) {
      left = margin;
    }

    if (top < margin) {
      top = margin;
    }

    if (top + tipRect.height + margin > viewportHeight) {
      top = viewportHeight - tipRect.height - margin;
    }

    setPosition({ top });
  }, [visible, text]);

  return (
    <div
      ref={triggerRef}
      style={{ display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            backgroundColor: "#333",
            color: "#fff",
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: 1.4,
            whiteSpace: "normal",
            wordBreak: "break-word",
            minWidth: "220px",
            maxWidth: "340px",
            zIndex: 999999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
            pointerEvents: "none",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;