document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty Dashboard loaded');
    
    // Check if we have real data
    const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
    console.log('Using real dashboard data:', hasRealData);
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize schedule filters
    initializeScheduleFilters();
    
    // Initialize real data features if available
    if (hasRealData) {
        initializeRealDataFeatures();
    }
    
    console.log('Faculty Dashboard initialization complete - animations delegated to layout');
});

// Real data features
function initializeRealDataFeatures() {
    const facultyDataElement = document.getElementById('faculty-dashboard-data');
    if (!facultyDataElement) {
        console.log('No faculty dashboard data element found');
        return;
    }
    
    try {
        const facultyData = JSON.parse(facultyDataElement.textContent);
        console.log('Real faculty data:', facultyData);
        
        // Update schedule counts in filters
        updateScheduleCounts(facultyData);
        
        // Initialize real-time updates
        initializeRealTimeUpdates(facultyData);
        
        // Update status indicators
        updateStatusIndicators(facultyData);
        
    } catch (e) {
        console.error('Error parsing faculty dashboard data:', e);
    }
}

function updateScheduleCounts(facultyData) {
    // Update today's count
    const todayFilter = document.querySelector('[data-day="today"] .float-right');
    if (todayFilter && facultyData.todaySchedule) {
        todayFilter.textContent = facultyData.todaySchedule.length;
    }
    
    // Update all days count
    const allFilter = document.querySelector('[data-day="all"] .float-right');
    if (allFilter && facultyData.allSchedules) {
        allFilter.textContent = facultyData.allSchedules.length;
    }
}

function initializeRealTimeUpdates(facultyData) {
    // Update class status every minute
    setInterval(() => {
        updateClassStatus(facultyData);
    }, 60000); // 1 minute
    
    // Initial update
    updateClassStatus(facultyData);
}

function updateClassStatus(facultyData) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    console.log('Updating class status at:', currentTime);
    
    // Update schedule items status based on current time
    document.querySelectorAll('.schedule-item').forEach(item => {
        const timeText = item.querySelector('.font-medium')?.textContent;
        if (timeText && timeText.includes(' - ')) {
            const [startTime, endTime] = timeText.split(' - ');
            const status = getClassStatus(currentTime, startTime.trim(), endTime.trim());
            updateScheduleItemStatus(item, status);
        }
    });
}

function getClassStatus(currentTime, startTime, endTime) {
    // Convert times to minutes for comparison
    const current = timeToMinutes(currentTime);
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    if (current >= start && current <= end) {
        return 'ongoing';
    } else if (current > end) {
        return 'completed';
    } else {
        return 'upcoming';
    }
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function updateScheduleItemStatus(item, status) {
    // Remove existing status classes
    item.classList.remove('bg-blue-50', 'border-blue-200', 'bg-gray-50', 'border-gray-200', 'bg-yellow-50', 'border-yellow-200');
    
    // Add new status classes
    switch (status) {
        case 'ongoing':
            item.classList.add('bg-blue-50', 'border-blue-200');
            break;
        case 'completed':
            item.classList.add('bg-gray-50', 'border-gray-200');
            break;
        case 'upcoming':
            item.classList.add('bg-yellow-50', 'border-yellow-200');
            break;
    }
    
    // Update status text
    const statusElement = item.querySelector('.text-xs.capitalize');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `text-xs text-gray-500 capitalize`;
    }
}

function updateStatusIndicators(facultyData) {
    // Update any status indicators based on real data
    const currentClassIndicator = document.querySelector('[data-current-class-status]');
    if (currentClassIndicator && facultyData.scheduleSummary?.currentClass) {
        currentClassIndicator.textContent = 'In Session';
        currentClassIndicator.className = 'text-green-600 font-medium';
    } else if (currentClassIndicator && facultyData.scheduleSummary?.nextClass) {
        currentClassIndicator.textContent = 'Next Class';
        currentClassIndicator.className = 'text-blue-600 font-medium';
    }
}

