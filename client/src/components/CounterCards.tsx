export default function CounterCard({ seconds = 0, progress = 1, onReset = () => {} }) {
  // render big digits as groups for styling
  const pad = (n: number): string => String(n).padStart(2, '0');
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // progress ring settings
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  return (
    <div className="card counter-card">
      <div className="card-inner">
        <div className="counter-left">
          <div className="counter-header">Session</div>

          <div className="big-digits" aria-hidden>
            <div className="digit-col">
              <span className="digit">{pad(minutes)}</span>
              <span className="label">min</span>
            </div>

            <div className="colon">:</div>

            <div className="digit-col">
              <span className="digit">{pad(secs)}</span>
              <span className="label">sec</span>
            </div>
          </div>

          <button className="btn primary" onClick={onReset} title="Reset activity timestamp">Reset activity</button>
        </div>

        <div className="counter-right">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-ring">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7b61ff" />
                <stop offset="100%" stopColor="#00d2ff" />
              </linearGradient>
            </defs>
            <g transform={`translate(${size/2},${size/2})`}>
              <circle r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
              <circle
                r={radius}
                stroke="url(#grad)"
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform={`rotate(-90)`}
                style={{ transition: 'stroke-dasharray 300ms linear' }}
              />
            </g>
          </svg>

          <div className="ring-label">
            <div className="small">Idle timeout</div>
            <div className="timeout">{Math.round((progress) * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
