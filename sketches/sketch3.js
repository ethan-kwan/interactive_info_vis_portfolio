// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const getPacificTime = () => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
    const parts = fmt.formatToParts(new Date());
    const get = (type) => Number(parts.find(part => part.type === type).value);
    return {
      h: get('hour'),
      m: get('minute'),
      s: get('second')
    };
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
  };

  const drawBackground = (time) => {
    const { h } = time;
    const hour = h % 24;

    // Explicit phases: morning (5–11), afternoon (11–17), evening (17–20), night (20–5)
    const morning = p.color(170, 215, 255);  // soft light blue
    const afternoon = p.color(110, 185, 245); // brighter blue
    const evening = p.color(40, 70, 120);    // darker, evening blue
    const night = p.color(15, 18, 45);       // deep night

    let bg;
    if (hour >= 5 && hour < 11) {
      const t = (hour - 5) / 6;
      bg = p.lerpColor(morning, afternoon, t);
    } else if (hour >= 11 && hour < 17) {
      const t = (hour - 11) / 6;
      bg = p.lerpColor(afternoon, afternoon, t); // hold bright blue through afternoon
    } else if (hour >= 17 && hour < 20) {
      const t = (hour - 17) / 3;
      bg = p.lerpColor(evening, night, t); // fade into darker evening/night
    } else {
      // Night hours
      bg = night;
    }

    p.background(bg);

    // Simple ground
    p.noStroke();
    p.fill(60, 120, 70);
    p.rect(0, p.height * 0.7, p.width, p.height * 0.3);
  };

  const drawSunMoon = (time) => {
    const { h, m } = time;
    const totalHours = (h % 24) + m / 60;

    // Map 0–24h to left-to-right sweep
    const x = p.map(totalHours, 0, 24, p.width * 0.05, p.width * 0.95);
    const arcRadius = p.height * 0.45;
    const angleT = p.map(totalHours, 0, 24, 0, 180); // 0–180 degrees
    const y = p.height * 0.7 - arcRadius * p.sin(p.radians(angleT));

    // Decide whether we show sun or moon (6–18 = sun, else moon)
    const isDay = totalHours >= 6 && totalHours < 18;

    if (isDay) {
      p.noStroke();
      p.fill(255, 220, 120);
      p.circle(x, y, p.height * 0.08);
    } else {
      p.noStroke();
      p.fill(245, 245, 255);
      p.circle(x, y, p.height * 0.07);
      // Little crescent effect
      p.fill(20, 24, 60);
      p.circle(x + p.height * 0.02, y - p.height * 0.005, p.height * 0.07);
    }
  };

  const drawFlowerClock = (time) => {
    const { h, m } = time;

    const centerX = p.width * 0.5;
    const baseY = p.height * 0.7;
    const stemHeight = p.height * 0.25;
    const flowerY = baseY - stemHeight;

    // Stem
    p.stroke(40, 120, 70);
    p.strokeWeight(8);
    p.line(centerX, baseY, centerX, flowerY);

    // Leaves (hands)
    const hourAngle = ((h % 12) + m / 60) * 30 - 90; // 30° per hour
    const minuteAngle = (m / 60) * 360 - 90;

    const hourLen = stemHeight * 0.6;
    const minuteLen = stemHeight * 0.9;

    // Hour leaf (shorter)
    p.push();
    p.translate(centerX, flowerY);
    p.stroke(40, 120, 70);
    p.fill(60, 160, 90);
    p.rotate(hourAngle);
    p.beginShape();
    p.vertex(0, 0);
    p.bezierVertex(hourLen * 0.4, -10, hourLen * 0.8, -10, hourLen, 0);
    p.bezierVertex(hourLen * 0.8, 10, hourLen * 0.4, 10, 0, 0);
    p.endShape(p.CLOSE);
    p.pop();

    // Minute leaf (longer)
    p.push();
    p.translate(centerX, flowerY);
    p.stroke(30, 110, 70);
    p.fill(70, 180, 110);
    p.rotate(minuteAngle);
    p.beginShape();
    p.vertex(0, 0);
    p.bezierVertex(minuteLen * 0.4, -12, minuteLen * 0.9, -12, minuteLen, 0);
    p.bezierVertex(minuteLen * 0.9, 12, minuteLen * 0.4, 12, 0, 0);
    p.endShape(p.CLOSE);
    p.pop();

    // Flower petals
    const petalCount = 10;
    const petalRadius = stemHeight * 0.32;
    p.push();
    p.translate(centerX, flowerY);
    for (let i = 0; i < petalCount; i++) {
      const a = (360 / petalCount) * i;
      const px = petalRadius * p.cos(a);
      const py = petalRadius * p.sin(a);
      p.noStroke();
      p.fill(255, 190, 120);
      p.ellipse(px, py, stemHeight * 0.18, stemHeight * 0.32);
    }

    // Flower center
    p.fill(255, 220, 80);
    p.stroke(200, 160, 60);
    p.strokeWeight(3);
    p.circle(0, 0, stemHeight * 0.3);

    p.pop();
  };

  p.draw = function () {
    const time = getPacificTime();

    drawBackground(time);
    drawSunMoon(time);
    drawFlowerClock(time);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
