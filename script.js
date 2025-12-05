document.addEventListener("DOMContentLoaded", () => {
  /* ========================
     캔버스 세팅 (고해상도)
  ======================== */
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "pattern.png"; // 저장되는 파일명
  link.href = canvas.toDataURL("image/png");
  link.click();
});


  function getPatternScale() {
    return Number(scaleSlider.value) / 100;
  }

function setCanvasSize() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width  = window.innerWidth  * ratio;
  canvas.height = window.innerHeight * ratio;

  canvas.style.width  = window.innerWidth  + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawAll();
}



  /* ========================
      요소들 불러오기
  ======================== */
  const leafCountInput   = document.getElementById("leafCount");
  const scaleSlider      = document.getElementById("scaleSlider");
  const leafStartInput   = document.getElementById("leafStart");
  const bugCountInput    = document.getElementById("bugCount");
  const leafCountText    = document.getElementById("leafCountText");
  const scaleText        = document.getElementById("scaleText");
  const lineColorInput   = document.getElementById("lineColor");
  const mainColorInput   = document.getElementById("mainColor");
  const accentColorInput = document.getElementById("accentColor");
  const subColorInput    = document.getElementById("subColor");
  const lightColorInput  = document.getElementById("lightColor");
  const redrawBtn        = document.getElementById("redrawBtn");

  // 새로 추가된 요소
  const tileToggleBtn    = document.getElementById("tileToggleBtn");
  const densitySlider    = document.getElementById("densitySlider");
  const densityText      = document.getElementById("densityText");

  let LINE_COLOR   = lineColorInput.value;
  let MAIN_COLOR   = mainColorInput.value;
  let ACCENT_COLOR = accentColorInput.value;
  let SUB_COLOR    = subColorInput.value;
  let LIGHT_COLOR  = lightColorInput.value;

  // 타일 모드 상태
  let isTiling = false;

  /* 팔레트 */
  function getPalette() {
    return [MAIN_COLOR, ACCENT_COLOR, SUB_COLOR, LIGHT_COLOR];
  }

  /* ========================
          패턴 함수들
  ======================== */

  function drawLeaf(inner, outer, layers) {
    const PAL = getPalette();
    const middle = (inner + outer) / 2;
    const half   = (outer - inner) / 2;
    const H      = half * 0.7;

    ctx.save();
    ctx.translate(middle, 0);

    for (let j = 0; j < layers; j++) {
      const t = j / (layers - 1 || 1);
      const w = half * (1 - t * 0.55);
      const h = H    * (1 - t * 0.85);

      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.quadraticCurveTo(0, -h, w, 0);
      ctx.quadraticCurveTo(0,  h, -w, 0);

      ctx.fillStyle = PAL[(j + 1) % PAL.length];
      ctx.fill();

      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 중심이 (0,0)이라고 가정하고 그림
  function drawLeaves(scale) {
    const count = Number(leafCountInput.value);
    const start = Number(leafStartInput.value) * scale;
    const outer = 190 * scale;

    ctx.save();
    const step = Math.PI * 2 / count;
    for (let i = 0; i < count; i++) {
      ctx.rotate(step);
      drawLeaf(start, outer, 4);
    }
    ctx.restore();
  }

  function drawOuterRing(scale) {
    const count = Number(leafCountInput.value);
    const step = Math.PI * 2 / count;

    ctx.save();

    ctx.beginPath();
    ctx.arc(0, 0, 200 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = SUB_COLOR;

    const arcs = [
      [210, 0, 20, -10, 120],
      [220, 20, 20, 180, 300],
      [180, 60, 10, 250, 30],
      [186, 55, 10, 70, 230]
    ];

    for (let i = 0; i < count; i++) {
      ctx.rotate(step);
      arcs.forEach(([x, y, r, s, e]) => {
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, r * scale, s * Math.PI / 180, e * Math.PI / 180);
        ctx.fill();
        ctx.strokeStyle = LINE_COLOR;
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  function drawCenterFlower(scale) {
    const leafNum = Number(leafCountInput.value);
    const PAL = getPalette();

    const C = Math.max(4, Math.round(leafNum / 4));
    const TOTAL = Math.max(8, Math.round(leafNum / 2));
    const localS = 0.45 + (Math.min(leafNum, 64) / 64) * 0.25;

    ctx.save();
    ctx.scale(scale * localS, scale * localS);

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1 / (scale * localS);

    // 작은 원 링
    for (let i = 0; i < C; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / C) * i);

      ctx.beginPath();
      ctx.arc(10, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = PAL[i % PAL.length];
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(24, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = PAL[(i + 1) % PAL.length];
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // 꽃잎 / 꾸밈
    for (let i = 0; i < TOTAL; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / TOTAL) * i);

      if (i % 2 === 0) {
        // 짧은 꽃잎 (메인)
        ctx.beginPath();
        ctx.moveTo(30, 30);
        ctx.quadraticCurveTo(50, 30, 60, 60);
        ctx.quadraticCurveTo(30, 50, 30, 30);
        ctx.fillStyle = MAIN_COLOR;
        ctx.fill();
        ctx.stroke();

        // 긴 꽃잎 (서브)
        ctx.beginPath();
        ctx.moveTo(30, 30);
        ctx.quadraticCurveTo(70, 30, 120, 120);
        ctx.quadraticCurveTo(30, 70, 30, 30);
        ctx.fillStyle = SUB_COLOR;
        ctx.fill();
        ctx.stroke();
      } else {
        // 꾸밈 잎 (보조)
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.quadraticCurveTo(175, -40, 200, 0);
        ctx.quadraticCurveTo(175, 40, 150, 0);
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  function drawBug2(scale) {
    const s = 0.18 * scale;
    ctx.fillStyle = MAIN_COLOR;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;

    // 왼쪽 날개
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-130 * s, -170 * s, -190 * s, -90 * s, -110 * s, 0);
    ctx.bezierCurveTo(-190 * s, 90 * s, -130 * s, 170 * s, 0, 100 * s);
    ctx.fill();
    ctx.stroke();

    // 오른쪽 날개
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(130 * s, -170 * s, 190 * s, -90 * s, 110 * s, 0);
    ctx.bezierCurveTo(190 * s, 90 * s, 130 * s, 170 * s, 0, 100 * s);
    ctx.fill();
    ctx.stroke();

    // 몸통
    ctx.beginPath();
    ctx.moveTo(0, -90 * s);
    ctx.lineTo(0, 180 * s);
    ctx.stroke();

    // 더듬이
    ctx.beginPath();
    ctx.moveTo(0, -90 * s);
    ctx.bezierCurveTo(-30 * s, -140 * s, -50 * s, -180 * s, -40 * s, -200 * s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -90 * s);
    ctx.bezierCurveTo(30 * s, -140 * s, 50 * s, -180 * s, 40 * s, -200 * s);
    ctx.stroke();
  }

  function drawBugsRing(scale) {
    const count = Number(bugCountInput.value);
    const step = Math.PI * 2 / count;
    const radius = Number(leafStartInput.value) * scale + 40 * scale;

    ctx.save();

    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.rotate(step * i + step / 2);
      ctx.translate(radius, 0);
      ctx.rotate(Math.PI / 2);
      drawBug2(scale);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawTopRedPetals(scale) {
    const count = Number(leafCountInput.value);
    const step = Math.PI * 2 / count;

    ctx.save();

    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.rotate(step * i);

      ctx.beginPath();
      ctx.moveTo(0, 90 * scale);
      ctx.quadraticCurveTo(10 * scale, 70 * scale, 0, 50 * scale);
      ctx.quadraticCurveTo(-10 * scale, 70 * scale, 0, 90 * scale);
      ctx.fillStyle = MAIN_COLOR;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  /* ========================
        만다라 하나 그리기
        (중심 (cx, cy), 스케일 s)
  ======================== */
  function drawMandalaAt(cx, cy, s) {
    ctx.save();
    ctx.translate(cx, cy);

    drawOuterRing(s);
    drawLeaves(s);
    drawCenterFlower(s);
    drawBugsRing(s);
    drawTopRedPetals(s);

    ctx.restore();
  }

  /* ========================
          전체 그리기
  ======================== */

    // 전체 그리기
  function drawAll() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const baseScale = getPatternScale();

    // 🔹 타일 배치 OFF일 때: 가운데 하나만
    if (!isTiling) {
      drawMandalaAt(rect.width / 2, rect.height / 2, baseScale);
      return;
    }

    // 🔹 타일 배치 ON일 때: 사선(지그재그) 그리드
    const density = Number(densitySlider.value); // 1~5
    const mandalaScale = baseScale * (1.1 - density * 0.15);

    // 패턴 간 기본 간격 (대략 지름 기준)
    const baseSpacing = 480;
    const spacingX = baseSpacing * mandalaScale;   // 가로 간격
    const spacingY = spacingX * 0.86;              // 세로 간격(조금 더 촘촘하게)

    const startY = -spacingY;
    const endY   = rect.height + spacingY;

    for (let row = 0, y = startY; y < endY; row++, y += spacingY) {
      // 홀수 줄마다 반칸씩 밀어서 사선 느낌 만들기
      const rowOffsetX = (row % 2 === 1) ? spacingX / 2 : 0;

      const startX = -spacingX + rowOffsetX;       // 양쪽을 살짝 넘겨서 가로로 꽉 차게
      const endX   = rect.width + spacingX;

      for (let x = startX; x < endX; x += spacingX) {
        drawMandalaAt(x, y, mandalaScale);
      }
    }
  }

  /* ========================
            프리셋
  ======================== */
  const PRESETS = {
    tropical: {
      line: "#3A2E39",
      main: "#E3427D",
      accent: "#F9C74F",
      sub: "#43AA8B",
      light: "#F1E9DA"
    },
    mystic: {
      line: "#2E1A47",
      main: "#7B2CBF",
      accent: "#C77DFF",
      sub: "#48BFE3",
      light: "#E0D4FA"
    },
    forest: {
      line: "#2F3E46",
      main: "#354F52",
      accent: "#84A98C",
      sub: "#CAD2C5",
      light: "#F6FFF6"
    }
  };

  document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = PRESETS[btn.dataset.preset];

      lineColorInput.value   = p.line;
      mainColorInput.value   = p.main;
      accentColorInput.value = p.accent;
      subColorInput.value    = p.sub;
      lightColorInput.value  = p.light;

      LINE_COLOR   = p.line;
      MAIN_COLOR   = p.main;
      ACCENT_COLOR = p.accent;
      SUB_COLOR    = p.sub;
      LIGHT_COLOR  = p.light;

      drawAll();
    });
  });

  /* ========================
        이벤트 & 초기화
  ======================== */
  leafCountInput.addEventListener("input", () => {
    leafCountText.textContent = leafCountInput.value;
    drawAll();
  });

  scaleSlider.addEventListener("input", () => {
    scaleText.textContent = scaleSlider.value + "%";
    drawAll();
  });

  leafStartInput.addEventListener("input", drawAll);
  bugCountInput.addEventListener("input", drawAll);

  lineColorInput.addEventListener("input", e => {
    LINE_COLOR = e.target.value;
    drawAll();
  });
  mainColorInput.addEventListener("input", e => {
    MAIN_COLOR = e.target.value;
    drawAll();
  });
  accentColorInput.addEventListener("input", e => {
    ACCENT_COLOR = e.target.value;
    drawAll();
  });
  subColorInput.addEventListener("input", e => {
    SUB_COLOR = e.target.value;
    drawAll();
  });
  lightColorInput.addEventListener("input", e => {
    LIGHT_COLOR = e.target.value;
    drawAll();
  });

  redrawBtn.addEventListener("click", drawAll);

  // 타일 배치 토글 버튼
  tileToggleBtn.addEventListener("click", () => {
    isTiling = !isTiling;
    tileToggleBtn.textContent = isTiling ? "타일 배치: ON" : "타일 배치: OFF";
    drawAll();
  });

  // 밀도 슬라이더
  densitySlider.addEventListener("input", () => {
    densityText.textContent = densitySlider.value;
    if (isTiling) drawAll();
  });

  window.addEventListener("resize", setCanvasSize);

  // 초기 세팅 + 렌더
  setCanvasSize();
});
