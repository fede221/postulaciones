"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * "Mesh drift" background: soft gaussian colour blobs that orbit slowly, with a
 * light domain warp, film grain and a gentle glow under the cursor. One WebGL
 * canvas, no dependencies. Colours come from the `--shader-*` design tokens so it
 * follows the theme; the field is offset so the blobs gather on the right side.
 * Pauses off-screen / when the tab is hidden; a single still frame under
 * prefers-reduced-motion.
 */

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[5];
uniform vec4 u_scene;   // resolution.xy, time, colour count
uniform vec4 u_shape;   // scale, intensity, warp, detail
uniform vec4 u_finish;  // grain, offset.x, offset.y, drift
uniform vec4 u_cursor;  // presence, strength, radius, -
uniform vec2 u_mouse;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.2); a *= 0.5; }
  return v;
}

vec3 shade(vec2 p, float t) {
  // colour 0 is the page canvas: it anchors the field so edges melt into the page
  vec3 acc = u_colors[0] * 0.55;
  float total = 0.55;
  for (int i = 1; i < 5; i++) {
    if (float(i) >= u_scene.w) break;
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.21 + fi * 0.071) + fi * 2.4),
      cos(t * (0.17 + fi * 0.093) + fi * 1.7)) * (0.45 + u_shape.y * 0.35);
    float w = exp(-dot(p - c, p - c) * 3.2);
    acc += u_colors[i] * w;
    total += w;
  }
  return acc / total;
}

void main() {
  vec2 res = u_scene.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);

  float cursorMask = 0.0;
  if (u_cursor.x > 0.001) {
    vec2 cursor = (0.5 * u_mouse * res) / min(res.x, res.y);
    cursorMask = u_cursor.x * (1.0 - smoothstep(0.0, u_cursor.z, length(p - cursor)));
  }

  p *= u_shape.x;
  p += u_finish.yz;
  p += u_finish.w * vec2(sin(u_scene.z * 0.31), cos(u_scene.z * 0.23));
  p += u_shape.z * (vec2(fbm(p * u_shape.w + 3.7), fbm(p * u_shape.w + vec2(5.2, 1.3))) - 0.5);

  vec3 col = shade(p, u_scene.z);
  col += (col * 0.10 + vec3(0.04)) * cursorMask * u_cursor.y;
  col += (grainHash(gl_FragCoord.xy) - 0.5) * u_finish.x;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const SETTINGS = {
  scale: 1.35,
  intensity: 0.35,
  warp: 0.22,
  detail: 1.6,
  grain: 0.022,
  // Negative x pushes the blob field to the right half of the hero.
  offsetX: -0.55,
  offsetY: -0.05,
  drift: 0.06,
  timeScale: 0.9,
  cursorStrength: 0.5,
  cursorRadius: 0.4,
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readColors(): number[] {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return [
    v("--canvas", "#eef4ec"),
    v("--shader-1", "#cfe8c6"),
    v("--shader-2", "#cfdcf6"),
    v("--shader-3", "#f5ebb0"),
    v("--shader-4", "#f8d3d5"),
  ].flatMap(hexToRgb);
}

export function HeroShader({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    // No WebGL (or a context lost during a hot reload): the page canvas colour shows through.
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uni = {
      colors: gl.getUniformLocation(program, "u_colors"),
      scene: gl.getUniformLocation(program, "u_scene"),
      shape: gl.getUniformLocation(program, "u_shape"),
      finish: gl.getUniformLocation(program, "u_finish"),
      cursor: gl.getUniformLocation(program, "u_cursor"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
    };
    const applyColors = () => gl.uniform3fv(uni.colors, new Float32Array(readColors()));
    applyColors();
    gl.uniform4f(uni.shape, SETTINGS.scale, SETTINGS.intensity, SETTINGS.warp, SETTINGS.detail);
    gl.uniform4f(uni.finish, SETTINGS.grain, SETTINGS.offsetX, SETTINGS.offsetY, SETTINGS.drift);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let bounds = canvas.getBoundingClientRect();
    let raf = 0;
    let lastNow: number | null = null;
    let inView = true;
    let disposed = false;
    let targetX = 0, targetY = 0, targetPresence = 0;
    let mouseX = 0, mouseY = 0, presence = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rawW = Math.max(1, Math.round(bounds.width * dpr));
      const rawH = Math.max(1, Math.round(bounds.height * dpr));
      // A blurred field never needs more than ~1.2MP.
      const k = Math.min(1, Math.sqrt(1_200_000 / (rawW * rawH)));
      const w = Math.max(1, Math.round(rawW * k));
      const h = Math.max(1, Math.round(rawH * k));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const request = () => {
      if (!disposed && inView && !document.hidden && raf === 0) raf = requestAnimationFrame((t) => render(t));
    };

    const render = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = lastNow === null ? 0 : Math.min((now - lastNow) / 1000, 0.1);
      lastNow = now;
      const follow = 1 - Math.exp(-8 * dt);
      mouseX += (targetX - mouseX) * follow;
      mouseY += (targetY - mouseY) * follow;
      presence += (targetPresence - presence) * follow;
      resize();
      const t = reduced ? 14 : ((now - start) / 1000) * SETTINGS.timeScale;
      gl.uniform4f(uni.scene, canvas!.width, canvas!.height, t, 5);
      gl.uniform2f(uni.mouse, mouseX, mouseY);
      gl.uniform4f(uni.cursor, reduced ? 0 : presence, SETTINGS.cursorStrength, SETTINGS.cursorRadius, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) request();
    };

    const onPointerMove = (e: PointerEvent) => {
      bounds = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= bounds.left && e.clientX <= bounds.right && e.clientY >= bounds.top && e.clientY <= bounds.bottom;
      if (!inside) {
        targetPresence = 0;
        return;
      }
      targetX = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      targetY = -(((e.clientY - bounds.top) / bounds.height) * 2 - 1);
      targetPresence = 1;
    };
    const onPointerLeave = () => {
      targetPresence = 0;
    };
    const onLayout = () => {
      bounds = canvas.getBoundingClientRect();
      resize();
      if (reduced) request();
    };
    const onVisibility = () => {
      lastNow = null;
      request();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(onLayout);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (inView) request();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        lastNow = null;
      }
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      applyColors();
      request();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    request();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("block h-full w-full", className)} />;
}
