// Attendance Modal Management
let currentAttendanceData = null;
let attendanceRecordsData = [];
let filteredAttendanceRecords = [];
let isCurrentCourse = false; // Flag to determine if the course is current (editable) or previous (read-only)

// Enhanced global variables for attendance update with better initialization
window.attendanceUpdateGlobals = {
    attendanceId: null,
    status: null,
    record: null,
    selectElement: null,
    
    // Helper methods
    set: function(attendanceId, status, record, selectElement) {
        console.log('=== SETTING GLOBAL ATTENDANCE UPDATE DATA ===');
        console.log('Setting attendanceId:', attendanceId, typeof attendanceId);
        console.log('Setting status:', status);
        console.log('Setting record:', record);
        console.log('Setting selectElement:', selectElement);
        
        this.attendanceId = attendanceId;
        this.status = status;
        this.record = record;
        this.selectElement = selectElement;
        
        console.log('Global data set successfully');
        console.log('===========================================');
    },
    
    get: function() {
        console.log('=== GETTING GLOBAL ATTENDANCE UPDATE DATA ===');
        console.log('attendanceId:', this.attendanceId, typeof this.attendanceId);
        console.log('status:', this.status);
        console.log('record:', this.record);
        console.log('selectElement:', this.selectElement);
        console.log('============================================');
        
        return {
            attendanceId: this.attendanceId,
            status: this.status,
            record: this.record,
            selectElement: this.selectElement
        };
    },
    
    clear: function() {
        console.log('Clearing global attendance update data');
        this.attendanceId = null;
        this.status = null;
        this.record = null;
        this.selectElement = null;
    },
    
    isValid: function() {
        const valid = this.attendanceId && 
                     this.attendanceId > 0 && 
                     this.status && 
                     this.record;
        
        console.log('Global data validation:', valid);
        if (!valid) {
            console.log('Validation failed:');
            console.log('  attendanceId valid:', this.attendanceId && this.attendanceId > 0);
            console.log('  status valid:', !!this.status);
            console.log('  record valid:', !!this.record);
        }
        
        return valid;
    }
};

