import React, { useState } from 'react';

const DailyReport = () => {
  const [date, setDate] = useState('');
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      const response = await fetch(`http://localhost:5002/api/report/daily?date=${date}`);
      const data = await response.json();
      setReport(data); // data contendrá { total_money, total_pieces }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reporte Diario</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchReport} className="bg-green-500 text-white p-2 rounded">
          Consultar
        </button>
      </div>
      {report && (
        <div className="bg-gray-800 p-4 rounded">
          <p><strong>Total de Dinero:</strong> {report.total_money}</p>
          <p><strong>Total de Piezas:</strong> {report.total_pieces}</p>
        </div>
      )}
    </div>
  );
};

export default DailyReport;
