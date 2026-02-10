"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RangeSlider, Button } from "../shared";

const BACKGROUNDS = [
  "bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500",
  "bg-linear-to-br from-cyan-500 via-blue-500 to-indigo-500",
  "bg-linear-to-br from-orange-400 via-rose-500 to-fuchsia-600",
  "bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-600",
  "bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center",
];

type PresetKey = "frosty" | "deepSpace" | "sunsetGlow" | "morpheus";

const PRESETS: Record<PresetKey, any> = {
  frosty: {
    blur: 20,
    transparency: 0.15,
    saturation: 180,
    radius: 24,
    outline: 0.22,
    shadow: 0.15,
    color: "white",
    noise: 0.08,
  },
  deepSpace: {
    blur: 12,
    transparency: 0.45,
    saturation: 110,
    radius: 12,
    outline: 0.1,
    shadow: 0.4,
    color: "black",
    noise: 0.03,
  },
  sunsetGlow: {
    blur: 16,
    transparency: 0.25,
    saturation: 220,
    radius: 32,
    outline: 0.35,
    shadow: 0.25,
    color: "white",
    noise: 0.05,
  },
  morpheus: {
    blur: 30,
    transparency: 0.08,
    saturation: 100,
    radius: 48,
    outline: 0.1,
    shadow: 0.1,
    color: "white",
    noise: 0.02,
  },
};