// Global variables for attendance update
let currentAttendanceUpdateId = null;
let currentAttendanceUpdateStatus = null;
let currentAttendanceUpdateRecord = null;
let currentAttendanceUpdateSelectElement = null;

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
        console.log(`=== LOADING ATTENDANCE FROM API ===`);
        console.log(`Assigned Course ID: ${assignedCourseId} (type: ${typeof assignedCourseId})`);
        
        const url = `/Faculty/GetCourseAttendance?assignedCourseId=${assignedCourseId}`;
        console.log(`Request URL: ${url}`);
        
        // Make API call to get attendance records
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log(`HTTP Response Status: ${response.status} ${response.statusText}`);
        console.log(`Response Headers:`, response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('=== RAW API RESPONSE ===');
        console.log('Full response object:', data);
        console.log('Response success:', data.success);
        console.log('Response message:', data.message);
        console.log('Attendance records:', data.attendance_records);
        console.log('Records count:', data.attendance_records?.length);
        
        if (data.attendance_records?.length > 0) {
            console.log('=== ATTENDANCE RECORDS ANALYSIS ===');
            console.log('First record:', data.attendance_records[0]);
            console.log('First record attendance_id:', data.attendance_records[0]?.attendance_id, typeof data.attendance_records[0]?.attendance_id);
            
            const recordsWithIds = data.attendance_records.filter(r => r.attendance_id && r.attendance_id > 0);
            const recordsWithoutIds = data.attendance_records.filter(r => !r.attendance_id || r.attendance_id <= 0);
            
            console.log(`Records with valid attendance_id: ${recordsWithIds.length}`);
            console.log(`Records with invalid attendance_id: ${recordsWithoutIds.length}`);
            
            if (recordsWithoutIds.length > 0) {
                console.warn('Records with invalid IDs:', recordsWithoutIds);
            }
            
            // Check all unique attendance IDs
            const allIds = data.attendance_records.map(r => r.attendance_id);
            const uniqueIds = [...new Set(allIds)];
            console.log('All attendance IDs:', allIds);
            console.log('Unique attendance IDs:', uniqueIds);
        }
        console.log('===========================');

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
        console.error('Error stack:', error.stack);
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
    console.log('=== PROCESSING ATTENDANCE DATA ===');
    console.log('Input data:', data);
    
    // Process attendance records
    attendanceRecordsData = data.attendance_records || [];
    
    console.log('Processed attendance records count:', attendanceRecordsData.length);
    console.log('First processed record:', attendanceRecordsData[0]);
    
    if (attendanceRecordsData.length > 0) {
        // Validate all records have proper attendance_id
        const invalidRecords = attendanceRecordsData.filter(record => 
            !record.attendance_id || record.attendance_id <= 0 || typeof record.attendance_id !== 'number'
        );
        
        if (invalidRecords.length > 0) {
            console.error(`Found ${invalidRecords.length} records with invalid attendance_id:`, invalidRecords);
        }
        
        // Log attendance ID distribution
        const attendanceIds = attendanceRecordsData.map(r => r.attendance_id);
        console.log('Attendance IDs in processed data:', attendanceIds);
    }
    
    console.log('================================');

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
    // Use filtered data instead of raw data for dynamic updates
    const totalSessions = filteredAttendanceRecords.length;
    const presentCount = filteredAttendanceRecords.filter(r => r.status.toLowerCase() === 'present').length;
    const lateCount = filteredAttendanceRecords.filter(r => r.status.toLowerCase() === 'late').length;
    const absentCount = filteredAttendanceRecords.filter(r => r.status.toLowerCase() === 'absent').length;
    const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;
    
    // Get unique students count from filtered data
    const uniqueStudents = new Set(filteredAttendanceRecords.map(r => r.student_id)).size;
    
    console.log('updateAttendanceSummaryCards - Filtered attendance counts:');
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
    
    // Ensure we have a valid attendance ID and convert to number
    let attendanceId = record.attendance_id;
    
    // Handle both string and number types
    if (typeof attendanceId === 'string') {
        attendanceId = parseInt(attendanceId, 10);
    }
    
    console.log(`Creating dropdown for ${record.student_name}:`);
    console.log(`  - attendance_id: ${attendanceId} (type: ${typeof attendanceId})`);
    console.log(`  - original record.attendance_id: ${record.attendance_id} (type: ${typeof record.attendance_id})`);
    console.log(`  - record keys:`, Object.keys(record));
    
    if (!attendanceId || isNaN(attendanceId) || attendanceId <= 0) {
        console.error('Invalid attendance ID for record:', record);
        return '<span class="text-red-500 text-xs">Invalid ID</span>';
    }
    
    // Store the record data as JSON with the validated attendance ID
    const recordWithValidId = { ...record, attendance_id: attendanceId };
    const recordDataJson = JSON.stringify(recordWithValidId).replace(/"/g, '&quot;');
    
    return `
        <select onchange="updateAttendanceStatus(this)" 
                data-attendance-id="${attendanceId}"
                data-current-status="${currentStatus}"
                data-record='${recordDataJson}'
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

function updateAttendanceStatus(selectElement) {
    const newStatus = selectElement.value;
    const currentStatus = selectElement.getAttribute('data-current-status');
    const attendanceIdStr = selectElement.getAttribute('data-attendance-id');
    
    console.log('=== UPDATE ATTENDANCE STATUS DEBUG ===');
    console.log('Select element:', selectElement);
    console.log('data-attendance-id attribute:', attendanceIdStr);
    console.log('New status:', newStatus);
    console.log('Current status:', currentStatus);
    console.log('Select element value at time of call:', selectElement.value);
    console.log('Select element selectedIndex:', selectElement.selectedIndex);
    console.log('Select element options:', Array.from(selectElement.options).map(o => ({value: o.value, text: o.text, selected: o.selected})));
    
    // Additional debugging - check all data attributes
    console.log('All data attributes on select element:');
    for (let i = 0; i < selectElement.attributes.length; i++) {
        const attr = selectElement.attributes[i];
        if (attr.name.startsWith('data-')) {
            console.log(`  ${attr.name}: ${attr.value}`);
        }
    }
    console.log('======================================');
    
    // Convert to number and validate
    const attendanceId = parseInt(attendanceIdStr, 10);
    
    if (!attendanceId || isNaN(attendanceId) || attendanceId === 0) {
        console.error('Invalid attendance ID:', attendanceIdStr, 'parsed as:', attendanceId);
        console.error('Resetting dropdown to current status:', currentStatus);
        selectElement.value = currentStatus || 'present';
        alert('Error: Invalid attendance record ID. Please refresh and try again.');
        return;
    }
    
    // If status hasn't actually changed, do nothing
    if (currentStatus === newStatus) {
        console.log('Status unchanged, ignoring');
        return;
    }
    
    // Temporarily disable the dropdown to prevent multiple rapid changes
    selectElement.disabled = true;
    console.log('Dropdown disabled during processing');
    
    // Get the record data from the data attribute
    let record;
    try {
        const recordDataJson = selectElement.getAttribute('data-record');
        console.log('Raw record data JSON:', recordDataJson);
        
        record = JSON.parse(recordDataJson.replace(/&quot;/g, '"'));
        console.log('Parsed record:', record);
        
        // Ensure the record has the correct attendance_id
        if (record.attendance_id !== attendanceId) {
            console.warn(`Record attendance_id (${record.attendance_id}) doesn't match dropdown (${attendanceId})`);
            record.attendance_id = attendanceId;
        }
    } catch (error) {
        console.error('Error parsing record data:', error);
        // Fallback: try to find the record in our data array
        record = attendanceRecordsData.find(r => r.attendance_id === attendanceId);
        console.log('Fallback record found:', record);
    }
    
    if (!record) {
        console.error('Attendance record not found for ID:', attendanceId);
        // Reset dropdown to original value and re-enable
        selectElement.value = currentStatus || 'present';
        selectElement.disabled = false;
        alert('Error: Attendance record not found. Please refresh and try again.');
        return;
    }

    console.log(`Updating attendance status for ${record.student_name} from ${currentStatus} to ${newStatus}`);
    console.log('Full record data being passed to confirmation:', record);
    
    // Store in enhanced global variables
    window.attendanceUpdateGlobals.set(attendanceId, newStatus, record, selectElement);
    
    // Show confirmation dialog with the complete record data
    showAttendanceUpdateConfirmation(record, newStatus, selectElement);
}

