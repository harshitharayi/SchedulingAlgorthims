

import React, { useState, useEffect } from "react";

// A simple round-robin scheduler with Gantt chart, stats, etc.
const processColors = { P1: "#FF5733", P2: "#33FF57", P3: "#3357FF", P4: "#FF33A8", P5: "#33FFF9" };

const RoundRobin = ({ processes, initialTimeQuantum = 2 }) => {
  const [pending, setPending] = useState([]);
  const [ready, setReady] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [gantt, setGantt] = useState([]);
  const [current, setCurrent] = useState(null);
  const [time, setTime] = useState(0);
  const [remaining, setRemaining] = useState({});
  const [quantum, setQuantum] = useState(initialTimeQuantum);
  const [running, setRunning] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [jumpTarget, setJumpTarget] = useState(null);
  const [animJump, setAnimJump] = useState(false);

  // Set up process copies and remaining-times map
  const start = () => {
    const rem = {};
    for (const p of processes) rem[p.name] = Number(p.burstTime);
    setRemaining(rem);

    setPending(processes.map(p => ({ ...p })));
    setReady([]);
    setCompleted([]);
    setGantt([]);
    setCurrent(null);
    setTime(0);
    setJumpTarget(null);
    setAnimJump(false);
    setRunning(true);
  };

  const delay = ms => new Promise(r => setTimeout(r, ms / animSpeed));

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const step = async () => {
      if (cancelled) return;

      const justArrived = pending.filter(p => +p.arrivalTime <= time);
      if (justArrived.length) {
        setReady(q => [...q, ...justArrived]);
        setPending(pnds => pnds.filter(p => +p.arrivalTime > time));
      }

      if (ready.length === 0 && pending.length > 0) {
        const nextArr = Math.min(...pending.map(p => +p.arrivalTime));
        setJumpTarget(nextArr);
        setAnimJump(true);
        for (let t = time + 1; t <= nextArr; t++) {
          setTime(t);
          await delay(100);
          if (cancelled) return;
        }
        setAnimJump(false);
        setGantt(g => [...g, { name: "Idle", start: time, end: nextArr, isIdle: true }]);
        return;
      }

      if (ready.length > 0) {
        const proc = ready[0];
        const remTime = remaining[proc.name];
        const slice = Math.min(quantum, remTime);
        const startTime = time;
        const endTime = startTime + slice;

        setCurrent(proc.name);
        setReady(r => r.slice(1));

        for (let t = time + 1; t <= endTime; t++) {
          setTime(t);
          await delay(100);
          if (cancelled) return;
        }

        setRemaining(r => ({ ...r, [proc.name]: remTime - slice }));
        setGantt(g => [...g, { name: proc.name, start: startTime, end: endTime }]);

        if (remTime - slice > 0) {
          setReady(r => [...r, proc]);
        } else {
          setCompleted(c => [...c, { ...proc, completionTime: endTime }]);
        }

        setCurrent(null);
        return;
      }
    };

    const timer = setTimeout(step, 0);
    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [time, pending, ready, remaining, running, animSpeed, quantum]);

  useEffect(() => {
    if (running && pending.length === 0 && ready.length === 0 && current === null) {
      setRunning(false);
    }
  }, [pending, ready, current, running]);

  const stats = (() => {
    const m = {};
    for (const e of gantt) {
      if (e.isIdle) continue;
      if (!m[e.name]) {
        const p = processes.find(x => x.name === e.name);
        m[e.name] = {
          arrival: +p.arrivalTime,
          burst: +p.burstTime,
          firstStart: e.start,
          completion: e.end
        };
      } else {
        m[e.name].completion = Math.max(m[e.name].completion, e.end);
      }
    }
    return Object.entries(m).map(([name, s]) => ({
      name, arrival: s.arrival, burst: s.burst,
      completion: s.completion,
      turnaround: s.completion - s.arrival,
      waiting: s.completion - s.arrival - s.burst,
      response: s.firstStart - s.arrival
    }));
  })();

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h2 className="text-2xl mb-4">Round Robin Scheduling</h2>

      <div className="mb-4">
        <label>Quantum:
          <input
            type="number"
            min="1"
            value={quantum}
            onChange={e => setQuantum(Math.max(1, Number(e.target.value)))}
            disabled={running}
            className="ml-2 px-2 w-16 text-black"
          />
        </label>
        <label className="ml-4">Speed:
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              disabled={running}
              onClick={() => setAnimSpeed(s)}
              className={`ml-2 px-2 py-1 ${animSpeed === s ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              {s}×
            </button>
          ))}
        </label>
      </div>

      <button
        onClick={start}
        disabled={running || processes.length === 0}
        className="px-4 py-2 mb-4 bg-blue-600 rounded disabled:opacity-50"
      >
        Start Simulation
      </button>

      <div className="mb-4">
        Time: <span className={`${animJump ? 'text-yellow-300 animate-pulse' : ''}`}>{time}</span>
        {animJump && <span className="ml-2">→ {jumpTarget}</span>}
      </div>

      {/* Gantt Chart & Stats omitted for brevity ... */}
    </div>
  );
};

export default RoundRobin;
