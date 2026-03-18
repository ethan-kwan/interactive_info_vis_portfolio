// Instance-mode sketch for tab 4
registerSketch('sk4', function (p) {
  const getPacificTime = () => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const parts = fmt.formatToParts(new Date());
    const get = (type) => Number(parts.find(part => part.type === type).value);
    return { h: get('hour'), m: get('minute'), s: get('second') };
  };

  const getBlindsOpen01 = (time) => {
    const t = time.h + time.m / 60 + time.s / 3600; // 0..24
    if (t < 6) return 0;
    if (t < 12) return p.constrain((t - 6) / 6, 0, 1); // 6am -> noon opens
    if (t < 18) return p.constrain(1 - (t - 12) / 6, 0, 1); // noon -> 6pm closes
    return 0;
  };

  const drawNeonDigital = (str, x, y, size, col) => {
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(size);
    p.noStroke();
    for (let i = 10; i >= 1; i--) {
      p.fill(p.red(col), p.green(col), p.blue(col), 12);
      p.text(str, x + p.random(-0.2, 0.2), y + p.random(-0.2, 0.2));
    }
    p.fill(col);
    p.text(str, x, y);
    p.pop();
  };

  const getPacificDate = () => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const parts = fmt.formatToParts(new Date());
    const get = (type) => Number(parts.find(part => part.type === type).value);
    return { y: get('year'), mo: get('month'), d: get('day') };
  };

  const weekdayIndexPacific = (y, mo, d) => {
    // Use a safe UTC hour so the Pacific date doesn't roll over.
    const dt = new Date(Date.UTC(y, mo - 1, d, 20, 0, 0));
    const wd = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short'
    }).format(dt);
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return map[wd] ?? 0;
  };

  const monthLabelPacific = (y, mo) => {
    const dt = new Date(Date.UTC(y, mo - 1, 1, 20, 0, 0));
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'long',
      year: 'numeric'
    }).format(dt);
  };

  const drawWallCalendar = (x, y, w, h, open01) => {
    const date = getPacificDate();
    const daysInMonth = new Date(Date.UTC(date.y, date.mo, 0)).getUTCDate();
    const firstWday = weekdayIndexPacific(date.y, date.mo, 1); // 0=Sun..6=Sat

    // Paper
    p.push();
    p.stroke(20, 20, 25, 90);
    p.strokeWeight(2);
    p.fill(p.lerpColor(p.color(235, 232, 225), p.color(252, 250, 245), open01));
    p.rect(x, y, w, h, 8);

    // Clip to paper
    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.roundRect(x, y, w, h, 8);
    p.drawingContext.clip();

    // Header strip
    p.noStroke();
    p.fill(245, 90, 90, p.map(open01, 0, 1, 90, 140));
    p.rect(x, y, w, h * 0.18);

    // Month label
    p.fill(30, 30, 36, 230);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(Math.max(12, h * 0.06));
    p.text(monthLabelPacific(date.y, date.mo), x + w * 0.06, y + h * 0.09);

    // Pin holes
    p.fill(40, 35, 30, 160);
    p.circle(x + w * 0.18, y + h * 0.03, 6);
    p.circle(x + w * 0.82, y + h * 0.03, 6);

    // Grid
    const gridX = x + w * 0.06;
    const gridY = y + h * 0.22;
    const gridW = w * 0.88;
    const gridH = h * 0.72;
    const cols = 7;
    const rows = 6;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    // Weekday labels
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    p.fill(60, 60, 70, 220);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(10, h * 0.045));
    for (let c = 0; c < cols; c++) {
      p.text(labels[c], gridX + (c + 0.5) * cellW, gridY - cellH * 0.35);
    }

    // Cells + numbers
    p.stroke(60, 60, 70, p.map(open01, 0, 1, 70, 110));
    p.strokeWeight(1);
    let day = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const cx = gridX + c * cellW;
        const cy = gridY + r * cellH;
        p.noFill();
        p.rect(cx, cy, cellW, cellH);

        if (idx >= firstWday && day <= daysInMonth) {
          // highlight today
          if (day === date.d) {
            p.noStroke();
            p.fill(255, 220, 120, 200);
            p.rect(cx + 1, cy + 1, cellW - 2, cellH - 2);
            p.stroke(60, 60, 70, 110);
          }

          p.noStroke();
          p.fill(35, 35, 45, 230);
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(Math.max(10, h * 0.042));
          p.text(String(day), cx + cellW * 0.12, cy + cellH * 0.12);
          day++;
        }
      }
    }

    // End clip
    p.drawingContext.restore();
    p.pop();
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
  };

  const drawDormRoom = (time, open01) => {
    const w = p.width;
    const h = p.height;

    // Lighting changes with blinds openness (more open = brighter room)
    const base = p.lerpColor(p.color(35, 36, 45), p.color(210, 205, 190), open01);
    p.background(base);

    // Back wall
    p.noStroke();
    p.fill(p.lerpColor(p.color(55, 55, 70), p.color(235, 230, 220), open01));
    p.rect(0, 0, w, h * 0.78);

    // Floor
    p.fill(p.lerpColor(p.color(45, 35, 30), p.color(155, 120, 85), open01));
    p.rect(0, h * 0.78, w, h * 0.22);

    // Cheap rug
    p.fill(p.lerpColor(p.color(40, 55, 65), p.color(90, 120, 130), open01));
    p.rect(w * 0.08, h * 0.83, w * 0.55, h * 0.12, 12);

    // Bed (messy)
    const bedX = w * 0.08, bedY = h * 0.52, bedW = w * 0.38, bedH = h * 0.22;
    p.fill(p.lerpColor(p.color(30, 30, 35), p.color(90, 85, 80), open01));
    p.rect(bedX, bedY, bedW, bedH, 10);
    p.fill(p.lerpColor(p.color(70, 80, 95), p.color(210, 220, 235), open01));
    p.rect(bedX + bedW * 0.04, bedY + bedH * 0.08, bedW * 0.92, bedH * 0.78, 12);
    p.fill(p.lerpColor(p.color(60, 65, 85), p.color(180, 190, 215), open01));
    p.rect(bedX + bedW * 0.06, bedY + bedH * 0.18, bedW * 0.55, bedH * 0.26, 14);
    // pillow
    p.fill(p.lerpColor(p.color(110, 110, 120), p.color(245, 245, 245), open01));
    p.rect(bedX + bedW * 0.62, bedY + bedH * 0.16, bedW * 0.3, bedH * 0.22, 14);
    // blanket fold
    p.fill(p.lerpColor(p.color(55, 65, 85), p.color(160, 175, 210), open01));
    p.beginShape();
    p.vertex(bedX + bedW * 0.12, bedY + bedH * 0.72);
    p.vertex(bedX + bedW * 0.88, bedY + bedH * 0.6);
    p.vertex(bedX + bedW * 0.86, bedY + bedH * 0.86);
    p.vertex(bedX + bedW * 0.16, bedY + bedH * 0.9);
    p.endShape(p.CLOSE);

    // Desk + chair
    const deskX = w * 0.58, deskY = h * 0.58, deskW = w * 0.32, deskH = h * 0.16;
    p.fill(p.lerpColor(p.color(60, 45, 35), p.color(160, 125, 90), open01));
    p.rect(deskX, deskY, deskW, deskH, 8);
    // legs
    p.rect(deskX + deskW * 0.05, deskY + deskH, deskW * 0.08, h * 0.12, 6);
    p.rect(deskX + deskW * 0.87, deskY + deskH, deskW * 0.08, h * 0.12, 6);
    // monitor
    p.fill(p.lerpColor(p.color(25, 25, 30), p.color(70, 70, 75), open01));
    p.rect(deskX + deskW * 0.2, deskY - deskH * 0.55, deskW * 0.35, deskH * 0.45, 8);
    p.fill(p.lerpColor(p.color(10, 10, 12), p.color(25, 25, 28), open01));
    p.rect(deskX + deskW * 0.22, deskY - deskH * 0.52, deskW * 0.31, deskH * 0.38, 6);
    // screen glow
    p.fill(80, 160, 255, p.map(open01, 0, 1, 40, 12));
    p.rect(deskX + deskW * 0.22, deskY - deskH * 0.52, deskW * 0.31, deskH * 0.38, 6);
    // chair
    p.fill(p.lerpColor(p.color(40, 40, 48), p.color(110, 110, 120), open01));
    p.rect(deskX + deskW * 0.62, deskY + deskH * 0.55, deskW * 0.22, deskH * 0.3, 10);
    p.rect(deskX + deskW * 0.62, deskY + deskH * 0.15, deskW * 0.22, deskH * 0.35, 10);

    // Paper month calendar (college dorm vibe)
    drawWallCalendar(w * 0.08, h * 0.10, w * 0.34, h * 0.28, open01);

    // Laundry pile
    p.noStroke();
    p.fill(p.lerpColor(p.color(70, 75, 85), p.color(185, 190, 200), open01));
    p.ellipse(w * 0.48, h * 0.88, w * 0.18, h * 0.08);
    p.fill(p.lerpColor(p.color(60, 55, 70), p.color(170, 160, 180), open01));
    p.ellipse(w * 0.52, h * 0.86, w * 0.16, h * 0.07);

    // Window
    const winX = w * 0.62, winY = h * 0.12, winW = w * 0.30, winH = h * 0.40;
    // frame
    p.stroke(40, 35, 30);
    p.strokeWeight(10);
    p.noFill();
    p.rect(winX, winY, winW, winH, 6);

    // Outside sky gradient based on time
    const outsideDay = p.color(150, 210, 255);
    const outsideEvening = p.color(240, 160, 110);
    const outsideNight = p.color(20, 24, 60);
    const hour = time.h + time.m / 60;
    let outside;
    if (hour >= 6 && hour < 16) outside = outsideDay;
    else if (hour >= 16 && hour < 20) outside = p.lerpColor(outsideEvening, outsideNight, (hour - 16) / 4);
    else outside = outsideNight;

    p.noStroke();
    p.fill(outside);
    p.rect(winX, winY, winW, winH, 4);

    // Simple "campus" silhouettes
    p.fill(10, 12, 18, p.map(open01, 0, 1, 180, 110));
    p.rect(winX, winY + winH * 0.72, winW, winH * 0.28);
    p.fill(18, 20, 28, p.map(open01, 0, 1, 200, 130));
    p.rect(winX + winW * 0.08, winY + winH * 0.55, winW * 0.18, winH * 0.45);
    p.rect(winX + winW * 0.32, winY + winH * 0.60, winW * 0.12, winH * 0.40);
    p.rect(winX + winW * 0.55, winY + winH * 0.52, winW * 0.25, winH * 0.48);

    // Blinds overlay (open01 controls how much window is visible)
    const blindInset = 8;
    const bx = winX + blindInset;
    const by = winY + blindInset;
    const bw = winW - blindInset * 2;
    const bh = winH - blindInset * 2;

    // blinds background
    p.fill(235, 232, 225, 240);
    p.rect(bx, by, bw, bh, 2);

    // slats: more open => bigger gaps between slats
    const slatCount = 14;
    const slatH = bh / slatCount;
    const gap = p.lerp(1, slatH * 0.72, open01);
    const thickness = p.lerp(slatH * 0.95, slatH * 0.35, open01);

    for (let i = 0; i < slatCount; i++) {
      const y0 = by + i * slatH;
      p.fill(245, 242, 236, 255);
      p.rect(bx, y0, bw, thickness, 2);
      p.fill(190, 185, 175, 110);
      p.rect(bx, y0 + thickness - 2, bw, 2);
      const gh = gap;
      if (gh > 0.5) {
        p.fill(outside);
        p.rect(bx, y0 + thickness, bw, p.min(gh, slatH - thickness), 0);
      }
    }

    // Window sill
    const sillH = h * 0.06;
    p.stroke(40, 35, 30);
    p.strokeWeight(6);
    p.fill(p.lerpColor(p.color(75, 60, 45), p.color(185, 155, 120), open01));
    p.rect(winX - 6, winY + winH, winW + 12, sillH, 6);

    // Alarm clock on sill (synced to Pacific time)
    const clockW = winW * 0.28;
    const clockH = sillH * 0.9;
    const clockX = winX + winW * 0.16;
    const clockY = winY + winH + sillH * 0.06;

    p.noStroke();
    p.fill(30, 30, 36);
    p.rect(clockX, clockY, clockW, clockH, 10);
    p.fill(18, 18, 22);
    p.rect(clockX + clockW * 0.06, clockY + clockH * 0.18, clockW * 0.88, clockH * 0.64, 8);

    const hh = String(time.h).padStart(2, '0');
    const mm = String(time.m).padStart(2, '0');
    const ss = String(time.s).padStart(2, '0');
    drawNeonDigital(`${hh}:${mm}:${ss}`, clockX + clockW * 0.5, clockY + clockH * 0.5, clockH * 0.42, p.color(90, 255, 160));

    // little "PM vibe" LED if afternoon/evening
    if (time.h >= 12) {
      p.fill(255, 110, 90);
      p.circle(clockX + clockW * 0.87, clockY + clockH * 0.2, 8);
    }

    // Clutter on sill: cup + instant noodles
    p.fill(240, 240, 245, 220);
    p.rect(winX + winW * 0.62, winY + winH + sillH * 0.18, winW * 0.08, sillH * 0.6, 6);
    p.fill(255, 190, 90, 230);
    p.ellipse(winX + winW * 0.78, winY + winH + sillH * 0.65, winW * 0.12, sillH * 0.45);
    p.fill(250, 240, 220, 230);
    p.ellipse(winX + winW * 0.78, winY + winH + sillH * 0.52, winW * 0.11, sillH * 0.22);

    // Soft light beam when blinds are open
    if (open01 > 0.02) {
      const beamA = p.map(open01, 0, 1, 0, 110);
      p.noStroke();
      p.fill(255, 240, 200, beamA);
      p.beginShape();
      p.vertex(winX + winW * 0.12, winY + winH * 0.55);
      p.vertex(winX + winW * 0.85, winY + winH * 0.55);
      p.vertex(w * 0.70, h * 0.95);
      p.vertex(w * 0.30, h * 0.95);
      p.endShape(p.CLOSE);
    }
  };

  p.draw = function () {
    const time = getPacificTime();
    const open01 = getBlindsOpen01(time);
    drawDormRoom(time, open01);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