function showAttendanceUpdateConfirmation(record, newStatus, selectElement) {
    console.log('=== ATTENDANCE UPDATE CONFIRMATION ===');
    console.log('Record data being passed:', record);
    console.log('Record attendance_id:', record.attendance_id, typeof record.attendance_id);
    console.log('New status:', newStatus);
    console.log('Select element details:');
    console.log('  - disabled:', selectElement.disabled);
    console.log('  - current value:', selectElement.value);
    console.log('  - attendance_id attr:', selectElement.getAttribute('data-attendance-id'));
    console.log('=======================================');
    
    // Validate attendance ID one more time
    if (!record.attendance_id || record.attendance_id === 0) {
        console.error('Invalid attendance ID in record:', record);
        // Re-enable dropdown and reset
        selectElement.disabled = false;
        selectElement.value = selectElement.getAttribute('data-current-status') || 'present';
        alert('Error: Invalid attendance record. Please refresh and try again.');
        return;
    }
    
    // Ensure attendance_id is a number and get the final value to use
    let attendanceId = record.attendance_id;
    if (typeof attendanceId === 'string') {
        attendanceId = parseInt(attendanceId, 10);
    }
    
    if (isNaN(attendanceId) || attendanceId <= 0) {
        console.error('Invalid attendance ID after parsing:', attendanceId);
        // Re-enable dropdown and reset
        selectElement.disabled = false;
        selectElement.value = selectElement.getAttribute('data-current-status') || 'present';
        alert('Error: Invalid attendance record ID. Please refresh and try again.');
        return;
    }
    
    console.log(`Creating confirmation modal for attendance ID: ${attendanceId} (${typeof attendanceId})`);
    
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
                    <div>Student ID: ${record.student_number}</div>
                    <div>Date: ${new Date(record.attendance_date).toLocaleDateString()}</div>
                    <div>Time: ${record.attendance_time || 'N/A'}</div>
                    <div>Attendance ID: ${attendanceId}</div>
                    <div class="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <strong>Debug Info:</strong><br>
                        Dropdown Value: ${selectElement.value}<br>
                        Current Status: ${selectElement.getAttribute('data-current-status')}<br>
                        Attendance ID: ${attendanceId}
                    </div>
                </div>
            </div>
            <div class="flex justify-center space-x-3">
                <button onclick="cancelAttendanceUpdateEnhanced()" 
                        class="bg-gray-600 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-700 transition-colors font-medium">
                    Cancel
                </button>
                <button onclick="confirmAttendanceUpdateEnhanced()" 
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
            cancelAttendanceUpdateEnhanced();
        }
    });
}