export default function GlassmorphismGenerator() {
  const t = useTranslations("glassmorphismGenerator");

  const [blur, setBlur] = useState(16);
  const [transparency, setTransparency] = useState(0.2);
  const [color, setColor] = useState("white");
  const [outline, setOutline] = useState(0.1);
  const [saturation, setSaturation] = useState(150);
  const [radius, setRadius] = useState(16);
  const [shadow, setShadow] = useState(0.2);
  const [noise, setNoise] = useState(0.05);
  const [bgIndex, setBgIndex] = useState(0);
  const [codeType, setCodeType] = useState<"css" | "tailwind">("css");

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const applyPreset = (key: PresetKey) => {
    const p = PRESETS[key];
    setBlur(p.blur);
    setTransparency(p.transparency);
    setSaturation(p.saturation);
    setRadius(p.radius);
    setOutline(p.outline);
    setShadow(p.shadow);
    setColor(p.color);
    setNoise(p.noise);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cssStyle = useMemo(() => {
    const bgColor =
      color === "white"
        ? `rgba(255, 255, 255, ${transparency})`
        : `rgba(0, 0, 0, ${transparency})`;

    const borderColor =
      color === "white"
        ? `rgba(255, 255, 255, ${outline})`
        : `rgba(255, 255, 255, ${outline * 0.5})`;

    return {
      background: bgColor,
      backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
      border: `1px solid ${borderColor}`,
      borderRadius: `${radius}px`,
      boxShadow: `0 8px 32px 0 rgba(0, 0, 0, ${shadow})`,
    };
  }, [blur, transparency, color, outline, saturation, radius, shadow]);

  const cssCode = useMemo(() => {
    return `/* Glass UI */
background: ${cssStyle.background};
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: 1px solid ${color === "white" ? `rgba(255, 255, 255, ${outline})` : `rgba(255, 255, 255, ${outline * 0.5})`};
border-radius: ${radius}px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${shadow.toFixed(2)});`;
  }, [
    blur,
    transparency,
    color,
    outline,
    saturation,
    radius,
    shadow,
    cssStyle.background,
  ]);

  const tailwindCode = useMemo(() => {
    const bg =
      color === "white"
        ? `bg-white/[${transparency}]`
        : `bg-black/[${transparency}]`;
    const bdr =
      color === "white"
        ? `border-white/[${outline}]`
        : `border-white/[${(outline * 0.5).toFixed(2)}]`;
    const rd =
      radius === 16
        ? "rounded-2xl"
        : radius === 24
          ? "rounded-3xl"
          : `rounded-[${radius}px]`;

    return `${bg} backdrop-blur-[${blur}px] backdrop-saturate-[${saturation}%] border ${bdr} ${rd} shadow-xl`;
  }, [blur, transparency, color, outline, saturation, radius]);

  const copyToClipboard = async () => {
    try {
      const code = codeType === "css" ? cssCode : tailwindCode;
      await navigator.clipboard.writeText(code);
      alert(codeType === "css" ? t("copySuccess") : t("tailwindSuccess"));
    } catch (err) {
      alert(t("copyFailed"));
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-white/95">
          {t("title")}
        </h1>
        <p className="text-lg text-white/50 max-w-2xl">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Panel */}
        <div className="lg:col-span-5 space-y-8 glass p-8 rounded-4xl border border-white/10 shadow-3xl bg-white/2">
          {/* Presets */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">
              {t("presets")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold text-white text-center shadow-lg cursor-pointer"
                >
                  {t(key as any)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <RangeSlider
              label={t("blur")}
              value={blur}
              onChange={setBlur}
              min={0}
              max={64}
              unit="px"
            />
            <RangeSlider
              label={t("transparency")}
              value={transparency}
              onChange={setTransparency}
              min={0}
              max={1}
              step={0.01}
            />
            <RangeSlider
              label={t("saturation")}
              value={saturation}
              onChange={setSaturation}
              min={0}
              max={400}
              unit="%"
            />
            <RangeSlider
              label={t("noise")}
              value={noise}
              onChange={setNoise}
              min={0}
              max={0.25}
              step={0.01}
            />

            <div className="grid grid-cols-2 gap-6">
              <RangeSlider
                label={t("radius")}
                value={radius}
                onChange={setRadius}
                min={0}
                max={100}
                unit="px"
              />
              <RangeSlider
                label={t("shadow")}
                value={shadow}
                onChange={setShadow}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                {t("color")}
              </label>
              <div className="flex gap-4">
                {["white", "black"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all duration-500 cursor-pointer ${
                      color === c
                        ? "bg-white text-black border-white scale-[1.02]"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t(c as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/80">
                {t("background")}
              </label>
              <div className="flex flex-wrap gap-3">
                {BACKGROUNDS.map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setBgIndex(i)}
                    className={`w-12 h-12 rounded-xl border-4 transition-all duration-300 cursor-pointer ${bg} ${
                      bgIndex === i
                        ? "border-cyan-400 scale-110 rotate-3 shadow-xl"
                        : "border-white/5 opacity-50 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Code Panel */}
        <div className="lg:col-span-7 space-y-8">
          <div
            className={`relative min-h-[500px] rounded-5xl overflow-hidden flex items-center justify-center p-16 transition-all duration-1000 shadow-3xl ${BACKGROUNDS[bgIndex]}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: "1200px" }}
          >
            {/* Mesh Gradient Overlay for extra sauce */}
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay opacity-30" />

            {/* The Animated Glass Element */}
            <motion.div
              style={{
                ...cssStyle,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-lg aspect-video flex flex-col items-center justify-center p-12 transition-shadow duration-300 group select-none shadow-glass"
            >
              {/* Noise Texture Overlay */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-(--noise-opacity) rounded-[inherit]"
                style={
                  {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    "--noise-opacity": noise,
                  } as any
                }
              />

              <div
                style={{ transform: "translateZ(80px)" }}
                className="relative mb-8"
              >
                <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-cyan-400 to-indigo-600 shadow-2xl flex items-center justify-center rotate-12 transition-transform group-hover:rotate-0 duration-700">
                  <span className="text-3xl">💎</span>
                </div>
                <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
              </div>

              <h3
                style={{ transform: "translateZ(60px)" }}
                className={`text-4xl font-black mb-4 tracking-tighter ${color === "white" ? "text-white" : "text-neutral-200"}`}
              >
                GlassKit 2099
              </h3>

              <div
                style={{ transform: "translateZ(40px)" }}
                className="flex gap-3"
              >
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${color === "white" ? "bg-white/10 text-white border-white/20" : "bg-black/40 text-white/50 border-white/10"}`}
                >
                  Neo-Luxury
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-500 text-black shadow-lg shadow-cyan-500/30">
                  Ultra
                </span>
              </div>
            </motion.div>
          </div>

          {/* Code Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                {(["css", "tailwind"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCodeType(type)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      codeType === type
                        ? "bg-white text-black shadow-lg"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {t(type as any)}
                  </button>
                ))}
              </div>
              <Button
                onClick={copyToClipboard}
                size="lg"
                className="bg-cyan-500 text-black hover:bg-cyan-400 border-0 shadow-2xl shadow-cyan-500/20 px-8"
              >
                {codeType === "css" ? t("copyCss") : t("copyTailwind")}
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-purple-600 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <pre className="relative p-8 rounded-3xl bg-[#030303] border border-white/10 text-sm font-mono text-cyan-400 overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/5 selection:bg-cyan-500 selection:text-black">
                {codeType === "css" ? cssCode : tailwindCode}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy/Tips Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 rounded-4xl bg-linear-to-br from-white/3 to-transparent border border-white/5 backdrop-blur-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 border-r border-white/10">
            <h4 className="text-white font-black text-xl mb-1 uppercase tracking-tighter">
              Pro Tips
            </h4>
            <p className="text-white/30 text-xs">Unlock peak aesthetics</p>
          </div>
          <div className="md:col-span-3">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                    0{i}
                  </span>
                  <span className="text-sm text-white/50 leading-relaxed font-medium">
                    {t(`tip${i}` as any)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
