"use client";

import { useEffect, useState } from "react";

const SET_A = [
  { emoji: "🎧", bg: "linear-gradient(135deg,#3FE0A5,#1D8F63)", name: "Wireless Earbuds", why: "Because you grind long night sessions", coin: "800", cash: "₹199", tag: "Best value",
    desc: "Compact fit, 24h battery. Ships in 3-5 days. Picked for you based on your late-night play sessions.", done: "Your earbuds are on the way." },
  { emoji: "☕", bg: "linear-gradient(135deg,#F5B942,#B6811F)", name: "Café Coupon ₹150", why: "Popular with players at your level", coin: "350", cash: null,
    desc: "₹150 off at partner cafés, valid for 30 days. Code is delivered instantly. Popular with players at your level.", done: "Your café coupon code is in your inbox." },
  { emoji: "👕", bg: "linear-gradient(135deg,#FF5C7A,#A6264A)", name: "Streetwear Hoodie", why: "Matches your in-game style picks", coin: "1,200", cash: "₹499",
    desc: "Heavyweight cotton, oversized fit. Ships in 5-7 days. Picked to match your in-game style choices.", done: "Your hoodie is on the way." },
  { emoji: "🎮", bg: "linear-gradient(135deg,#8E7CF0,#4A3BA0)", name: "+500 Bonus Coins", why: "Keep the streak going", coin: null, cash: "₹99", bonus: 500,
    desc: "500 coins added to your balance instantly. Use them towards your next Reward Drop.", done: "500 bonus coins have been added to your balance." },
];

const SET_B = [
  { emoji: "📓", bg: "linear-gradient(135deg,#8E7CF0,#4A3BA0)", name: "Study Planner Set", why: "Trending with players in your region", coin: "500", cash: "₹99",
    desc: "Undated planner with sticker sheets. Ships in 3-5 days. Trending with players in your region.", done: "Your planner set is on the way." },
  { emoji: "🍔", bg: "linear-gradient(135deg,#3FE0A5,#1D8F63)", name: "Food Delivery Voucher ₹100", why: "Most-redeemed reward this week", coin: "300", cash: null,
    desc: "₹100 off your next food delivery order, valid for 14 days. Code is delivered instantly.", done: "Your food voucher code is in your inbox." },
  { emoji: "🧢", bg: "linear-gradient(135deg,#F5B942,#B6811F)", name: "Graphic Cap", why: "New arrival, low stock", coin: "600", cash: "₹149", tag: "Low stock",
    desc: "Embroidered six-panel cap, adjustable strap. Ships in 3-5 days. New arrival with limited stock.", done: "Your cap is on the way." },
];

const START_COINS = 2450;
const LOW_COINS = 300;
const RUPEES_PER_COIN = 0.9;
const toNum = (s) => (s ? Number(s.replace(/[^\d]/g, "")) : 0);
const fmt = (n) => n.toLocaleString("en-IN");

const DECISIONS = [
  {
    title: "Store triggered by a gameplay milestone, not a persistent 'Shop' tab",
    why: "A persistent tab imports e-commerce browse intent into a context where no such intent exists. Triggering on an earned milestone uses achievement as the intent signal — the player has a reason to look, the same way a real shopper has a reason to walk into a store.",
    alt: "A persistent tab (standard e-commerce pattern) — rejected because it assumes browsing intent that doesn't exist mid-gameplay, and competes with the game's own navigation for attention.",
  },
  {
    title: "Coins + cash blended pricing, not coins-only or cash-only",
    why: "A coins-only store caps monetization and isn't really commerce. A cash-only store ignores why PlaySuper exists at all. Blending them keeps players motivated to keep playing for a bigger discount — reinforcing the retention loop PlaySuper sells to studios.",
    alt: "Coins-only (zero revenue, no real commerce) and cash-only (removes the entire gameplay-reward connection, becomes a generic ad unit) — both rejected.",
  },
  {
    title: "4-6 curated items per Reward Drop, not a full catalog browse",
    why: "PlaySuper's real catalog spans 5,000+ brands. Shown in full, that's overwhelming and breaks the 'this was earned for me' feeling. A small, cohort-curated set keeps it feeling like a reward, not a marketplace.",
    alt: "Full searchable catalog — rejected because it reintroduces browse/compare behavior this product is trying to avoid, and doesn't solve PlaySuper's real catalog-relevance problem.",
  },
  {
    title: "Checkout stays inside the same in-game frame — no redirect",
    why: "Any hand-off to a browser tab or separate payment app breaks immersion at the exact moment we've earned the player's attention. A single confirm tap inside the same sheet keeps the whole loop inside the game.",
    alt: "Redirect to a web checkout (a realistic engineering shortcut) — rejected here because it undermines the core 'don't break immersion' thesis, even though a real SDK might take that shortcut.",
  },
  {
    title: "Post-purchase gives bonus XP and a streak mechanic, not just an order confirmation",
    why: "A generic 'order confirmed' screen is pure e-commerce language and ends the loop. Rewarding the purchase with XP and a streak ties the moment back into the game's own value system, and gives an explicit reason to return next session.",
    alt: "Plain confirmation screen — rejected because it optimizes for a single conversion event and ignores PlaySuper's actual success metric (retention), not just whether a purchase happened.",
  },
  {
    title: "A fallback path when curated picks miss ('Refresh my picks')",
    why: "Behavioral-cohort personalization will sometimes be wrong. Dead-ending a player whose picks don't land is a silent drop-off we'd never see in a funnel chart unless we explicitly design and track the fallback.",
    alt: "No fallback (simplest to build) — rejected because it hides a real failure mode rather than handling it.",
  },
  {
    title: "Dynamic coin/cash rebalancing when a player has insufficient coins",
    why: "A fixed split only works for players who happen to have exactly enough coins. Real players will have varying balances; the mix should rebalance toward more cash rather than blocking the purchase outright.",
    alt: "Hard block ('not enough coins', standard e-commerce out-of-stock pattern) — rejected because it kills a purchase PlaySuper could still capture via cash, hurting their own monetization.",
  },
  {
    title: "Trigger frequency cools down after one redemption",
    why: "An interruptive toast on every level-up would get tuned out fast (banner blindness). After one redemption, the trigger shifts to a quieter streak/cooldown state instead of repeating the same popup.",
    alt: "Always-on toast every milestone (easiest to build) — rejected because it optimizes for short-term visibility at the cost of long-term trigger fatigue and opt-out behavior.",
  },
];

