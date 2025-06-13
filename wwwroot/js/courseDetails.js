// Course Details Modal Management
let currentCourseDetailsData = null;
let courseDetailsStudentsData = [];
let filteredCourseDetailsStudents = [];

function openCourseDetailsModal(courseData) {
    console.log('Opening course details modal with data:', courseData);
    
    // Store current course data
    currentCourseDetailsData = courseData;
    
    // Open modal using ModalManager
    ModalManager.openModal('courseDetailsModal');
    
    // Reset states
    showCourseDetailsLoading();
    
    // Load course details from API
    loadCourseDetailsFromAPI(courseData.AssignedCourseId);
}

function closeCourseDetailsModal() {
    console.log('Closing course details modal');
    ModalManager.closeModal('courseDetailsModal');
    currentCourseDetailsData = null;
    courseDetailsStudentsData = [];
    filteredCourseDetailsStudents = [];
}

function showCourseDetailsLoading() {
    document.getElementById('courseDetailsLoadingState').classList.remove('hidden');
    document.getElementById('courseDetailsErrorState').classList.add('hidden');
    document.getElementById('courseDetailsContentState').classList.add('hidden');
}

function showCourseDetailsError(message) {
    document.getElementById('courseDetailsLoadingState').classList.add('hidden');
    document.getElementById('courseDetailsContentState').classList.add('hidden');
    document.getElementById('courseDetailsErrorState').classList.remove('hidden');
    document.getElementById('courseDetailsErrorMessage').textContent = message;
}

function showCourseDetailsContent() {
    document.getElementById('courseDetailsLoadingState').classList.add('hidden');
    document.getElementById('courseDetailsErrorState').classList.add('hidden');
    document.getElementById('courseDetailsContentState').classList.remove('hidden');
}

async function loadCourseDetailsFromAPI(assignedCourseId) {
    try {
        console.log(`Loading course details for assigned course ID: ${assignedCourseId}`);
        
        // Make API call to get course details
        const response = await fetch(`/Faculty/GetCourseDetails?assignedCourseId=${assignedCourseId}`, {
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
        console.log('Course details API response:', data);

        if (!data.success) {
            showCourseDetailsError(data.message || 'Failed to load course details');
            return;
        }

        // Update modal header with course info
        updateCourseDetailsHeader(data);
        
        // Process students data
        processCourseDetailsData(data);
        
        // Show content
        showCourseDetailsContent();
        
    } catch (error) {
        console.error('Error loading course details from API:', error);
        showCourseDetailsError('Failed to load course details. Please try again later.');
    }
}

function updateCourseDetailsHeader(data) {
    const titleElement = document.getElementById('modalCourseDetailsTitle');
    const subHeaderElement = document.getElementById('modalCourseDetailsSubHeader');
    const descriptionElement = document.getElementById('modalCourseDescription');
    
    if (titleElement && subHeaderElement && descriptionElement && data.course_info) {
        const courseInfo = data.course_info;
        titleElement.textContent = `${courseInfo.course_code} - ${courseInfo.course_name}`;
        
        // Build sub header with available info
        let subHeaderParts = [];
        if (data.section_info?.section_name) subHeaderParts.push(data.section_info.section_name);
        if (courseInfo.room) subHeaderParts.push(courseInfo.room);
        subHeaderElement.textContent = subHeaderParts.join(' - ') || 'Course Information';
        
        descriptionElement.textContent = courseInfo.course_description || 'No course description available.';
    }
}

function processCourseDetailsData(data) {
    // Combine all students from different status arrays
    courseDetailsStudentsData = [];
    
    // Process enrolled students
    if (data.enrolled_students) {
        data.enrolled_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Enrolled'));
        });
    }
    
    // Process pending students
    if (data.pending_students) {
        data.pending_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Pending'));
        });
    }
    
    // Process rejected students
    if (data.rejected_students) {
        data.rejected_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Rejected'));
        });
    }

    // Process passed students
    if (data.passed_students) {
        data.passed_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Passed'));
        });
    }

    // Process failed students
    if (data.failed_students) {
        data.failed_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Failed'));
        });
    }

    // Process attending students (students with attendance but no formal enrollment status)
    if (data.attending_students) {
        data.attending_students.forEach(student => {
            courseDetailsStudentsData.push(processStudentData(student, 'Attending'));
        });
    }

    // Set filtered data
    filteredCourseDetailsStudents = [...courseDetailsStudentsData];
    
    // Update summary cards
    updateCourseDetailsSummaryCards();
    
    // Render students table
    renderCourseDetailsStudentsTable();
    
    // Setup event listeners
    setupCourseDetailsEventListeners();
}

