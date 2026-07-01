import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";
import type { Scene, SceneProps } from "@/scenes/types";
import {
  CampfireIcon,
  DoorIcon,
  ShipSigil,
  Starburst,
  VitaIcon,
} from "@/scenes/search-portal/icons";

/* ------------------------------------------------------------------ *
 * Tokens
 * ------------------------------------------------------------------ */
const W = 800; // component width on the 1600px stage (~50%)

const T_HOVER = { duration: 0.16, ease: EASE.entrance };
const T_PRESS = { duration: 0.1, ease: EASE.entrance };
const T_FOCUS = { duration: 0.2, ease: EASE.entrance };

const ENTER_FROM = { opacity: 0, y: 7, filter: "blur(7px)" };
const ENTER_TO = { opacity: 1, y: 0, filter: "blur(0px)" };
const enter = (delay: number) => ({ duration: 0.62, ease: EASE.entrance, delay });

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */
const APPS = [
  { id: "app:door", Icon: DoorIcon, name: "door.link", pill: "GROUP" },
  { id: "app:campfire", Icon: CampfireIcon, name: "Campfire", pill: "APP" },
  { id: "app:vita", Icon: VitaIcon, name: "vita", pill: "APP" },
] as const;

const SHIPS = [
  { id: "ship:foddur", name: "~foddur-hodler", tilt: 1.6 },
  { id: "ship:toptyr", name: "~toptyr-bilder", tilt: -1.6 },
  { id: "ship:fillux", name: "~fillux-dopyl", tilt: 1.6 },
] as const;

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */

/** Entrance-only wrapper (opacity + translateY + blur), staggered by delay. */
function Enter({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.div initial={ENTER_FROM} animate={ENTER_TO} transition={enter(delay)}>
      {children}
    </motion.div>
  );
}

/** Faint rounded hover surface behind a row — inset from the card edge. */
function HoverBg({ active, pressed }: { active: boolean; pressed: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-[10px]"
      style={{ left: -10, right: -10, top: 0, bottom: 0 }}
      initial={false}
      animate={{
        opacity: active || pressed ? 1 : 0,
        backgroundColor: pressed ? "#F4F4F4" : "#F8F8F8",
      }}
      transition={pressed ? T_PRESS : T_HOVER}
    />
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="balance"
      style={{ fontSize: 15, color: "#B8B8B8", letterSpacing: "0.005em" }}
    >
      {children}
    </div>
  );
}

/** Pale-gray highlight of the matched query prefix inside a word. */
function Match({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q && text.toLowerCase().startsWith(q.toLowerCase())) {
    const head = text.slice(0, q.length);
    const tail = text.slice(q.length);
    return (
      <>
        <span
          style={{
            background: "rgba(0,0,0,0.055)",
            borderRadius: 3,
            padding: "0 1px",
            margin: "0 -1px",
          }}
        >
          {head}
        </span>
        {tail}
      </>
    );
  }
  return <>{text}</>;
}

/* ------------------------------------------------------------------ *
 * Search bar
 * ------------------------------------------------------------------ */
