// Attendance Modal Management
let currentAttendanceData = null;
let attendanceRecordsData = [];
let filteredAttendanceRecords = [];
let isCurrentCourse = false; // Flag to determine if the course is current (editable) or previous (read-only)

function openAttendanceModal(courseData, isCurrent = true) {
    console.log('Opening attendance modal with data:', courseData);
    console.log('Is current course:', isCurrent);
    
    // Store current course data and mode
    currentAttendanceData = courseData;
    isCurrentCourse = isCurrent;
    
    // Open modal using ModalManager
    ModalManager.openModal('attendanceModal');
    
    // Reset states
    showAttendanceLoading();
    
    // Populate day filter options
    populateDayFilter();
    
    // Load attendance data from API
    loadAttendanceFromAPI(courseData.AssignedCourseId);
}

function closeAttendanceModal() {
    console.log('Closing attendance modal');
    ModalManager.closeModal('attendanceModal');
    currentAttendanceData = null;
    attendanceRecordsData = [];
    filteredAttendanceRecords = [];
    isCurrentCourse = false;
}

function showAttendanceLoading() {
    document.getElementById('attendanceLoadingState').classList.remove('hidden');
    document.getElementById('attendanceErrorState').classList.add('hidden');
    document.getElementById('attendanceContentState').classList.add('hidden');
}

function showAttendanceError(message) {
    document.getElementById('attendanceLoadingState').classList.add('hidden');
    document.getElementById('attendanceContentState').classList.add('hidden');
    document.getElementById('attendanceErrorState').classList.remove('hidden');
    document.getElementById('attendanceErrorMessage').textContent = message;
}

function showAttendanceContent() {
    document.getElementById('attendanceLoadingState').classList.add('hidden');
    document.getElementById('attendanceErrorState').classList.add('hidden');
    document.getElementById('attendanceContentState').classList.remove('hidden');
}

async function loadAttendanceFromAPI(assignedCourseId) {
    try {
        console.log(`Loading attendance for assigned course ID: ${assignedCourseId}`);
        
        // Make API call to get attendance records
        const response = await fetch(`/Faculty/GetCourseAttendance?assignedCourseId=${assignedCourseId}`, {
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
        console.log('Attendance API response:', data);

        if (!data.success) {
            showAttendanceError(data.message || 'Failed to load attendance records');
            return;
        }

        // Update modal header with course info
        updateAttendanceHeader(data);
        
        // Process attendance data
        processAttendanceData(data);
        
        // Show content
        showAttendanceContent();
        
    } catch (error) {
        console.error('Error loading attendance from API:', error);
        showAttendanceError('Failed to load attendance records. Please try again later.');
    }
}

function updateAttendanceHeader(data) {
    const titleElement = document.getElementById('modalAttendanceTitle');
    const subHeaderElement = document.getElementById('modalAttendanceSubHeader');
    const descriptionElement = document.getElementById('modalAttendanceDescription');
    
    if (titleElement && subHeaderElement && descriptionElement && data.course_info) {
        const courseInfo = data.course_info;
        titleElement.textContent = `${courseInfo.course_code} - Attendance Records`;
        
        // Build sub header with available info
        let subHeaderParts = [];
        if (data.section_info?.section_name) subHeaderParts.push(data.section_info.section_name);
        if (courseInfo.room) subHeaderParts.push(courseInfo.room);
        if (courseInfo.academic_year) subHeaderParts.push(courseInfo.academic_year);
        if (courseInfo.semester) subHeaderParts.push(courseInfo.semester);
        subHeaderElement.textContent = subHeaderParts.join(' • ') || 'Attendance Information';
        
        descriptionElement.textContent = `${isCurrentCourse ? 'Current Course' : 'Previous Course'} - ${courseInfo.course_name}`;
    }
}

function processAttendanceData(data) {
    console.log('processAttendanceData - Full API response:', data);
    
    // Process attendance records
    attendanceRecordsData = data.attendance_records || [];
    
    console.log('Final processed attendance data:', attendanceRecordsData);

    // Set filtered data
    filteredAttendanceRecords = [...attendanceRecordsData];
    
    // Update summary cards
    updateAttendanceSummaryCards();
    
    // Render attendance table
    renderAttendanceRecordsTable();
    
    // Setup event listeners
    setupAttendanceEventListeners();
}

function updateAttendanceSummaryCards() {
    const totalSessions = attendanceRecordsData.length;
    const presentCount = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'present').length;
    const lateCount = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'late').length;
    const absentCount = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'absent').length;
    const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;
    
    // Get unique students count
    const uniqueStudents = new Set(attendanceRecordsData.map(r => r.student_id)).size;
    
    console.log('updateAttendanceSummaryCards - Attendance counts:');
    console.log(`  Total Sessions: ${totalSessions}`);
    console.log(`  Present: ${presentCount}`);
    console.log(`  Late: ${lateCount}`);
    console.log(`  Absent: ${absentCount}`);
    console.log(`  Attendance Rate: ${attendanceRate}%`);
    console.log(`  Unique Students: ${uniqueStudents}`);
    
    document.getElementById('attendanceTotalSessions').textContent = totalSessions;
    document.getElementById('attendancePresentCount').textContent = presentCount;
    document.getElementById('attendanceLateCount').textContent = lateCount;
    document.getElementById('attendanceAbsentCount').textContent = absentCount;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    document.getElementById('attendanceTotalStudents').textContent = uniqueStudents;
}