function cancelAttendanceUpdateEnhanced() {
    const modal = window.attendanceUpdateModal;
    if (modal) {
        const content = modal.querySelector('#attendanceConfirmationContent');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            document.body.removeChild(modal);
            window.attendanceUpdateModal = null;
            
            // Re-enable the dropdown and reset its value when canceling
            const globalData = window.attendanceUpdateGlobals.get();
            if (globalData.selectElement) {
                console.log('Re-enabling dropdown and resetting value on cancel');
                globalData.selectElement.disabled = false;
                const originalStatus = globalData.selectElement.getAttribute('data-current-status');
                globalData.selectElement.value = originalStatus || 'present';
            }
            
            // Clear enhanced global variables when canceling
            window.attendanceUpdateGlobals.clear();
        }, 300);
    }
}

// Enhanced confirmation function
async function confirmAttendanceUpdateEnhanced() {
    console.log('=== CONFIRMING ATTENDANCE UPDATE ENHANCED ===');
    
    // Get data from enhanced global variables
    const globalData = window.attendanceUpdateGlobals.get();
    
    // Validate global data
    if (!window.attendanceUpdateGlobals.isValid()) {
        console.error('Invalid global data for attendance update');
        cancelAttendanceUpdateEnhanced();
        alert('Error: Invalid attendance data. Please refresh and try again.');
        return;
    }
    
    if (!currentAttendanceData || !currentAttendanceData.AssignedCourseId) {
        console.error('No currentAttendanceData available:', currentAttendanceData);
        cancelAttendanceUpdateEnhanced();
        alert('Error: Course information not available. Please refresh and try again.');
        return;
    }
    
    console.log('All validations passed, proceeding with API call');
    console.log('Final data for API call:');
    console.log('  attendanceId:', globalData.attendanceId);
    console.log('  status:', globalData.status);
    console.log('  assignedCourseId:', currentAttendanceData.AssignedCourseId);
    console.log('============================================');
    
    // Get button element and disable it
    const buttonElement = document.getElementById('confirmAttendanceBtn');
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
    }

    try {
        // Make API call to update attendance status
        const requestBody = {
            status: globalData.status,
            assignedCourseId: currentAttendanceData.AssignedCourseId,
            // Include additional record data for context
            student_id: globalData.record.student_id || 0,
            student_name: globalData.record.student_name || '',
            attendance_date: globalData.record.attendance_date || '',
            attendance_time: globalData.record.attendance_time || ''
        };
        
        const apiUrl = `/Faculty/UpdateAttendanceStatus/${globalData.attendanceId}`;
        
        console.log('Making API request:');
        console.log('  URL:', apiUrl);
        console.log('  Attendance ID in URL:', globalData.attendanceId);
        console.log('  Request body:', requestBody);
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Attendance update API response:', result);

        if (!result.success) {
            throw new Error(result.message || 'Failed to update attendance status');
        }
        
        // Close confirmation modal
        cancelAttendanceUpdateEnhanced();
        
        // Show success notification
        showAttendanceUpdateNotification(globalData.record, globalData.status);
        
        // Store current filter and sort state before refreshing
        const currentFilters = preserveCurrentFilters();
        console.log('Preserving current filters:', currentFilters);
        
        // Refresh attendance data from server to get the latest state
        await refreshAttendanceDataWithFilters(currentFilters);
        
    } catch (error) {
        console.error('Error updating attendance status:', error);
        
        // Reset dropdown to original value and re-enable
        if (globalData.selectElement) {
            console.log('Error: Resetting dropdown to original status and re-enabling');
            const originalStatus = globalData.selectElement.getAttribute('data-current-status');
            globalData.selectElement.value = originalStatus || 'present';
            globalData.selectElement.disabled = false;
        }
        
        // Close confirmation modal first
        cancelAttendanceUpdateEnhanced();
        
        // Show error notification
        showAttendanceUpdateError(error.message || 'Failed to update attendance status. Please try again.');
        
    } finally {
        // Re-enable button (in case modal is still open due to error)
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = 'Update Attendance';
        }
    }
}

