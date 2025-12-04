/* ============================================
   LANDING TEMPLATE - JavaScript (Flask Optimized)
   ============================================ */

   document.addEventListener('DOMContentLoaded', function() {
    // SCOPING: All variables are defined inside this function to avoid global naming conflicts.
    
    const domElements = {
      uploadBtn: document.getElementById('uploadBtn'),
      pdfInput: document.getElementById('pdfInput'),
      uploadBox: document.getElementById('uploadBox'),
      fileListSection: document.getElementById('fileListSection'),
      fileList: document.getElementById('fileList'),
      submitFilesBtn: document.getElementById('submitFilesBtn'),
      landingContainer: document.querySelector('.landing-container')
    };
  
    // State management
    let selectedFiles = [];
  
    // Initialize Page Animation
    if (domElements.landingContainer) {
      domElements.landingContainer.style.opacity = '1';
    }
  
    /* ============================================
       EVENT LISTENERS
       ============================================ */
  
    // 1. Upload Button Trigger
    if (domElements.uploadBtn) {
      domElements.uploadBtn.addEventListener('click', function() {
        domElements.pdfInput.click();
      });
    }
  
    // 2. File Input Change
    if (domElements.pdfInput) {
      domElements.pdfInput.addEventListener('change', function() {
        processIncomingFiles(this.files);
      });
    }
  
    // 3. Drag and Drop Events
    if (domElements.uploadBox) {
      ['dragover', 'dragenter'].forEach(eventName => {
        domElements.uploadBox.addEventListener(eventName, function(e) {
          e.preventDefault();
          e.stopPropagation();
          domElements.uploadBox.classList.add('drag-over');
        });
      });
  
      ['dragleave', 'drop'].forEach(eventName => {
        domElements.uploadBox.addEventListener(eventName, function(e) {
          e.preventDefault();
          e.stopPropagation();
          domElements.uploadBox.classList.remove('drag-over');
        });
      });
  
      domElements.uploadBox.addEventListener('drop', function(e) {
        processIncomingFiles(e.dataTransfer.files);
      });
    }
  
    // 4. Submit/Upload Button
    if (domElements.submitFilesBtn) {
      domElements.submitFilesBtn.addEventListener('click', uploadFilesToFlask);
    }
  
    /* ============================================
       CORE FUNCTIONS
       ============================================ */
  
    // Process and filter incoming files
    function processIncomingFiles(fileListObject) {
      const newFiles = Array.from(fileListObject).filter(file => file.type === 'application/pdf');
  
      if (newFiles.length === 0) {
        alert('Please select valid PDF files');
        return;
      }
  
      // Add new files to our state array
      selectedFiles = [...selectedFiles, ...newFiles];
      
      console.log(`Added ${newFiles.length} files. Total: ${selectedFiles.length}`);
      
      renderFileList();
    }
  
    // Render the list of files to the DOM
    function renderFileList() {
      domElements.fileList.innerHTML = '';
  
      selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
  
        // Create content container
        const fileContent = document.createElement('div');
        Object.assign(fileContent.style, {
          display: 'flex',
          alignItems: 'center',
          flex: '1'
        });
  
        // Icon
        const fileIcon = document.createElement('span');
        fileIcon.className = 'file-item-icon';
        fileIcon.textContent = '📄';
  
        // Name
        const fileName = document.createElement('span');
        fileName.className = 'file-item-name';
        fileName.textContent = file.name;
  
        // Size
        const fileSize = document.createElement('span');
        fileSize.className = 'file-item-size';
        fileSize.textContent = formatBytes(file.size);
  
        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-item-remove';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
        
        // Bind remove event with specific index
        removeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          removeFileFromList(index);
        });
  
        // Append elements
        fileContent.appendChild(fileIcon);
        fileContent.appendChild(fileName);
        fileContent.appendChild(fileSize);
        fileItem.appendChild(fileContent);
        fileItem.appendChild(removeBtn);
  
        domElements.fileList.appendChild(fileItem);
      });
  
      // Toggle visibility based on list content
      if (selectedFiles.length > 0) {
        domElements.fileListSection.classList.add('show');
      } else {
        domElements.fileListSection.classList.remove('show');
      }
    }
  
    // Remove a specific file from the array
    function removeFileFromList(index) {
      selectedFiles.splice(index, 1);
      renderFileList();
    }
  
    // Helper: Format bytes to human readable string
    function formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    /* ============================================
       FLASK COMMUNICATION
       ============================================ */
  
    function uploadFilesToFlask() {
      if (selectedFiles.length === 0) {
        alert('Please select at least one PDF file');
        return;
      }
  
      const formData = new FormData();
      
      // Append all files to FormData
      selectedFiles.forEach((file) => {
        formData.append('files[]', file);
      });
  
      // Disable button to prevent double submission
      domElements.submitFilesBtn.disabled = true;
      domElements.submitFilesBtn.textContent = 'Uploading...';
  
      // Send to Flask
      fetch('/upload_handler', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('Server Success:', data);
        alert(`Success! Saved ${data.files.length} PDFs to the server.`);
        
        // Optional: Clear list on success
        selectedFiles = [];
        renderFileList();
      })
      .catch(error => {
        console.error('Upload Error:', error);
        alert('Failed to upload files. Check the console for details.');
      })
      .finally(() => {
        // Re-enable button
        domElements.submitFilesBtn.disabled = false;
        domElements.submitFilesBtn.textContent = 'Submit Files';
      });
    }
  });