function renderAttendanceRecordsTable() {
    const tableBody = document.getElementById('attendanceRecordsTableBody');
    const table = document.getElementById('attendanceRecordsTable');
    const emptyState = document.getElementById('emptyAttendanceState');
    const recordsCount = document.getElementById('attendanceRecordsCount');
    
    console.log('renderAttendanceRecordsTable - Rendering records:', filteredAttendanceRecords);
    
    if (filteredAttendanceRecords.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        recordsCount.textContent = '0 records displayed';
        return;
    }
    
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
    recordsCount.textContent = `${filteredAttendanceRecords.length} records displayed`;
    
    tableBody.innerHTML = filteredAttendanceRecords.map(record => {
        const date = new Date(record.attendance_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
        
        const time = record.attendance_time ? new Date(`1970-01-01T${record.attendance_time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) : 'N/A';
        
        const statusBadge = getAttendanceStatusBadge(record.status);
        const statusDropdown = getAttendanceStatusDropdown(record);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-green-600 font-medium text-sm">${getStudentInitials(record.student_name)}</span>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${record.student_name}</div>
                            <div class="text-sm text-gray-500">${record.student_number}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${date}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${time}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                    ${isCurrentCourse ? statusDropdown : statusBadge}
                </td>
            </tr>
        `;
    }).join('');
}

function getAttendanceStatusBadge(status) {
    const badges = {
        'present': '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Present</span>',
        'late': '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Late</span>',
        'absent': '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Absent</span>',
    };
    return badges[status.toLowerCase()] || '<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Unknown</span>';
}

function getAttendanceStatusDropdown(record) {
    const currentStatus = record.status.toLowerCase();
    const statusClasses = getAttendanceStatusClasses(currentStatus);
    
    return `
        <select onchange="updateAttendanceStatus(${record.attendance_id}, this.value)" 
                data-attendance-id="${record.attendance_id}"
                data-current-status="${currentStatus}"
                class="text-xs font-semibold rounded-full border-0 px-3 py-1.5 focus:ring-2 focus:ring-green-500 transition-all duration-150 ${statusClasses}">
            <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>Present</option>
            <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>Late</option>
            <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>Absent</option>
        </select>
    `;
}

function getAttendanceStatusClasses(status) {
    switch(status) {
        case 'present':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'late':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'absent':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function getStudentInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function updateAttendanceStatus(attendanceId, newStatus) {
    // Find the dropdown that triggered this
    const dropdown = document.querySelector(`select[data-attendance-id="${attendanceId}"]`);
    const currentStatus = dropdown ? dropdown.getAttribute('data-current-status') : null;
    
    // If status hasn't actually changed, do nothing
    if (currentStatus === newStatus) {
        return;
    }
    
    const record = attendanceRecordsData.find(r => r.attendance_id === attendanceId);
    if (!record) {
        console.error('Attendance record not found');
        // Reset dropdown to original value
        if (dropdown) {
            dropdown.value = currentStatus || 'present';
        }
        return;
    }

    console.log(`Updating attendance status for ${record.student_name} from ${currentStatus} to ${newStatus}`);
    
    // Show confirmation dialog
    showAttendanceUpdateConfirmation(record, newStatus);
}

function showAttendanceUpdateConfirmation(record, newStatus) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 attendance-update-modal';
    modal.style.zIndex = '10003'; // Higher than course details modal
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-95 opacity-0" id="attendanceConfirmationContent">
            <div class="text-center mb-6">
                <div class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-calendar-check text-green-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Update Attendance</h3>
                <p class="text-gray-600 text-sm">
                    Update <strong>${record.student_name}</strong>'s attendance to <strong>${newStatus}</strong>?
                </p>
                <div class="mt-3 text-sm text-gray-500">
                    Date: ${new Date(record.attendance_date).toLocaleDateString()}
                </div>
            </div>
            <div class="flex justify-center space-x-3">
                <button onclick="cancelAttendanceUpdate()" 
                        class="bg-gray-600 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors font-medium">
                    Cancel
                </button>
                <button onclick="confirmAttendanceUpdate(${record.attendance_id}, '${newStatus}')" 
                        id="confirmAttendanceBtn"
                        class="bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700 transition-colors font-medium">
                    Update Attendance
                </button>
            </div>
        </div>
    `;

    // Add to document
    document.body.appendChild(modal);
    
    // Store reference for cleanup
    window.attendanceUpdateModal = modal;

    // Show with animation
    setTimeout(() => {
        const content = modal.querySelector('#attendanceConfirmationContent');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 50);

    // Handle backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cancelAttendanceUpdate();
        }
    });
}

function cancelAttendanceUpdate() {
    const modal = window.attendanceUpdateModal;
    if (modal) {
        const content = modal.querySelector('#attendanceConfirmationContent');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            document.body.removeChild(modal);
            window.attendanceUpdateModal = null;
        }, 300);
    }
}

async function confirmAttendanceUpdate(attendanceId, newStatus) {
    const confirmBtn = document.getElementById('confirmAttendanceBtn');
    
    // Disable button and show loading
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';

    try {
        // TODO: Replace with actual API call when backend is ready
        console.log(`Would update attendance ${attendanceId} to ${newStatus}`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Close confirmation modal
        cancelAttendanceUpdate();
        
        // Show success notification
        showAttendanceUpdateNotification(attendanceId, newStatus);
        
        // Update local data and refresh table
        const record = attendanceRecordsData.find(r => r.attendance_id === attendanceId);
        if (record) {
            record.status = newStatus;
            updateAttendanceSummaryCards();
            renderAttendanceRecordsTable();
        }
        
    } catch (error) {
        console.error('Error updating attendance status:', error);
        showAttendanceUpdateError('Failed to update attendance status. Please try again.');
    } finally {
        // Re-enable button
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Update Attendance';
        }
    }
}

function showAttendanceUpdateNotification(attendanceId, newStatus) {
    const record = attendanceRecordsData.find(r => r.attendance_id === attendanceId);
    if (record) {
        // Find the notification area
        const notificationArea = document.getElementById('attendanceNotificationArea');
        if (!notificationArea) return;
        
        // Remove any existing notification
        notificationArea.innerHTML = '';
        
        // Create a notification inside the modal
        const notification = document.createElement('div');
        notification.className = 'bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 opacity-100 text-sm min-w-[250px]';
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2 text-green-600"></i>
                    <span><strong>${record.student_name}</strong> marked as <strong>${newStatus}</strong></span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-green-500 hover:text-green-700 transition-colors">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `;
        
        // Add notification to the notification area
        notificationArea.appendChild(notification);
        
        // Auto-remove notification after 4 seconds
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    if (notification && notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
}

function showAttendanceUpdateError(message) {
    const notificationArea = document.getElementById('attendanceNotificationArea');
    if (!notificationArea) return;
    
    // Remove any existing notification
    notificationArea.innerHTML = '';
    
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 opacity-100 text-sm min-w-[250px]';
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle mr-2 text-red-600"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-red-500 hover:text-red-700 transition-colors">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    `;
    
    notificationArea.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            setTimeout(() => {
                if (notification && notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function populateDayFilter() {
    const dayFilter = document.getElementById('attendanceDayFilter');
    if (!dayFilter) return;
    
    // Clear existing options except "All Days"
    dayFilter.innerHTML = '<option value="">All Days</option>';
    
    // Add days 1-31
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        dayFilter.appendChild(option);
    }
}

function setupAttendanceEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('attendanceStudentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyAttendanceFilters();
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('attendanceSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyAttendanceFilters();
        });
    }
    
    // Date filters
    const yearFilter = document.getElementById('attendanceAcademicYearFilter');
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            applyAttendanceFilters();
        });
    }
    
    if (monthFilter) {
        monthFilter.addEventListener('change', function() {
            applyAttendanceFilters();
        });
    }
    
    if (dayFilter) {
        dayFilter.addEventListener('change', function() {
            applyAttendanceFilters();
        });
    }
}

function applyAttendanceFilters() {
    const searchInput = document.getElementById('attendanceStudentSearchInput');
    const sortSelect = document.getElementById('attendanceSortSelect');
    const yearFilter = document.getElementById('attendanceAcademicYearFilter');
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
    if (!searchInput || !sortSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const selectedYear = yearFilter ? yearFilter.value : '';
    const selectedMonth = monthFilter ? monthFilter.value : '';
    const selectedDay = dayFilter ? dayFilter.value : '';
    
    // Apply search filter
    filteredAttendanceRecords = attendanceRecordsData.filter(record => {
        const matchesSearch = record.student_name.toLowerCase().includes(searchTerm) ||
                             record.student_number.toLowerCase().includes(searchTerm);
        
        const recordDate = new Date(record.attendance_date);
        const matchesYear = !selectedYear || record.academic_year === selectedYear;
        const matchesMonth = !selectedMonth || (recordDate.getMonth() + 1) == selectedMonth;
        const matchesDay = !selectedDay || recordDate.getDate() == selectedDay;
        
        return matchesSearch && matchesYear && matchesMonth && matchesDay;
    });
    
    // Apply sorting
    filteredAttendanceRecords.sort((a, b) => {
        switch(sortBy) {
            case 'name-asc': 
                return a.student_name.localeCompare(b.student_name);
            case 'name-desc': 
                return b.student_name.localeCompare(a.student_name);
            case 'date-desc': 
                return new Date(b.attendance_date) - new Date(a.attendance_date);
            case 'date-asc': 
                return new Date(a.attendance_date) - new Date(b.attendance_date);
            case 'time-desc': 
                return (b.attendance_time || '00:00').localeCompare(a.attendance_time || '00:00');
            case 'time-asc': 
                return (a.attendance_time || '00:00').localeCompare(b.attendance_time || '00:00');
            case 'status-asc': 
                return a.status.localeCompare(b.status);
            default: 
                return 0;
        }
    });
    
    renderAttendanceRecordsTable();
}

function attendanceQuickFilter(filterType) {
    // Update UI for active quick filter
    document.querySelectorAll('[id^="attendanceQuickFilter-"]').forEach(pill => {
        pill.classList.remove('active', 'bg-green-100', 'text-green-700', 'border-green-200');
        pill.classList.add('bg-gray-100', 'text-gray-600', 'border-gray-200');
    });
    
    const activePill = document.getElementById(`attendanceQuickFilter-${filterType}`);
    if (activePill) {
        activePill.classList.add('active', 'bg-green-100', 'text-green-700', 'border-green-200');
        activePill.classList.remove('bg-gray-100', 'text-gray-600', 'border-gray-200');
    }
    
    // Apply the filter
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch(filterType) {
        case 'all':
            filteredAttendanceRecords = [...attendanceRecordsData];
            break;
        case 'present':
            filteredAttendanceRecords = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'present');
            break;
        case 'late':
            filteredAttendanceRecords = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'late');
            break;
        case 'absent':
            filteredAttendanceRecords = attendanceRecordsData.filter(r => r.status.toLowerCase() === 'absent');
            break;
        case 'today':
            const todayStr = new Date().toISOString().split('T')[0];
            filteredAttendanceRecords = attendanceRecordsData.filter(r => r.attendance_date === todayStr);
            break;
        case 'this-week':
            filteredAttendanceRecords = attendanceRecordsData.filter(r => new Date(r.attendance_date) >= startOfWeek);
            break;
        case 'this-month':
            filteredAttendanceRecords = attendanceRecordsData.filter(r => new Date(r.attendance_date) >= startOfMonth);
            break;
    }
    
    renderAttendanceRecordsTable();
}

function clearAttendanceFilters() {
    document.getElementById('attendanceAcademicYearFilter').value = '';
    document.getElementById('attendanceMonthFilter').value = '';
    document.getElementById('attendanceDayFilter').value = '';
    applyAttendanceFilters();
}

function clearAttendanceSearchFilters() {
    document.getElementById('attendanceStudentSearchInput').value = '';
    document.getElementById('attendanceSortSelect').value = 'name-asc';
    attendanceQuickFilter('all');
}

function exportAttendanceRecords() {
    if (filteredAttendanceRecords.length === 0) {
        alert('No records to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Student Name', 'Student Number', 'Date', 'Time', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredAttendanceRecords.map(record => [
            `"${record.student_name}"`,
            record.student_number,
            record.attendance_date,
            record.attendance_time || 'N/A',
            record.status
        ].join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function printAttendanceRecords() {
    if (filteredAttendanceRecords.length === 0) {
        alert('No records to print');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const printContent = `
        <html>
        <head>
            <title>Attendance Records</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Attendance Records</h1>
                <p>Course: ${currentAttendanceData ? currentAttendanceData.CourseName || 'N/A' : 'N/A'}</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <p>Total Records: ${filteredAttendanceRecords.length}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Student Number</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredAttendanceRecords.map(record => `
                        <tr>
                            <td>${record.student_name}</td>
                            <td>${record.student_number}</td>
                            <td>${new Date(record.attendance_date).toLocaleDateString()}</td>
                            <td>${record.attendance_time || 'N/A'}</td>
                            <td>${record.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function reloadAttendance() {
    if (currentAttendanceData && currentAttendanceData.AssignedCourseId) {
        showAttendanceLoading();
        loadAttendanceFromAPI(currentAttendanceData.AssignedCourseId);
    }
}

// Handle escape key for attendance modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (window.attendanceUpdateModal) {
            cancelAttendanceUpdate();
            return;
        }
        
        if (ModalManager.isModalOpen('attendanceModal')) {
            closeAttendanceModal();
        }
    }
});

// Handle backdrop click for attendance modal
document.addEventListener('DOMContentLoaded', function() {
    const attendanceModal = document.getElementById('attendanceModal');
    if (attendanceModal) {
        attendanceModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAttendanceModal();
            }
        });
    }
});
