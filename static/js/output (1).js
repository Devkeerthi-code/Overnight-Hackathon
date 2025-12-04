/* ============================================
   EXAMPLE OUTPUT TEMPLATE - JavaScript
   ============================================ */

   document.addEventListener('DOMContentLoaded', function() {
    const assignButtons = document.querySelectorAll('.eo-assign-btn');
  
    // Assign button click handler
    assignButtons.forEach(button => {
      button.addEventListener('click', function() {
        const card = this.closest('.eo-role-card');
        
        // Extract role data
        const name = card.querySelector('.eo-role-name')?.textContent?.trim();
        const position = card.querySelector('.eo-role-position')?.textContent?.trim();
        const email = card.querySelector('.eo-role-value')?.textContent?.trim();
        
        // Get all role values (email is first, phone is second)
        const roleValues = Array.from(card.querySelectorAll('.eo-role-value'));
        const phone = roleValues.length > 1 ? roleValues[1].textContent?.trim() : 'N/A';
  
        // Create assignment object
        const assignmentData = {
          name: name,
          position: position,
          email: email,
          phone: phone,
          timestamp: new Date().toISOString()
        };
  
        // Log to console
        console.log('Role Assignment:', assignmentData);
        console.log(`Assigned ${position}: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Phone: ${phone}`);
  
        // Update button state
        if (!this.classList.contains('assigned')) {
          this.textContent = '✓ Assigned';
          this.classList.add('assigned');
          this.disabled = true;
  
          // Optional: Show subtle feedback
          console.log(`✓ Assignment complete for ${name}`);
        }
      });
  
      // Keyboard accessibility
      button.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  
    // Page load animation
    document.querySelector('.example-output-container').style.opacity = '1';
  });