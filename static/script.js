
async function submitAll() {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';
    
    try {
        // Submit config
        const configResponse = await fetch('/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: document.getElementById('configData').value
        });
        
        if (!configResponse.ok) throw new Error('Config submission failed');

        // Submit secrets
        const secretsResponse = await fetch('/api/secrets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: document.getElementById('secretsData').value
        });
        
        if (!secretsResponse.ok) throw new Error('Secrets submission failed');

        // Submit resume
        const resumeResponse = await fetch('/api/resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: document.getElementById('resumeData').value
        });
        
        if (!resumeResponse.ok) throw new Error('Resume submission failed');

        // Start the bot
        const startResponse = await fetch('/start');
        if (!startResponse.ok) throw new Error('Bot start failed');

        statusDiv.textContent = 'All data submitted and bot started successfully!';
        statusDiv.classList.add('success');
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.classList.add('error');
    }
}
