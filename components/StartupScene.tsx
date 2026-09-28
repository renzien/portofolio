type Props = {
  progress: number;
  ready: boolean;
  leaving: boolean;
  enhanced: boolean;
  onSkip: () => void;
};

/** A small original vector mascot: all graphics are inline, with no image requests. */
export default function StartupScene({
  progress,
  ready,
  leaving,
  enhanced,
  onSkip,
}: Props) {
  return (
    <div
      className={`startup-screen${leaving ? " is-leaving" : ""}`}
      data-enhanced={enhanced}
      role="dialog"
      aria-modal="true"
      aria-label="Intro portofolio"
      onKeyDown={(event) => {
        if (event.key === "Escape") onSkip();
        if (event.key === "Tab") {
          event.preventDefault();
          event.currentTarget
            .querySelector<HTMLButtonElement>("button")
            ?.focus();
        }
      }}
    >
      <div className="startup-topline">
        <span className="wordmark" aria-hidden="true">
          ar<span>®</span>
        </span>
        <span className="startup-edition">PORTFOLIO / PLAYER ONE</span>
      </div>

      <div className="startup-center">
        <div className="startup-kicker">
          <span /> ANDROID × UNITY
        </div>
        <h2>
          Sedang merakit
          <br />
          <em>dunia kecil.</em>
        </h2>

        <div className="startup-stage" aria-hidden="true">
          <span className="startup-coordinate">WORLD_01</span>
          <span className="startup-bit bit-one">+</span>
          <span className="startup-bit bit-two">+</span>
          <span className="startup-cloud cloud-one">&lt; / &gt;</span>
          <span className="startup-cloud cloud-two">{"{ }"}</span>
          <div className="startup-robot-shadow" />
          <div className="startup-robot">
            <svg viewBox="0 0 40 48" fill="none" shapeRendering="crispEdges">
              <path d="M18 0h4v4h-4zM19 4h2v5h-2z" fill="#2457ff" />
              <path d="M8 8h24v4h4v20h-4v8H8v-8H4V12h4z" fill="#2457ff" />
              <path d="M10 12h20v4h3v12H7V16h3z" fill="#142b77" />
              <g className="startup-eyes" fill="#f5fbff">
                <path d="M11 17h5v6h-5zM24 17h5v6h-5z" />
              </g>
              <path d="M18 25h4v2h-4zM16 33h8v3h-8z" fill="#abc5ff" />
              <path
                className="startup-arm-left"
                d="M0 24h4v10H0z"
                fill="#2457ff"
              />
              <path
                className="startup-arm-right"
                d="M36 22h4v10h-4z"
                fill="#2457ff"
              />
              <path
                className="startup-foot-left"
                d="M9 40h7v4h-3v4H6v-4h3z"
                fill="#163cae"
              />
              <path
                className="startup-foot-right"
                d="M24 40h7v4h3v4h-10z"
                fill="#163cae"
              />
              <path d="M9 9h3v3H9zM28 9h3v3h-3z" fill="#87aaff" />
            </svg>
          </div>
          <div className="startup-cube">
            <svg viewBox="0 0 32 36" fill="none">
              <path
                d="m16 1 15 8.5v17L16 35 1 26.5v-17Z"
                fill="#e3e9fa"
                stroke="#819bea"
                strokeWidth="1.5"
              />
              <path
                d="m1 9.5 15 9 15-9M16 18.5V35M8.5 5.3l15 8.7"
                stroke="#819bea"
                strokeWidth="1.5"
              />
              <path d="m1 9.5 15 9V35L1 26.5Z" fill="#d2dcf8" />
            </svg>
          </div>
          <div className="startup-ground" />
          <span className="startup-stage-caption">
            a little code. a little play.
          </span>
        </div>

        <div className="startup-meter-head">
          <span aria-live="polite">
            {ready ? "Duniamu siap. Let's go!" : "Menyiapkan pengalaman…"}
          </span>
          <span aria-hidden="true">
            {String(progress).padStart(2, "0")}
            <small>%</small>
          </span>
        </div>
        <div
          className="startup-meter"
          role="progressbar"
          aria-label="Persiapan portofolio"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <button className="startup-skip" onClick={onSkip}>
          Lewati intro <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="startup-bottomline">
        <span>BUILT FROM CURIOSITY.</span>
        <span>ONE LITTLE JUMP AT A TIME.</span>
      </div>
    </div>
  );
}