function SearchBar({
  playing,
  focused,
  query,
  hovered,
  setFocused,
  setHovered,
  setQuery,
}: {
  playing: boolean;
  focused: boolean;
  query: string;
  hovered: boolean;
  setFocused: (v: boolean) => void;
  setHovered: (v: boolean) => void;
  setQuery: (v: string) => void;
}) {
  const lifted = hovered || focused;
  return (
    <div
      tabIndex={0}
      onPointerEnter={() => !playing && setHovered(true)}
      onPointerLeave={() => !playing && setHovered(false)}
      onFocus={() => !playing && setFocused(true)}
      onBlur={() => !playing && setFocused(false)}
      onKeyDown={(e) => {
        if (playing) return;
        if (e.key === "Backspace") setQuery(query.slice(0, -1));
        else if (e.key.length === 1) setQuery(query + e.key);
      }}
      className="relative flex items-center outline-none"
      style={{ width: W, height: 56 }}
    >
      {/* base surface + shadow-as-border + faint inner top highlight */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[14px]"
        initial={false}
        animate={{ backgroundColor: lifted ? "#FFFFFF" : "#FAFAFA" }}
        transition={T_FOCUS}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.055), 0 1px 2px rgba(0,0,0,0.035), 0 8px 24px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      />
      {/* hover ring (fades out when focused) */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[14px]"
        initial={false}
        animate={{ opacity: hovered && !focused ? 1 : 0 }}
        transition={T_HOVER}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04), 0 10px 28px rgba(0,0,0,0.035)",
        }}
      />
      {/* focus glow */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[14px]"
        initial={false}
        animate={{ opacity: focused ? 1 : 0 }}
        transition={T_FOCUS}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 0 0 4px rgba(0,0,0,0.035), 0 8px 28px rgba(0,0,0,0.04)",
        }}
      />

      {/* left starburst — slow passive rotation; lifts a touch on focus */}
      <div className="relative z-10 grid place-items-center pl-[18px] pr-[13px]">
        <motion.span
          animate={{ opacity: focused ? 0.95 : 0.8, scale: focused ? 1.06 : 1 }}
          transition={T_FOCUS}
          style={{ display: "grid", placeItems: "center" }}
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
            style={{ display: "grid", placeItems: "center" }}
          >
            <Starburst />
          </motion.span>
        </motion.span>
      </div>

      {/* text: typed value + caret, with placeholder overlay */}
      <div className="relative z-10 flex min-w-0 flex-1 items-center">
        <span
          className="pretty inline-flex items-center whitespace-pre"
          style={{ fontSize: 20, color: "#1C1C1C", letterSpacing: "-0.005em" }}
        >
          {query}
          {focused && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 1.5,
                height: 22,
                marginLeft: 1,
                background: "#3A3A3A",
                borderRadius: 1,
              }}
            />
          )}
        </span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0"
          initial={false}
          animate={{ opacity: query.length ? 0 : 1, color: lifted ? "#9B9B9B" : "#A5A5A5" }}
          transition={{ duration: 0.12, ease: EASE.entrance }}
          style={{ fontSize: 20, fontWeight: 400, letterSpacing: "-0.005em" }}
        >
          Search Portal...
        </motion.span>
      </div>

      {/* right keycap "/" — depresses on focus */}
      <div className="relative z-10 pr-[13px]">
        <motion.span
          className="grid place-items-center"
          initial={false}
          animate={{
            y: focused ? 1 : 0,
            backgroundColor: lifted ? "#F2F2F2" : "#EFEFEF",
            boxShadow: focused
              ? "inset 0 1.5px 2px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)"
              : "inset 0 -1px 0 rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
          transition={T_FOCUS}
          style={{ width: 32, height: 32, borderRadius: 8 }}
        >
          <span
            style={{
              fontSize: 16,
              lineHeight: 1,
              color: "#9A9A9A",
              transform: "translateY(-0.5px)",
            }}
          >
            /
          </span>
        </motion.span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Rows
 * ------------------------------------------------------------------ */
function AppRow({
  app,
  query,
  hovered,
  pressed,
  bind,
}: {
  app: (typeof APPS)[number];
  query: string;
  hovered: boolean;
  pressed: boolean;
  bind: RowBind;
}) {
  const { Icon, name, pill } = app;
  return (
    <motion.div
      {...bind}
      className="relative flex cursor-default items-center"
      style={{ height: 44 }}
      initial={false}
      animate={{ y: pressed ? 1 : 0 }}
      transition={pressed ? T_PRESS : T_HOVER}
    >
      <HoverBg active={hovered} pressed={pressed} />
      <motion.span
        className="relative z-10 grid place-items-center"
        initial={false}
        animate={{
          scale: pressed ? 1.0 : hovered ? 1.03 : 1,
          boxShadow: hovered
            ? "0 3px 8px rgba(0,0,0,0.10)"
            : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={pressed ? T_PRESS : T_HOVER}
        style={{ borderRadius: 6 }}
      >
        <Icon />
      </motion.span>
      <motion.span
        className="relative z-10"
        initial={false}
        animate={{ x: hovered ? 1 : 0 }}
        transition={T_HOVER}
        style={{
          marginLeft: 13,
          fontSize: 20,
          fontWeight: 500,
          color: "#111111",
          letterSpacing: "-0.01em",
        }}
      >
        <Match text={name} query={query} />
      </motion.span>
      <div className="relative z-10 ml-auto">
        <motion.span
          className="inline-flex items-center"
          initial={false}
          animate={{ backgroundColor: hovered ? "#E8E8E8" : "#F0F0F0" }}
          transition={T_HOVER}
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#9E9E9E",
          }}
        >
          {pill}
        </motion.span>
      </div>
    </motion.div>
  );
}

function ShipRow({
  ship,
  index,
  hovered,
  pressed,
  bind,
}: {
  ship: (typeof SHIPS)[number];
  index: number;
  hovered: boolean;
  pressed: boolean;
  bind: RowBind;
}) {
  const tilt = pressed ? ship.tilt * 0.4 : hovered ? ship.tilt : 0;
  return (
    <motion.div
      {...bind}
      className="relative flex cursor-default items-center"
      style={{ height: 44 }}
      initial={false}
      animate={{ y: pressed ? 1 : 0 }}
      transition={pressed ? T_PRESS : T_HOVER}
    >
      <HoverBg active={hovered} pressed={pressed} />
      <motion.span
        className="relative z-10 grid place-items-center"
        initial={false}
        animate={{ rotate: tilt }}
        transition={pressed ? T_PRESS : T_HOVER}
        style={{ borderRadius: 6 }}
      >
        <ShipSigil index={index} />
      </motion.span>
      <motion.span
        className="relative z-10"
        initial={false}
        animate={{ x: hovered ? 1 : 0 }}
        transition={T_HOVER}
        style={{
          marginLeft: 14,
          fontSize: 20,
          fontWeight: 500,
          color: "#111111",
          letterSpacing: "-0.01em",
        }}
      >
        {ship.name}
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Recent posts
 * ------------------------------------------------------------------ */
function Link({
  children,
  hovered,
  query,
}: {
  children: string;
  hovered: boolean;
  query?: string;
}) {
  return (
    <motion.span
      className="whitespace-pre"
      initial={false}
      animate={{
        color: hovered ? "#111111" : "#3A3A3A",
        borderBottomWidth: hovered ? 1.5 : 1,
      }}
      transition={{ duration: 0.14, ease: EASE.entrance }}
      style={{
        borderBottomStyle: "solid",
        borderBottomColor: "#3A3A3A",
        paddingBottom: 1,
      }}
    >
      {query !== undefined ? <Match text={children} query={query} /> : children}
    </motion.span>
  );
}

function PostLine({
  hovered,
  bind,
  children,
}: {
  hovered: boolean;
  bind: RowBind;
  children: ReactNode;
}) {
  return (
    <motion.div
      {...bind}
      className="pretty cursor-default whitespace-nowrap"
      initial={false}
      animate={{ color: hovered ? "#565656" : "#6A6A6A" }}
      transition={{ duration: 0.14, ease: EASE.entrance }}
      style={{ fontSize: 18, lineHeight: "33px", letterSpacing: "-0.006em" }}
    >
      {children}
    </motion.div>
  );
}

function Handle({ children }: { children: string }) {
  return (
    <span style={{ fontWeight: 600, color: "#111111" }}>{children}</span>
  );
}

/* ------------------------------------------------------------------ *
 * Interaction state helpers
 * ------------------------------------------------------------------ */
type RowBind = {
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
};

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */
function SearchPortal({ playing, loopKey }: SceneProps) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [barHover, setBarHover] = useState(false);

  // Autoplay demo timeline — seamless: starts blank (entrance), ends blank (exit).
  useEffect(() => {
    if (!playing) return;
    setFocused(false);
    setQuery("");
    setHover(null);
    setPressed(null);
    setPhase("in");
    setBarHover(false);

    const steps: [number, () => void][] = [
      [1900, () => setFocused(true)],
      [2150, () => setQuery("d")],
      [2250, () => setQuery("do")],
      [2350, () => setQuery("doo")],
      [2450, () => setQuery("door")],
      [2560, () => setQuery("door.")],
      [2670, () => setQuery("door.l")],
      [2820, () => setQuery("door.link")],
      [3300, () => setHover("app:door")],
      [3850, () => setPressed("app:door")],
      [3970, () => setPressed(null)],
      [4200, () => setHover("app:campfire")],
      [4650, () => setHover("app:vita")],
      [5050, () => setHover(null)],
      [5300, () => setHover("post:door")],
      [6000, () => setHover("post:forum")],
      [6500, () => setHover(null)],
      [6750, () => setHover("ship:foddur")],
      [7300, () => setPressed("ship:foddur")],
      [7420, () => setPressed(null)],
      [7650, () => setHover("ship:fillux")],
      [8150, () => setHover(null)],
      [8350, () => {
        setQuery("");
        setFocused(false);
      }],
      [9250, () => setPhase("out")],
    ];
    const timers = steps.map(([t, fn]) => setTimeout(fn, t));
    return () => timers.forEach(clearTimeout);
  }, [playing, loopKey]);

  const rowBind = (id: string): RowBind =>
    playing
      ? {}
      : {
          onPointerEnter: () => setHover(id),
          onPointerLeave: () => setHover((h) => (h === id ? null : h)),
          onPointerDown: () => setPressed(id),
          onPointerUp: () => setPressed((p) => (p === id ? null : p)),
        };

  const is = (id: string) => hover === id || pressed === id;

  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: "#FBFBFB" }}>
      <motion.div
        initial={false}
        animate={
          phase === "out"
            ? { opacity: 0, y: 3, filter: "blur(4px)" }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.2, ease: EASE.entrance }}
        style={{ width: W }}
      >
        {/* search bar — enters first */}
        <Enter delay={0}>
          <SearchBar
            playing={playing}
            focused={focused}
            query={query}
            hovered={barHover}
            setFocused={setFocused}
            setHovered={setBarHover}
            setQuery={setQuery}
          />
        </Enter>

        {/* results card — shell enters second */}
        <Enter delay={0.08}>
          <div
            style={{
              marginTop: 17,
              borderRadius: 14,
              background: "#FFFFFF",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.035), 0 18px 44px rgba(0,0,0,0.035)",
              padding: "20px 20px 24px",
            }}
          >
            <motion.div
              initial={false}
              animate={{ opacity: query ? 1 : 0.9, y: query ? -2 : 0 }}
              transition={{ duration: 0.22, ease: EASE.entrance }}
            >
              {/* Section: Apps, Groups & Collections */}
              <Enter delay={0.14}>
                <SectionLabel>Apps, Groups &amp; Collections</SectionLabel>
              </Enter>
              <div style={{ marginTop: 11 }}>
                {APPS.map((app, i) => (
                  <Enter key={app.id} delay={0.17 + i * 0.03}>
                    <AppRow
                      app={app}
                      query={query}
                      hovered={hover === app.id}
                      pressed={pressed === app.id}
                      bind={rowBind(app.id)}
                    />
                  </Enter>
                ))}
              </div>

              {/* Section: Recent posts */}
              <div style={{ marginTop: 20, marginBottom: 12 }}>
                <Enter delay={0.28}>
                  <SectionLabel>Recent posts</SectionLabel>
                </Enter>
              </div>
              <div className="flex flex-col" style={{ gap: 2 }}>
                <Enter delay={0.3}>
                  <PostLine hovered={is("post:door")} bind={rowBind("post:door")}>
                    <Handle>~foddur-hodler:</Handle>{" "}
                    {"“I just checked out "}
                    <Link hovered={is("post:door")} query={query}>
                      door.link
                    </Link>
                    {"! It’s veeery niiiiice!”"}
                  </PostLine>
                </Enter>
                <Enter delay={0.33}>
                  <PostLine hovered={is("post:fillux")} bind={rowBind("post:fillux")}>
                    <Handle>~fillux-dopyl:</Handle>{" "}
                    {"“Portal is everything what I asked for. It’s the missing link that…”"}
                  </PostLine>
                </Enter>
                <Enter delay={0.36}>
                  <PostLine hovered={is("post:forum")} bind={rowBind("post:forum")}>
                    <Handle>~toptyr-bilder:</Handle>{" "}
                    <Link hovered={is("post:forum")}>[The Cryptocurrency Forum]</Link>{" "}
                    {"“Seems like another gold rush…”"}
                  </PostLine>
                </Enter>
              </div>

              {/* Section: Ships */}
              <div style={{ marginTop: 20, marginBottom: 12 }}>
                <Enter delay={0.41}>
                  <SectionLabel>Ships</SectionLabel>
                </Enter>
              </div>
              <div>
                {SHIPS.map((ship, i) => (
                  <Enter key={ship.id} delay={0.43 + i * 0.03}>
                    <ShipRow
                      ship={ship}
                      index={i}
                      hovered={hover === ship.id}
                      pressed={pressed === ship.id}
                      bind={rowBind(ship.id)}
                    />
                  </Enter>
                ))}
              </div>
            </motion.div>
          </div>
        </Enter>
      </motion.div>
    </div>
  );
}

export const scene: Scene = {
  id: "search-portal",
  title: "Search Portal",
  blurb:
    "A calm command-palette / discovery panel — staggered blur-in, focus glow, and contextual row motion.",
  tags: ["Command palette", "Stagger entrance", "Focus glow", "Optical detail"],
  aspect: "landscape",
  loopMs: 10000,
  Component: SearchPortal,
};
