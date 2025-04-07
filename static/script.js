
function getCheckedValues(name) {
    const checkboxes = document.getElementsByName(name);
    const checkedValues = {};
    checkboxes.forEach(checkbox => {
        checkedValues[checkbox.value] = checkbox.checked;
    });
    return checkedValues;
}

function textareaToArray(id) {
    return document.getElementById(id).value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

function submitAll() {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';
    
    try {
        // Prepare config data
        const configData = {
            remote: true,
            jobTypes: getCheckedValues('jobType'),
            experienceLevel: getCheckedValues('expLevel'),
            date: getCheckedValues('datePosted'),
            positions: textareaToArray('positions'),
            locations: textareaToArray('locations'),
            distance: parseInt(document.getElementById('distance').value),
            companyBlacklist: textareaToArray('blacklistCompanies'),
            titleBlacklist: textareaToArray('blacklistTitles')
        };

        // Prepare secrets data
        const secretsData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
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
