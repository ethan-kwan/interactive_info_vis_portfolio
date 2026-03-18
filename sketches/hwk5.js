// Instance-mode sketch for HWK 5 tab
registerSketch('hwk5', function (p) {
  let containerEl = null;
  let table = null;
  let grouped = null;
  let loadError = null;
  const MIN_SEASONS_PLAYED = 5;

  const getContainerSize = () => {
    const fallbackW = p.windowWidth;
    const fallbackH = Math.min(620, p.windowHeight * 0.72);
    if (!containerEl) return { w: fallbackW, h: fallbackH };
    const rect = containerEl.getBoundingClientRect();
    return {
      w: Math.max(260, Math.floor(rect.width)),
      h: Math.max(420, Math.floor(p.windowHeight * 0.72))
    };
  };

  const heightStrToInches = (hStr) => {
    if (!hStr) return null;
    const s = String(hStr).trim();
    // Common format in this dataset: "6-10"
    const dash = s.match(/^(\d+)\s*-\s*(\d+)$/);
    if (dash) return Number(dash[1]) * 12 + Number(dash[2]);
    // Fallbacks: 6'10", 6’10, 6 ft 10 in
    const ftIn = s.match(/(\d+)\s*(?:ft|')\s*(\d+)\s*(?:in|\"|”)?/i);
    if (ftIn) return Number(ftIn[1]) * 12 + Number(ftIn[2]);
    const justNum = Number(s);
    if (Number.isFinite(justNum)) return justNum;
    return null;
  };

  const inchesToLabel = (inches) => {
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    return `${ft}'${inch}"`;
  };

  const binLabel = (startIn, binSize) => {
    const endIn = startIn + binSize - 1;
    return `${inchesToLabel(startIn)}–${inchesToLabel(endIn)}`;
  };

  const groupByHeightBins = (rows, binSizeIn = 2) => {
    const bins = new Map(); // startIn -> {startIn, label, sum, n}

    for (const r of rows) {
      const inches = heightStrToInches(r.height);
      const ppg = Number(r.ppg);
      if (!Number.isFinite(inches) || !Number.isFinite(ppg)) continue;
      if (ppg <= 0) continue;

      const startIn = Math.floor(inches / binSizeIn) * binSizeIn;
      if (!bins.has(startIn)) {
        bins.set(startIn, {
          startIn,
          label: binLabel(startIn, binSizeIn),
          sum: 0,
          n: 0
        });
      }
      const b = bins.get(startIn);
      b.sum += ppg;
      b.n += 1;
    }

    const out = Array.from(bins.values())
      .filter(b => b.n >= 8) // keep bins with enough players for a stable average
      .map(b => ({
        ...b,
        avg: b.sum / b.n
      }))
      .sort((a, b) => a.startIn - b.startIn);

    return out;
  };

  const extractRows = () => {
    if (!table) return [];
    const heightCol = 'HEIGHT';
    const ppgCol = 'PTS'; // dataset uses career points per game in PTS column for Career timeframe
    const timeframeCol = 'STATS_TIMEFRAME';
    const fromYearCol = 'FROM_YEAR';
    const toYearCol = 'TO_YEAR';

    const rows = [];
    for (let r = 0; r < table.getRowCount(); r++) {
      const timeframe = table.getString(r, timeframeCol);
      if (timeframe && String(timeframe).trim().toLowerCase() !== 'career') continue;
      const fromYear = Number(table.getString(r, fromYearCol));
      const toYear = Number(table.getString(r, toYearCol));
      const seasons = (Number.isFinite(fromYear) && Number.isFinite(toYear)) ? (toYear - fromYear + 1) : null;
      if (!Number.isFinite(seasons) || seasons < MIN_SEASONS_PLAYED) continue;
      rows.push({
        height: table.getString(r, heightCol),
        ppg: table.getString(r, ppgCol),
        seasons
      });
    }
    return rows;
  };

  const drawInfographic = (bins) => {
    const pad = 28;
    const headerH = 86;
    const footH = 54;

    // Card
    p.noStroke();
    p.fill(255);
    p.rect(12, 12, p.width - 24, p.height - 24, 16);
    p.fill(15, 23, 42, 12);
    p.rect(12, 12, p.width - 24, headerH, 16);

    // Title + subtitle
    p.fill(15, 23, 42);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(20);
    p.text('The taller the better? 🏀', 12 + pad, 12 + 18);
    p.fill(15, 23, 42, 170);
    p.textSize(12);
    p.text(
      `Career points per game (PPG), averaged within 2-inch height groups (min ${MIN_SEASONS_PLAYED} seasons)`,
      12 + pad,
      12 + 48
    );

    // Layout
    const chartX = 12 + pad;
    const chartY = 12 + headerH + 18;
    const chartW = p.width - (12 + pad) - (12 + pad);
    const chartH = p.height - chartY - footH;

    // Grid + axis
    const maxAvg = Math.max(...bins.map(b => b.avg), 1);
    const niceMax = Math.ceil(maxAvg / 5) * 5;

    p.stroke(15, 23, 42, 60);
    p.strokeWeight(1);
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const t = i / ticks;
      const y = chartY + chartH - t * chartH;
      p.line(chartX, y, chartX + chartW, y);
      p.noStroke();
      p.fill(15, 23, 42, 120);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(11);
      p.text((niceMax * t).toFixed(0), chartX - 26, y);
      p.stroke(15, 23, 42, 60);
    }

    p.stroke(15, 23, 42, 120);
    p.strokeWeight(2);
    p.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

    // Bars
    const barGap = 10;
    const barW = (chartW - barGap * (bins.length + 1)) / bins.length;
    const highlight = bins.reduce((best, b) => (b.avg > best.avg ? b : best), bins[0]);

    for (let i = 0; i < bins.length; i++) {
      const b = bins[i];
      const t = b.avg / niceMax;
      const bh = chartH * t;
      const x = chartX + barGap + i * (barW + barGap);
      const y = chartY + chartH - bh;

      const isHi = b.startIn === highlight.startIn;
      p.noStroke();
      p.fill(isHi ? p.color(245, 158, 11, 210) : p.color(59, 130, 246, 190));
      p.rect(x, y, barW, bh, 10);

      // PPG value label for each bar (slightly larger for highlight)
      p.fill(15, 23, 42);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(isHi ? 12 : 10);
      p.text(`${b.avg.toFixed(1)} PPG`, x + barW / 2, y - 6);

      // Height label (skip some to avoid clutter)
      if (bins.length <= 14 || i % 2 === 0) {
        p.fill(15, 23, 42, 170);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);
        p.text(b.label, x + barW / 2, chartY + chartH + 10);
      }

      // Player count per bin (put inside bars when possible, otherwise above baseline)
      const countLabel = `n=${b.n}`;
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(10);
      if (bh > 22) {
        p.fill(255, 255, 255, 220);
        p.text(countLabel, x + barW / 2, y + 18);
      } else {
        p.fill(15, 23, 42, 150);
        p.text(countLabel, x + barW / 2, chartY + chartH - 4);
      }
    }

    // Footer note
    p.noStroke();
    p.fill(15, 23, 42, 140);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.textSize(11);
    p.text(
      'Source: PlayerIndex NBA stats (Career timeframe). Bars show mean PPG per height bin.',
      12 + pad,
      p.height - 18
    );
  };

  p.preload = function () {
    try {
      table = p.loadTable('data/playerindex_nba_stats.csv', 'csv', 'header');
    } catch (e) {
      loadError = String(e);
    }
  };

  p.setup = function () {
    containerEl = p._userNode || null;
    const { w, h } = getContainerSize();
    p.createCanvas(w, h);
    p.textFont('system-ui');
  };

  p.draw = function () {
    p.background(235, 242, 255);

    if (loadError) {
      p.fill(120, 20, 20);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(14);
      p.text(`Failed to load CSV: ${loadError}`, 20, 20);
      return;
    }

    if (!table) {
      p.fill(15, 23, 42, 180);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(14);
      p.text('Loading data…', 20, 20);
      return;
    }

    if (!grouped) {
      const rows = extractRows();
      grouped = groupByHeightBins(rows, 2);
    }

    if (!grouped || grouped.length === 0) {
      p.fill(15, 23, 42, 180);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(14);
      p.text('No data to display (check HEIGHT / PTS columns).', 20, 20);
      return;
    }

    drawInfographic(grouped);
  };

  p.windowResized = function () {
    const { w, h } = getContainerSize();
    p.resizeCanvas(w, h);
  };
});

