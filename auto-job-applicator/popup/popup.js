document.addEventListener('DOMContentLoaded', function() {
  // Tab Navigation
  setupTabs();
  
  // Load saved data
  loadProfileData();
  loadSettings();
  loadApplicationHistory();
  
  // Setup form listeners
  setupFormListeners();
  
  // Setup button listeners
  setupButtonListeners();
});

// Tab Navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetId = tab.id.replace('Tab', 'Section');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Load saved profile data from storage
function loadProfileData() {
  chrome.storage.sync.get('profileData', function(data) {
    if (data.profileData) {
      const profile = data.profileData;
      
      // Fill basic info
      document.getElementById('fullName').value = profile.fullName || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';
      document.getElementById('location').value = profile.location || '';
      document.getElementById('linkedin').value = profile.linkedin || '';
      document.getElementById('website').value = profile.website || '';
      document.getElementById('summary').value = profile.summary || '';
      document.getElementById('skills').value = profile.skills || '';
      
      // Fill work experience
      if (profile.workExperience && profile.workExperience.length > 0) {
        const workContainer = document.getElementById('workExperience');
        // Clear default entry
        workContainer.innerHTML = '';
        
        profile.workExperience.forEach(work => {
          const workEntry = createWorkExperienceEntry();
          workEntry.querySelector('[name="workTitle[]"]').value = work.title || '';
          workEntry.querySelector('[name="workCompany[]"]').value = work.company || '';
          workEntry.querySelector('[name="workDuration[]"]').value = work.duration || '';
          workEntry.querySelector('[name="workDescription[]"]').value = work.description || '';
          workContainer.appendChild(workEntry);
        });
      }
      
      // Fill education
      if (profile.education && profile.education.length > 0) {
        const eduContainer = document.getElementById('education');
        // Clear default entry
        eduContainer.innerHTML = '';
        
        profile.education.forEach(edu => {
          const eduEntry = createEducationEntry();
          eduEntry.querySelector('[name="eduDegree[]"]').value = edu.degree || '';
          eduEntry.querySelector('[name="eduInstitution[]"]').value = edu.institution || '';
          eduEntry.querySelector('[name="eduYear[]"]').value = edu.year || '';
          eduContainer.appendChild(eduEntry);
        });
      }
    }
  });
}

// Load application settings
function loadSettings() {
  chrome.storage.sync.get('appSettings', function(data) {
    if (data.appSettings) {
      const settings = data.appSettings;
      
      document.getElementById('autoDetect').checked = settings.autoDetect !== false;
      document.getElementById('showNotification').checked = settings.showNotification !== false;
      document.getElementById('oneClickSubmit').checked = settings.oneClickSubmit !== false;
      document.getElementById('defaultResume').value = settings.defaultResume || '';
    }
  });
}

