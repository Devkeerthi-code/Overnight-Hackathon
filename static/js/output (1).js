/* ============================================
   EXAMPLE OUTPUT TEMPLATE - JavaScript (Fixed Buffer)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. IMMEDIATE CLEANUP & LOADING STATE
    // This solves the issue of seeing the old data first.
    const summarySection = document.querySelector('.eo-section-summary .eo-section-body');
    const decisionsList = document.querySelector('.eo-decisions-list');
    const rolesGrid = document.querySelector('.eo-roles-grid');
    
    // Inject Spinner Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { text-align: center; color: #666; font-family: sans-serif; }
    `;
    document.head.appendChild(style);

    // Apply Loader
    if (summarySection) summarySection.innerHTML = '<div class="loader"></div><p class="loading-text">Analyzing Documents...</p>';
    if (decisionsList) decisionsList.innerHTML = '';
    if (rolesGrid) rolesGrid.innerHTML = '';

    // Show Container
    const container = document.querySelector('.example-output-container');
    if (container) container.style.opacity = '1';


    // 2. Fetch Data
    fetch('/api/analyze')
        .then(response => response.json())
        .then(data => {
            populateUI(data);
        })
        .catch(err => {
            console.error(err);
            if (summarySection) summarySection.innerHTML = '<p style="color:red">Analysis Failed.</p>';
        });

    function populateUI(data) {
        // Summary
        if (summarySection && data.summary) {
            summarySection.innerHTML = `<p class="eo-example-text">${data.summary}</p>`;
        }

        // Decisions
        if (decisionsList && data.key_decisions) {
            data.key_decisions.forEach(d => {
                const li = document.createElement('li');
                li.className = 'eo-decision-item';
                li.textContent = d;
                decisionsList.appendChild(li);
            });
        }

        // Roles
        if (rolesGrid && data.roles) {
            data.roles.forEach(role => {
                let avatar = '👤';
                // Simple avatar logic based on team name
                if((role.team_name || '').toLowerCase().includes('finance')) avatar = '💰';
                if((role.team_name || '').toLowerCase().includes('tech')) avatar = '💻';

                const card = `
                    <article class="eo-role-card">
                        <div class="eo-role-card-header">
                            <div class="eo-role-avatar">${avatar}</div>
                            <div class="eo-role-title-section">
                                <h3 class="eo-role-name">${role.name}</h3>
                                <span class="eo-role-position">${role.team_name}</span>
                            </div>
                        </div>
                        <div class="eo-role-card-body">
                            <div class="eo-role-info"><span class="eo-role-label">Email</span><p class="eo-role-value">${role.email}</p></div>
                            <div class="eo-role-info"><span class="eo-role-label">Phone</span><p class="eo-role-value">${role.phone || 'N/A'}</p></div>
                        </div>
                        <div class="eo-role-card-footer">
                            <button class="btn btn-primary btn-sm eo-assign-btn">Assign</button>
                        </div>
                    </article>
                `;
                rolesGrid.insertAdjacentHTML('beforeend', card);
            });

            // Re-bind buttons
            document.querySelectorAll('.eo-assign-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.textContent = '✓ Assigned';
                    this.disabled = true;
                    this.classList.add('assigned');
                });
            });
        }
    }
});