document.addEventListener("DOMContentLoaded", () => {

    const riskCanvas = document.getElementById("riskChart");
    const pieCanvas = document.getElementById("pieChart");

    if (!riskCanvas || !pieCanvas) return;

    // Values passed from EJS
    const {
        studentNames,
        riskScores,
        threatCounts
    } = window.dashboardData;

    // ===========================
    // Risk Bar Chart
    // ===========================

    new Chart(riskCanvas, {

        type: "bar",

        data: {

            labels: studentNames,

            datasets: [

                {

                    label: "Risk Score",

                    data: riskScores,

                    backgroundColor: "#2563EB",

                    borderRadius: 8

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100

                }

            }

        }

    });

    // ===========================
    // Threat Pie Chart
    // ===========================

    new Chart(pieCanvas, {

        type: "pie",

        data: {

            labels: [

                "LOW",

                "MEDIUM",

                "HIGH"

            ],

            datasets: [

                {

                    data: [

                        threatCounts.LOW,

                        threatCounts.MEDIUM,

                        threatCounts.HIGH

                    ],

                    backgroundColor: [

                        "#22C55E",

                        "#F59E0B",

                        "#EF4444"

                    ]

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

});