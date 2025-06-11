// Global variables for charts
let weeklyTrendChart;
let monthlyBarChart;

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get attendance data
    const attendanceDetails = getAttendanceDetails();
    
    // Check if we have pre-loaded charts data
    const hasChartsData = document.getElementById('has-charts-data');
    const hasPreloadedData = hasChartsData && hasChartsData.textContent.trim() === 'true';
    
    console.log('Charts data detection:');
    console.log('- Has pre-loaded charts data:', hasPreloadedData);
    
    // Initialize all charts with a slight delay to ensure DOM is ready
    setTimeout(() => {
        if (hasPreloadedData) {
            // Use pre-loaded data
            loadChartsFromPreloadedData();
        } else {
            // Initialize with empty states and fetch from API
            initializeWeeklyTrendChart();
            initializeMonthlyBarChart();
            initializeCourseWiseStats();
            
            // Fetch real data from API and update charts
            fetchAttendanceChartsData();
        }
    }, 100);
});

function loadChartsFromPreloadedData() {
    try {
        const chartsDataElement = document.getElementById('charts-data');
        if (!chartsDataElement) {
            console.log('No charts data element found, falling back to API fetch');
            initializeWeeklyTrendChart();
            initializeMonthlyBarChart();
            initializeCourseWiseStats();
            fetchAttendanceChartsData();
            return;
        }
        
        const chartsData = JSON.parse(chartsDataElement.textContent);
        console.log('Pre-loaded charts data:', chartsData);
        
        // Initialize charts with real data
        if (chartsData.weeklyData && chartsData.weeklyData.length > 0) {
            updateWeeklyTrendChart(chartsData.weeklyData);
        } else {
            initializeWeeklyTrendChart();
        }
        
        // Fix monthly data property mapping
        if (chartsData.monthlyData && chartsData.monthlyData.length > 0) {
            console.log('Raw monthly data from server:', chartsData.monthlyData);
            
            // Map the property names to match what the chart expects
            const mappedMonthlyData = chartsData.monthlyData.map(item => {
                console.log('Processing monthly item:', item);
                return {
                    month: item.Month || item.month,  // Handle both cases
                    attendanceRate: item.AttendanceRate || item.attendanceRate  // Handle both cases
                };
            });
            console.log('Mapped monthly data for chart:', mappedMonthlyData);
            initializeMonthlyBarChart(mappedMonthlyData);
        } else {
            console.log('No monthly data available, showing empty state');
            initializeMonthlyBarChart();
        }
        
        if (chartsData.courseWiseData && chartsData.courseWiseData.length > 0) {
            initializeCourseWiseStats(chartsData.courseWiseData);
        } else {
            initializeCourseWiseStats();
        }
        
    } catch (error) {
        console.error('Error loading pre-loaded charts data:', error);
        // Fall back to API fetch
        initializeWeeklyTrendChart();
        initializeMonthlyBarChart();
        initializeCourseWiseStats();
        fetchAttendanceChartsData();
    }
}

function getAttendanceDetails() {
    // Check if we have real attendance data from the hidden element
    const hasDataElement = document.getElementById('has-attendance-data');
    const hasRealData = hasDataElement ? hasDataElement.textContent.trim() === 'true' : false;
    
    // Debug logging
    console.log('Attendance data detection:');
    console.log('- hasDataElement exists:', !!hasDataElement);
    console.log('- hasDataElement content:', hasDataElement?.textContent);
    console.log('- hasRealData:', hasRealData);
    
    // Debug ViewBag values
    const debugRate = document.getElementById('debug-attendance-rate');
    const debugDetails = document.getElementById('debug-attendance-details');
    console.log('- Debug rate:', debugRate?.textContent);
    console.log('- Debug details:', debugDetails?.textContent);
    
    const presentElement = document.getElementById('presentCount');
    const lateElement = document.getElementById('lateCount');
    const absentElement = document.getElementById('absentCount');
    
    console.log('- Present element content:', presentElement?.textContent);
    console.log('- Late element content:', lateElement?.textContent);
    console.log('- Absent element content:', absentElement?.textContent);
    
    return {
        present: hasRealData && presentElement ? parseInt(presentElement.textContent) : 0,
        late: hasRealData && lateElement ? parseInt(lateElement.textContent) : 0,
        absent: hasRealData && absentElement ? parseInt(absentElement.textContent) : 0,
        hasData: hasRealData,
        total: function() { return this.present + this.late + this.absent; }
    };
}

function initializeWeeklyTrendChart() {
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;

    // Show empty state initially
    showEmptyChartState(ctx.parentElement, 'Weekly attendance trends will be displayed here once you start attending classes regularly');
}

function getColorForCourse(index) {
    const colors = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#F97316', // Orange
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6B7280'  // Gray
    ];
    return colors[index % colors.length];
}

