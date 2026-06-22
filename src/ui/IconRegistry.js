import createElement from "lucide/dist/esm/createElement.mjs";
import {
  Bomb,
  CircleDot,
  Coins,
  Crosshair,
  Flame,
  Heart,
  Rows3,
  Skull,
  Sparkles,
  Square,
  Trophy,
  Zap
} from "lucide";

const ICON_DEFS = {
  coins: { icon: Coins, color: "#ffd86a", size: 48 },
  combo: { icon: Flame, color: "#ff7b2f", size: 48 },
  score: { icon: Trophy, color: "#ffd86a", size: 48 },
  heart: { icon: Heart, color: "#d81414", size: 48 },
  dash: { icon: Zap, color: "#ff3d2d", size: 48 },
  skull: { icon: Skull, color: "#ff5a5a", size: 48 },
  passive: { icon: Sparkles, color: "#ffe0a0", size: 48 },
  target: { icon: Crosshair, color: "#ffd86a", size: 48 },
  empty: { icon: Square, color: "#888888", size: 48 },
  shotgun: { icon: Rows3, color: "#ff7b2f", size: 48 },
  machine: { icon: CircleDot, color: "#76ff6b", size: 48 },
  missile: { icon: Bomb, color: "#ff9a00", size: 48 },
  laser: { icon: Zap, color: "#ff3030", size: 48 }
};

const TOKEN_ICON_KEYS = {
  shotgun: "icon_shotgun",
  machine: "icon_machine",
  missile: "icon_missile",
  laser: "icon_laser"
};

function svgToDataUrl(svgElement) {
  let svgString = new XMLSerializer().serializeToString(svgElement);

  if (!svgString.includes("xmlns")) {
    svgString = svgString.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

function addPlaceholderTexture(scene, textureKey, color = "#ffd86a") {
  if (scene.textures.exists(textureKey)) return;

  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  scene.textures.addCanvas(textureKey, canvas);
}

export function getTokenIconKey(tokenKey) {
  return TOKEN_ICON_KEYS[tokenKey] || "icon_passive";
}

export function addLucideTexture(scene, textureKey, iconNode, options = {}) {
  const { size = 48, color = "#ffd86a", strokeWidth = 2 } = options;

  if (scene.textures.exists(textureKey)) {
    return Promise.resolve(textureKey);
  }

  return new Promise((resolve) => {
    try {
      const svg = createElement(iconNode, {
        width: size,
        height: size,
        stroke: color,
        color,
        "stroke-width": strokeWidth
      });

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        scene.textures.addCanvas(textureKey, canvas);
        resolve(textureKey);
      };
      img.onerror = () => {
        addPlaceholderTexture(scene, textureKey, color);
        resolve(textureKey);
      };
      img.src = svgToDataUrl(svg);
    } catch {
      addPlaceholderTexture(scene, textureKey, color);
      resolve(textureKey);
    }
  });
}

export async function registerLucideIcons(scene) {
  const jobs = Object.entries(ICON_DEFS).map(([name, def]) =>
    addLucideTexture(scene, `icon_${name}`, def.icon, {
      size: def.size,
      color: def.color,
      strokeWidth: 2
    })
  );

  await Promise.all(jobs);
}

export function hasIcon(scene, textureKey) {
  return scene.textures.exists(textureKey);
}

export function ensureIconTextures(scene) {
  for (const [name, def] of Object.entries(ICON_DEFS)) {
    addPlaceholderTexture(scene, `icon_${name}`, def.color);
  }
}