const FUNNEL = [
  ["Trigger fires (level-up)", "Trigger-to-view rate", "No frequency cap → banner blindness, opt-out over time", "Cooldown state after first redemption; trigger quiets into a streak pill"],
  ["Open Drop vs. Later", "Open rate", "Repeated 'Later' taps have no consequence modeled", "Dismissal tracked as the first real drop-off point in the funnel"],
  ["Store home (browse)", "Browse-to-tap rate", "Cohort personalization can miss — no recovery path", "\u201cRefresh my picks\u201d fallback swaps in an alternate curated set"],
  ["Product detail", "Detail-to-checkout rate", "Fixed coin/cash split assumes enough coins", "Live rebalancing demo when coin balance is insufficient"],
  ["Checkout confirm", "Checkout completion rate", "No failure states modeled (funds, payment, shipping)", "Insufficient-coin path handled; others noted as future work"],
  ["Post-purchase", "Repeat redemption rate (the real retention metric)", "Easy to treat this as the end of the flow", "Streak screen ties this purchase to the next session, not just this one"],
];

export default function Home() {
  const [screen, setScreen] = useState(1);
  const [redeemedOnce, setRedeemedOnce] = useState(false);
  const [pickSetB, setPickSetB] = useState(false);
  const [lowCoinMode, setLowCoinMode] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [selected, setSelected] = useState(SET_A[0]);
  const [device, setDevice] = useState("web");
  const [narrow, setNarrow] = useState(false);

  // On a real phone-sized viewport the web frame can't fit, so always use the mobile layout there.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const mode = narrow ? "mobile" : device;

  const total = 5;
  const go = (n) => setScreen(n);
  const backToGame = () => { setRedeemedOnce(true); setScreen(1); };

  const activeSet = pickSetB ? SET_B : SET_A;

  // Checkout mix for the selected reward: any coins the player can't cover are topped up with cash.
  const coinPrice = toNum(selected.coin);
  const available = lowCoinMode ? LOW_COINS : START_COINS;
  const coinsUsed = Math.min(coinPrice, available);
  const shortfall = coinPrice - coinsUsed;
  const cashDue = toNum(selected.cash) + Math.round(shortfall * RUPEES_PER_COIN);
  const priceLabel = [coinsUsed > 0 && `${fmt(coinsUsed)} coins`, cashDue > 0 && `₹${fmt(cashDue)}`].filter(Boolean).join(" + ");
  const coinShare = Math.round((coinsUsed / (coinsUsed + cashDue / RUPEES_PER_COIN)) * 100);
  const balanceAfter = fmt(START_COINS - coinsUsed + (selected.bonus || 0));
  const openItem = (item) => { setSelected(item); setLowCoinMode(false); go(3); };

  return (
    <main className="page">
      <div className="page-head">
        <p className="eyebrow">PlaySuper <span>Reward Drop</span> Prototype</p>
        <p className="sub">
          A clickable walkthrough of an in-game store, built around curated &quot;Reward Drops&quot;
          instead of a full catalog — tap through the five stages below.
        </p>
      </div>

      {!narrow && (
        <div className="device-toggle">
          <button className={`seg ${device === "mobile" ? "on" : ""}`} onClick={() => setDevice("mobile")}>📱 Mobile</button>
          <button className={`seg ${device === "web" ? "on" : ""}`} onClick={() => setDevice("web")}>🖥 Web</button>
        </div>
      )}

      <div className={`stage ${mode}`}>
        <div className={`device ${mode === "mobile" ? "phone" : "web"}`}>
          {mode === "mobile" ? (
            <div className="notch" />
          ) : (
            <div className="winbar">
              <span className="win-dots"><i /><i /><i /></span>
              <span className="win-title">Eldermoon · Reward Store</span>
            </div>
          )}
          <div className="viewport">

          {/* SCREEN 1: trigger */}
          <div className={`screen ${screen === 1 ? "active" : ""}`}>
            <div className="game-bg" />
            <div className="hud">
              <div className="hud-coins"><span className="coin-dot" />{redeemedOnce ? balanceAfter : fmt(START_COINS)}</div>
              <div className="hud-level">Level 14</div>
            </div>
            <div className="backdrop">
              <div className="stars" />
              <div className="moon" />
              <div className="peaks far" />
              <div className="peaks" />
            </div>
            <div className="playfield">
              <div className="scene">
                <div className="game-logo">Eldermoon</div>
                <svg className="hero-char" viewBox="0 0 120 150" aria-label="Lyra the Moonwarden">
                  <defs>
                    <linearGradient id="cloak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#8e7cf0" />
                      <stop offset="1" stopColor="#2c1f6b" />
                    </linearGradient>
                    <radialGradient id="orb" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0" stopColor="#eafff6" />
                      <stop offset="0.5" stopColor="#3fe0a5" />
                      <stop offset="1" stopColor="#3fe0a5" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="60" cy="140" rx="40" ry="7" fill="#3fe0a5" opacity="0.25" />
                  <line x1="97" y1="36" x2="103" y2="138" stroke="#c9a15a" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="96" cy="28" r="16" fill="url(#orb)" />
                  <circle cx="96" cy="28" r="5" fill="#eafff6" />
                  <path d="M60 34 C36 40 28 84 20 138 L100 138 C92 84 84 40 60 34 Z" fill="url(#cloak)" />
                  <path d="M60 60 L50 138 L70 138 Z" fill="#1c1447" opacity="0.6" />
                  <path d="M60 10 C40 12 34 34 38 54 C46 62 74 62 82 54 C86 34 80 12 60 10 Z" fill="#4a3ba0" />
                  <ellipse cx="60" cy="40" rx="15" ry="17" fill="#0b0818" />
                  <circle cx="54" cy="40" r="2.6" fill="#f5b942" />
                  <circle cx="66" cy="40" r="2.6" fill="#f5b942" />
                  <path d="M60 74 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13 Z" fill="#f5b942" />
                </svg>
                <div className="nameplate">
                  <span className="char-name">Lyra</span>
                  <span className="char-class">Moonwarden · Lv 14</span>
                </div>
              </div>
            </div>
            <div className="toast">
              {!redeemedOnce ? (
                <>
                  <div className="toast-label">Level up reward</div>
                  <p className="toast-title">You&apos;ve earned a Reward Drop 🎁</p>
                  <div className="toast-row">
                    <button className="btn btn-ghost" onClick={() => go(1)}>Later</button>
                    <button className="btn btn-primary" onClick={() => go(2)}>Open Drop</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="toast-label">Streak active 🔥</div>
                  <p className="toast-title" style={{ fontSize: 15 }}>Next Drop unlocks at Level 16</p>
                  <div className="toast-row">
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => go(2)}>Peek at store anyway</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SCREEN 2: store home */}
          <div className={`screen ${screen === 2 ? "active" : ""}`}>
            <div className="game-bg" style={{ opacity: 0.5 }} />
            <div className="store-head">
              <div className="hud" style={{ padding: 0 }}>
                <div className="hud-coins"><span className="coin-dot" />2,450<span className="coin-plus">+</span></div>
                <div className="back-btn" onClick={() => go(1)}>✕</div>
              </div>
              <h2>Your Reward Drop</h2>
              <p className="pick-caption">
                {pickSetB ? "Here's a different cut — trending with similar players" : "Picked for you from how you've been playing this week"}
              </p>
            </div>
            <div className="reward-scroll">
              {activeSet.map((item) => (
                <div className="reward-card" key={item.name} onClick={() => openItem(item)}>
                  {item.tag && <span className="tag">{item.tag}</span>}
                  <div className="reward-thumb" style={{ background: item.bg }}>{item.emoji}</div>
                  <div className="reward-info">
                    <p className="name">{item.name}</p>
                    <p className="why">{item.why}</p>
                  </div>
                  <div className="reward-price">
                    {item.coin && <span className="coin-amt">{item.coin}</span>}
                    {item.coin && item.cash && " + "}
                    {item.cash && <span className="cash-amt">{item.cash}</span>}
                    {item.coin && !item.cash && " coins"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", zIndex: 5, padding: "0 18px 16px" }}>
              <button className="btn btn-ghost" style={{ width: "100%", border: "1px solid rgba(255,255,255,0.12)" }} onClick={() => setPickSetB(!pickSetB)}>
                {pickSetB ? "↻ Back to my original picks" : "↻ None of these? Refresh my picks"}
              </button>
            </div>
          </div>

          {/* SCREEN 3: product + checkout */}
          <div className={`screen pd ${screen === 3 ? "active" : ""}`}>
            <div className="pd-top">
              <div className="back-btn" onClick={() => go(2)}>←</div>
            </div>
            <div className="pd-hero" style={{ background: selected.bg }}>{selected.emoji}</div>
            <div className="pd-body">
              <h3>{selected.name}</h3>
              <p className="desc">{selected.desc}</p>
              <div className="mix-box">
                <div className="mix-label">{coinPrice === 0 ? "Cash only" : cashDue > 0 ? "Use coins + cash" : "Use coins"}</div>
                <div className="mix-row">
                  {coinsUsed > 0 && <div className="mix-coin"><span className="coin-dot" />{fmt(coinsUsed)}</div>}
                  {coinsUsed > 0 && cashDue > 0 && <div className="mix-plus">+</div>}
                  {cashDue > 0 && <div className="mix-cash">₹{fmt(cashDue)}</div>}
                </div>
                <div className="slider-track"><div className="slider-fill" style={{ width: `${coinShare}%` }} /></div>
                <p className="mix-helper" style={{ color: shortfall > 0 ? "var(--coral)" : "var(--ink-faint)" }}>
                  {coinPrice === 0
                    ? "This reward is paid in cash — no coins needed"
                    : shortfall > 0
                      ? `Only ${fmt(available)} coins available — rest auto-filled with cash`
                      : `You have ${fmt(available)} coins available`}
                </p>
              </div>
              {coinPrice > 0 && (
                <button className="note-toggle full" onClick={() => setLowCoinMode(!lowCoinMode)}>
                  {lowCoinMode ? "Reset to full coin balance" : `Simulate: only ${LOW_COINS} coins left`}
                </button>
              )}
            </div>
            <div className="pd-footer">
              <button className="btn btn-primary full" onClick={() => go(4)}>
                Confirm · {priceLabel}
              </button>
            </div>
          </div>

          {/* SCREEN 4: post purchase */}
          <div className={`screen center ${screen === 4 ? "active" : ""}`}>
            <div className="center-inner">
              <div className="burst">🎉</div>
              <h2>Drop claimed!</h2>
              <p>{selected.done} Keep playing to unlock your next Reward Drop.</p>
              <div className="xp-pill">+150 bonus XP for redeeming</div>
              <div style={{ padding: "0 30px" }}>
                <button className="btn btn-primary full" onClick={() => go(5)}>Continue</button>
              </div>
            </div>
          </div>

          {/* SCREEN 5: retention hook */}
          <div className={`screen ${screen === 5 ? "active" : ""}`}>
            <div className="game-bg" />
            <div className="hud">
              <div className="hud-coins"><span className="coin-dot" />{balanceAfter}</div>
              <div className="hud-level">Level 14</div>
            </div>
            <div className="retention-body">
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔥</div>
              <h2>3-Drop streak started</h2>
              <p>Your next Reward Drop unlocks at <strong style={{ color: "var(--gold)" }}>Level 16</strong>. Keep your streak alive — miss a Drop and it resets.</p>
              <div className="streak-dots">
                <div className="streak-dot done">✓</div>
                <div className="streak-dot">2</div>
                <div className="streak-dot">3</div>
              </div>
              <button className="btn btn-primary full" onClick={backToGame}>Back to game</button>
            </div>
          </div>
          </div>
        </div>

        <div className="stepper">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`dot ${screen === n ? "active" : ""}`} />
          ))}
        </div>

        <div className="nav-row">
          <button className="btn btn-ghost bordered" onClick={() => go(screen > 1 ? screen - 1 : total)}>Back</button>
          <button className="btn btn-primary" onClick={() => go(screen < total ? screen + 1 : 1)}>Next step</button>
        </div>

        <button className="note-toggle" onClick={() => setNoteOpen(!noteOpen)}>
          {noteOpen ? "Hide product decisions & assumptions ▴" : "Show product decisions & assumptions ▾"}
        </button>

        {noteOpen && (
          <div className="decision-note">
            <h4>Core product question</h4>
            <p style={{ fontStyle: "italic" }}>How should an in-game commerce store be different from a traditional e-commerce store?</p>
            <p>
              In traditional e-commerce, the user arrives with intent — they searched, compared, and are
              ready to transact. In a game, the user has zero shopping intent; they&apos;re mid-flow,
              focused on gameplay. So the store&apos;s entire job is different: it isn&apos;t about
              optimizing a conversion funnel for existing intent, it&apos;s about <strong>not breaking
              immersion</strong> while creating a believable reason to want something. Every decision
              below is built around that single reframe.
            </p>

            <h4>How PlaySuper actually works (research grounding)</h4>
            <p>Before designing, I looked into PlaySuper&apos;s real model rather than treating this as a generic exercise:</p>
            <ul>
              <li>A plug-and-play SDK that game studios integrate without disrupting gameplay.</li>
              <li>In-game currency converts into real-world rewards sourced from a catalog of 5,000+ brands.</li>
              <li>PlaySuper&apos;s core sell to studios is <strong>retention uplift</strong>, not just GMV.</li>
              <li>Personalization is done via <strong>behavioral cohorts</strong>, not individual/personal data.</li>
              <li>A real, stated challenge at their scale: catalog fragmentation — too many brands to show without overwhelming the player.</li>
            </ul>

            <h4>Key decisions, and why not the alternatives</h4>
            {DECISIONS.map((d, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{i + 1}. {d.title}</p>
                <p><strong>Why:</strong> {d.why}</p>
                <p><strong>Why not the alternative:</strong> {d.alt}</p>
              </div>
            ))}

            <h4>The funnel we&apos;re actually targeting</h4>
            <p>
              Most in-game-store prototypes stop at &quot;did they buy.&quot; PlaySuper&apos;s own stated
              business metric is retention lift, not one-time conversion — so the funnel below is designed
              around that, with the specific risk at every step and how the prototype addresses it.
            </p>
            <div className="funnel-table">
              <div className="funnel-row funnel-head">
                <div>Step</div><div>Metric</div><div>Risk</div><div>How it&apos;s addressed</div>
              </div>
              {FUNNEL.map((row, i) => (
                <div className="funnel-row" key={i}>
                  <div>{row[0]}</div><div>{row[1]}</div><div>{row[2]}</div><div>{row[3]}</div>
                </div>
              ))}
            </div>
            <p>
              <strong>The single biggest risk we corrected for:</strong> a prototype that only optimizes
              &quot;did they buy&quot; misses PlaySuper&apos;s actual point. The real product question is
              whether having this store makes a player more likely to come back and play again — so the
              flow doesn&apos;t end at the purchase, it ends at a designed reason to return.
            </p>

            <h4>Assumptions made</h4>
            <ul>
              <li>Single-player casual/hyper-casual mobile game.</li>
              <li>Players already hold an earned in-game coin balance when the store first appears.</li>
              <li>Checkout is a UI mock only — no real payment gateway is wired up.</li>
              <li>&quot;Behavioral cohort&quot; curation is simulated with a toggleable alternate set rather than live personalization data.</li>
              <li>Streak/cooldown logic is simplified to a single redemption cycle to keep the prototype legible within this assignment&apos;s scope.</li>
            </ul>

            <h4>AI / vibe-coding tools used</h4>
            <p>
              Built with Claude as a thinking partner for structuring the product decisions above and for
              the interactive build (React/Next.js) — not as a one-shot generic template. Each edge case
              (fallback picks, low-coin rebalancing, trigger cooldown, retention hook) was deliberately
              designed and iterated on.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          --bg-deep: #0d0a1f;
          --bg-panel: #1a1438;
          --bg-card: #221b4a;
          --gold: #f5b942;
          --gold-dim: #8a6a2a;
          --coral: #ff5c7a;
          --mint: #3fe0a5;
          --violet: #8e7cf0;
          --ink: #f3f0ff;
          --ink-dim: #a79fd1;
          --ink-faint: #7a72a0;
          --display: "Chakra Petch", "Rajdhani", sans-serif;
          --body: "Inter", sans-serif;
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 8%, rgba(255,92,122,0.22), transparent 38%),
            radial-gradient(circle at 88% 22%, rgba(142,124,240,0.24), transparent 42%),
            radial-gradient(circle at 50% 100%, rgba(63,224,165,0.16), transparent 45%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 44px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 44px),
            var(--bg-deep);
          background-attachment: fixed;
          font-family: var(--body);
          color: var(--ink);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 36px 16px 60px;
          box-sizing: border-box;
        }
        .page-head { text-align: center; max-width: 860px; margin-bottom: 22px; }
        .eyebrow {
          font-family: var(--display);
          font-weight: 700;
          font-size: clamp(22px, 3.2vw, 34px);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink);
          margin: 0 0 8px;
          text-shadow: 0 0 24px rgba(142,124,240,0.55);
        }
        .eyebrow span { color: var(--gold); text-shadow: 0 0 22px rgba(245,185,66,0.55); }
        .sub { color: var(--ink-dim); font-size: 14.5px; line-height: 1.55; margin: 0 auto; max-width: 560px; }

        .device-toggle { display: flex; gap: 4px; padding: 4px; margin-bottom: 22px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; }
        .seg { font-family: var(--display); font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-dim); background: transparent; border: none; border-radius: 9px; padding: 8px 18px; cursor: pointer; }
        .seg.on { background: var(--gold); color: #1a1205; box-shadow: 0 0 18px rgba(245,185,66,0.4); }

        .stage { display: flex; flex-direction: column; align-items: center; gap: 22px; width: 100%; max-width: 380px; }
        .stage.web { max-width: 960px; }
        .device { position: relative; display: flex; flex-direction: column; background: #0b0818; overflow: hidden; }
        .viewport { position: relative; flex: 1; }
        .phone {
          width: 340px; height: 700px;
          border-radius: 44px; border: 7px solid #000;
          box-shadow: 0 30px 70px rgba(0,0,0,0.6), 0 0 60px rgba(142,124,240,0.25), inset 0 0 0 2px rgba(255,255,255,0.03);
        }
        .device.web {
          width: 100%; height: 600px; flex-shrink: 0;
          border-radius: 18px; border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 70px rgba(142,124,240,0.22);
        }
        .notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 22px; background: #000; border-radius: 0 0 16px 16px; z-index: 50; }
        .winbar { height: 38px; flex-shrink: 0; display: flex; align-items: center; gap: 14px; padding: 0 14px; background: #07051a; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .win-dots { display: flex; gap: 6px; }
        .win-dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--coral); }
        .win-dots i:nth-child(2) { background: var(--gold); }
        .win-dots i:nth-child(3) { background: var(--mint); }
        .win-title { font-family: var(--display); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-dim); }

        .screen {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          opacity: 0; pointer-events: none; transform: translateY(14px);
          transition: opacity 0.38s ease, transform 0.38s ease;
        }
        .screen.active { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .screen.center { align-items: center; justify-content: center; text-align: center; }
        .center-inner { width: 100%; max-width: 400px; }
        .game-bg {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 25% 18%, rgba(255,92,122,0.35), transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(63,224,165,0.22), transparent 50%),
            linear-gradient(180deg, #241a46 0%, #15102b 70%);
        }
        .hud { position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: center; padding: 34px 18px 0; }
        .hud-coins {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,0,0,0.45); border: 1px solid rgba(245,185,66,0.5); border-radius: 999px;
          padding: 6px 12px 6px 8px; font-family: var(--display); font-weight: 700; font-size: 14px; letter-spacing: 0.04em; color: var(--gold);
        }
        .coin-dot { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ffe8b0, var(--gold) 60%, var(--gold-dim)); display: inline-block; }
        .coin-plus { margin-left: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--mint); color: #062216; font-size: 13px; line-height: 16px; text-align: center; }
        .hud-level { font-family: var(--display); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink); background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.14); padding: 6px 12px; border-radius: 999px; }
        .playfield { position: relative; flex: 1; display: flex; align-items: center; justify-content: center; padding-bottom: 150px; }
        .backdrop { position: absolute; inset: 0; overflow: hidden; }
        .stars { position: absolute; top: 0; left: 0; width: 2px; height: 2px; border-radius: 50%; background: transparent;
          box-shadow: 30px 70px #fff, 90px 120px #cfc8ff, 150px 60px #fff, 230px 95px #cfc8ff, 290px 150px #fff, 60px 200px #cfc8ff, 200px 220px #fff,
            380px 80px #fff, 470px 140px #cfc8ff, 560px 60px #fff, 650px 110px #cfc8ff, 740px 70px #fff, 830px 160px #cfc8ff, 900px 90px #fff, 520px 230px #fff, 700px 250px #cfc8ff; }
        .moon { position: absolute; top: 13%; right: 14%; width: 78px; height: 78px; border-radius: 50%; background: radial-gradient(circle at 38% 35%, #fff8e0, #f5d98a 60%, #c9a15a); box-shadow: 0 0 50px rgba(245,217,138,0.55), 0 0 120px rgba(245,217,138,0.25); }
        .peaks { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; background: #0f0a26; clip-path: polygon(0 100%, 0 60%, 12% 30%, 22% 55%, 35% 12%, 48% 50%, 60% 28%, 72% 58%, 85% 20%, 100% 52%, 100% 100%); }
        .peaks.far { height: 46%; background: #2a1f5c; opacity: 0.7; clip-path: polygon(0 100%, 0 40%, 15% 62%, 28% 22%, 42% 58%, 55% 15%, 68% 50%, 80% 30%, 92% 60%, 100% 35%, 100% 100%); }
        .scene { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .game-logo { font-family: var(--display); font-weight: 700; font-size: 22px; text-transform: uppercase; letter-spacing: 0.32em; margin-right: -0.32em; color: #fff8e0; text-shadow: 0 0 18px rgba(245,217,138,0.7); }
        .hero-char { width: 150px; height: 188px; filter: drop-shadow(0 0 22px rgba(142,124,240,0.6)); animation: floaty 3.6s ease-in-out infinite; }
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .nameplate { display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid rgba(245,185,66,0.5); border-radius: 12px; padding: 6px 18px; }
        .char-name { font-family: var(--display); font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--gold); }
        .char-class { font-family: var(--display); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-dim); }
        .toast {
          position: absolute; left: 16px; right: 16px; bottom: 28px;
          background: linear-gradient(135deg, #2a2158, #1c1540); border: 1px solid rgba(245,185,66,0.5);
          border-radius: 20px; padding: 16px 16px 14px; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(245,185,66,0.15);
        }
        .toast-label { font-family: var(--display); font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--gold); font-weight: 700; margin-bottom: 4px; }
        .toast-title { font-family: var(--display); font-size: 18px; font-weight: 700; margin: 0 0 10px; }
        .toast-row { display: flex; gap: 8px; }
        .btn { font-family: var(--display); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.07em; border: none; border-radius: 12px; padding: 11px 14px; cursor: pointer; transition: transform 0.12s ease, box-shadow 0.2s ease; }
        .btn:active { transform: scale(0.96); }
        .btn-primary { background: linear-gradient(180deg, #ff7a93, var(--coral)); color: #1a0d16; flex: 1; box-shadow: 0 4px 0 #a6264a, 0 0 22px rgba(255,92,122,0.35); }
        .btn-primary:hover { box-shadow: 0 4px 0 #a6264a, 0 0 32px rgba(255,92,122,0.6); }
        .btn-ghost { background: transparent; color: var(--ink-dim); }
        .btn-ghost:hover { color: var(--ink); }
        .btn.full { width: 100%; padding: 14px; flex: none; }
        .btn.bordered { border: 1px solid rgba(255,255,255,0.16); flex: 1; }
        .nav-row { display: flex; gap: 10px; width: 100%; max-width: 340px; }
        .nav-row .btn { flex: 1; }
        .back-btn { width: 30px; height: 30px; border-radius: 10px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; color: var(--ink); }
        .store-head { position: relative; z-index: 5; padding: 34px 18px 2px; }
        .store-head h2 { font-family: var(--display); font-size: 20px; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 2px; }
        .pick-caption { font-size: 12.5px; color: var(--ink-dim); margin: 0 0 8px; }
        .reward-scroll { position: relative; z-index: 5; flex: 1; overflow-y: auto; padding: 10px 18px 20px; display: flex; flex-direction: column; gap: 12px; }
        .reward-card { position: relative; display: flex; align-items: center; gap: 12px; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
        .reward-card:hover { transform: translateY(-2px); border-color: rgba(245,185,66,0.6); box-shadow: 0 10px 26px rgba(0,0,0,0.4), 0 0 20px rgba(245,185,66,0.18); }
        .tag { position: absolute; top: -8px; right: 12px; z-index: 2; font-family: var(--display); font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; background: var(--gold); color: #1a1205; padding: 3px 8px; border-radius: 6px; }
        .reward-thumb { width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .reward-info { flex: 1; min-width: 0; }
        .reward-info .name { font-family: var(--display); font-size: 14px; font-weight: 600; margin: 0 0 3px; }
        .reward-info .why { font-size: 11px; color: var(--ink-faint); margin: 0; }
        .reward-price { font-family: var(--display); font-weight: 700; font-size: 13px; text-align: right; white-space: nowrap; }
        .reward-price .coin-amt { color: var(--gold); }
        .reward-price .cash-amt { color: var(--ink-dim); }
        .pd-top { position: relative; z-index: 5; padding: 34px 18px 0; display: flex; align-items: center; gap: 10px; }
        .pd-hero { margin: 14px 18px 0; height: 150px; border-radius: 20px; background: linear-gradient(135deg, #2e2560, #1a1438); display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .pd-body { padding: 16px 18px; flex: 1; overflow-y: auto; }
        .pd-body h3 { font-family: var(--display); font-size: 19px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 6px; }
        .pd-body .desc { font-size: 12.5px; color: var(--ink-dim); line-height: 1.5; margin: 0 0 16px; }
        .mix-box { background: var(--bg-panel); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px; margin-bottom: 14px; }
        .mix-label { font-family: var(--display); font-size: 11px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
        .mix-row { display: flex; align-items: center; justify-content: space-between; }
        .mix-coin { display: flex; align-items: center; gap: 6px; font-family: var(--display); color: var(--gold); font-weight: 700; font-size: 16px; }
        .mix-plus { color: var(--ink-faint); font-size: 13px; }
        .mix-cash { font-family: var(--display); font-weight: 700; font-size: 16px; }
        .slider-track { margin-top: 12px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); position: relative; }
        .slider-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, var(--gold), var(--coral)); transition: width 0.3s ease; }
        .mix-helper { font-size: 11px; margin: 10px 0 0; }
        .pd-footer { position: relative; z-index: 5; padding: 14px 18px 22px; }
        .burst { width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff2cf, var(--gold) 55%, var(--gold-dim)); display: flex; align-items: center; justify-content: center; font-size: 46px; margin: 0 auto 22px; box-shadow: 0 0 0 10px rgba(245,185,66,0.08), 0 20px 50px rgba(245,185,66,0.3); }
        .screen.center h2 { font-family: var(--display); font-size: 24px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px; }
        .screen.center p { font-size: 13px; color: var(--ink-dim); margin: 0 0 4px; line-height: 1.5; padding: 0 30px; }
        .xp-pill { margin: 18px auto 26px; display: inline-flex; align-items: center; gap: 6px; background: rgba(63,224,165,0.12); border: 1px solid rgba(63,224,165,0.4); color: var(--mint); font-family: var(--display); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; padding: 7px 14px; border-radius: 999px; }
        .retention-body { position: relative; z-index: 5; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 30px; width: 100%; max-width: 400px; margin: 0 auto; box-sizing: border-box; }
        .retention-body h2 { font-family: var(--display); font-size: 21px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px; }
        .retention-body p { font-size: 12.5px; color: var(--ink-dim); line-height: 1.6; margin: 0 0 20px; }
        .streak-dots { display: flex; gap: 8px; margin-bottom: 26px; }
        .streak-dot { width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-family: var(--display); font-size: 13px; color: var(--ink-faint); }
        .streak-dot.done { background: var(--mint); color: #0b0818; font-size: 15px; }

        /* Web layout: same screens, laid out for a wide game window */
        .web .hud { padding: 18px 26px 0; }
        .web .playfield { padding-bottom: 130px; }
        .web .toast { left: auto; right: 26px; bottom: 26px; width: 380px; }
        .web .store-head { padding: 18px 26px 2px; }
        .web .store-head h2 { font-size: 24px; }
        .web .reward-scroll { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-content: start; gap: 16px; padding: 12px 26px 20px; }
        .web .reward-card { flex-direction: column; align-items: stretch; padding: 14px; }
        .web .reward-thumb { width: 100%; height: 120px; font-size: 46px; }
        .web .reward-price { text-align: left; font-size: 15px; }
        .web .screen.pd { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto 1fr auto; }
        .web .pd-top { grid-column: 1 / -1; padding: 18px 26px 0; }
        .web .pd-hero { grid-column: 1; grid-row: 2 / 4; height: auto; margin: 14px 0 26px 26px; font-size: 110px; }
        .web .pd-body { grid-column: 2; grid-row: 2; padding: 14px 26px 0; }
        .web .pd-body h3 { font-size: 24px; }
        .web .pd-footer { grid-column: 2; grid-row: 3; padding: 14px 26px 26px; }

        .stepper { display: flex; gap: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.18); transition: all 0.2s ease; }
        .dot.active { background: var(--coral); transform: scale(1.3); box-shadow: 0 0 10px var(--coral); }
        .note-toggle { margin-top: 10px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.14); color: var(--ink-dim); font-size: 12.5px; font-family: var(--body); border-radius: 10px; padding: 9px 14px; cursor: pointer; }
        .note-toggle:hover { border-color: var(--gold); color: var(--gold); }
        .note-toggle.full { width: 100%; margin: 0 0 14px; }
        .decision-note {
          max-width: 760px; width: 100%; margin-top: 18px; background: rgba(26,20,56,0.92);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 22px 24px;
          font-size: 13.5px; line-height: 1.6; color: var(--ink-dim); box-sizing: border-box;
        }
        .decision-note h4 { font-family: var(--display); font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); margin: 18px 0 6px; }
        .decision-note h4:first-child { margin-top: 0; }
        .decision-note p { margin: 0 0 4px; }
        .decision-note ul { margin: 0 0 8px; padding-left: 18px; }
        .decision-note li { margin-bottom: 4px; }
        .funnel-table { display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin: 10px 0 14px; }
        .funnel-row { display: grid; grid-template-columns: 1fr 1fr 1.4fr 1.4fr; gap: 8px; background: var(--bg-card); padding: 8px 10px; font-size: 11.5px; }
        .funnel-row.funnel-head { background: #2a2158; font-family: var(--display); font-weight: 700; color: var(--gold); text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; }
        @media (max-width: 560px) {
          .funnel-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 400px) {
          .phone { width: 300px; height: 620px; }
        }
      `}</style>
    </main>
  );
}