// Load application history
function loadApplicationHistory() {
  chrome.storage.sync.get('applicationHistory', function(data) {
    const historyContainer = document.getElementById('applicationHistory');
    
    if (data.applicationHistory && data.applicationHistory.length > 0) {
      historyContainer.innerHTML = '';
      
      // Sort by date (newest first)
      const sortedHistory = data.applicationHistory.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      sortedHistory.forEach(app => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const statusClass = app.status === 'success' ? 'status-success' : 'status-error';
        
        historyItem.innerHTML = `
          <div class="history-item-title">${app.jobTitle || 'Unknown Job'}</div>
          <div class="history-item-company">${app.company || 'Unknown Company'}</div>
          <div class="history-item-date">${formatDate(app.date)}</div>
          <div class="history-item-status ${statusClass}">${app.status === 'success' ? 'Submitted' : 'Failed'}</div>
        `;
        
        historyContainer.appendChild(historyItem);
      });
    } else {
      // Show empty state
      historyContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history fa-3x"></i>
          <p>No application history yet. Your submitted applications will appear here.</p>
        </div>
      `;
    }
  });
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Setup form listeners
function setupFormListeners() {
  // Profile form submission
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveProfileData();
  });
  
  // Settings form submission
  document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveSettings();
  });
  
  // Add work experience button
  document.getElementById('addWorkBtn').addEventListener('click', function() {
    const workContainer = document.getElementById('workExperience');
    const workEntry = createWorkExperienceEntry();
    workContainer.appendChild(workEntry);
  });
  
  // Add education button
  document.getElementById('addEduBtn').addEventListener('click', function() {
    const eduContainer = document.getElementById('education');
    const eduEntry = createEducationEntry();
    eduContainer.appendChild(eduEntry);
  });
  
  // Listen for remove buttons (delegated event)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-btn')) {
      const button = e.target.closest('.remove-btn');
      const entry = button.closest('.work-entry, .education-entry');
      entry.remove();
    }
  });
  
  // History search
  document.getElementById('historySearch').addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const historyItems = document.querySelectorAll('.history-item');
    
    historyItems.forEach(item => {
      const title = item.querySelector('.history-item-title').textContent.toLowerCase();
      const company = item.querySelector('.history-item-company').textContent.toLowerCase();
      
      if (title.includes(searchText) || company.includes(searchText)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Create a new work experience entry
function createWorkExperienceEntry() {
  const entry = document.createElement('div');
  entry.className = 'work-entry';
  entry.innerHTML = `
    <div class="form-group">
      <label>Job Title</label>
      <input type="text" name="workTitle[]" placeholder="Software Engineer">
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" name="workCompany[]" placeholder="Company Name">
    </div>
    <div class="form-group">
      <label>Duration</label>
      <input type="text" name="workDuration[]" placeholder="Jan 2020 - Present">
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea name="workDescription[]" rows="2" placeholder="Brief description of responsibilities and achievements"></textarea>
    </div>
    <button type="button" class="remove-btn" title="Remove this entry"><i class="fas fa-trash"></i></button>
  `;
  return entry;
}

// Create a new education entry
function createEducationEntry() {
  const entry = document.createElement('div');
  entry.className = 'education-entry';
  entry.innerHTML = `
    <div class="form-group">
      <label>Degree</label>
      <input type="text" name="eduDegree[]" placeholder="Bachelor of Science in Computer Science">
    </div>
    <div class="form-group">
      <label>Institution</label>
      <input type="text" name="eduInstitution[]" placeholder="University Name">
    </div>
    <div class="form-group">
      <label>Graduation Year</label>
      <input type="text" name="eduYear[]" placeholder="2019">
    </div>
    <button type="button" class="remove-btn" title="Remove this entry"><i class="fas fa-trash"></i></button>
  `;
  return entry;
}

// Save profile data to storage
function saveProfileData() {
  const profileData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    location: document.getElementById('location').value,
    linkedin: document.getElementById('linkedin').value,
    website: document.getElementById('website').value,
    summary: document.getElementById('summary').value,
    skills: document.getElementById('skills').value,
    workExperience: [],
    education: []
  };
  
  // Get work experience entries
  const workEntries = document.querySelectorAll('.work-entry');
  workEntries.forEach(entry => {
    profileData.workExperience.push({
      title: entry.querySelector('[name="workTitle[]"]').value,
      company: entry.querySelector('[name="workCompany[]"]').value,
      duration: entry.querySelector('[name="workDuration[]"]').value,
      description: entry.querySelector('[name="workDescription[]"]').value
    });
  });
  
  // Get education entries
  const eduEntries = document.querySelectorAll('.education-entry');
  eduEntries.forEach(entry => {
    profileData.education.push({
      degree: entry.querySelector('[name="eduDegree[]"]').value,
      institution: entry.querySelector('[name="eduInstitution[]"]').value,
      year: entry.querySelector('[name="eduYear[]"]').value
    });
  });
  
  // Save to Chrome storage
  chrome.storage.sync.set({ profileData }, function() {
    showNotification('Profile saved successfully!');
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    autoDetect: document.getElementById('autoDetect').checked,
    showNotification: document.getElementById('showNotification').checked,
    oneClickSubmit: document.getElementById('oneClickSubmit').checked,
    defaultResume: document.getElementById('defaultResume').value
  };
  
  chrome.storage.sync.set({ appSettings: settings }, function() {
    showNotification('Settings saved successfully!');
  });
}

// Setup button listeners
function setupButtonListeners() {
  // Fill current form button
  document.getElementById('fillCurrentBtn').addEventListener('click', function() {
    executeContentScript('fillForm');
  });
  
  // Auto submit button
  document.getElementById('autoSubmitBtn').addEventListener('click', async function() {
    try {
      const response = await fetch('https://' + window.location.hostname + '/start', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.status === 'completed') {
        showNotification('Application submitted successfully!');
      } else {
        showNotification('Failed to submit application', true);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Failed to connect to the application server', true);
    }
  });
  
  // Export data button
  document.getElementById('exportDataBtn').addEventListener('click', function() {
    exportData();
  });
  
  // Import data button
  document.getElementById('importDataBtn').addEventListener('click', function() {
    importData();
  });
  
  // Clear data button
  document.getElementById('clearDataBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all your saved data? This cannot be undone.')) {
      clearAllData();
    }
  });
}

// Execute a content script action on the current tab
function executeContentScript(action) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: action });
  });
}

// Show a notification
function showNotification(message, isError = false) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content and style
  notification.textContent = message;
  notification.className = 'notification ' + (isError ? 'error' : 'success');
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Export user data
function exportData() {
  chrome.storage.sync.get(['profileData', 'appSettings', 'applicationHistory'], function(data) {
    const exportData = JSON.stringify(data, null, 2);
    const blob = new Blob([exportData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-job-applicator-data.json';
    a.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  });
}

// Import user data
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate imported data
        if (!data.profileData && !data.appSettings && !data.applicationHistory) {
          throw new Error('Invalid data format');
        }
        
        // Save imported data to storage
        chrome.storage.sync.set(data, function() {
          // Reload the data in the UI
          loadProfileData();
          loadSettings();
          loadApplicationHistory();
          
          showNotification('Data imported successfully!');
        });
      } catch (error) {
        showNotification('Error importing data: ' + error.message, true);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Clear all user data
function clearAllData() {
  chrome.storage.sync.clear(function() {
    // Reset UI to default state
    document.getElementById('profileForm').reset();
    document.getElementById('settingsForm').reset();
    
    // Clear work experience and education entries except for the first one
    const workContainer = document.getElementById('workExperience');
    const eduContainer = document.getElementById('education');
    
    workContainer.innerHTML = '';
    workContainer.appendChild(createWorkExperienceEntry());
    
    eduContainer.innerHTML = '';
    eduContainer.appendChild(createEducationEntry());
    
    // Reset history
    loadApplicationHistory();
    
    showNotification('All data has been cleared');
  });
}
