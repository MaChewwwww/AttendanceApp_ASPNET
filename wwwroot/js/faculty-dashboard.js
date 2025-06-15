document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty Dashboard loaded');
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize schedule filters
    initializeScheduleFilters();
    
    // Initialize dashboard animations
    initializeDashboardAnimations();
});

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
        
        // Hide all schedule content
        document.querySelectorAll('.schedule-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        if (isToday) {
            // Show today's schedule
            document.getElementById('today-schedule').classList.remove('hidden');
        } else {
            // Show all schedule for now (you can customize this later)
            document.getElementById('all-schedule').classList.remove('hidden');
        }
        
        // Update active filter
        updateActiveFilter('selected-date');
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

function showScheduleForDay(day) {
    // Hide all schedule content
    document.querySelectorAll('.schedule-content').forEach(content => {
        content.classList.add('hidden');
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
    }
}

function updateActiveFilter(activeDay) {
    // Remove active class from all filters
    document.querySelectorAll('.day-filter').forEach(filter => {
        filter.classList.remove('active');
        filter.classList.remove('bg-indigo-100', 'text-indigo-700', 'border-indigo-200');
        filter.classList.add('text-gray-700', 'hover:bg-gray-100');
    });
    
    // Add active class to selected filter
    let activeFilter;
    if (activeDay === 'selected-date') {
        // Don't update filter buttons for calendar selections
        return;
    } else {
        activeFilter = document.querySelector(`[data-day="${activeDay}"]`);
    }
    
    if (activeFilter) {
        activeFilter.classList.add('active');
        activeFilter.classList.add('bg-indigo-100', 'text-indigo-700', 'border-indigo-200');
        activeFilter.classList.remove('text-gray-700', 'hover:bg-gray-100');
    }
}

// Dashboard animations
function initializeDashboardAnimations() {
    // Animate cards on load
    const cards = document.querySelectorAll('.dashboard-card-entrance');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate');
    });
}

