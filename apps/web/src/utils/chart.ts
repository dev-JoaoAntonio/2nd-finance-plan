import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

/** Tooltip escuro compartilhado por todos os gráficos. */
export const tooltipTheme = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  titleColor: '#ffffff',
  bodyColor: '#ffffff',
  cornerRadius: 10,
  padding: 12,
  displayColors: false,
  titleFont: { family: 'Poppins', size: 13, weight: 700 as const },
  bodyFont: { family: 'Poppins', size: 12, weight: 500 as const },
};

export const axisTheme = {
  x: {
    grid: { display: false },
    ticks: { color: '#64748b', font: { family: 'Poppins', size: 11 } },
  },
  y: {
    grid: { color: '#e5e7eb' },
    ticks: {
      color: '#64748b',
      font: { family: 'Poppins', size: 11 },
      callback: (v: number | string) =>
        'R$ ' + Number(v).toLocaleString('pt-BR'),
    },
  },
};