function processStudentData(student, defaultStatus) {
    return {
        id: student.student_id || student.id,
        name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        studentNumber: student.student_number || '',
        email: student.email || '',
        status: student.enrollment_status || defaultStatus,
        present: student.present_count || 0,
        late: student.late_count || 0,
        absent: student.absent_count || 0,
        failed: student.failed_count || 0,
        attendanceRate: student.attendance_percentage || 0,
        latestAttendance: student.latest_attendance_date ? new Date(student.latest_attendance_date).toLocaleDateString() : 'N/A'
    };
}

function updateCourseDetailsSummaryCards() {
    const totalStudents = courseDetailsStudentsData.length;
    const pendingStudents = courseDetailsStudentsData.filter(s => s.status === 'Pending').length;
    const enrolledStudents = courseDetailsStudentsData.filter(s => s.status === 'Enrolled').length;
    const passedStudents = courseDetailsStudentsData.filter(s => s.status === 'Passed').length;
    const rejectedStudents = courseDetailsStudentsData.filter(s => s.status === 'Rejected').length;
    const failedStudents = courseDetailsStudentsData.filter(s => s.status === 'Failed').length;
    
    document.getElementById('courseDetailsStudentCount').textContent = totalStudents;
    document.getElementById('courseDetailsPendingCount').textContent = pendingStudents;
    document.getElementById('courseDetailsEnrolledCount').textContent = enrolledStudents;
    document.getElementById('courseDetailsPassedCount').textContent = passedStudents;
    document.getElementById('courseDetailsRejectedCount').textContent = rejectedStudents;
    document.getElementById('courseDetailsFailedCount').textContent = failedStudents;
}

