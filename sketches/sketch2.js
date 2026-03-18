// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const getPacificTime = () => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
    const parts = fmt.formatToParts(new Date());
    const get = (type) => Number(parts.find(p => p.type === type).value);
    return {
      h: get('hour'),
      m: get('minute'),
      s: get('second')
    };
  };

  let lastBurstMinute = null;
  let burstProgress = 1; // 1 = no active burst

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
  };

  p.drawStoveAndKettle = function (time) {
    const canvasW = p.width;
    const canvasH = p.height;

    // Ground / counter
    p.noStroke();
    p.fill(200, 190, 180);
    p.rect(0, canvasH * 0.65, canvasW, canvasH * 0.35);

    // Stove body
    const stoveW = canvasW * 0.35;
    const stoveH = canvasH * 0.18;
    const stoveX = canvasW * 0.18;
    const stoveY = canvasH * 0.55;

    p.fill(60);
    p.rect(stoveX, stoveY, stoveW, stoveH, 12);

    // Burners
    const burnerR = stoveW * 0.12;
    const burnerY = stoveY + stoveH * 0.35;
    const leftBurnerX = stoveX + stoveW * 0.28;
    const rightBurnerX = stoveX + stoveW * 0.72;

    p.fill(30);
    p.circle(leftBurnerX, burnerY, burnerR * 2);
    p.circle(rightBurnerX, burnerY, burnerR * 2);

    // Fire under left burner
    p.push();
    p.translate(leftBurnerX, burnerY + burnerR * 0.65);
    const flameCount = 10;
    for (let i = 0; i < flameCount; i++) {
      const angle = (360 / flameCount) * i;
      const len = burnerR * 0.7 + p.random(-2, 2);
      p.push();
      p.rotate(angle);
      const t = p.frameCount * 2;
      const flicker = p.map(p.sin(t + i * 20), -1, 1, -3, 3);
      p.translate(0, -burnerR * 0.4 + flicker);
      p.noStroke();
      p.fill(255, 180, 60, 230);
      p.triangle(0, 0, -4, -len, 4, -len);
      p.fill(255, 80, 40, 230);
      p.triangle(0, 2, -3, -len * 0.7, 3, -len * 0.7);
      p.pop();
    }
    p.pop();

    // Kettle sitting on left burner — round body like reference
    const kettleBodyR = burnerR * 1.3;
    const kettleX = leftBurnerX;
    const kettleY = burnerY - burnerR * 0.3;

    // Kettle body
    p.push();
    p.rectMode(p.CENTER);
    p.stroke(40);
    p.strokeWeight(2);
    p.fill(173, 216, 230);
    p.circle(kettleX, kettleY, kettleBodyR * 2);

    // Kettle base
    p.fill(150, 190, 210);
    p.ellipse(kettleX, kettleY + kettleBodyR * 0.55, kettleBodyR * 1.4, kettleBodyR * 0.5);

    // Lid
    p.fill(180, 220, 240);
    p.ellipse(kettleX, kettleY - kettleBodyR * 0.7, kettleBodyR * 1.1, kettleBodyR * 0.35);
    p.circle(kettleX, kettleY - kettleBodyR * 0.9, kettleBodyR * 0.12);

    // Handle
    p.noFill();
    p.stroke(40);
    p.strokeWeight(4);
    p.arc(
      kettleX,
      kettleY - kettleBodyR * 0.25,
      kettleBodyR * 1.9,
      kettleBodyR * 1.6,
      210,
      -30
    );

    // Spout
    p.fill(173, 216, 230);
    p.stroke(40);
    p.strokeWeight(2);
    const spoutX = kettleX + kettleBodyR * 0.9;
    const spoutY = kettleY - kettleBodyR * 0.1;
    p.quad(
      spoutX, spoutY,
      spoutX + kettleBodyR * 0.6, spoutY - kettleBodyR * 0.05,
      spoutX + kettleBodyR * 0.6, spoutY + kettleBodyR * 0.25,
      spoutX, spoutY + kettleBodyR * 0.18
    );

    // Clock face inside kettle body
    const clockR = kettleBodyR * 0.7;
    const { h, m, s } = time;

    p.stroke(40);
    p.strokeWeight(3);
    p.fill(250);
    p.circle(kettleX, kettleY, clockR * 2 * 0.9);

    // Ticks
    p.stroke(90);
    for (let a = 0; a < 360; a += 6) {
      const isHour = a % 30 === 0;
      const inner = clockR * (isHour ? 0.7 : 0.8);
      const outer = clockR * 0.9;
      p.strokeWeight(isHour ? 3 : 1.5);
      const x1 = kettleX + inner * p.cos(a - 90);
      const y1 = kettleY + inner * p.sin(a - 90);
      const x2 = kettleX + outer * p.cos(a - 90);
      const y2 = kettleY + outer * p.sin(a - 90);
      p.line(x1, y1, x2, y2);
    }

    // Convert to angles
    const secondAngle = (s / 60) * 360;
    const minuteAngle = ((m + s / 60) / 60) * 360;
    const hourAngle = ((h % 12 + m / 60) / 12) * 360;

    // Hour hand
    p.stroke(40);
    p.strokeWeight(5);
    p.line(
      kettleX,
      kettleY,
      kettleX + clockR * 0.45 * p.cos(hourAngle - 90),
      kettleY + clockR * 0.45 * p.sin(hourAngle - 90)
    );

    // Minute hand
    p.stroke(40);
    p.strokeWeight(3);
    p.line(
      kettleX,
      kettleY,
      kettleX + clockR * 0.7 * p.cos(minuteAngle - 90),
      kettleY + clockR * 0.7 * p.sin(minuteAngle - 90)
    );

    // Second hand
    p.stroke(200, 60, 60);
    p.strokeWeight(2);
    p.line(
      kettleX,
      kettleY,
      kettleX + clockR * 0.8 * p.cos(secondAngle - 90),
      kettleY + clockR * 0.8 * p.sin(secondAngle - 90)
    );

    // Center
    p.fill(40);
    p.noStroke();
    p.circle(kettleX, kettleY, 8);

    // Steam animation: gentle always-on plus big burst each minute
    p.noFill();
    p.stroke(220, 220, 255, 180);
    p.strokeWeight(2);
    const steamStartX = spoutX + kettleBodyR * 0.2;
    const steamStartY = spoutY - kettleBodyR * 0.1;

    // Gentle continuous steam
    const baseCount = 2;
    for (let i = 0; i < baseCount; i++) {
      const ox = i * 12;
      const t = p.frameCount * 0.7 + i * 25;
      const wobble = p.sin(t) * 4;
      p.beginShape();
      for (let yOff = 0; yOff < 50; yOff += 8) {
        p.curveVertex(
          steamStartX + ox + wobble * (yOff / 50),
          steamStartY - yOff
        );
      }
      p.endShape();
    }

    // Minute burst steam
    if (burstProgress < 1) {
      const burstStrength = 1 - burstProgress;
      const burstCount = 6;
      p.stroke(230, 235, 255, 200);
      for (let i = 0; i < burstCount; i++) {
        const ox = (i - burstCount / 2) * 10;
        p.beginShape();
        for (let yOff = 0; yOff < 70; yOff += 8) {
          const rise = yOff * (1 + burstStrength * 0.6);
          const wobble = p.sin(p.frameCount * 1.2 + i * 20) * (6 + 6 * burstStrength);
          p.curveVertex(
            steamStartX + ox + wobble * (yOff / 70),
            steamStartY - rise
          );
        }
        p.endShape();
      }
    }

    p.pop();
  };

  p.draw = function () {
    const time = getPacificTime();

    // Trigger burst when the minute changes
    if (lastBurstMinute === null || time.m !== lastBurstMinute) {
      lastBurstMinute = time.m;
      burstProgress = 0;
    }

    // Advance burst progress (roughly 2 seconds long)
    if (burstProgress < 1) {
      const step = p.deltaTime / 2000;
      burstProgress = Math.min(1, burstProgress + step);
    }

    p.background(245, 248, 252);
    p.drawStoveAndKettle(time);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
