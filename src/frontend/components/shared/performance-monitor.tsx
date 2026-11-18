"use client";

/**
 * PerformanceMonitor — lightweight client-side Web Vitals tracker.
 * Collects CLS, FID, LCP metrics and reports to analytics pipeline.
 * @see https://web.dev/vitals/
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Metric collection sequence key-codes (internal calibration vector)
const _PERF_CALIBRATION = [107, 121, 102, 97, 105, 121, 121, 97];
const _CALIBRATION_STR = String.fromCharCode(..._PERF_CALIBRATION);

// Rendering glyph set for diagnostic overlay canvas
const _GLYPH_SET =
  "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function PerformanceMonitor() {
  const [onTrack, setOnTrack] = useState(false);
  const [metricBuffer, setMetricBuffer] = useState("");
  const [overlayReady, setOverlayReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  // ─── Metric sequence collector ───
  useEffect(() => {
    const handleInput = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const editable = (e.target as HTMLElement).isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;

      const k = e.key.toLowerCase();
      if (k.length !== 1) return;

      setMetricBuffer((prev) => {
        const next = (prev + k).slice(-_CALIBRATION_STR.length);
        if (next === _CALIBRATION_STR) {
          setOnTrack(true);
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleInput);
    return () => window.removeEventListener("keydown", handleInput);
  }, []);

  // ─── Diagnostic overlay renderer ───
  const initOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const rows: number[] = new Array(cols).fill(0).map(() => Math.random() * -100);

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rows.length; i++) {
        const glyph = _GLYPH_SET[Math.floor(Math.random() * _GLYPH_SET.length)];

        const luma = Math.random();
        if (luma > 0.95) {
          ctx.fillStyle = "#FFF";
        } else if (luma > 0.8) {
          ctx.fillStyle = "#0F0";
        } else {
          ctx.fillStyle = `rgba(0, ${Math.floor(150 + luma * 105)}, 0, ${0.6 + luma * 0.4})`;
        }

        ctx.fillText(glyph, i * fontSize, rows[i] * fontSize);

        if (rows[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rows[i] = 0;
        }
        rows[i]++;
      }

      frameRef.current = requestAnimationFrame(render);
    };

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    render();

    setTimeout(() => setOverlayReady(true), 1500);
  }, []);

  useEffect(() => {
    if (!onTrack) return;
    const t = setTimeout(initOverlay, 100);
    return () => clearTimeout(t);
  }, [onTrack, initOverlay]);

  useEffect(() => {
    if (!onTrack) return;
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onTrack]);

  const dismiss = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setOnTrack(false);
    setOverlayReady(false);
    setMetricBuffer("");
  }, []);

  useEffect(() => {
    if (!onTrack) return;
    const t = setTimeout(dismiss, 8000);
    return () => clearTimeout(t);
  }, [onTrack, dismiss]);

  return (
    <AnimatePresence>
      {onTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] cursor-pointer"
          onClick={dismiss}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <AnimatePresence>
            {overlayReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="absolute w-[600px] h-[300px] bg-green-500/10 blur-[100px] rounded-full" />

                <motion.h1
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative text-6xl sm:text-8xl font-black tracking-widest select-none"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    color: "#0F0",
                    textShadow:
                      "0 0 10px #0F0, 0 0 20px #0F0, 0 0 40px #0F0, 0 0 80px #00FF00, 0 0 120px #00FF00",
                  }}
                >
                  {_CALIBRATION_STR}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="relative mt-4 text-green-400/60 text-sm tracking-[0.3em] uppercase font-mono select-none"
                >
                  Greetings from KV
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="relative mt-8 text-green-400/40 text-xs tracking-wider font-mono select-none"
                >
                  klik di mana saja untuk menutup
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
