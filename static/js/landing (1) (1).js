/* ============================================
   LANDING TEMPLATE - JavaScript (Fixed Redirection)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    const domElements = {
        uploadBtn: document.getElementById('uploadBtn'),
        pdfInput: document.getElementById('pdfInput'),
        uploadBox: document.getElementById('uploadBox'),
        fileListSection: document.getElementById('fileListSection'),
        fileList: document.getElementById('fileList'),
        submitFilesBtn: document.getElementById('submitFilesBtn'),
        landingContainer: document.querySelector('.landing-container')
    };
  
    let selectedFiles = [];
  
    if (domElements.landingContainer) domElements.landingContainer.style.opacity = '1';
  
    // 1. Upload Button Trigger
    if (domElements.uploadBtn) {
        domElements.uploadBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            domElements.pdfInput.click();
        });
    }
  
    // 2. File Input Change
    if (domElements.pdfInput) {
        domElements.pdfInput.addEventListener('change', function() {
            processIncomingFiles(this.files);
        });
    }
  
    // 3. Drag and Drop
    if (domElements.uploadBox) {
        ['dragover', 'dragenter'].forEach(eventName => {
            domElements.uploadBox.addEventListener(eventName, function(e) {
                e.preventDefault(); e.stopPropagation();
                domElements.uploadBox.classList.add('drag-over');
            });
        });
        ['dragleave', 'drop'].forEach(eventName => {
            domElements.uploadBox.addEventListener(eventName, function(e) {
                e.preventDefault(); e.stopPropagation();
                domElements.uploadBox.classList.remove('drag-over');
            });
        });
        domElements.uploadBox.addEventListener('drop', function(e) {
            processIncomingFiles(e.dataTransfer.files);
        });
    }
  
    // 4. Submit Button
    if (domElements.submitFilesBtn) {
        domElements.submitFilesBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Stop any default behavior
            uploadFilesToFlask();
        });
    }
  
    /* --- CORE FUNCTIONS --- */
    function processIncomingFiles(fileListObject) {
        const newFiles = Array.from(fileListObject).filter(file => file.type === 'application/pdf');
        if (newFiles.length === 0) { alert('Please select valid PDF files'); return; }
        selectedFiles = [...selectedFiles, ...newFiles];
        renderFileList();
    }
  
    function renderFileList() {
        domElements.fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('li');
            fileItem.className = 'file-item';
            
            // Simplified for brevity, same logic as before
            fileItem.innerHTML = `
                <div style="display:flex; align-items:center; flex:1">
                    <span class="file-item-icon">📄</span>
                    <span class="file-item-name">${file.name}</span>
                </div>
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-item-remove';
            removeBtn.textContent = '×';
            removeBtn.onclick = (e) => { e.preventDefault(); removeFileFromList(index); };
            
            fileItem.appendChild(removeBtn);
            domElements.fileList.appendChild(fileItem);
        });
  
        if (selectedFiles.length > 0) domElements.fileListSection.classList.add('show');
        else domElements.fileListSection.classList.remove('show');
    }
  
    function removeFileFromList(index) {
        selectedFiles.splice(index, 1);
        renderFileList();
    }
  
    /* --- FLASK COMMUNICATION --- */
    function uploadFilesToFlask() {
        if (selectedFiles.length === 0) { alert('Please select a PDF'); return; }
  
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files[]', file));
  
        domElements.submitFilesBtn.disabled = true;
        domElements.submitFilesBtn.textContent = 'Uploading...';
  
        fetch('/upload_handler', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            console.log("Upload success, redirecting...");
            
            // Alert user
            alert("Upload Successful! Click OK to generate analysis.");
            
            // FORCE REDIRECT TO OUTPUT PAGE
            window.location.href = "/output";
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Upload failed.');
            domElements.submitFilesBtn.disabled = false;
            domElements.submitFilesBtn.textContent = 'Submit Files';
        });
    }
});