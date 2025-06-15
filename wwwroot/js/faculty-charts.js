document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty Charts loaded');
    
    // Initialize charts after page load
    setTimeout(() => {
        initializeWeeklyTrendChart();
        initializeMonthlyAnalysisChart();
    }, 500);
});

function initializeWeeklyTrendChart() {
    const canvas = document.getElementById('weeklyTrendChart');
    if (!canvas) {
        console.log('Weekly trend chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Mock data for weekly attendance trends
    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Present',
                data: [85, 92, 88, 94, 89, 75, 0],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Late',
                data: [8, 5, 7, 3, 6, 12, 0],
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                borderColor: 'rgb(251, 191, 36)',
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Absent',
                data: [7, 3, 5, 3, 5, 13, 0],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: weeklyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function initializeMonthlyAnalysisChart() {
    const canvas = document.getElementById('monthlyAnalysisChart');
    if (!canvas) {
        console.log('Monthly analysis chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Mock data for monthly analysis
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Attendance Rate',
                data: [82, 85, 88, 91, 87, 89, 92, 88, 85, 87, 84, 86],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: monthlyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100
                }
            }
        }
    });
}

// Export functions for external use
window.facultyCharts = {
    initializeWeeklyTrendChart,
    initializeMonthlyAnalysisChart
};
               