(() => {
  var k = (a, h = 0, c = 1) => Math.max(h, Math.min(c, a)),
    vt = (a) => ((a = k(a)), a * a * (3 - 2 * a)),
    N = (a, h, c) => vt((c - a) / (h - a)),
    j = (a, h, c) => a + (h - a) * c,
    Z = Math.PI * 2,
    d = {
      ink: "#27372e",
      sage: "#91ac92",
      mint: "#c4d2bc",
      green: "#65866c",
      cream: "#f0e6ce",
      chalk: "#fffdf4",
      lime: "#c4d963",
      lemon: "#dfe79a",
      olive: "#94aa4f",
    };
  function gt(a, h = !1) {
    return new Promise((c, R) => {
      if (!a) return c(null);
      let w = new Image();
      ((w.onload = () => c(w)),
        (w.onerror = () => (h ? c(null) : R(Error("Unable to load the official UP mark")))),
        (w.src = a));
    });
  }
  function Tt() {
    let a = document.createElement("canvas");
    a.width = a.height = 192;
    let h = a.getContext("2d"),
      c = h.createImageData(192, 192),
      R = 8128;
    for (let w = 0; w < c.data.length; w += 4) {
      R = (R * 1664525 + 1013904223) >>> 0;
      let S = 227 + (R >>> 27);
      ((c.data[w] = c.data[w + 1] = c.data[w + 2] = S), (c.data[w + 3] = 255));
    }
    return (h.putImageData(c, 0, 0), a);
  }
  function Ct(a) {
    if (!a) return null;
    let h = document.createElement("canvas");
    ((h.width = a.width), (h.height = a.height));
    let c = h.getContext("2d");
    return (
      c.drawImage(a, 0, 0),
      (c.globalCompositeOperation = "source-in"),
      (c.fillStyle = d.ink),
      c.fillRect(0, 0, h.width, h.height),
      h
    );
  }
  function z(a) {
    let h = new Path2D();
    h.moveTo(...a[0]);
    for (let c of a.slice(1)) h.lineTo(...c);
    return (h.closePath(), h);
  }
  function Dt(a, h, c, R = 0) {
    let w = new Path2D();
    for (let S = 0; S <= 96; S++) {
      let F = (S * Z) / 96,
        _ = c * (1 + 0.009 * Math.sin(F * 3 + R) + 0.006 * Math.sin(F * 7 - 0.7)),
        $ = a + Math.cos(F) * _,
        tt = h + Math.sin(F) * _;
      S ? w.lineTo($, tt) : w.moveTo($, tt);
    }
    return (w.closePath(), w);
  }
  async function Rt(a, { logoUrl: h, textureUrl: c, onReady: R, onError: w } = {}) {
    try {
      let st = function (t) {
          let u = ot.stacked ?? g / P < 0.88,
            o = P < 520 && g / P > 1.3,
            r = -g * 0.22,
            l = g * 1.22,
            e = l - r,
            n = k(Math.min(g * 0.02, P * 0.03), o ? 8 : u ? 10 : 14, 25),
            f = et || P * 0.3,
            x = o ? 8 : 12,
            y = k(P * 0.085, 28, 72),
            v = P * 0.5 + (6 - y) / 2 - 2 * n - f - x,
            M = Math.min(u ? 88 : 112, Math.max(12, v / 0.715)),
            p = Math.min(u ? 36 : 62, M * 0.57),
            m = P * 0.5 + (p + 7 - y - 1) / 2,
            O = u ? k(g * 0.29, 95, 125) : k(g * 0.15, 150, 230),
            B = g * 0.065,
            D = n * 2.6 + g * 0.035,
            A = -D,
            s = g + D,
            b,
            I,
            H,
            Q,
            W,
            J,
            U;
          (t < 0.405
            ? ((I = 0),
              (b = k(t / 0.405)),
              (H = "right"),
              (Q = b),
              (W = j(B, s, b)),
              (U = 4 * b * (1 - b) * M))
            : t < 0.455
              ? ((I = 0), (b = 1), (H = "offscreen-right"), (Q = 1), (W = s), (U = 0))
              : t < 0.775
                ? ((I = 1),
                  (b = k((t - 0.455) / 0.32)),
                  (H = "left"),
                  (Q = 1 - b),
                  (W = j(s, A, b)),
                  (U = 4 * b * (1 - b) * M))
                : ((I = 1),
                  (b = 1),
                  (H = t < 0.815 ? "offscreen-left" : "stationary"),
                  (Q = 0),
                  (W = A),
                  (U = 0)),
            (J = m - n - U));
          let pt = N(0.815, 1, t),
            dt = N(0.815, 0.945, t),
            bt = N(0.85, 1, t),
            V = ot.finalArt || { left: g * 0.55, top: 24, width: g * 0.4, height: P - 48 },
            wt = Math.max(1, Math.min(V.width, V.height) / 2) * 0.85,
            yt = V.left + V.width / 2,
            Mt = V.top + V.height / 2;
          t >= 0.815 && ((W = j(A, yt, dt)), (J = j(m - n, Mt, dt)));
          let L = j(n, wt, bt),
            kt = t < 0.78 ? t * 9.2 : j(0.78 * 9.2, Math.PI * 2, N(0.78, 0.975, t)),
            ut = N(0.845, 0.96, t),
            xt = 1 - N(0.82, 0.975, t),
            Pt = 0.55 * Math.sin(t * Z * 2);
          return {
            portrait: u,
            landscape: o,
            left: r,
            right: l,
            span: e,
            baseline: m,
            bandHeight: y,
            netHeight: p,
            netWidth: O,
            netRipple: Pt,
            copyBottom: f,
            netTop: m - p,
            ball: {
              x: W,
              y: J,
              radius: L,
              rotation: kt,
              bounds: { left: W - L, top: J - L, right: W + L, bottom: J + L },
              logoVisible: ut > 0.01,
              logoOpacity: ut,
            },
            direction: H,
            zoom: pt,
            courtOpacity: xt,
            bounce: {
              leg: I,
              t: b,
              height: t < 0.78 ? U : 0,
              atCourt: t < 0.78 && (b < 0.015 || b > 0.985),
            },
            phase: t < 0.455 ? "left-to-right" : t < 0.815 ? "right-to-left" : "ball-close-up",
          };
        },
        T = function (t, u, o = 1) {
          (i.save(), (i.globalAlpha *= o), (i.fillStyle = u), i.fill(t), i.restore());
        },
        q = function (t, u, o, r = 1) {
          (i.save(),
            (i.globalAlpha *= r),
            (i.strokeStyle = u),
            (i.lineWidth = o),
            (i.lineCap = "round"),
            (i.lineJoin = "round"),
            i.stroke(t),
            i.restore());
        },
        C = function (t, u, o, r = 1) {
          let l = new Path2D();
          l.moveTo(...t[0]);
          for (let e of t.slice(1)) l.lineTo(...e);
          q(l, u, o, r);
        },
        nt = function (t, u = 0.23) {
          (i.save(),
            i.clip(t),
            (i.globalCompositeOperation = "multiply"),
            (i.globalAlpha *= u),
            (i.fillStyle = ct),
            i.fillRect(0, 0, g, P),
            i.restore());
        },
        ht = function (t) {
          let { x: u } = t,
            { left: o, right: r, span: l, baseline: e, bandHeight: n, netHeight: f } = t,
            x = (o + r) / 2;
          (i.save(), (i.globalAlpha = t.courtOpacity));
          let y = z([
            [o, e + 2],
            [r, e + 2],
            [r - 2, e + n * 0.82],
            [o + l * 0.72, e + n * 0.89],
            [o + l * 0.5, e + n * 0.78],
            [o + l * 0.22, e + n],
            [o + 3, e + n * 0.87],
          ]);
          (T(y, d.mint),
            T(
              z([
                [o, e + 2],
                [x - l * 0.1, e + 2],
                [x + l * 0.015, e + n * 0.53],
                [o + l * 0.22, e + n],
                [o + 3, e + n * 0.87],
              ]),
              d.sage,
            ),
            T(
              z([
                [x - l * 0.1, e + 2],
                [r, e + 2],
                [r - 2, e + n * 0.27],
                [x + l * 0.11, e + n * 0.64],
                [x + l * 0.015, e + n * 0.53],
              ]),
              d.green,
            ),
            T(
              z([
                [o + l * 0.29, e + n * 0.66],
                [o + l * 0.59, e + n * 0.43],
                [o + l * 0.7, e + n * 0.49],
                [o + l * 0.47, e + n * 0.83],
              ]),
              d.cream,
            ),
            T(
              z([
                [o + l * 0.77, e + n * 0.79],
                [r - 2, e + n * 0.51],
                [r - 2, e + n * 0.82],
                [o + l * 0.72, e + n * 0.89],
              ]),
              d.ink,
              0.9,
            ),
            nt(y, 0.28),
            C(
              [
                [o - 2, e],
                [o + l * 0.23, e - 0.9],
                [x, e + 0.8],
                [o + l * 0.76, e - 0.6],
                [r + 1, e],
              ],
              d.ink,
              k(g * 0.0018, 1.4, 2.5),
            ),
            C(
              [
                [o + l * 0.03, e + n * 0.23],
                [o + l * 0.26, e + n * 0.21],
                [o + l * 0.47, e + n * 0.25],
              ],
              d.chalk,
              k(n * 0.045, 1.2, 3.1),
              0.91,
            ),
            C(
              [
                [o + l * 0.58, e + n * 0.18],
                [o + l * 0.8, e + n * 0.2],
                [r - l * 0.025, e + n * 0.15],
              ],
              d.chalk,
              k(n * 0.038, 1.2, 2.6),
              0.86,
            ));
          for (let s of [0.04, 0.345, 0.655, 0.96])
            C(
              [
                [o + l * s, e - 1],
                [o + l * s + 1, e + n * 0.16],
              ],
              d.chalk,
              k(n * 0.045, 1.2, 3),
              0.97,
            );
          let v = o + l * 0.077;
          for (let s = 0; s < 5; s++)
            C(
              [
                [v + s * k(l * 0.009, 3, 10), e + n * 0.53],
                [v + s * k(l * 0.009, 3, 10) + n * 0.17, e + n * 0.75],
              ],
              d.ink,
              1,
              0.29,
            );
          C(
            [
              [o + l * 0.22, e + n + 1],
              [o + l * 0.43, e + n * 0.85],
            ],
            d.ink,
            1,
            0.47,
          );
          let M = t.netWidth,
            p = x - M / 2,
            m = e - f,
            O = t.netRipple,
            B = m + 5 + 2 * O,
            D = new Path2D();
          (D.moveTo(p, m),
            D.quadraticCurveTo(x, B, p + M, m),
            D.lineTo(p + M, e - 4),
            D.quadraticCurveTo(x, e - 1, p, e - 4),
            D.closePath(),
            T(D, d.chalk, 0.9),
            i.save(),
            i.clip(D));
          for (let s = 0; s <= 16; s++) {
            let b = s / 16,
              I = p + b * M,
              H = new Path2D();
            (H.moveTo(I, m),
              H.quadraticCurveTo(I + O * 0.4 * 4 * b * (1 - b), (m + e) / 2, I, e),
              q(H, d.ink, 0.65, 0.4));
          }
          for (let s = 0; s <= 7; s++)
            C(
              [
                [p, m + (s * f) / 7],
                [x, m + (s * f) / 7 + 2 + O * (1 - s / 7)],
                [p + M, m + (s * f) / 7],
              ],
              d.ink,
              0.7,
              0.4,
            );
          i.restore();
          let A = new Path2D();
          (A.moveTo(p, m),
            A.quadraticCurveTo(x, B, p + M, m),
            q(A, d.ink, 3.2),
            q(A, d.chalk, 1.1));
          for (let s of [p - 2, p + M + 2])
            (C(
              [
                [s, m - 7],
                [s, e + 3],
              ],
              d.ink,
              k(g * 0.0022, 2, 3.2),
            ),
              C(
                [
                  [s - 5, e + 4],
                  [s + 5, e + 4],
                ],
                d.ink,
                1.7,
              ));
          i.restore();
        },
        ft = function (t) {
          let { x: u, y: o, radius: r, rotation: l, logoOpacity: e } = t.ball,
            n = Dt(u, o, r, 0);
          (T(n, d.lime), i.save(), i.clip(n));
          let f = (y, v) => [u + y * r, o + v * r];
          (T(
            z([
              f(-1.08, -0.12),
              f(-0.64, -0.88),
              f(-0.3, -0.98),
              f(-0.69, -0.24),
              f(-0.81, 0.54),
              f(-1.03, 0.27),
            ]),
            d.lemon,
          ),
            T(
              z([
                f(0.7, -0.83),
                f(1.07, -0.32),
                f(0.93, 0.65),
                f(0.39, 0.93),
                f(0.68, 0.46),
                f(0.78, -0.1),
              ]),
              d.olive,
            ),
            T(
              z([
                f(-0.51, 0.86),
                f(-0.05, 0.66),
                f(0.38, 0.93),
                f(0.67, 0.88),
                f(0.3, 1.06),
                f(-0.49, 1.03),
              ]),
              d.cream,
              0.76,
            ),
            i.restore(),
            nt(n, 0.25));
          for (let y = 0; y < 9; y++) {
            let v = (y * Z) / 9 + l,
              M = r * (y % 3 === 0 ? 0.81 : 0.835),
              p = u + Math.cos(v) * M,
              m = o + Math.sin(v) * M,
              O = r * (y % 3 === 1 ? 0.046 : 0.04),
              B = new Path2D();
            (B.ellipse(
              p,
              m,
              Math.max(0.8, O),
              Math.max(0.7, O * (y % 2 ? 0.87 : 1.1)),
              v * 0.31,
              0,
              Z,
            ),
              T(B, d.ink, 0.76));
          }
          q(n, d.ink, k(r * 0.009, 1.1, 2.4), 0.9);
          let x = new Path2D();
          if (
            (x.arc(u - r * 0.008, o + r * 0.01, r * 0.978, Math.PI * 0.94, Math.PI * 1.45),
            q(x, d.ink, k(r * 0.004, 0.65, 1.25), 0.56),
            Y && e > 0)
          ) {
            let y = r * 1.18,
              v = (y * Y.height) / Y.width,
              M = Math.min(1, (r * 1.1) / v),
              p = y * M,
              m = v * M;
            (i.save(),
              (i.globalAlpha = e),
              i.drawImage(Y, u - p / 2, o - m / 2 + r * 0.01, p, m),
              i.restore());
          }
        },
        it = function (t) {
          K ||
            ((G = k(Number(t) || 0)),
            (X = st(G)),
            i.setTransform(E, 0, 0, E, 0, 0),
            (i.globalAlpha = 1),
            (i.globalCompositeOperation = "source-over"),
            (i.fillStyle = "#fff"),
            i.fillRect(0, 0, g, P),
            X.courtOpacity > 0.001 && ht(X),
            ft(X),
            rt++);
        };
      var S = st,
        F = T,
        _ = q,
        $ = C,
        tt = nt,
        It = ht,
        Ht = ft,
        Ot = it;
      let i = a.getContext("2d", { alpha: !1, desynchronized: !0 });
      if (!i) throw Error("Canvas illustration unavailable");
      let [mt, lt] = await Promise.all([gt(h), gt(c, !0)]),
        Y = Ct(mt),
        g = a.clientWidth || 1200,
        P = a.clientHeight || 800,
        E = 1,
        G = 0,
        rt = 0,
        K = !1,
        X = null,
        et = 0,
        ot = {},
        ct = i.createPattern(lt || Tt(), "repeat"),
        at = {
          setProgress: it,
          resize(t, u, o = {}) {
            K ||
              ((g = Math.max(1, Math.round(t || a.clientWidth))),
              (P = Math.max(1, Math.round(u || a.clientHeight))),
              (ot = o),
              (et = Number(o.copyBottom) || et),
              (E = Math.min(window.devicePixelRatio || 1, g < 700 ? 1.25 : 1.5)),
              (a.width = Math.round(g * E)),
              (a.height = Math.round(P * E)),
              it(G));
          },
          info() {
            if (!X) return {};
            let t = X;
            return {
              renderer: "Canvas2D flat cut-paper illustration",
              artDirection: "cubist court collage",
              flat2D: !0,
              perspective: !1,
              players: 0,
              paddles: 0,
              onDemand: !0,
              progress: G,
              renderCount: rt,
              width: g,
              height: P,
              pixelRatio: E,
              textureLoaded: !!lt,
              phase: t.phase,
              direction: t.direction,
              zoom: t.zoom,
              bounce: t.bounce,
              ball: { ...t.ball },
              court: {
                left: t.left,
                right: t.right,
                baseline: t.baseline,
                bottom: t.baseline + t.bandHeight + 1,
                netTop: t.netTop,
                netWidth: t.netWidth,
                netHeight: t.netHeight,
                ripple: t.netRipple,
                copyBottom: t.copyBottom,
                opacity: t.courtOpacity,
              },
              logoVisible: t.ball.logoVisible,
            };
          },
          dispose() {
            K || ((K = !0), (ct = null), (X = null), (a.width = a.height = 1));
          },
        };
      return (at.resize(g, P), R?.(at), at);
    } catch (i) {
      throw (w?.(i), i);
    }
  }
  window.UPCourt = { create: Rt };
})();
