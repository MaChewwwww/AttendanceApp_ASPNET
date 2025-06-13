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
    
    // Load course details
    loadCourseDetails(courseData);
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

function loadCourseDetails(courseData) {
    try {
        // Update modal header
        updateCourseDetailsHeader(courseData);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            // Load students data for this course
            loadCourseDetailsStudents(courseData.AssignedCourseId);
            
            // Show content
            showCourseDetailsContent();
        }, 800);
        
    } catch (error) {
        console.error('Error loading course details:', error);
        showCourseDetailsError('Failed to load course details. Please try again.');
    }
}

function updateCourseDetailsHeader(courseData) {
    const titleElement = document.getElementById('modalCourseDetailsTitle');
    const subHeaderElement = document.getElementById('modalCourseDetailsSubHeader');
    const descriptionElement = document.getElementById('modalCourseDescription');
    
    if (titleElement && subHeaderElement && descriptionElement) {
        titleElement.textContent = `${courseData.CourseCode} - ${courseData.CourseName}`;
        subHeaderElement.textContent = `${courseData.ProgramAcronym} - ${courseData.SectionName} - ${courseData.Room}`;
        descriptionElement.textContent = courseData.Description || 'No course description available.';
    }
}

function loadCourseDetailsStudents(assignedCourseId) {
    // Simulate API call to get course students
    // In real implementation, this would be an API call
    setTimeout(() => {
        // Mock students data
        courseDetailsStudentsData = generateMockStudentsData();
        filteredCourseDetailsStudents = [...courseDetailsStudentsData];
        
        // Update summary cards
        updateCourseDetailsSummaryCards();
        
        // Render students table
        renderCourseDetailsStudentsTable();
        
        // Setup event listeners
        setupCourseDetailsEventListeners();
    }, 500);
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
                        <span class="text-blue-600 font-medium text-sm">${student.name.charAt(8)}${student.name.charAt(9)}</span>
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
                </select>
            </td>
        </tr>
    `).join('');
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
        
        // Here you would typically make an API call to update the status on the server
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

function generateMockStudentsData() {
    const statuses = ['Enrolled', 'Pending', 'Enrolled', 'Enrolled', 'Pending', 'Passed', 'Rejected', 'Failed'];
    const students = [];
    
    for (let i = 1; i <= 15; i++) {
        const present = Math.floor(Math.random() * 20) + 5;
        const late = Math.floor(Math.random() * 5);
        const absent = Math.floor(Math.random() * 8);
        const total = present + late + absent;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        students.push({
            id: i,
            name: `Student ${i.toString().padStart(2, '0')}`,
            studentNumber: `2024-${(1000 + i).toString()}`,
            email: `student${i}@email.com`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            present: present,
            late: late,
            absent: absent,
            attendanceRate: attendanceRate,
            latestAttendance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
    }
    
    return students;
}

function updateCourseDetailsSummaryCards() {
    const totalStudents = courseDetailsStudentsData.length;
    const enrolledStudents = courseDetailsStudentsData.filter(s => s.status === 'Enrolled').length;
    const pendingStudents = courseDetailsStudentsData.filter(s => s.status === 'Pending').length;
    const avgAttendance = totalStudents > 0 ? 
        Math.round(courseDetailsStudentsData.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents) : 0;
    
    document.getElementById('courseDetailsStudentCount').textContent = totalStudents;
    document.getElementById('courseDetailsEnrolledCount').textContent = enrolledStudents;
    document.getElementById('courseDetailsPendingCount').textContent = pendingStudents;
    document.getElementById('courseDetailsAvgAttendance').textContent = `${avgAttendance}%`;
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
                        <span class="text-blue-600 font-medium text-sm">${student.name.charAt(8)}${student.name.charAt(9)}</span>
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
                </select>
            </td>
        </tr>
    `).join('');
}

function setupCourseDetailsEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('courseDetailsStudentSearchInput');
    searchInput.addEventListener('input', function() {
        applyCourseDetailsFilters();
    });
    
    // Sort functionality
    const sortSelect = document.getElementById('courseDetailsSortSelect');
    sortSelect.addEventListener('change', function() {
        applyCourseDetailsFilters();
    });
}

function applyCourseDetailsFilters() {
    const searchTerm = document.getElementById('courseDetailsStudentSearchInput').value.toLowerCase();
    const sortBy = document.getElementById('courseDetailsSortSelect').value;
    
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
    document.getElementById('courseDetailsStudentSearchInput').value = '';
    
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
    document.getElementById('courseDetailsStudentSearchInput').value = '';
    document.getElementById('courseDetailsSortSelect').value = 'name-asc';
    courseDetailsQuickFilter('all');
}

function reloadCourseDetails() {
    if (currentCourseDetailsData) {
        showCourseDetailsLoading();
        loadCourseDetails(currentCourseDetailsData);
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
        courseDetailsModal.addEventListener('click', function(e) {            if (e.target === this) {
                closeCourseDetailsModal();
            }
        });
    }
});
