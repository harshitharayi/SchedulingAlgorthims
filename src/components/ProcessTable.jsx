import React from "react";

const ProcessTable = ({ processes }) => (
  <div role="region" aria-labelledby="process-table-caption" className="overflow-auto">
    <table className="w-full mb-10 border-collapse border border-gray-300 dark:border-gray-700 shadow-md dark:shadow-gray-800 transition-all" aria-label="List of processes and their burst times">
      <caption id="process-table-caption" className="sr-only">
        Process list with names and burst times
      </caption>
      <thead className="bg-black text-white">
        <tr>
          <th scope="col" className="p-2 border">Process</th>
          <th scope="col" className="p-2 border">Burst Time</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((p) => (
          <tr key={p.name} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <td scope="row" className="p-2 border">{p.name}</td>
            <td className="p-2 border text-right">{p.burstTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProcessTable;
