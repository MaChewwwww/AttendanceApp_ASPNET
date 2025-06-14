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
    console.log('processCourseDetailsData - Full API response:', data);
    
    // Combine all students from different status arrays
    courseDetailsStudentsData = [];
    
    // Process enrolled students - the API is putting the student in the enrolled_students array
    if (data.enrolled_students) {
        console.log('Processing enrolled_students:', data.enrolled_students);
        data.enrolled_students.forEach(student => {
            console.log('Enrolled student raw data:', student);
            const processedStudent = processStudentData(student, 'Enrolled');
            console.log('Processed enrolled student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }
    
    // Process pending students
    if (data.pending_students) {
        console.log('Processing pending_students:', data.pending_students);
        data.pending_students.forEach(student => {
            console.log('Pending student raw data:', student);
            const processedStudent = processStudentData(student, 'Pending');
            console.log('Processed pending student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }
    
    // Process rejected students
    if (data.rejected_students) {
        console.log('Processing rejected_students:', data.rejected_students);
        data.rejected_students.forEach(student => {
            console.log('Rejected student raw data:', student);
            const processedStudent = processStudentData(student, 'Rejected');
            console.log('Processed rejected student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }

    // Process passed students
    if (data.passed_students) {
        console.log('Processing passed_students:', data.passed_students);
        data.passed_students.forEach(student => {
            console.log('Passed student raw data:', student);
            const processedStudent = processStudentData(student, 'Passed');
            console.log('Processed passed student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }

    // Process failed students
    if (data.failed_students) {
        console.log('Processing failed_students:', data.failed_students);
        data.failed_students.forEach(student => {
            console.log('Failed student raw data:', student);
            const processedStudent = processStudentData(student, 'Failed');
            console.log('Processed failed student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }

    // Process attending students (students with attendance but no formal enrollment status)
    if (data.attending_students) {
        console.log('Processing attending_students:', data.attending_students);
        data.attending_students.forEach(student => {
            console.log('Attending student raw data:', student);
            const processedStudent = processStudentData(student, 'Attending');
            console.log('Processed attending student:', processedStudent);
            courseDetailsStudentsData.push(processedStudent);
        });
    }

    console.log('Final processed students data:', courseDetailsStudentsData);

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
    // Debug logging to see what we're receiving
    console.log('processStudentData - Processing student:', student);
    console.log('processStudentData - Default status:', defaultStatus);
    
    // The API is returning "enrollment_status" but we need to check all possible property names
    let actualStatus = student.enrollment_status || 
                      student.status || 
                      student.enrollmentStatus || 
                      defaultStatus;
    
    console.log('processStudentData - Final status assigned:', actualStatus);
    
    return {
        id: student.student_id || student.id,
        name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        studentNumber: student.student_number || '',
        email: student.email || '',
        status: actualStatus, // Use the actual status from the database
        present: student.present_count || 0,
        late: student.late_count || 0,
        absent: student.absent_count || 0,
        failed: student.failed_count || 0,
        attendanceRate: student.attendance_percentage || 0,
        latestAttendance: student.latest_attendance_date ? new Date(student.latest_attendance_date).toLocaleDateString() : 'N/A'
    };
}

// Add a function to normalize status values
function normalizeStatusForDisplay(status) {
    if (!status) return 'Pending';
    
    const statusLower = status.toLowerCase().trim();
    console.log('normalizeStatusForDisplay - Input:', status, 'Lowercase:', statusLower);
    
    switch (statusLower) {
        case 'enrolled':
        case 'approved':
            return 'Enrolled';
        case 'pending':
            return 'Pending';
        case 'rejected':
            return 'Rejected';
        case 'failed':
            return 'Failed';
        case 'passed':
            return 'Passed';
        default:
            console.log('normalizeStatusForDisplay - Unknown status, defaulting to Pending:', status);
            return 'Pending';
    }
}

function updateCourseDetailsSummaryCards() {
    const totalStudents = courseDetailsStudentsData.length;
    
    // Use normalized status for counting to ensure consistency
    const pendingStudents = courseDetailsStudentsData.filter(s => {
        const normalizedStatus = normalizeStatusForDisplay(s.status);
        return normalizedStatus === 'Pending';
    }).length;
    
    const enrolledStudents = courseDetailsStudentsData.filter(s => {
        const normalizedStatus = normalizeStatusForDisplay(s.status);
        return normalizedStatus === 'Enrolled';
    }).length;
    
    const passedStudents = courseDetailsStudentsData.filter(s => {
        const normalizedStatus = normalizeStatusForDisplay(s.status);
        return normalizedStatus === 'Passed';
    }).length;
    
    const rejectedStudents = courseDetailsStudentsData.filter(s => {
        const normalizedStatus = normalizeStatusForDisplay(s.status);
        return normalizedStatus === 'Rejected';
    }).length;
    
    const failedStudents = courseDetailsStudentsData.filter(s => {
        const normalizedStatus = normalizeStatusForDisplay(s.status);
        return normalizedStatus === 'Failed';
    }).length;
    
    console.log('updateCourseDetailsSummaryCards - Status counts:');
    console.log(`  Total: ${totalStudents}`);
    console.log(`  Pending: ${pendingStudents}`);
    console.log(`  Enrolled: ${enrolledStudents}`);
    console.log(`  Passed: ${passedStudents}`);
    console.log(`  Rejected: ${rejectedStudents}`);
    console.log(`  Failed: ${failedStudents}`);
    
    // Log individual student statuses for debugging
    courseDetailsStudentsData.forEach(student => {
        const normalized = normalizeStatusForDisplay(student.status);
        console.log(`  Student ${student.name}: raw="${student.status}" -> normalized="${normalized}"`);
    });
    
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
    
    console.log('renderCourseDetailsStudentsTable - Rendering students:', filteredCourseDetailsStudents);
    
    if (filteredCourseDetailsStudents.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    tableBody.innerHTML = filteredCourseDetailsStudents.map(student => {
        console.log('Rendering student in table:', student.name, 'Status:', student.status);
        
        // Normalize status for display and dropdown
        const normalizedStatus = normalizeStatusForDisplay(student.status);
        console.log('Normalized status for', student.name, ':', normalizedStatus);
        
        return `
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
                            data-student-id="${student.id}"
                            data-current-status="${normalizedStatus}"
                            class="text-xs font-semibold rounded-full border-0 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${getStatusClasses(normalizedStatus)}">
                        <option value="Pending" ${normalizedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Enrolled" ${normalizedStatus === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
                        <option value="Passed" ${normalizedStatus === 'Passed' ? 'selected' : ''}>Passed</option>
                        <option value="Rejected" ${normalizedStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Failed" ${normalizedStatus === 'Failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
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
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function updateStudentStatus(studentId, newStatus) {
    // Find the dropdown that triggered this
    const dropdown = document.querySelector(`select[data-student-id="${studentId}"]`);
    const currentStatus = dropdown ? dropdown.getAttribute('data-current-status') : null;
    
    // If status hasn't actually changed, do nothing
    if (currentStatus === newStatus) {
        return;
    }
    
    const student = courseDetailsStudentsData.find(s => s.id === studentId);
    if (!student) {
        console.error('Student not found');
        // Reset dropdown to original value
        if (dropdown) {
            dropdown.value = currentStatus || 'Pending';
        }
        return;
    }

    // Get the current assigned course ID
    const assignedCourseId = currentCourseDetailsData?.AssignedCourseId;
    if (!assignedCourseId) {
        console.error('Assigned course ID not found');
        // Reset dropdown to original value
        if (dropdown) {
            dropdown.value = currentStatus || 'Pending';
        }
        return;
    }

    // Show confirmation dialog
    showStatusUpdateConfirmation(student, newStatus, assignedCourseId);
}

function showStatusUpdateConfirmation(student, newStatus, assignedCourseId) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 status-update-modal';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-95 opacity-0" id="statusConfirmationContent">
            <div class="text-center mb-6">
                <div class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Status Change</h3>
                <p class="text-gray-600 text-sm">
                    Are you sure you want to change <strong>${student.name}</strong>'s status to <strong>${newStatus}</strong>?
                </p>
                ${newStatus === 'Rejected' ? `
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (Optional)</label>
                        <textarea id="rejectionReason" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                                  rows="3" 
                                  placeholder="Enter reason for rejection..."></textarea>
                    </div>
                ` : ''}
            </div>
            <div class="flex justify-center space-x-3">
                <button onclick="cancelStatusUpdate()" 
                        class="bg-gray-600 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors font-medium">
                    Cancel
                </button>
                <button onclick="confirmStatusUpdate(${student.id}, '${newStatus}', ${assignedCourseId})" 
                        id="confirmStatusBtn"
                        class="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors font-medium">
                    Confirm Change
                </button>
            </div>
        </div>
    `;

    // Add to document
    document.body.appendChild(modal);
    
    // Store reference for cleanup
    window.statusUpdateModal = modal;

    // Show with animation
    setTimeout(() => {
        const content = modal.querySelector('#statusConfirmationContent');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 50);

    // Handle backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cancelStatusUpdate();
        }
    });
}

function cancelStatusUpdate() {
    const modal = window.statusUpdateModal;
    if (modal) {
        const content = modal.querySelector('#statusConfirmationContent');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            document.body.removeChild(modal);
            window.statusUpdateModal = null;
        }, 300);
    }

    // Don't reload here - let the calling function handle it
}

async function confirmStatusUpdate(studentId, newStatus, assignedCourseId) {
    const confirmBtn = document.getElementById('confirmStatusBtn');
    const rejectionReasonTextarea = document.getElementById('rejectionReason');
    
    // Disable button and show loading
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';

    try {
        const rejectionReason = rejectionReasonTextarea ? rejectionReasonTextarea.value.trim() : '';

        const response = await fetch(`/Faculty/UpdateStudentStatus?assignedCourseId=${assignedCourseId}&studentId=${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                status: newStatus,
                rejectionReason: rejectionReason
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Close confirmation modal first
            cancelStatusUpdate();
            
            // Show success notification
            showStatusUpdateNotification(studentId, newStatus);
            
            // Reload the entire modal to get fresh data from the server
            setTimeout(() => {
                reloadCourseDetails();
            }, 1000); // Give time for the notification to show
        } else {
            // Show error notification
            showStatusUpdateError(result.message || 'Failed to update student status');
        }
    } catch (error) {
        console.error('Error updating student status:', error);
        showStatusUpdateError('Failed to update student status. Please try again.');
    } finally {
        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm Change';
    }
}

function showStatusUpdateError(message) {
    const notificationArea = document.getElementById('courseDetailsNotificationArea');
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

// Course Details Quick Filter Management
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

// Handle escape key for confirmation modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (window.statusUpdateModal) {
            cancelStatusUpdate();
            return;
        }
        
        if (ModalManager.isModalOpen('courseDetailsModal')) {
            closeCourseDetailsModal();
        }
    }
});
