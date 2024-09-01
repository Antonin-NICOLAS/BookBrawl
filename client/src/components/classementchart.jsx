// ClassementChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ClassementChart = ({ users }) => {
    const data = {
        labels: users.map(user => `${user.prenom}`),
        datasets: [
            {
                label: 'Mots lus',
                data: users.map(user => user.wordsRead),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Mots totaux (lectures futures comprises)',
                data: users.map(user => user.wordsRead + user.futureWordsRead),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        indexAxis: 'y', // Change l'axe des barres à horizontal
        scales: {
            x: {
                stacked: false, // Ne pas empiler les barres
            },
            y: {
                stacked: true, // empiler les barres
            },
        },
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Classement des utilisateurs par nombre de mots lus et totaux'
            }
        }
    };

    return <Bar data={data} options={options} />;
};

export default ClassementChart;