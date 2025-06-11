// Global variables for calendar and schedule data
let currentDate = new Date();
let selectedDate = new Date();
let allSchedulesData = [];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get data passed from the view
    const dashboardDataElement = document.getElementById('dashboard-data');
    if (dashboardDataElement) {
        try {
            allSchedulesData = JSON.parse(dashboardDataElement.textContent || '[]');
        } catch (e) {
            console.error('Error parsing schedule data:', e);
            allSchedulesData = [];
        }
    }

    // Check if onboarding modal should be shown
    const onboardingElement = document.getElementById('onboarding-alert');
    if (onboardingElement) {
        const showOnboardingAlert = onboardingElement.textContent === 'true';
        console.log('ShowOnboardingAlert value:', showOnboardingAlert);
        
        if (showOnboardingAlert) {
            console.log('Attempting to show onboarding modal...');
            
            // Ensure the function is available
            if (typeof window.showOnboardingModal === 'function') {
                setTimeout(() => {
                    window.showOnboardingModal();
                }, 500);
            } else {
                console.error('showOnboardingModal function not found');
                console.log('Available functions:', Object.keys(window).filter(key => key.includes('onboard')));
            }
        } else {
            console.log('Onboarding modal not needed');
        }
    }

    // Initialize calendar with animations
    initializeCalendar();
    
    // Add animation classes to existing elements
    addInitialAnimations();
});

function addInitialAnimations() {
    // Add animation classes to filter buttons
    document.querySelectorAll('.day-filter').forEach(btn => {
        btn.classList.add('filter-button');
    });
    
    // Add animation classes to schedule items
    document.querySelectorAll('.schedule-content > div > div').forEach((item, index) => {
        if (item.classList.contains('space-y-4') || item.classList.contains('space-y-6')) {
            item.children.forEach((scheduleItem, itemIndex) => {
                scheduleItem.classList.add('schedule-item');
                scheduleItem.style.animationDelay = `${itemIndex * 0.1}s`;
            });
        }
    });
}

// Calendar functionality with animations
function initializeCalendar() {
    updateCalendarDisplay();
    setupCalendarEventListeners();
    setupScheduleFilters();
}

function updateCalendarDisplay() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    const monthElement = document.getElementById('currentMonth');
    if (!monthElement) return;
    
    monthElement.style.opacity = '0';
    
    setTimeout(() => {
        monthElement.textContent = monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear();
        monthElement.style.opacity = '1';
        monthElement.style.transition = 'opacity 0.3s ease-in-out';
    }, 150);
    
    generateCalendarDays();
}

function generateCalendarDays() {
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    // Fade out current calendar
    calendarDays.style.opacity = '0';
    calendarDays.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('button');
            dayElement.className = 'aspect-square text-sm p-1 rounded hover:bg-gray-200 relative calendar-day';
            dayElement.textContent = day.getDate();
            
            // Check if day has schedules
            const dayName = dayNames[day.getDay()];
            const hasSchedule = allSchedulesData.some(schedule => 
                schedule.dayOfWeek.toLowerCase() === dayName.toLowerCase()
            );
            
            // Style current month days
            if (day.getMonth() === currentDate.getMonth()) {
                dayElement.classList.add('text-gray-900');
                
                // Highlight today with special handling
                if (day.toDateString() === today.toDateString()) {
                    dayElement.classList.add('bg-blue-500', 'text-white', 'font-semibold', 'today-date');
                    dayElement.classList.remove('hover:bg-gray-200');
                    // Use white ring for today to be visible against blue background
                    dayElement.style.setProperty('--ring-color', 'white');
                }
            } else {
                dayElement.classList.add('text-gray-400');
            }
            
            // Add click handler with animation
            dayElement.addEventListener('click', (e) => selectDateWithAnimation(day, dayName, dayElement, e));
            
            // Add entrance animation
            dayElement.style.opacity = '0';
            dayElement.style.transform = 'scale(0.8)';
            
            calendarDays.appendChild(dayElement);
            
            // Animate day entrance
            setTimeout(() => {
                dayElement.style.transition = 'all 0.2s ease-out';
                dayElement.style.opacity = '1';
                dayElement.style.transform = 'scale(1)';
            }, i * 20);
        }
        
        // Fade in new calendar
        setTimeout(() => {
            calendarDays.style.transition = 'all 0.3s ease-in-out';
            calendarDays.style.opacity = '1';
            calendarDays.style.transform = 'scale(1)';
        }, 100);
    }, 200);
}

function selectDateWithAnimation(date, dayName, dayElement, event) {
    selectedDate = date;
    const today = new Date();
    
    // Check if selected date is today
    if (date.toDateString() === today.toDateString()) {
        // If clicking on today's date, treat it like clicking the "Today" button
        updateFilterButtonsWithAnimation('today');
        showScheduleContentWithAnimation('today');
        
        // Remove selection rings from all calendar days since we're showing "today" view
        document.querySelectorAll('#calendarDays button').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500', 'ring-white', 'selected');
            btn.style.removeProperty('--ring-color');
        });
        
        return; // Exit early, don't show selected-date view
    }
    
    // For other dates, proceed with normal selection logic
    document.querySelectorAll('#calendarDays button').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500', 'selected');
        btn.style.removeProperty('--ring-color');
    });
    
    // Add selection ring with blue color for non-today dates
    dayElement.classList.add('ring-2', 'selected', 'ring-blue-500');
    
    // Show schedules for selected date with animation
    showScheduleForDateWithAnimation(date, dayName);
    
    // Update filter buttons with animation
    updateFilterButtonsWithAnimation('selected-date');
}

