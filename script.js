const W = 1200,
        H = 760,
        cv = document.getElementById("c"),
        g = cv.getContext("2d"),
        DPR = Math.min(window.devicePixelRatio || 1, 2);

      if (!g.roundRect)
        g.roundRect = function (x, y, w, h, r) {
          r = Math.min(r || 0, w / 2, h / 2);
          this.moveTo(x + r, y);
          this.arcTo(x + w, y, x + w, y + h, r);
          this.arcTo(x + w, y + h, x, y + h, r);
          this.arcTo(x, y + h, x, y, r);
          this.arcTo(x, y, x + w, y, r);
          this.closePath();
        };
      let rot = false,
        S = 1,
        OX = 0,
        OY = 0,
        CW = W,
        CH = H,
        M = [1, 0, 0, 1, 0, 0],
        X0 = 0,
        X1 = W,
        Y0 = 0,
        Y1 = H;
      function fit() {
        const vv = window.visualViewport;
        CW = Math.round((vv && vv.width) || innerWidth);
        CH = Math.round((vv && vv.height) || innerHeight);
        cv.width = Math.round(CW * DPR);
        cv.height = Math.round(CH * DPR);
        Object.assign(cv.style, {
          position: "fixed",
          left: "0",
          top: "0",
          width: CW + "px",
          height: CH + "px",
          transform: "none",
        });
        rot = CH > CW * 1.1;
        const lw = rot ? CH : CW,
          lh = rot ? CW : CH;
        S = Math.min(lw / W, lh / H);
        const VW = lw / S,
          VH = lh / S;
        OX = (VW - W) / 2;
        OY = (VH - H) / 2;
        X0 = -OX;
        X1 = W + OX;
        Y0 = -OY;
        Y1 = H + OY;
        M = rot
          ? [0, S, -S, 0, CW - S * OY, S * OX]
          : [S, 0, 0, S, S * OX, S * OY];
      }
      addEventListener("resize", fit);
      addEventListener("orientationchange", () => setTimeout(fit, 150));
      if (window.visualViewport)
        window.visualViewport.addEventListener("resize", fit);
      fit();
      function goFS() {
        try {
          if (
            window.matchMedia &&
            matchMedia("(pointer:coarse)").matches &&
            !document.fullscreenElement &&
            document.documentElement.requestFullscreen
          ) {
            document.documentElement
              .requestFullscreen()
              .then(() => {
                try {
                  screen.orientation.lock("landscape").catch(() => {});
                } catch (_) {}
              })
              .catch(() => {});
          }
        } catch (_) {}
      }
      const C = (r, gg, b) => `rgb(${r},${gg},${b})`;
      const INK = C(65, 42, 36),
        DARK = C(65, 48, 65),
        BROWN = C(138, 87, 61),
        GREEN = C(66, 157, 100),
        RED = C(214, 76, 67),
        GOLD = C(255, 203, 96),
        PLUM = C(104, 75, 91),
        ROSE = C(232, 143, 134),
        SKIN = C(248, 195, 160),
        TOPICS = ["Power Rule", "Sum and Difference Rules", "Product Rule", "Quotient Rule", "Chain Rule"];
      const LEVEL_COUNT = TOPICS.length;
      const LOADING_TIME = 3000;
      let loadingStart = null;
      const ORDER_TIME = 45,
        PASS = 4,
        PER = 5,
        PI = Math.PI;
      const FT = {
        title: [42, 1],
        head: [28, 1],
        body: [22, 1],
        small: [18, 0],
        tiny: [15, 0],
      };
      const setF = (k) =>
        (g.font =
          (FT[k][1] ? "bold " : "") +
          FT[k][0] +
          "px Arial, Helvetica, sans-serif");
      const tw = (s, k) => {
        setF(k);
        return g.measureText(s).width;
      };
      function T(s, x, y, k, col, center, mw) {
        s = String(s);
        setF(k);
        if (mw && g.measureText(s).width > mw) {
          while (s.length > 2 && g.measureText(s + "…").width > mw)
            s = s.slice(0, -1);
          s += "…";
        }
        g.fillStyle = col || INK;
        g.textAlign = center ? "center" : "left";
        g.textBaseline = center ? "middle" : "top";
        g.fillText(s, x, y);
      }
      const R = (x, y, w, h, f, r = 0) => {
        g.fillStyle = f;
        g.beginPath();
        g.roundRect(x, y, w, h, r);
        g.fill();
      };
      const RS = (x, y, w, h, s, lw, r = 0) => {
        g.strokeStyle = s;
        g.lineWidth = lw;
        g.beginPath();
        g.roundRect(x, y, w, h, r);
        g.stroke();
      };
      const E = (x, y, w, h, f) => {
        g.fillStyle = f;
        g.beginPath();
        g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7);
        g.fill();
      };
      const Ci = (x, y, r, f) => {
        g.fillStyle = f;
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.fill();
      };
      const L = (a, b, c, d, s, lw) => {
        g.strokeStyle = s;
        g.lineWidth = lw;
        g.beginPath();
        g.moveTo(a, b);
        g.lineTo(c, d);
        g.stroke();
      };
      const ARC = (x, y, w, h, a0, a1, s, lw) => {
        g.strokeStyle = s;
        g.lineWidth = lw;
        g.beginPath();
        g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, a0, a1);
        g.stroke();
      };
      const hit = (r, p) =>
        p[0] >= r[0] &&
        p[0] < r[0] + r[2] &&
        p[1] >= r[1] &&
        p[1] < r[1] + r[3];
      const ctr = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];

      function panel(
        r,
        col = "rgb(255,251,239)",
        bd = "rgb(231,203,183)",
        rad = 22,
      ) {
        const [x, y, w, h] = r;
        R(x, y + 6, w, h, "rgb(135,92,92)", rad);
        R(x, y, w, h, col, rad);
        RS(x, y, w, h, bd, 2, rad);
        L(x + 23, y + 7, x + w - 23, y + 7, "#fff", 2);
      }
      function button(r, label, en = true) {
        const hv = en && hit(r, mouse);
        panel(
          r,
          hv
            ? "rgb(255,188,135)"
            : en
              ? "rgb(255,207,162)"
              : "rgb(221,214,211)",
          en ? "rgb(214,137,119)" : "rgb(187,177,174)",
          15,
        );
        const c = ctr(r);
        T(
          label,
          c[0],
          c[1],
          "small",
          en ? DARK : "rgb(141,134,131)",
          1,
          r[2] - 22,
        );
      }
      function background() {
        const ex = 40;
        g.fillStyle = "rgb(250,232,221)";
        g.fillRect(X0 - ex, Y0 - ex, X1 - X0 + 2 * ex, Y1 - Y0 + 2 * ex);
        g.fillStyle = "rgb(255,247,235)";
        g.fillRect(X0 - ex, Y0 - ex, X1 - X0 + 2 * ex, 170 - Y0 + ex);
        for (let y = 175; y < 715; y += 68) {
          L(X0 - ex, y, X1 + ex, y, "rgb(242,215,206)", 2);
          const off = Math.floor(y / 68) % 2 ? 0 : 58,
            st0 = off - 116 * Math.ceil((off - X0 + ex) / 116);
          for (let x = st0; x < X1 + ex; x += 116)
            L(x, y, x, y + 68, "rgb(242,215,206)", 2);
        }
        g.fillStyle = "rgb(174,119,113)";
        g.fillRect(X0 - ex, 704, X1 - X0 + 2 * ex, Y1 - 704 + ex);
        g.fillStyle = "rgb(207,150,133)";
        g.fillRect(X0 - ex, 704, X1 - X0 + 2 * ex, 9);
        const fy = Math.max(H, Y1) + ex,
          k = (18 * (fy - 716)) / 44,
          s0 = -95 * Math.ceil((X0 - ex) / -95);
        for (let x = Math.floor((X0 - ex - k) / 95) * 95; x < X1 + ex; x += 95)
          L(x, 716, x + k, fy, "rgb(157,104,105)", 2);
        for (const x of [178, 600, 1020]) {
          L(x, Y0 - ex, x, 32, "rgb(129,91,94)", 4);
          E(x - 42, 32, 84, 47, "rgb(251,224,169)");
          E(x - 37, 36, 74, 36, "rgb(255,246,212)");
          Ci(x - 15, 48, 7, "#fffff8");
        }
        for (const [x, y] of [
          [70, 228],
          [1130, 225],
          [88, 628],
          [1120, 633],
        ]) {
          Ci(x, y, 10, "rgb(255,245,220)");
          g.strokeStyle = "rgb(234,184,163)";
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y, 10, 0, 7);
          g.stroke();
        }
      }
      function chef(x, y, t, s) {
        x |= 0;
        y = (y + Math.sin(t / 260) * 2) | 0;
        const ci = (c, dx, dy, r) =>
            Ci(x + dx * s, y + dy * s, Math.max(1, r * s), c),
          bx = (c, dx, dy, w, h, r = 0) =>
            R(x + dx * s, y + dy * s, w * s, h * s, c, r * s);
        bx(PLUM, -41, 39, 82, 78, 21);
        bx("#fffcf8", -37, 32, 74, 76, 17);
        bx(ROSE, -28, 68, 56, 40, 10);
        ci(SKIN, 0, 3, 36);
        ci(SKIN, -33, 5, 9);
        ci(SKIN, 33, 5, 9);
        ci(DARK, -12, -1, 3);
        ci(DARK, 12, -1, 3);
        ARC(x - 14 * s, y + 3 * s, 28 * s, 19 * s, 0, PI, "rgb(139,80,81)", 2);
        ci("rgb(249,152,150)", -25, 16, 7);
        ci("rgb(249,152,150)", 25, 16, 7);
        bx("#fff", -35, -48, 70, 28, 10);
        for (const dx of [-22, 0, 22]) ci("#fff", dx, -45, 20);
        bx("#fff", -34, -27, 68, 12, 4);
        ci(SKIN, 43, 68 + Math.sin(t / 180) * 3, 11);
        bx("#fff", -4, 50, 8, 29, 2);
        ci("rgb(255,224,148)", 0, 87, 6);
      }
      function customer(x, y, t) {
        x |= 0;
        y = (y + Math.sin(t / 380) * 2) | 0;
        E(x - 56, y + 34, 112, 109, "rgb(116,156,158)");
        E(x - 56, y + 121, 112, 22, "rgb(85,126,136)");
        Ci(x, y + 10, 43, "rgb(246,197,165)");
        ARC(x - 44, y - 33, 88, 67, PI, 2 * PI, "rgb(101,69,67)", 12);
        Ci(x - 14, y + 10, 4, DARK);
        Ci(x + 14, y + 10, 4, DARK);
        ARC(x - 13, y + 19, 26, 19, 0, PI, "rgb(158,87,88)", 2);
        Ci(x - 27, y + 25, 7, "rgb(246,154,155)");
        Ci(x + 27, y + 25, 7, "rgb(246,154,155)");
      }
      function dish(x, y) {
        x |= 0;
        y |= 0;
        E(x - 66, y - 7, 132, 47, "rgb(151,113,104)");
        E(x - 66, y - 21, 132, 48, "rgb(255,252,242)");
        E(x - 51, y - 13, 102, 30, "rgb(218,231,219)");
        E(x - 41, y - 17, 82, 30, "rgb(126,189,123)");
        for (const [dx, dy, c] of [
          [-22, -8, "rgb(238,114,99)"],
          [15, -9, "rgb(255,205,116)"],
          [0, 1, "rgb(242,149,103)"],
        ])
          Ci(x + dx, y + dy, 11, c);
        E(x - 4, y - 22, 29, 13, "rgb(75,155,112)");
      }
      function station(r, name, active, done) {
        const fill = done
            ? "rgb(224,246,231)"
            : active
              ? "rgb(255,232,188)"
              : "rgb(255,248,237)",
          bd = done
            ? "rgb(87,170,134)"
            : active
              ? "rgb(235,160,99)"
              : "rgb(229,200,184)";
        if (active)
          R(r[0] - 6, r[1] - 6, r[2] + 12, r[3] + 12, "rgb(255,208,154)", 24);
        panel(r, fill, bd, 19);
        let [cx, cy] = ctr(r);
        cy -= 3;
        if (name == "CHOP") {
          R(cx - 41, cy - 13, 82, 47, "rgb(169,114,87)", 10);
          R(cx - 35, cy - 8, 70, 34, "rgb(219,164,118)", 8);
          Ci(cx - 12, cy + 7, 11, "rgb(110,183,120)");
          Ci(cx + 11, cy + 6, 10, "rgb(236,118,100)");
          L(cx - 20, cy - 35, cx + 30, cy - 18, "rgb(90,98,112)", 7);
        } else if (name == "MIX") {
          E(cx - 44, cy - 12, 88, 54, "rgb(113,169,183)");
          E(cx - 44, cy - 19, 88, 27, "rgb(223,242,237)");
          E(cx - 35, cy - 12, 70, 14, "rgb(246,203,129)");
          L(cx - 13, cy - 44, cx + 13, cy + 2, "rgb(104,104,117)", 5);
        } else if (name == "COOK") {
          for (const dx of [-19, 0, 19]) {
            g.fillStyle = "rgb(245,136,92)";
            g.beginPath();
            g.moveTo(cx + dx - 8, cy + 30);
            g.lineTo(cx + dx, cy - 5);
            g.lineTo(cx + dx + 10, cy + 30);
            g.fill();
          }
          E(cx - 43, cy - 15, 86, 33, "rgb(85,89,108)");
          E(cx - 35, cy - 12, 70, 21, "rgb(242,169,105)");
          L(cx + 34, cy - 2, cx + 57, cy - 16, "rgb(85,89,108)", 9);
        } else dish(cx, cy + 3);
        T(name, cx, r[1] + r[3] - 21, "small", DARK, 1);
        if (done) T("DONE", r[0] + r[2] - 33, r[1] + 15, "tiny", GREEN, 1);
        if (active) T("DROP HERE", cx, r[1] + 16, "tiny", BROWN, 1);
      }

      /* ---------- questions ---------- */
      const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      const pw = (c, n) => {
        if (c === 0) return "0";
        if (n === 0) return "" + c;
        const k = c === 1 ? "" : c === -1 ? "-" : "" + c;
        return n === 1 ? k + "x" : k + "x^" + n;
      };
      function mk(station, prompt, cor, wa, wb) {
        let o = [...new Set([cor, wa, wb].map(String))];
        for (const f of ["0", "1", "x", "2x", "x^2", "none"]) {
          if (o.length >= 3) break;
          if (!o.includes(f)) o.push(f);
        }
        for (let i = o.length - 1; i > 0; i--) {
          const j = ri(0, i);
          [o[i], o[j]] = [o[j], o[i]];
        }
        return {
          station,
          prompt,
          options: o.slice(0, 3),
          correct: String(cor),
        };
      }
      // Moderate classroom questions: 5 orders per level, 3 stations per order.
      // Each entry: expression, final answer, CHOP prompt, CHOP answer,
      // two CHOP distractors, and (for higher-order) first derivative.
      const QUESTIONS = [
        [
          ["7x", "7", "What is the derivative of x?", "1", "0", "x"],
          ["x^2 + 3", "2x", "What is the derivative of 3?", "0", "1", "3"],
          ["4x + 2", "4", "What is the derivative of 2?", "0", "1", "2"],
          ["x^3", "3x^2", "What is the exponent of x?", "3", "2", "4"],
          ["5x^2", "10x", "What is the derivative of x^2?", "2x", "x", "x^2"],
        ],
        [
          ["x^3", "3x^2", "Bring down which exponent?", "3", "2", "4"],
          ["2x^3", "6x^2", "What is 2 times 3?", "6", "5", "3"],
          ["x^4", "4x^3", "New exponent after differentiating?", "3", "4", "2"],
          ["3x^3", "9x^2", "What is 3 times 3?", "9", "6", "3"],
          ["2x^4", "8x^3", "What is 2 times 4?", "8", "6", "4"],
        ],
        [
          ["3x^2", "6x", "Derivative of x^2?", "2x", "x", "x^2"],
          ["4x^3", "12x^2", "Derivative of x^3?", "3x^2", "3x", "x^2"],
          ["2x^4", "8x^3", "Derivative of x^4?", "4x^3", "4x^2", "x^3"],
          ["5x^2", "10x", "Derivative of x^2?", "2x", "x", "2"],
          ["3x^3", "9x^2", "Derivative of x^3?", "3x^2", "3x", "x^2"],
        ],
        [
          ["x^2 + 3x", "2x + 3", "Derivative of 3x?", "3", "0", "3x"],
          ["2x^2 + x", "4x + 1", "Derivative of x?", "1", "0", "x"],
          ["x^3 + 2", "3x^2", "Derivative of 2?", "0", "1", "2"],
          ["3x + x^2", "3 + 2x", "Derivative of 3x?", "3", "1", "3x"],
          ["2x^3 + x", "6x^2 + 1", "Derivative of x?", "1", "0", "x"],
        ],
        [
          ["x^2 - 3x", "2x - 3", "Derivative of 3x?", "3", "1", "0"],
          ["3x^2 - x", "6x - 1", "Derivative of x?", "1", "0", "x"],
          ["x^3 - 2", "3x^2", "Derivative of 2?", "0", "1", "2"],
          ["4x - x^2", "4 - 2x", "Derivative of 4x?", "4", "1", "0"],
          ["2x^3 - x", "6x^2 - 1", "Derivative of x?", "1", "0", "x"],
        ],
        [
          ["x * x^2", "3x^2", "Derivative of x^2?", "2x", "x", "x^2"],
          ["x * (x + 2)", "2x + 2", "Derivative of (x + 2)?", "1", "2", "x"],
          ["2x * x", "4x", "Derivative of 2x?", "2", "1", "0"],
          ["x^2 * x^2", "4x^3", "Derivative of x^2?", "2x", "x", "x^2"],
          ["x * (x + 3)", "2x + 3", "Derivative of (x + 3)?", "1", "3", "0"],
        ],
        [
          ["x^2 / x", "1", "Derivative of numerator x^2?", "2x", "x", "2"],
          ["(x^2 + x) / x", "1", "Derivative of denominator x?", "1", "0", "x"],
          ["x^3 / x", "2x", "Derivative of denominator x?", "1", "0", "x"],
          ["(2x^2) / x", "2", "Derivative of numerator 2x^2?", "4x", "2x", "x^2"],
          ["(x^2 + 2x) / x", "1", "Derivative of denominator x?", "1", "0", "2"],
        ],
        [
          ["(x + 2)^2", "2(x + 2)", "Derivative of inner (x + 2)?", "1", "0", "2"],
          ["(2x + 1)^2", "4(2x + 1)", "Derivative of inner (2x + 1)?", "2", "1", "0"],
          ["(x + 1)^3", "3(x + 1)^2", "Derivative of inner (x + 1)?", "1", "0", "3"],
          ["(3x + 1)^2", "6(3x + 1)", "Derivative of inner (3x + 1)?", "3", "1", "2"],
          ["(2x + 3)^2", "4(2x + 3)", "Derivative of inner (2x + 3)?", "2", "1", "3"],
        ],
        [
          ["2sin(x)", "2cos(x)", "Derivative of sin(x)?", "cos(x)", "sin(x)", "-sin(x)"],
          ["3cos(x)", "-3sin(x)", "Derivative of cos(x)?", "-sin(x)", "sin(x)", "cos(x)"],
          ["sin(2x)", "2cos(2x)", "Derivative of inner 2x?", "2", "1", "0"],
          ["cos(2x)", "-2sin(2x)", "Derivative of inner 2x?", "2", "1", "0"],
          ["sin(x) + x", "cos(x) + 1", "Derivative of x?", "1", "0", "x"],
        ],
        [
          ["x^3", "6x", "Original exponent?", "3", "2", "4", "3x^2"],
          ["2x^3", "12x", "Original exponent?", "3", "2", "4", "6x^2"],
          ["x^4", "12x^2", "Original exponent?", "4", "3", "2", "4x^3"],
          ["3x^3", "18x", "Original exponent?", "3", "2", "4", "9x^2"],
          ["2x^4", "24x^2", "Original exponent?", "4", "3", "2", "8x^3"],
        ],
      ];
      // Each MIX step prepares a part of the derivative; COOK asks for the complete answer.
      const MIX_TASKS = [
        [
          ["Which term disappears after differentiation?", "Constant", "x term", "Both terms"],
          ["Differentiate x^2 only", "2x", "x", "x^2"],
          ["Differentiate 4x only", "4", "4x", "1"],
          ["After differentiating x^3, what power remains?", "x^2", "x^3", "x"],
          ["What is 5 multiplied by 2?", "10", "7", "5"],
        ],
        [
          ["After x^3, what power remains?", "x^2", "x^3", "x"],
          ["After 2x^3, what power remains?", "x^2", "x^3", "x"],
          ["For x^4, what is the new coefficient?", "4", "3", "1"],
          ["After 3x^3, what power remains?", "x^2", "x^3", "x"],
          ["For 2x^4, what is the new exponent?", "3", "4", "2"],
        ],
        [
          ["Multiply 3 by the power 2", "6", "5", "3"],
          ["Multiply 4 by the power 3", "12", "7", "4"],
          ["Multiply 2 by the power 4", "8", "6", "4"],
          ["After differentiating 5x^2, which power remains?", "x", "x^2", "x^3"],
          ["Multiply 3 by the power 3", "9", "6", "3"],
        ],
        [
          ["Differentiate the first term x^2", "2x", "x", "x^2"],
          ["Differentiate the first term 2x^2", "4x", "2x", "4"],
          ["Differentiate the first term x^3", "3x^2", "3x", "x^2"],
          ["Differentiate the second term x^2", "2x", "x", "2"],
          ["Differentiate the first term 2x^3", "6x^2", "6x", "2x^2"],
        ],
        [
          ["Differentiate the first term x^2", "2x", "x", "x^2"],
          ["Differentiate the first term 3x^2", "6x", "3x", "6"],
          ["Differentiate the first term x^3", "3x^2", "3x", "x^2"],
          ["Differentiate the second term x^2", "2x", "x", "2"],
          ["Differentiate the first term 2x^3", "6x^2", "6x", "2x^2"],
        ],
        [
          ["For u=x and v=x^2, what is u'v?", "x^2", "2x^2", "x"],
          ["For u=x and v=x+2, what is u'v?", "x+2", "x", "2x+2"],
          ["For u=2x and v=x, what is u'v?", "2x", "2", "x"],
          ["For u=x^2 and v=x^2, what is u'v?", "2x^3", "2x^2", "x^3"],
          ["For u=x and v=x+3, what is u'v?", "x+3", "x", "2x+3"],
        ],
        [
          ["Simplify x^2 / x before differentiating", "x", "x^2", "1"],
          ["Simplify (x^2 + x) / x", "x + 1", "x + x", "x^2 + 1"],
          ["Simplify x^3 / x", "x^2", "x^3", "x"],
          ["Simplify 2x^2 / x", "2x", "2x^2", "2"],
          ["Simplify (x^2 + 2x) / x", "x + 2", "x^2 + 2", "x + 2x"],
        ],
        [
          ["Differentiate the outer square of (x+2)^2", "2(x+2)", "(x+2)^2", "2x+2"],
          ["Differentiate the outer square of (2x+1)^2", "2(2x+1)", "4(2x+1)", "(2x+1)^2"],
          ["Differentiate the outer cube of (x+1)^3", "3(x+1)^2", "3(x+1)", "(x+1)^2"],
          ["Differentiate the outer square of (3x+1)^2", "2(3x+1)", "6(3x+1)", "(3x+1)^2"],
          ["Differentiate the outer square of (2x+3)^2", "2(2x+3)", "4(2x+3)", "(2x+3)^2"],
        ],
        [
          ["Differentiate sin(x) before multiplying by 2", "cos(x)", "-sin(x)", "sin(x)"],
          ["Differentiate cos(x) before multiplying by 3", "-sin(x)", "cos(x)", "sin(x)"],
          ["Differentiate sin(2x) before multiplying by inner derivative", "cos(2x)", "sin(2x)", "-cos(2x)"],
          ["Differentiate cos(2x) before multiplying by inner derivative", "-sin(2x)", "cos(2x)", "sin(2x)"],
          ["Differentiate sin(x) first", "cos(x)", "sin(x)", "-sin(x)"],
        ],
      ];
      function create(level, index) {
        const topic = [1, index % 2 === 0 ? 3 : 4, 5, 6, 7][level];
        const [expression, result, hint, first, wrong1, wrong2, intermediate] = QUESTIONS[topic][index];
        const mix = topic === 9 ? null : MIX_TASKS[topic][index];
        const steps = [
          mk("CHOP", hint, first, wrong1, wrong2),
          topic === 9
            ? mk("MIX", "What is the first derivative f'(x)?", intermediate, result, expression)
            : mk("MIX", mix[0], mix[1], mix[2], mix[3]),
          mk("COOK", topic === 9 ? "What is the second derivative f''(x)?" : "Now find the complete derivative f'(x)", result,
             expression, topic === 9 ? intermediate : (result === "0" ? "1" : "0")),
        ];
        return {
          level,
          number: index + 1,
          difficulty: "Moderate",
          equation: `f(x) = ${expression}` + (topic === 9 ? "  |  Find f''(x)" : ""),
          result,
          steps,
          dish: ["Veggie Bowl", "Hot Soup", "Golden Pancake", "Fruit Tart", "Chef Special"][(level + index) % 5],
        };
      }

      function getLevel(level) {
        const qs = [],
          seen = new Set();
        for (let i = 0; i < PER; i++) {
          let q;
          for (let t = 0; t < 1000; t++) {
            q = create(level, i);
            if (!seen.has(q.equation)) break;
          }
          qs.push(q);
          seen.add(q.equation);
        }
        return qs;
      }

      /* ---------- state ---------- */
      let st = "loading",
        unlocked = 1;
      try {
        unlocked = Math.min(LEVEL_COUNT, Math.max(1, +localStorage.getItem("crc_5_unlocked") || 1));
      } catch (e) {}
      let level = 0,
        orders = [],
        order = 0,
        score = 0,
        correct = 0,
        si = 0,
        answered = false,
        serving = false,
        fb = "",
        rem = ORDER_TIME,
        drag = null,
        mouse = [0, 0],
        last = performance.now();
      const BACK = [22, 20, 112, 43],
        menuB = [0, 1].map((i) => [460, 340 + i * 90, 280, 62]),
        lvB = Array.from({length: LEVEL_COUNT}, (_, i) => [300, 165 + i * 100, 600, 76]),
        retry = [321, 525, 250, 64],
        cont = [628, 525, 250, 64],
        ST = {
          CHOP: [32, 375, 158, 132],
          MIX: [203, 375, 158, 132],
          COOK: [374, 375, 158, 132],
          PLATE: [545, 375, 158, 132],
        },
        TILES = [0, 1, 2].map((i) => [39 + i * 225, 553, 211, 70]),
        CUST = [882, 199, 155, 176],
        NEXT = [809, 615, 323, 48];
      function startLevel(n) {
        level = n;
        orders = getLevel(n);
        order = 0;
        score = 0;
        correct = 0;
        si = 0;
        answered = false;
        serving = false;
        fb = "";
        rem = ORDER_TIME;
        drag = null;
        st = "game";
      }
      function nextOrder() {
        order++;
        if (order >= orders.length) {
          if (correct >= PASS) {
            unlocked = Math.max(unlocked, Math.min(LEVEL_COUNT, level + 2));
            try {
              localStorage.setItem("crc_5_unlocked", unlocked);
            } catch (e) {}
          }
          st = "results";
        } else {
          si = 0;
          answered = false;
          serving = false;
          fb = "";
          rem = ORDER_TIME;
          drag = null;
        }
      }
      function finish(ok, msg) {
        answered = true;
        serving = false;
        drag = null;
        fb = msg;
        if (ok) {
          correct++;
          score += 10;
        }
      }
      const pos = (e) => {
        const r = cv.getBoundingClientRect(),
          cx = e.clientX - r.left,
          cy = e.clientY - r.top;
        return rot
          ? [cy / S - OX, (CW - cx) / S - OY]
          : [cx / S - OX, cy / S - OY];
      };
      cv.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        try {
          cv.setPointerCapture(e.pointerId);
        } catch (_) {}
        const p = (mouse = pos(e));
        goFS();
        if (st == "menu") {
          if (hit(menuB[0], p)) st = "levels";
          else if (hit(menuB[1], p)) st = "instructions";
        } else if (st == "levels" || st == "instructions") {
          if (hit(BACK, p)) st = "menu";
          else if (st == "levels")
            lvB.forEach((r, i) => {
              if (hit(r, p) && i < unlocked && st == "levels") startLevel(i);
            });
        } else if (st == "game") {
          if (hit(BACK, p)) {
            drag = null;
            st = "levels";
          } else if (answered) {
            if (hit(NEXT, p)) nextOrder();
          } else if (serving) {
            if (hit(ST.PLATE, p)) drag = { kind: "plate" };
          } else {
            const i = TILES.findIndex((r) => hit(r, p));
            if (i >= 0)
              drag = {
                kind: "tile",
                index: i,
                label: orders[order].steps[si].options[i],
              };
          }
        } else if (st == "results") {
          if (hit(BACK, p)) st = "levels";
          else if (hit(retry, p)) startLevel(level);
          else if (hit(cont, p)) {
            if (correct >= PASS && level < LEVEL_COUNT - 1) startLevel(level + 1);
            else st = "levels";
          }
        }
      });
      cv.addEventListener("pointermove", (e) => {
        mouse = pos(e);
      });
      function up(e) {
        const p = (mouse = pos(e));
        if (st == "game" && drag) {
          if (drag.kind == "plate") {
            if (hit(CUST, p))
              finish(true, "Perfect! Dish served to the customer!");
          } else if (!answered && !serving) {
            const s = orders[order].steps[si];
            if (hit(ST[s.station], p)) {
              if (drag.label == s.correct) {
                si++;
                if (si == orders[order].steps.length) serving = true;
              } else {
                rem = Math.max(0, rem - 8);
                if (rem <= 0)
                  finish(false, "Too many mistakes! Customer left.");
              }
            }
          }
          drag = null;
        }
      }
      cv.addEventListener("pointerup", up);
      cv.addEventListener("pointercancel", () => {
        drag = null;
      });
      addEventListener("keydown", (e) => {
        if (e.key == "Escape" || e.key == "Backspace") {
          if (st == "game") {
            drag = null;
            st = "levels";
          } else if (st != "menu" && st != "loading") st = "menu";
        }
      });

      /* ---------- drawing ---------- */
      function lines(v, k, w, max = 2) {
        const words = String(v).split(" "),
          out = [];
        let cur = "";
        for (const wd of words) {
          const t = (cur + " " + wd).trim();
          if (tw(t, k) <= w) cur = t;
          else {
            if (cur) out.push(cur);
            cur = wd;
          }
        }
        if (cur) out.push(cur);
        if (out.length > max) {
          out.length = max;
          let l = out[max - 1];
          while (l && tw(l + "…", k) > w) l = l.slice(0, -1);
          out[max - 1] = l + "…";
        }
        return out;
      }
      const cl = (v, cx, top, k, col, w, max = 2, sp = 23) =>
        lines(v, k, w, max).forEach((l, i) =>
          T(l, cx, top + i * sp, k, col, 1),
        );
      function choice(v, r, col) {
        v = String(v);
        const mw = r[2] - 18,
          c = ctr(r);
        for (const k of ["body", "small", "tiny"])
          if (tw(v, k) <= mw) {
            T(v, c[0], c[1], k, col, 1);
            return;
          }
        let ls = [],
          cur = "";
        for (const ch of v) {
          if (tw(cur + ch, "tiny") <= mw) cur += ch;
          else {
            if (cur) ls.push(cur);
            cur = ch;
          }
        }
        if (cur) ls.push(cur);
        if (ls.length > 3) {
          ls = ls.slice(0, 3);
          while (ls[2] && tw(ls[2] + "...", "tiny") > mw)
            ls[2] = ls[2].slice(0, -1);
          ls[2] += "...";
        }
        const top = c[1] - ((ls.length - 1) * 17) / 2;
        ls.forEach((l, i) =>
          T(l, c[0], Math.round(top + i * 17), "tiny", col, 1),
        );
      }
      function drawGame(tick) {
        const ch = orders[order];
        background();
        T("CHAIN RULE CHEF", 600, 44, "title", "rgb(91,63,76)", 1);
        T(
          `LEVEL ${level + 1}  /  ${TOPICS[level]}`,
          600,
          95,
          "head",
          INK,
          1,
          850,
        );
        for (const [r, l] of [
          [[24, 116, 156, 39], `ORDER ${order + 1} / ${PER}`],
          [[193, 116, 145, 39], `SCORE  ${score}`],
          [[350, 116, 195, 39], ch.difficulty.toUpperCase()],
        ]) {
          R(...r, "rgb(255,250,238)", 18);
          RS(...r, "rgb(233,201,185)", 2, 18);
          const c = ctr(r);
          T(l, c[0], c[1], "tiny", INK, 1);
        }
        button(BACK, "BACK");
        panel([20, 168, 700, 520], "rgb(255,247,233)");
        panel([735, 168, 443, 520], "rgb(255,251,243)");
        T("THE KITCHEN", 370, 199, "head", "rgb(91,63,76)", 1);
        chef(105, 264, tick, 0.58);
        T("TODAY'S DISH", 182, 236, "tiny", BROWN);
        T(ch.dish, 182, 263, "head", DARK, 0, 510);
        if (answered)
          cl(
            fb,
            369,
            315,
            "small",
            fb.startsWith("Perfect") ? GREEN : RED,
            650,
            2,
            25,
          );
        else if (serving) {
          T("READY TO SERVE!", 369, 310, "body", GREEN, 1);
          T("Drag the plate to your customer.", 369, 339, "small", INK, 1);
        } else
          cl(
            `STEP ${si + 1}/${ch.steps.length}  -  ${ch.steps[si].prompt}`,
            369,
            308,
            "small",
            DARK,
            645,
            2,
            24,
          );
        for (const n in ST) {
          const done = ch.steps.slice(0, si).some((s) => s.station == n),
            act =
              !answered &&
              !serving &&
              si < ch.steps.length &&
              ch.steps[si].station == n;
          station(ST[n], n, act, done && !act);
        }
        if (serving && (!drag || drag.kind != "plate"))
          dish(ctr(ST.PLATE)[0], ctr(ST.PLATE)[1] - 6);
        if (!answered && !serving) {
          T("PICK AN INGREDIENT", 370, 534, "small", DARK, 1);
          const s = ch.steps[si];
          TILES.forEach((r, i) => {
            if (drag && drag.kind == "tile" && drag.index == i) return;
            panel(r, "rgb(255,254,246)", "rgb(232,186,161)", 15);
            choice(s.options[i], r, DARK);
          });
          T("DRAG A TILE TO THE GLOWING STATION", 370, 655, "tiny", BROWN, 1);
        } else if (serving) {
          T("YOUR DISH IS PLATED!", 370, 557, "body", GREEN, 1);
          T(
            "Pick up the plate and drop it on the customer.",
            370,
            593,
            "tiny",
            BROWN,
            1,
          );
        } else {
          T("ORDER COMPLETE", 370, 552, "body", DARK, 1);
          cl(
            `Correct derivative: ${ch.result}`,
            370,
            592,
            "small",
            BROWN,
            640,
            2,
            25,
          );
        }
        T("YOUR CUSTOMER", 957, 197, "small", BROWN, 1);
        customer(957, 248, tick);
        L(758, 396, 1154, 396, "rgb(229,206,191)", 2);
        T("ORDER TICKET", 957, 422, "head", DARK, 1);
        cl(ch.equation, 957, 460, "small", BROWN, 390, 2, 22);
        T("DISH  /  " + ch.dish, 957, 499, "small", DARK, 1, 395);
        const pat = Math.max(0, Math.min(1, rem / ORDER_TIME));
        T(
          `PATIENCE   ${Math.max(0, Math.floor(rem + 0.999))}s`,
          758,
          536,
          "small",
          DARK,
        );
        R(758, 566, 395, 18, "rgb(236,219,210)", 9);
        const bw = Math.round(395 * pat);
        if (bw > 0)
          R(
            758,
            566,
            bw,
            18,
            pat > 0.5 ? GREEN : pat > 0.25 ? GOLD : RED,
            Math.min(9, bw / 2),
          );
        if (answered)
          button(NEXT, order < PER - 1 ? "NEXT ORDER" : "VIEW RESULTS");
        else if (serving)
          T("DROP YOUR PLATE ON THE CUSTOMER", 957, 631, "tiny", GREEN, 1, 400);
        else T("FINISH THE RECIPE TO SERVE", 957, 631, "tiny", BROWN, 1, 400);
        if (drag) {
          if (drag.kind == "tile") {
            const r = [mouse[0] - 100, mouse[1] - 31, 200, 62];
            panel(r, "rgb(255,224,173)", "rgb(235,163,115)", 15);
            choice(drag.label, r, DARK);
          } else dish(mouse[0], mouse[1]);
        }
      }
      function frame(now) {
        g.setTransform(
          M[0] * DPR,
          M[1] * DPR,
          M[2] * DPR,
          M[3] * DPR,
          M[4] * DPR,
          M[5] * DPR,
        );
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (st == "game" && !answered) {
          rem = Math.max(0, rem - dt);
          if (rem <= 0) finish(false, "Customer left! Time is up.");
        }
        background();
        if (st == "loading") {
          if (loadingStart === null) loadingStart = now;
          const progress = Math.min(1, (now - loadingStart) / LOADING_TIME);
          panel([250, 105, 700, 550]);
          T("CHAIN RULE CHEF", 600, 165, "title", INK, 1);
          T("Preparing your kitchen...", 600, 225, "head", BROWN, 1);
          chef(600, 350, now, 1.35);
          dish(600, 535);
          R(350, 585, 500, 22, "rgb(236,219,210)", 11);
          if (progress > 0) R(350, 585, 500 * progress, 22, GREEN, Math.min(11, 250 * progress));
          T(Math.floor(progress * 100) + "%", 600, 630, "small", DARK, 1);
          if (progress >= 1) st = "menu";
        } else if (st == "menu") {
          T("CHAIN RULE CHEF", 600, 137, "title", INK, 1);
          T("DRAG & COOK RESTAURANT", 600, 195, "head", BROWN, 1);
          chef(215, 387, now, 1.6);
          customer(981, 367, now);
          ["PLAY", "HOW TO PLAY"].forEach((l, i) => button(menuB[i], l));
          T(
            "Solve derivative recipes by dragging ingredients through the kitchen!",
            600,
            658,
            "small",
            INK,
            1,
          );
        } else if (st == "instructions") {
          panel([130, 132, 940, 522]);
          T("HOW TO PLAY", 600, 181, "title", INK, 1);
          [
            "1. Choose a derivative level and read the customer order ticket.",
            "2. Read the current step above the kitchen stations.",
            "3. DRAG the correct ingredient tile onto the glowing station.",
            "4. Answer at CHOP, MIX and COOK, then serve from PLATE.",
            "5. Drag the finished plate to the CUSTOMER to serve the dish.",
            "6. Wrong drops cost 8 seconds. Serve before patience reaches zero.",
            "7. Each level has 5 orders. Serve at least 4 correctly to pass.",
            "8. Complete all five levels to finish the game.",
          ].forEach((l, i) => T(l, 190, 246 + i * 44, "small", INK));
          button(BACK, "BACK");
        } else if (st == "levels") {
          T("CHOOSE A DERIVATIVE LEVEL", 600, 95, "title", INK, 1);
          lvB.forEach((r, i) => {
            const en = i < unlocked;
            button(
              r,
              en
                ? `${i + 1}. ${TOPICS[i]}`
                : `${i + 1}. ${TOPICS[i]}  [LOCKED]`,
              en,
            );
          });
          button(BACK, "BACK");
        } else if (st == "game") drawGame(now);
        else if (st == "results") {
          const ok = correct >= PASS;
          panel([218, 158, 764, 475]);
          T(
            ok ? "LEVEL COMPLETE!" : "LEVEL FAILED",
            600,
            236,
            "title",
            ok ? GREEN : RED,
            1,
          );
          T(TOPICS[level], 600, 308, "head", INK, 1);
          T(`Served orders: ${correct}/${PER}`, 600, 365, "head", INK, 1);
          T(`Score: ${score}/${PER * 10}`, 600, 410, "head", INK, 1);
          T(
            ok && level < LEVEL_COUNT - 1
              ? "Next level unlocked!"
              : ok
                ? "All levels completed!"
                : "Serve at least 4 orders to unlock the next level.",
            600,
            463,
            "small",
            BROWN,
            1,
          );
          button(retry, "RETRY LEVEL");
          button(cont, ok && level < LEVEL_COUNT - 1 ? "NEXT LEVEL" : "LEVEL SELECT");
          button(BACK, "BACK");
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
