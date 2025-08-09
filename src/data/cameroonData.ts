export const populationData = {
  labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      label: 'Population (millions)',
      data: [25.2, 25.9, 26.5, 27.2, 27.9, 28.6],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

export const economicData = {
  labels: ['Agriculture', 'Industry', 'Services', 'Mining', 'Tourism'],
  datasets: [
    {
      label: 'GDP Contribution (%)',
      data: [23, 28, 35, 8, 6],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 2,
    },
  ],
};

export const educationData = {
  labels: ['Primary', 'Secondary', 'Higher Education', 'Vocational'],
  datasets: [
    {
      label: 'Enrollment Rate (%)',
      data: [95, 68, 15, 12],
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
    },
  ],
};

export const regionsData = {
  labels: ['Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Adamaoua', 'Est', 'Extrême-Nord', 'Nord', 'Sud'],
  datasets: [
    {
      label: 'Population (millions)',
      data: [4.2, 3.5, 2.1, 2.0, 1.8, 1.2, 0.9, 4.1, 2.3, 0.8],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
    },
  ],
};

export const healthData = {
  labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      label: 'Life Expectancy (years)',
      data: [58.5, 59.1, 58.8, 59.3, 59.8, 60.2],
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Infant Mortality (per 1000)',
      data: [52, 50, 48, 46, 44, 42],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
};

export const statsCards = [
  {
    title: 'Population',
    value: '28.6M',
    change: '+2.5%',
    trend: 'up',
    icon: 'users',
    color: 'blue',
  },
  {
    title: 'GDP Growth',
    value: '3.8%',
    change: '+0.3%',
    trend: 'up',
    icon: 'chart-bar',
    color: 'green',
  },
  {
    title: 'Literacy Rate',
    value: '77.1%',
    change: '+1.2%',
    trend: 'up',
    icon: 'academic-cap',
    color: 'purple',
  },
  {
    title: 'Life Expectancy',
    value: '60.2 years',
    change: '+0.4',
    trend: 'up',
    icon: 'heart',
    color: 'red',
  },
];