function showScheduleForDateWithAnimation(date, dayName) {
    const schedules = allSchedulesData.filter(schedule => 
        schedule.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
    
    const titleElement = document.getElementById('selectedDateTitle');
    const subtitleElement = document.getElementById('selectedDateSubtitle');
    const contentElement = document.getElementById('selectedDateContent');
    
    if (!titleElement || !subtitleElement || !contentElement) return;
    
    // Animate title change
    titleElement.style.opacity = '0';
    subtitleElement.style.opacity = '0';
    
    setTimeout(() => {
        titleElement.textContent = dayName + ' Classes';
        subtitleElement.textContent = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        titleElement.style.transition = 'opacity 0.3s ease-in-out';
        subtitleElement.style.transition = 'opacity 0.3s ease-in-out';
        titleElement.style.opacity = '1';
        subtitleElement.style.opacity = '1';
    }, 150);
    
    // Animate content change
    contentElement.style.opacity = '0';
    contentElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        if (schedules.length > 0) {
            contentElement.innerHTML = `
                <div class="max-h-96 overflow-y-auto space-y-4 pr-2">
                    ${schedules.map((schedule, index) => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mb-3 schedule-item" style="animation-delay: ${index * 0.1}s;">
                            <div>
                                <p class="font-medium text-gray-900">${schedule.courseName}</p>
                                <p class="text-sm text-gray-500">${schedule.facultyName}</p>
                                ${schedule.room ? `<p class="text-sm text-gray-500">Room ${schedule.room}</p>` : ''}
                            </div>
                            <div class="text-right">
                                <p class="font-medium text-gray-700">
                                    ${schedule.startTime || 'TBA'}${schedule.endTime ? ' - ' + schedule.endTime : ''}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            contentElement.innerHTML = `
                <div class="text-center py-8 slide-up">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-calendar-times text-gray-400 text-2xl"></i>
                    </div>
                    <p class="text-gray-500 text-sm">No classes scheduled for this day</p>
                </div>
            `;
        }
        
        contentElement.style.transition = 'all 0.4s ease-out';
        contentElement.style.opacity = '1';
        contentElement.style.transform = 'translateY(0)';
    }, 200);
    
    // Show selected date schedule with animation
    showScheduleContentWithAnimation('selected-date');
}

function setupCalendarEventListeners() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.classList.add('calendar-nav');
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendarDisplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.classList.add('calendar-nav');
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendarDisplay();
        });
    }
}

function setupScheduleFilters() {
    const dayFilters = document.querySelectorAll('.day-filter');

    dayFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const selectedDay = this.getAttribute('data-day');
            updateFilterButtonsWithAnimation(selectedDay);
            showScheduleContentWithAnimation(selectedDay);
        });
    });
}

function updateFilterButtonsWithAnimation(selectedDay) {
    const dayFilters = document.querySelectorAll('.day-filter');
    
    dayFilters.forEach(f => {
        f.classList.remove('active', 'bg-blue-100', 'text-blue-700', 'border-blue-200');
        f.classList.add('text-gray-700', 'hover:bg-gray-100');
        f.style.transform = 'translateX(0)';
    });
    
    const activeFilter = document.querySelector(`[data-day="${selectedDay}"]`);
    if (activeFilter) {
        activeFilter.classList.remove('text-gray-700', 'hover:bg-gray-100');
        activeFilter.classList.add('active', 'bg-blue-100', 'text-blue-700', 'border-blue-200');
    }
}

function showScheduleContentWithAnimation(selectedDay) {
    // Fade out all content
    document.querySelectorAll('.schedule-content').forEach(content => {
        content.style.opacity = '0';
        content.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            content.classList.add('hidden');
        }, 200);
    });
    
    // Show target content with animation
    setTimeout(() => {
        let targetContent;
        if (selectedDay === 'today') {
            targetContent = document.getElementById('today-schedule');
        } else if (selectedDay === 'all') {
            targetContent = document.getElementById('all-schedule');
        } else if (selectedDay === 'selected-date') {
            targetContent = document.getElementById('selected-date-schedule');
        } else {
            targetContent = document.getElementById(selectedDay + '-schedule');
        }
        
        if (targetContent) {
            targetContent.classList.remove('hidden');
            
            // Add staggered animation to schedule items
            const scheduleItems = targetContent.querySelectorAll('.space-y-4 > div, .space-y-6 > div, .space-y-3 > div');
            scheduleItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(15px)';
                item.style.transition = 'all 0.3s ease-out';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
            
            setTimeout(() => {
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateX(0)';
            }, 50);
        }
    }, 250);
}