function initializeMonthlyBarChart(monthlyData = null) {
    const ctx = document.getElementById('monthlyBarChart');
    if (!ctx) return;

    console.log('Initializing monthly chart with data:', monthlyData);

    // Check if we have real data
    if (!monthlyData || monthlyData.length === 0) {
        console.log('No monthly data available, showing empty state');
        showEmptyChartState(ctx.parentElement, 'Monthly attendance patterns will show your progress over time throughout the semester');
        return;
    }

    console.log(`Processing ${monthlyData.length} monthly data points`);

    // Hide empty state if it exists and show canvas
    const container = ctx.parentElement;
    const emptyState = container.querySelector('.empty-chart-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    ctx.style.display = 'block';

    // For simple monthly data (no course breakdown), create a single line chart
    const months = monthlyData.map(item => item.month || item.Month);
    const monthlyRates = monthlyData.map(item => item.attendanceRate || item.AttendanceRate);

    console.log('Final chart data:');
    console.log('- Months:', months);
    console.log('- Rates:', monthlyRates);

    // Destroy existing chart if it exists
    if (monthlyBarChart) {
        monthlyBarChart.destroy();
    }

    // Create a beautiful line chart
    monthlyBarChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Overall Attendance Rate',
                data: monthlyRates,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 4,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointHoverBackgroundColor: '#1D4ED8',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(59, 130, 246, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#374151',
                        padding: 10
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...monthlyRates) - 15),
                    max: Math.min(100, Math.max(...monthlyRates) + 15),
                    grid: {
                        display: true,
                        color: 'rgba(156, 163, 175, 0.2)',
                        lineWidth: 1
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#374151',
                        padding: 15,
                        stepSize: 10
                    },
                    border: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3B82F6',
                    borderWidth: 2,
                    cornerRadius: 12,
                    padding: 16,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '500'
                    },
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const dataPoint = monthlyData[context.dataIndex];
                            return [
                                `Attendance Rate: ${context.raw}%`,
                                `Classes Attended: ${dataPoint.attendedClasses || dataPoint.AttendedClasses || 'N/A'}`,
                                `Total Classes: ${dataPoint.totalClasses || dataPoint.TotalClasses || 'N/A'}`
                            ];
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                }
            }
        }
    });

    console.log('Monthly chart initialized successfully');
}

