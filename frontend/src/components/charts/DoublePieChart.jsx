// src/components/charts/DoublePieChart.jsx

import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

class DoublePieChart extends PureComponent {
  // Esto es solo para mantener la estructura de tu ejemplo

  // (Opcional) Si quieres usar onMouseEnter, puedes definirlo aquí:
  // onPieEnter = () => {};

  render() {
    const {
      data1 = [],
      data2 = [],
      colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
      width = 800,
      height = 400,
    } = this.props;

    return (
      <PieChart width={width} height={height}>
        {/* Primer pastel */}
        <Pie
          data={data1}
          cx={120}
          cy={200}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          // onMouseEnter={this.onPieEnter} // si quieres
        >
          {data1.map((entry, index) => (
            <Cell
              key={`cell1-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>

      </PieChart>
    );
  }
}

export default DoublePieChart;
