// Add LinkedIn login button event listener
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('linkedinLoginBtn');
    const statusDiv = document.getElementById('status');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.open('/linkedin/login', 'LinkedIn Login', 'width=600,height=700');
        });
    }

    // Listen for messages from the popup
    window.addEventListener('message', function(event) {
        if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
            statusDiv.textContent = 'LinkedIn authentication successful!';
            statusDiv.className = 'status success';
            // Store the profile data
            localStorage.setItem('linkedinProfile', JSON.stringify(event.data.profile));
        } else if (event.data.type === 'LINKEDIN_AUTH_ERROR') {
            statusDiv.textContent = 'LinkedIn authentication failed';
            statusDiv.className = 'status error';
        }
    });
});



function getExperienceLevels() {
    const getCheckboxValue = (value) => {
        const element = document.querySelector(`input[name="expLevel"][value="${value}"]`);
        return element ? element.checked : false;
    };

    return {
        "internship": getCheckboxValue("internship"),
        "entry": getCheckboxValue("entry"),
        "associate": getCheckboxValue("associate"),
        "mid-senior level": getCheckboxValue("mid-senior level"),
        "director": getCheckboxValue("director"),
        "executive": getCheckboxValue("executive")
    };
}

function getJobTypes() {
    return {
        "full-time": document.querySelector('input[name="jobType"][value="full-time"]').checked,
        "contract": document.querySelector('input[name="jobType"][value="contract"]').checked,
        "part-time": document.querySelector('input[name="jobType"][value="part-time"]').checked,
        "temporary": document.querySelector('input[name="jobType"][value="temporary"]').checked,
        "internship": document.querySelector('input[name="jobType"][value="internship"]').checked,
        "other": document.querySelector('input[name="jobType"][value="other"]').checked,
        "volunteer": document.querySelector('input[name="jobType"][value="volunteer"]').checked
    };
}

function getDatePosted() {
    return {
        "all time": document.querySelector('input[name="datePosted"][value="all time"]').checked,
        "month": document.querySelector('input[name="datePosted"][value="month"]').checked,
        "week": document.querySelector('input[name="datePosted"][value="week"]').checked,
        "24 hours": document.querySelector('input[name="datePosted"][value="24 hours"]').checked
    };
}

function textareaToArray(id) {
    const value = document.getElementById(id).value.trim();
    return value ? value.split('\n').map(item => item.trim()).filter(item => item.length > 0) : [];
}

function submitAll() {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';

    try {
        // Prepare config data
        const configData = {
            remote: document.getElementById('remote').checked,
            experienceLevel: getExperienceLevels(),
            jobTypes: getJobTypes(),
            date: getDatePosted(),
            positions: textareaToArray('positions'),
            locations: textareaToArray('locations'),
            distance: parseInt(document.getElementById('distance').value),
            companyBlacklist: textareaToArray('blacklistCompanies'),
            titleBlacklist: null
        };

        // Prepare secrets data
        const secretsData = {
            openai_api_key: document.getElementById('openaiKey').value
        };

        // Resume data temporarily disabled
        /*const resumeData = {
            content: document.getElementById('resumeText').value
        };*/

        // Submit data to API endpoints
        Promise.all([
            fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData)
            }),
            fetch('/api/secrets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(secretsData)
            })
            /*fetch('/api/resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumeData)
            })*/
        ])
        .then(() => fetch('/start'))
        .then(response => {
            if (!response.ok) throw new Error('Failed to start the bot');
            statusDiv.textContent = 'Bot started successfully!';
            statusDiv.classList.add('success');
        })
        .catch(error => {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.classList.add('error');
        });
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.classList.add('error');
    }
}