function renderCourseDetailsStudentsTable() {
    const tableBody = document.getElementById('courseDetailsStudentsTableBody');
    const table = document.getElementById('courseDetailsStudentsTable');
    const emptyState = document.getElementById('courseDetailsEmptyStudentsState');
    
    if (filteredCourseDetailsStudents.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    tableBody.innerHTML = filteredCourseDetailsStudents.map(student => `
        <tr class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-blue-600 font-medium text-sm">${getStudentInitials(student.name)}</span>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${student.name}</div>
                        <div class="text-sm text-gray-500">${student.studentNumber}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-green-600">${student.present}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-yellow-600">${student.late}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-red-600">${student.absent}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                ${student.latestAttendance}
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <select onchange="updateStudentStatus(${student.id}, this.value)" 
                        class="text-xs font-semibold rounded-full border-0 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${getStatusClasses(student.status)}">
                    <option value="Pending" ${student.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Enrolled" ${student.status === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
                    <option value="Passed" ${student.status === 'Passed' ? 'selected' : ''}>Passed</option>
                    <option value="Rejected" ${student.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="Failed" ${student.status === 'Failed' ? 'selected' : ''}>Failed</option>
                    <option value="Attending" ${student.status === 'Attending' ? 'selected' : ''}>Attending</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function getStudentInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getStatusClasses(status) {
    switch(status) {
        case 'Enrolled':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Passed':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'Failed':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'Attending':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function updateStudentStatus(studentId, newStatus) {
    // Find the student in the data array
    const studentIndex = courseDetailsStudentsData.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        // Update the status in the data
        courseDetailsStudentsData[studentIndex].status = newStatus;
        
        // Update the filtered data if this student is currently visible
        const filteredIndex = filteredCourseDetailsStudents.findIndex(s => s.id === studentId);
        if (filteredIndex !== -1) {
            filteredCourseDetailsStudents[filteredIndex].status = newStatus;
        }
        
        // Update the summary cards
        updateCourseDetailsSummaryCards();
        
        // Re-render the table to update styling
        renderCourseDetailsStudentsTable();
        
        // Show success notification
        showStatusUpdateNotification(studentId, newStatus);
        
        // TODO: Make API call to update status on server
        // updateStudentStatusOnServer(studentId, newStatus);
    }
}

function showStatusUpdateNotification(studentId, newStatus) {
    const student = courseDetailsStudentsData.find(s => s.id === studentId);
    if (student) {
        // Find the notification area
        const notificationArea = document.getElementById('courseDetailsNotificationArea');
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
                    <span><strong>${student.name}</strong> status updated to <strong>${newStatus}</strong></span>
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

function setupCourseDetailsEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('courseDetailsStudentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyCourseDetailsFilters();
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('courseDetailsSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyCourseDetailsFilters();
        });
    }
}

function applyCourseDetailsFilters() {
    const searchInput = document.getElementById('courseDetailsStudentSearchInput');
    const sortSelect = document.getElementById('courseDetailsSortSelect');
    
    if (!searchInput || !sortSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    
    // Apply search filter
    filteredCourseDetailsStudents = courseDetailsStudentsData.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.studentNumber.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );
    
    // Apply sorting
    filteredCourseDetailsStudents.sort((a, b) => {
        switch(sortBy) {
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'attendance-desc': return b.attendanceRate - a.attendanceRate;
            case 'attendance-asc': return a.attendanceRate - b.attendanceRate;
            case 'present-desc': return b.present - a.present;
            case 'status-asc': return a.status.localeCompare(b.status);
            default: return 0;
        }
    });
    
    renderCourseDetailsStudentsTable();
}

function courseDetailsQuickFilter(filterType) {
    // Reset search
    const searchInput = document.getElementById('courseDetailsStudentSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Apply filter
    switch(filterType) {
        case 'all':
            filteredCourseDetailsStudents = [...courseDetailsStudentsData];
            break;
        case 'approved':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Enrolled');
            break;
        case 'pending':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Pending');
            break;
        case 'passed':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Passed');
            break;
        case 'rejected':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Rejected');
            break;
        case 'failed':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Failed');
            break;
        case 'attending':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.status === 'Attending');
            break;
        case 'high-attendance':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.attendanceRate >= 80);
            break;
        case 'low-attendance':
            filteredCourseDetailsStudents = courseDetailsStudentsData.filter(s => s.attendanceRate < 60);
            break;
    }
    
    // Update active filter button
    document.querySelectorAll('[id^="courseDetailsQuickFilter-"]').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-100', 'text-blue-700', 'border-blue-200');
        btn.classList.add('bg-gray-100', 'text-gray-600', 'border-gray-200');
    });
    
    const activeBtn = document.getElementById(`courseDetailsQuickFilter-${filterType}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-100', 'text-blue-700', 'border-blue-200');
        activeBtn.classList.remove('bg-gray-100', 'text-gray-600', 'border-gray-200');
    }
    
    renderCourseDetailsStudentsTable();
}

function clearCourseDetailsFilters() {
    const searchInput = document.getElementById('courseDetailsStudentSearchInput');
    const sortSelect = document.getElementById('courseDetailsSortSelect');
    
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'name-asc';
    
    courseDetailsQuickFilter('all');
}

function reloadCourseDetails() {
    if (currentCourseDetailsData && currentCourseDetailsData.AssignedCourseId) {
        showCourseDetailsLoading();
        loadCourseDetailsFromAPI(currentCourseDetailsData.AssignedCourseId);
    }
}

// Handle escape key for course details modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && ModalManager.isModalOpen('courseDetailsModal')) {
        closeCourseDetailsModal();
    }
});

// Handle backdrop click for course details modal
document.addEventListener('DOMContentLoaded', function() {
    const courseDetailsModal = document.getElementById('courseDetailsModal');
    if (courseDetailsModal) {
        courseDetailsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCourseDetailsModal();
            }
        });
    }
});
