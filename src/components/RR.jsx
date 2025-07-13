

import React, { useState, useEffect } from "react";

// Map each process to a distinct color
const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
};

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

  const delay = ms => new Promise(r => setTimeout(r, ms / animSpeed));

  const start = () => {
    const rem = {};
    const copy = processes.map(p => {
      const r = +p.burstTime;
      rem[p.name] = r;
      return { ...p, remaining: r };
    });
    setPending(copy);
    setRemaining(rem);
    setReady([]);
    setCompleted([]);
    setGantt([]);
    setCurrent(null);
    setTime(0);
    setJumpTarget(null);
    setAnimJump(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const step = async () => {
      if (cancelled) return;

      // Move arrived processes to ready queue
      const arrived = pending.filter(p => +p.arrivalTime <= time);
      if (arrived.length) {
        setReady(q => [...q, ...arrived]);
        setPending(pnds => pnds.filter(p => +p.arrivalTime > time));
      }

      // Idle jump when no ready process
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

      // Execute next ready process
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

  const computeStats = () => {
    const stats = {};
    gantt.filter(e => !e.isIdle).forEach(entry => {
      if (!stats[entry.name]) {
        const p = processes.find(p => p.name === entry.name);
        stats[entry.name] = {
          arrival: +p.arrivalTime,
          burst: +p.burstTime,
          firstStart: entry.start,
          completion: entry.end
        };
      } else {
        stats[entry.name].completion = Math.max(stats[entry.name].completion, entry.end);
      }
    });
    return Object.entries(stats).map(([name, s]) => ({
      name,
      ...s,
      turnaround: s.completion - s.arrival,
      waiting: s.completion - s.arrival - s.burst,
      response: s.firstStart - s.arrival
    }));
  };

  const statsArray = computeStats();

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h2 className="text-2xl mb-4">Round Robin Scheduling</h2>
      <button onClick={start} disabled={running}
        className="px-4 py-2 mb-4 bg-blue-600 rounded disabled:opacity-50">
        Start
      </button>

      <div className="flex gap-4 mb-4">
        <label>
          Quantum:
          <input type="number" value={quantum} onChange={e => setQuantum(+e.target.value)}
            disabled={running} className="ml-2 px-2 w-16 text-black" />
        </label>
        <label>Speed:</label>
        {[0.5, 1, 2].map(s => (
          <button key={s} disabled={running} onClick={() => setAnimSpeed(s)}
            className={`px-2 py-1 ${animSpeed === s ? 'bg-blue-500' : 'bg-gray-700'}`}>
            {s}×
          </button>
        ))}
      </div>

      <div className="mb-4">
        Time: <span className={`${animJump ? 'text-yellow-300 animate-pulse' : ''}`}>{time}</span>
        {animJump && <span className="ml-2">→ {jumpTarget}</span>}
      </div>

      <div className="mb-6">
        <h3 className="text-xl">Gantt Chart</h3>
        {gantt.map((e, i) => (
          <div key={i} className="inline-block mx-1 relative text-center">
            <div style={{
              background: e.isIdle ? "#555" : processColors[e.name] ?? '#888',
              color: "#fff", padding: "4px", minWidth: "40px"
            }}>
              {e.isIdle ? 'Idle' : e.name} ({e.end - e.start})
            </div>
            <div style={{ position: 'absolute', bottom: -18, left: 0 }}>
              {e.start}
            </div>
            {i === gantt.length - 1 && (
              <div style={{ position: 'absolute', bottom: -18, right: 0 }}>
                {e.end}
              </div>
            )}
          </div>
        ))}
      </div>

      {!running && statsArray.length > 0 && (
        <div>
          <h3 className="text-xl mb-2">Process Stats</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr>{['Proc','Arr','Brst','Comp','Turn','Wait','Resp'].map(h => (
                <th key={h} className="border p-1">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {statsArray.map(s => (
                <tr key={s.name} className="text-center">
                  <td>{s.name}</td><td>{s.arrival}</td><td>{s.burst}</td><td>{s.completion}</td>
                  <td>{s.turnaround}</td><td>{s.waiting}</td><td>{s.response}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td>Avg</td><td>-</td><td>-</td><td>-</td>
                <td>{(statsArray.reduce((a,c)=>a+c.turnaround,0)/statsArray.length).toFixed(2)}</td>
                <td>{(statsArray.reduce((a,c)=>a.waiting,0)/statsArray.length).toFixed(2)}</td>
                <td>{(statsArray.reduce((a,c)=>a.response,0)/statsArray.length).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoundRobin;
