"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  alphaDir: number;
  type: "dot" | "ring" | "hex" | "cloud" | "molecule";
  color: string;
  rot: number;
  rotSpeed: number;
}

const COLORS = ["#4fb8b0", "#8b7eb8", "#6b8ec8", "#d4a24c", "#4fb8b0", "#4fb8b0"];

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, color: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x - r * 0.8, y + r * 0.2, r * 0.75, 0, Math.PI * 2);
  ctx.arc(x + r * 0.8, y + r * 0.2, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x, y + r * 0.5, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, color: string, rot: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = r * Math.cos(angle);
    const py = r * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  // center dot
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  // 3 outer atoms
  const atomAngles = [0, Math.PI * 2 / 3, Math.PI * 4 / 3];
  atomAngles.forEach((a) => {
    ctx.beginPath();
    ctx.arc(r * 1.4 * Math.cos(a), r * 1.4 * Math.sin(a), r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.9 * Math.cos(a), r * 0.9 * Math.sin(a));
    ctx.lineTo(r * 1.2 * Math.cos(a), r * 1.2 * Math.sin(a));
    ctx.stroke();
  });
  ctx.restore();
}

function drawMolecule(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, color: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  // central atom
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // bonded atoms
  const bonds = [
    { dx: r * 2.2, dy: 0, rc: r * 0.65, col: "#d4a24c" },
    { dx: -r * 1.8, dy: -r * 1.4, rc: r * 0.5, col: "#8b7eb8" },
    { dx: -r * 1.8, dy: r * 1.4, rc: r * 0.55, col: "#6b8ec8" },
  ];
  bonds.forEach(b => {
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + b.dx, y + b.dy);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.arc(x + b.dx, y + b.dy, b.rc, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, color: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = document.body.scrollHeight;

    canvas.width = W;
    canvas.height = H;

    // spawn particles distributed across full page height
    const COUNT = 55;
    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const types: Particle["type"][] = ["dot", "dot", "dot", "ring", "hex", "hex", "cloud", "cloud", "molecule"];
      const type = types[Math.floor(Math.random() * types.length)];
      const baseR = type === "cloud" ? 14 + Math.random() * 10
        : type === "hex" ? 8 + Math.random() * 8
        : type === "molecule" ? 5 + Math.random() * 5
        : type === "ring" ? 5 + Math.random() * 6
        : 1.5 + Math.random() * 2.5;

      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.35,
        r: baseR,
        alpha: 0.05 + Math.random() * 0.12,
        alphaDir: Math.random() > 0.5 ? 0.0005 : -0.0005,
        type,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
      };
    });

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.alpha += p.alphaDir;

        // bounce off edges
        if (p.x < -p.r * 3) p.x = W + p.r * 3;
        if (p.x > W + p.r * 3) p.x = -p.r * 3;
        if (p.y < -p.r * 3) p.y = H + p.r * 3;
        if (p.y > H + p.r * 3) p.y = -p.r * 3;

        // pulse alpha
        if (p.alpha > 0.18) p.alphaDir = -Math.abs(p.alphaDir);
        if (p.alpha < 0.03) p.alphaDir = Math.abs(p.alphaDir);

        switch (p.type) {
          case "cloud":
            drawCloud(ctx, p.x, p.y, p.r, p.alpha, p.color);
            break;
          case "hex":
            drawHex(ctx, p.x, p.y, p.r, p.alpha, p.color, p.rot);
            break;
          case "molecule":
            drawMolecule(ctx, p.x, p.y, p.r, p.alpha, p.color);
            break;
          case "ring":
            drawRing(ctx, p.x, p.y, p.r, p.alpha, p.color);
            break;
          default:
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    // Resize handler
    const onResize = () => {
      W = window.innerWidth;
      H = document.body.scrollHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1 }}
      aria-hidden="true"
    />
  );
}
