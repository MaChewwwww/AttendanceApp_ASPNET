document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty Charts loaded');
    
    // Check if we have real charts data
    const hasChartsData = document.getElementById('has-charts-data')?.textContent === 'true';
    const chartsDataElement = document.getElementById('charts-data');
    
    let chartsData = null;
    if (hasChartsData && chartsDataElement) {
        try {
            chartsData = JSON.parse(chartsDataElement.textContent);
            console.log('Real charts data loaded:', chartsData);
        } catch (e) {
            console.error('Error parsing charts data:', e);
        }
    }
    
    // Initialize charts after page load
    setTimeout(() => {
        initializeWeeklyTrendChart(chartsData?.WeeklyTrends);
        initializeMonthlyAnalysisChart(chartsData?.MonthlyData);
    }, 500);
});

function initializeWeeklyTrendChart(weeklyTrendsData) {
    const canvas = document.getElementById('weeklyTrendChart');
    if (!canvas) {
        console.log('Weekly trend chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!weeklyTrendsData || weeklyTrendsData.length === 0) {
        console.log('No weekly trends data available');
        showChartError(canvas, 'No weekly attendance data available');
        return;
    }
    
    try {
        const days = weeklyTrendsData.map(d => d.dayShort || d.day_short);
        const presentData = weeklyTrendsData.map(d => d.presentCount || d.present_count || 0);
        const lateData = weeklyTrendsData.map(d => d.lateCount || d.late_count || 0);
        const absentData = weeklyTrendsData.map(d => d.absentCount || d.absent_count || 0);
        
        const weeklyData = {
            labels: days,
            datasets: [
                {
                    label: 'Present',
                    data: presentData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                },
                {
                    label: 'Late',
                    data: lateData,
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                    borderColor: 'rgb(251, 191, 36)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                },
                {
                    label: 'Absent',
                    data: absentData,
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
    } catch (error) {
        console.error('Error creating weekly trend chart:', error);
        showChartError(canvas, 'Unable to load weekly attendance chart');
    }
}

function initializeMonthlyAnalysisChart(monthlyData) {
    const canvas = document.getElementById('monthlyAnalysisChart');
    if (!canvas) {
        console.log('Monthly analysis chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!monthlyData || monthlyData.length === 0) {
        console.log('No monthly data available');
        showChartError(canvas, 'No monthly attendance data available');
        return;
    }
    
    try {
        const months = monthlyData.map(d => d.monthShort || d.month_short);
        const attendanceRates = monthlyData.map(d => d.attendanceRate || d.attendance_rate || 0);
        
        const chartData = {
            labels: months,
            datasets: [
                {
                    label: 'Attendance Rate',
                    data: attendanceRates,
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
            data: chartData,
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
    } catch (error) {
        console.error('Error creating monthly analysis chart:', error);
        showChartError(canvas, 'Unable to load monthly attendance chart');
    }
}

function showChartError(canvas, message) {
    const container = canvas.parentElement;
    container.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="text-center">
                <i class="fas fa-chart-line text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-500 text-sm">${message}</p>
                <p class="text-gray-400 text-xs mt-1">Charts will appear when data is available</p>
            </div>
        </div>
    `;
}

// Export functions for external use
window.facultyCharts = {
    initializeWeeklyTrendChart,
    initializeMonthlyAnalysisChart
};