// New function to preserve current filter and sort state
function preserveCurrentFilters() {
    const searchInput = document.getElementById('attendanceStudentSearchInput');
    const sortSelect = document.getElementById('attendanceSortSelect');
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
    // Get current quick filter selection
    const activeQuickFilter = document.querySelector('[id^="attendanceQuickFilter-"].active');
    const quickFilterType = activeQuickFilter ? activeQuickFilter.id.replace('attendanceQuickFilter-', '') : 'all';
    
    return {
        searchTerm: searchInput ? searchInput.value : '',
        sortBy: sortSelect ? sortSelect.value : 'name-asc',
        selectedMonth: monthFilter ? monthFilter.value : '',
        selectedDay: dayFilter ? dayFilter.value : '',
        quickFilter: quickFilterType
    };
}

// New function to refresh data and restore filters
async function refreshAttendanceDataWithFilters(savedFilters) {
    try {
        console.log('=== REFRESHING ATTENDANCE DATA WITH FILTERS ===');
        console.log('Saved filters:', savedFilters);
        
        // Show a subtle loading indicator
        showRefreshingIndicator();
        
        // Reload attendance data from API
        const response = await fetch(`/Faculty/GetCourseAttendance?assignedCourseId=${currentAttendanceData.AssignedCourseId}`, {
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
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to refresh attendance records');
        }

        console.log('Successfully refreshed attendance data');
        
        // Update the data arrays with fresh data
        attendanceRecordsData = data.attendance_records || [];
        
        // Restore the saved filters and sorts
        restoreFiltersAndApply(savedFilters);
        
        // Hide the loading indicator
        hideRefreshingIndicator();
        
        console.log('Filters restored and data refreshed successfully');
        
    } catch (error) {
        console.error('Error refreshing attendance data:', error);
        hideRefreshingIndicator();
        
        // If refresh fails, just update local data as fallback
        updateLocalDataOnly();
    }
}

// Function to restore filters and apply them
function restoreFiltersAndApply(savedFilters) {
    console.log('=== RESTORING FILTERS ===');
    console.log('Restoring filters:', savedFilters);
    
    // Restore form values
    const searchInput = document.getElementById('attendanceStudentSearchInput');
    const sortSelect = document.getElementById('attendanceSortSelect');
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
    if (searchInput) searchInput.value = savedFilters.searchTerm || '';
    if (sortSelect) sortSelect.value = savedFilters.sortBy || 'name-asc';
    if (monthFilter) monthFilter.value = savedFilters.selectedMonth || '';
    if (dayFilter) dayFilter.value = savedFilters.selectedDay || '';
    
    // Restore quick filter selection
    const quickFilterType = savedFilters.quickFilter || 'all';
    attendanceQuickFilter(quickFilterType);
    
    // Apply the restored filters
    applyAttendanceFilters();
    
    // Update summary cards and render table
    updateAttendanceSummaryCards();
    renderAttendanceRecordsTable();
    
    console.log('======================');
}

// Function to update only local data (fallback when refresh fails)
function updateLocalDataOnly() {
    console.log('Updating local data only (fallback mode)');
    
    const globalData = window.attendanceUpdateGlobals.get();
    if (globalData && globalData.attendanceId) {
        // Update the local record
        const localRecord = attendanceRecordsData.find(r => r.attendance_id === globalData.attendanceId);
        if (localRecord) {
            localRecord.status = globalData.status;
            
            // Update the dropdown's data-current-status attribute
            if (globalData.selectElement) {
                globalData.selectElement.setAttribute('data-current-status', globalData.status);
                globalData.selectElement.classList.remove('bg-green-100', 'text-green-800', 'border-green-200', 
                                               'bg-yellow-100', 'text-yellow-800', 'border-yellow-200',
                                               'bg-red-100', 'text-red-800', 'border-red-200');
                globalData.selectElement.classList.add(...getAttendanceStatusClasses(globalData.status).split(' '));
                globalData.selectElement.disabled = false; // Re-enable dropdown
                
                // Update the record data in the dropdown as well
                const updatedRecordJson = JSON.stringify(localRecord).replace(/"/g, '&quot;');
                globalData.selectElement.setAttribute('data-record', updatedRecordJson);
            }
            
            // Re-apply current filters to update filtered data
            applyAttendanceFilters();
            
            // Update summary cards and table
            updateAttendanceSummaryCards();
        }
    }
}

// Function to show subtle refreshing indicator
function showRefreshingIndicator() {
    const notificationArea = document.getElementById('attendanceNotificationArea');
    if (!notificationArea) return;
    
    // Remove any existing refresh notification
    const existingRefresh = notificationArea.querySelector('.refresh-indicator');
    if (existingRefresh) existingRefresh.remove();
    
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'refresh-indicator bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 opacity-100 text-sm min-w-[200px]';
    refreshIndicator.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-sync fa-spin mr-2 text-blue-600"></i>
            <span>Refreshing data...</span>
        </div>
    `;
    
    notificationArea.appendChild(refreshIndicator);
}

// Function to hide refreshing indicator
function hideRefreshingIndicator() {
    const refreshIndicator = document.querySelector('.refresh-indicator');
    if (refreshIndicator) {
        refreshIndicator.style.opacity = '0';
        refreshIndicator.style.transform = 'translateX(20px)';
        setTimeout(() => {
            if (refreshIndicator && refreshIndicator.parentElement) {
                refreshIndicator.remove();
            }
        }, 300);
    }
}

// Enhanced reloadAttendance function that preserves filters
function reloadAttendance() {
    if (currentAttendanceData && currentAttendanceData.AssignedCourseId) {
        // Preserve current filters before reloading
        const currentFilters = preserveCurrentFilters();
        console.log('Manual reload - preserving filters:', currentFilters);
        
        // Show loading state
        showAttendanceLoading();
        
        // Load fresh data and restore filters
        loadAttendanceFromAPIWithFilters(currentAttendanceData.AssignedCourseId, currentFilters);
    }
}

// Enhanced loadAttendanceFromAPI that can restore filters after loading
async function loadAttendanceFromAPIWithFilters(assignedCourseId, savedFilters = null) {
    try {
        console.log(`=== LOADING ATTENDANCE FROM API WITH FILTERS ===`);
        console.log(`Assigned Course ID: ${assignedCourseId} (type: ${typeof assignedCourseId})`);
        console.log('Saved filters to restore:', savedFilters);
        
        const url = `/Faculty/GetCourseAttendance?assignedCourseId=${assignedCourseId}`;
        console.log(`Request URL: ${url}`);
        
        // Make API call to get attendance records
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log(`HTTP Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fresh API data loaded');
        
        if (!data.success) {
            showAttendanceError(data.message || 'Failed to load attendance records');
            return;
        }

        // Update modal header with course info
        updateAttendanceHeader(data);
        
        // Process attendance data
        processAttendanceData(data);
        
        // If we have saved filters, restore them
        if (savedFilters) {
            console.log('Restoring saved filters after data load');
            restoreFiltersAndApply(savedFilters);
        }
        
        // Show content
        showAttendanceContent();
        
    } catch (error) {
        console.error('Error loading attendance from API with filters:', error);
        showAttendanceError('Failed to load attendance records. Please try again later.');
    }
}

function showAttendanceUpdateNotification(record, newStatus) {
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
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
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
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const dayFilter = document.getElementById('attendanceDayFilter');
    
    if (!searchInput || !sortSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const selectedMonth = monthFilter ? monthFilter.value : '';
    const selectedDay = dayFilter ? dayFilter.value : '';
    
    // Apply search filter
    filteredAttendanceRecords = attendanceRecordsData.filter(record => {
        const matchesSearch = record.student_name.toLowerCase().includes(searchTerm) ||
                             record.student_number.toLowerCase().includes(searchTerm);
        
        const recordDate = new Date(record.attendance_date);
        const matchesMonth = !selectedMonth || (recordDate.getMonth() + 1) == selectedMonth;
        const matchesDay = !selectedDay || recordDate.getDate() == selectedDay;
        
        return matchesSearch && matchesMonth && matchesDay;
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
    
    // Update summary cards with filtered data
    updateAttendanceSummaryCards();
    
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
    
    // Update summary cards with filtered data
    updateAttendanceSummaryCards();
    
    renderAttendanceRecordsTable();
}

function clearAttendanceFilters() {
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

// Handle escape key for attendance modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (window.attendanceUpdateModal) {
            cancelAttendanceUpdateEnhanced();
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