// Calendar functionality
function initializeCalendar() {
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarDaysElement = document.getElementById('calendarDays');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (!currentMonthElement || !calendarDaysElement) {
        console.log('Calendar elements not found');
        return;
    }
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    function renderCalendar() {
        // Clear previous calendar
        calendarDaysElement.innerHTML = '';
        
        // Set month/year header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'h-8 w-8';
            calendarDaysElement.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('button');
            dayElement.className = 'h-8 w-8 text-sm rounded-full hover:bg-gray-200 calendar-day transition-all duration-200';
            dayElement.textContent = day;
            
            // Check if this is today
            const today = new Date();
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('bg-indigo-600', 'text-white', 'today-date');
                dayElement.classList.remove('hover:bg-gray-200');
            }
            
            // Add click handler
            dayElement.addEventListener('click', function() {
                selectDate(currentYear, currentMonth, day);
            });
            
            calendarDaysElement.appendChild(dayElement);
        }
    }
    
    function selectDate(year, month, day) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
            if (!el.classList.contains('today-date')) {
                el.classList.remove('bg-indigo-600', 'text-white');
                el.classList.add('hover:bg-gray-200');
            }
        });
        
        // Add selection to clicked day
        event.target.classList.add('selected');
        if (!event.target.classList.contains('today-date')) {
            event.target.classList.add('bg-indigo-600', 'text-white');
            event.target.classList.remove('hover:bg-gray-200');
        }
        
        // Show selected date schedule
        showSelectedDateSchedule(year, month, day);
    }
    
    function showSelectedDateSchedule(year, month, day) {
        const selectedDate = new Date(year, month, day);
        const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
        const isToday = isDateToday(selectedDate);
        const formattedDate = selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        console.log(`Selected date: ${formattedDate}, Day: ${dayName}, Is Today: ${isToday}`);
        
        // Hide all schedule content
        document.querySelectorAll('.schedule-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Get the real faculty data to filter schedules
        const facultyDataElement = document.getElementById('faculty-dashboard-data');
        let facultyData = null;
        if (facultyDataElement) {
            try {
                facultyData = JSON.parse(facultyDataElement.textContent);
            } catch (e) {
                console.error('Error parsing faculty data:', e);
            }
        }
        
        // Create or update the selected date schedule view
        let selectedDateContent = document.getElementById('selected-date-schedule');
        if (!selectedDateContent) {
            // Create new content area for selected dates
            selectedDateContent = document.createElement('div');
            selectedDateContent.id = 'selected-date-schedule';
            selectedDateContent.className = 'schedule-content hidden';
            
            // Insert after the all-schedule div
            const allSchedule = document.getElementById('all-schedule');
            allSchedule.parentNode.insertBefore(selectedDateContent, allSchedule.nextSibling);
        }
        
        // Filter schedules for the selected day
        let daySchedules = [];
        
        if (isToday && facultyData?.todaySchedule) {
            // Use today's schedule if selecting today
            daySchedules = facultyData.todaySchedule;
        } else if (facultyData?.allSchedules) {
            // Filter all schedules for the selected day of week
            daySchedules = facultyData.allSchedules.filter(schedule => 
                schedule.dayOfWeek && schedule.dayOfWeek.toLowerCase() === dayName.toLowerCase()
            );
        }
        
        // Build the schedule content
        selectedDateContent.innerHTML = `
            <div class="mb-4">
                <h5 class="font-medium text-gray-900">Classes for ${formattedDate}</h5>
                <p class="text-sm text-gray-500">${isToday ? 'Today' : dayName} Schedule</p>
            </div>
            <div class="max-h-96 overflow-y-auto space-y-4 pr-2">
                ${daySchedules.length > 0 ? generateScheduleItems(daySchedules, facultyData) : generateNoScheduleMessage(formattedDate)}
            </div>
        `;
        
        // Show the selected date schedule
        selectedDateContent.classList.remove('hidden');
        
        // Update active filter (don't highlight any filter buttons for calendar selections)
        updateActiveFilter('calendar-selected');
        
        // Add animation to schedule items
        const scheduleItems = selectedDateContent.querySelectorAll('.schedule-item');
        scheduleItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    function generateScheduleItems(schedules, facultyData) {
        return schedules.map(schedule => {
            const statusColor = schedule.status === "ongoing" ? "blue" : 
                               schedule.status === "completed" ? "gray" : "yellow";
            
            // Find course info for student count
            let studentCount = 0;
            if (facultyData?.currentCourses) {
                const courseInfo = facultyData.currentCourses.find(c => 
                    c.assignedCourseId === schedule.assignedCourseId
                );
                studentCount = courseInfo?.enrolledStudents || 0;
            }
            
            return `
                <div class="flex items-center justify-between p-4 bg-${statusColor}-50 border-${statusColor}-200 border rounded-lg schedule-item">
                    <div>
                        <p class="font-medium text-gray-900">${schedule.courseName}</p>
                        <p class="text-sm text-gray-500">${schedule.sectionName} • ${studentCount} students</p>
                        <p class="text-sm text-gray-500">Room ${schedule.room || 'TBA'}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-${statusColor}-600">${schedule.startTime} - ${schedule.endTime}</p>
                        <p class="text-xs text-gray-500 capitalize">${schedule.status}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function generateNoScheduleMessage(formattedDate) {
        return `
            <div class="text-center py-8">
                <i class="fas fa-calendar-times text-gray-300 text-3xl mb-3"></i>
                <p class="text-gray-500 text-sm">No classes scheduled for ${formattedDate}</p>
                <p class="text-gray-400 text-xs mt-1">Select another date or view all schedules</p>
            </div>
        `;
    }
    
    function isDateToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    // Event listeners for navigation
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }
    
    // Initial render
    renderCalendar();
}

// Schedule filter functionality
function initializeScheduleFilters() {
    const dayFilters = document.querySelectorAll('.day-filter');
    
    dayFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            showScheduleForDay(day);
            updateActiveFilter(day);
        });
    });
}

// Enhanced schedule filter functionality for real data
function showScheduleForDay(day) {
    // Hide all schedule content including selected date content
    document.querySelectorAll('.schedule-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Clear calendar selections when using filter buttons
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
        if (!el.classList.contains('today-date')) {
            el.classList.remove('bg-indigo-600', 'text-white');
            el.classList.add('hover:bg-gray-200');
        }
    });
    
    // Show selected schedule
    let targetSchedule;
    if (day === 'today') {
        targetSchedule = document.getElementById('today-schedule');
    } else if (day === 'all') {
        targetSchedule = document.getElementById('all-schedule');
    }
    
    if (targetSchedule) {
        targetSchedule.classList.remove('hidden');
        
        // Add animation for schedule items
        const scheduleItems = targetSchedule.querySelectorAll('.schedule-item');
        scheduleItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

function updateActiveFilter(activeDay) {
    // Remove active class from all filters
    document.querySelectorAll('.day-filter').forEach(filter => {
        filter.classList.remove('active');
        filter.classList.remove('bg-indigo-100', 'text-indigo-700', 'border-indigo-200');
        filter.classList.add('text-gray-700', 'hover:bg-gray-100');
    });
    
    // Add active class to selected filter (but not for calendar selections)
    if (activeDay !== 'calendar-selected' && activeDay !== 'selected-date') {
        const activeFilter = document.querySelector(`[data-day="${activeDay}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
            activeFilter.classList.add('bg-indigo-100', 'text-indigo-700', 'border-indigo-200');
            activeFilter.classList.remove('text-gray-700', 'hover:bg-gray-100');
        }
    }
}