function initializeCourseWiseStats(courseData = null) {
    const container = document.getElementById('courseWiseStats');
    if (!container) return;

    // Check if we have real data
    if (!courseData || courseData.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-200">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-lg"></i>
                </div>
                <h5 class="text-gray-700 font-medium text-sm mb-2">No Performance Data</h5>
                <p class="text-gray-500 text-xs mb-3">Course performance will appear here</p>
                <div class="inline-flex items-center text-xs text-gray-400">
                    <i class="fas fa-chart-bar mr-2"></i>
                    Start attending classes to see progress
                </div>
            </div>
        `;
        return;
    }

    const courses = courseData.map(course => ({
        name: course.courseName,
        code: course.courseCode,
        rate: course.attendanceRate,
        present: course.attendedClasses,
        total: course.totalClasses
    }));

    // Clear loading content
    container.innerHTML = '';

    courses.forEach((course, index) => {
        const rateColor = course.rate >= 90 ? 'text-green-600' : 
                         course.rate >= 80 ? 'text-yellow-600' : 'text-red-600';
        
        const progressColor = course.rate >= 90 ? 'bg-green-500' : 
                             course.rate >= 80 ? 'bg-yellow-500' : 'bg-red-500';

        const courseElement = document.createElement('div');
        courseElement.className = 'course-stat-item opacity-0 transform translate-y-4';
        courseElement.style.animationDelay = `${index * 0.1}s`;
        
        courseElement.innerHTML = `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div class="flex-1">
                    <div class="font-medium text-gray-900 text-sm">${course.name}</div>
                    <div class="text-xs text-gray-500">${course.code}</div>
                    <div class="mt-1">
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="${progressColor} h-1.5 rounded-full transition-all duration-500" 
                                 style="width: ${course.rate}%"></div>
                        </div>
                    </div>
                </div>
                <div class="text-right ml-3">
                    <div class="text-sm font-medium ${rateColor}">${course.rate}%</div>
                    <div class="text-xs text-gray-500">${course.present}/${course.total}</div>
                </div>
            </div>
        `;

        container.appendChild(courseElement);

        // Animate course item
        setTimeout(() => {
            courseElement.classList.remove('opacity-0', 'transform', 'translate-y-4');
            courseElement.classList.add('opacity-100');
        }, index * 100);
    });
}

function showEmptyChartState(container, message) {
    // Remove canvas if it exists
    const canvas = container.querySelector('canvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Create or update empty state
    let emptyState = container.querySelector('.empty-chart-state');
    if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'empty-chart-state text-center py-8 h-64 flex flex-col items-center justify-center';
        container.appendChild(emptyState);
    }
    
    emptyState.innerHTML = `
        <div class="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
            <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
        </div>
        <h4 class="text-gray-700 font-medium mb-2">No Data Available</h4>
        <p class="text-gray-500 text-sm max-w-xs">${message}</p>
        <div class="mt-4">
            <div class="inline-flex items-center text-xs text-gray-400">
                <i class="fas fa-info-circle mr-2"></i>
                Data will appear after attending classes
            </div>
        </div>
    `;
}

function updateWeeklyTrendChart(weeklyData) {
    if (!weeklyData || weeklyData.length === 0) return;
    
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;
    
    // Hide empty state and show canvas
    const container = ctx.parentElement;
    const emptyState = container.querySelector('.empty-chart-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    ctx.style.display = 'block';
    
    const labels = weeklyData.map(item => item.date);
    const presentData = weeklyData.map(item => item.present);
    const lateData = weeklyData.map(item => item.late);
    const absentData = weeklyData.map(item => item.absent);
    
    // Create chart if it doesn't exist
    if (!weeklyTrendChart) {
        weeklyTrendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Present',
                        data: presentData,
                        backgroundColor: '#10B981',
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Late',
                        data: lateData,
                        backgroundColor: '#F59E0B',
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Absent',
                        data: absentData,
                        backgroundColor: '#EF4444',
                        borderRadius: 4,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: '#F3F4F6'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } else {
        // Update existing chart
        weeklyTrendChart.data.labels = labels;
        weeklyTrendChart.data.datasets[0].data = presentData;
        weeklyTrendChart.data.datasets[1].data = lateData;
        weeklyTrendChart.data.datasets[2].data = absentData;
        weeklyTrendChart.update('none');
    }
}

// Utility function to update charts when new data is available
function updateChartsWithNewData(attendanceData) {
    if (attendanceDonutChart && attendanceData) {
        // Show center text overlay and stats grid when updating with real data
        const ctx = document.getElementById('attendanceDonutChart');
        if (ctx) {
            const centerTextOverlay = ctx.parentElement.querySelector('.absolute');
            if (centerTextOverlay) {
                centerTextOverlay.style.display = 'flex';
            }
            
            // Show the stats grid
            const statsGrid = ctx.parentElement.parentElement.querySelector('.grid.grid-cols-3');
            if (statsGrid) {
                statsGrid.style.display = 'grid';
            }
            
            // Hide empty state if it exists
            const emptyState = ctx.parentElement.querySelector('.empty-chart-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Show canvas
            ctx.style.display = 'block';
        }
        
        attendanceDonutChart.data.datasets[0].data = [
            attendanceData.present,
            attendanceData.late,
            attendanceData.absent
        ];
        attendanceDonutChart.update('none');
        
        // Update center text
        const rate = attendanceData.total() > 0 ? 
                    ((attendanceData.present + attendanceData.late) / attendanceData.total() * 100).toFixed(0) : 0;
        const centerElement = document.getElementById('donutCenterRate');
        if (centerElement) {
            centerElement.textContent = rate + '%';
        }
    }
}

// Function to fetch real attendance data from API (fallback)
async function fetchAttendanceChartsData() {
    try {
        console.log('Fetching attendance charts data from API...');
        
        const response = await fetch('/Student/GetAttendanceChartsData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('Charts data received successfully from API:', data);
            
            // Update charts with real data
            if (data.monthlyData && data.monthlyData.length > 0) {
                initializeMonthlyBarChart(data.monthlyData);
            }
            
            if (data.courseWiseData && data.courseWiseData.length > 0) {
                initializeCourseWiseStats(data.courseWiseData);
            }
            
            if (data.overallStats) {
                updateChartsWithNewData({
                    present: data.overallStats.presentClasses,
                    late: data.overallStats.lateClasses,
                    absent: data.overallStats.absentClasses,
                    total: function() { return this.present + this.late + this.absent; }
                });
            }
            
            if (data.weeklyData && data.weeklyData.length > 0) {
                updateWeeklyTrendChart(data.weeklyData);
            }
        } else {
            console.warn('Failed to fetch charts data from API:', data.message);
            // Charts will continue to use empty states
        }
    } catch (error) {
        console.error('Error fetching attendance charts data from API:', error);
        // Charts will continue to use empty states
    }
}

// Responsive chart handling - debounced to prevent excessive calls
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (weeklyTrendChart) weeklyTrendChart.resize();
        if (monthlyBarChart) monthlyBarChart.resize();
    }, 250);
});

// Destroy charts when page unloads to prevent memory leaks
window.addEventListener('beforeunload', function() {
    if (weeklyTrendChart) weeklyTrendChart.destroy();
    if (monthlyBarChart) monthlyBarChart.destroy();
});
