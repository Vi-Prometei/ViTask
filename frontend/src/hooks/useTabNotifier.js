import { useEffect, useRef, useMemo } from "react";

export function useTabNotifier({ items, blinkMs = 50 }) {
    const timerRef = useRef(null);
    const originalFaviconRef = useRef(getFaviconHref());
    const pulseRef = useRef(0);
    const hueRef = useRef(0);
    const growingRef = useRef(true);

    // палитра тёплых цветов (HSL)
    const warmColors = [
        { h: 0, s: 100, l: 50 },   // красный
        { h: 20, s: 100, l: 50 },  // оранжевый
        { h: 40, s: 100, l: 50 }   // жёлтый
    ];

    // Выбираем уведомление с наибольшим приоритетом
    const winner = useMemo(() => {
        const candidates = (items || []).filter(i => (i?.count || 0) > 0);
        if (!candidates.length) return null;
        return candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
    }, [items]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (!document.hidden) reset();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            reset();
        };
    }, []);

    useEffect(() => {
        reset();

        if (!document.hidden || !winner) return;

        let colorIndex = 0;
        pulseRef.current = 0;
        growingRef.current = true;

        timerRef.current = setInterval(() => {
            // Меняем цвет каждые ~8 шагов
            if (pulseRef.current % 8 === 0) {
                colorIndex = (colorIndex + 1) % warmColors.length;
            }

            // Плавный пульс (0.85 - 1.15 радиус)
            if (growingRef.current) {
                pulseRef.current += 0.02;
                if (pulseRef.current >= 1) growingRef.current = false;
            } else {
                pulseRef.current -= 0.02;
                if (pulseRef.current <= 0) growingRef.current = true;
            }

            const { h, s, l } = warmColors[colorIndex];
            const color = `hsl(${h}, ${s}%, ${l}%)`;

            setFaviconPulse(color, 0.85 + pulseRef.current * 0.3); // радиус меняется
        }, blinkMs);

        return reset;
    }, [winner, blinkMs]);

    function reset() {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        restoreFavicon();
    }

    function getFaviconHref() {
        const link = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
        return link?.href || null;
    }

    function ensureFaviconLink() {
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        return link;
    }

    function restoreFavicon() {
        const link = ensureFaviconLink();
        link.href = originalFaviconRef.current || "";
    }

    function setFaviconPulse(color, scale = 1) {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, size, size); // прозрачный фон

        // Ореол (shadowBlur)
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.4 * scale;

        // Рисуем круг
        const radius = (size * 0.3) * scale;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(color, 0.8);
        ctx.fill();

        const link = ensureFaviconLink();
        link.href = canvas.toDataURL("image/png");
    }

    function hexToRgba(hexOrHsl, alpha = 1) {
        // Если цвет в HSL
        if (hexOrHsl.startsWith("hsl")) {
            return hexOrHsl.replace("hsl", "hsla").replace(")", `, ${alpha})`);
        }
        // Если в HEX
        const { r, g, b } = hexToRgb(hexOrHsl);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
}
