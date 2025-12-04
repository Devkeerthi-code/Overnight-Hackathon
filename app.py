import os 
from flask import Flask, render_template, url_for, request, jsonify
from werkzeug.utils import secure_filename

import pdf_utils

app = Flask(__name__) 

UPLOAD_FOLDER = 'uploads'
TEXT_FOLDER = 'texts'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def intro():
    return render_template('landing.html')

# This is a "reciever function"
@app.route('/upload_handler', methods=['POST'])
def upload_handler():
    if 'files[]' not in request.files:
        return jsonify({"error": "No files received"}), 400
    
    files = request.files.getlist('files[]')
    
    saved_files = []
    converted_files = []

    for file in files:
        if file.filename == '':
            continue
            
        if file:
            # 1. Save the PDF to 'uploads'
            filename = secure_filename(file.filename)
            pdf_save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(pdf_save_path)
            saved_files.append(filename)

            # 2. Convert to Text immediately
            try:
                # Extract text using your module
                extracted_text = pdf_utils.convertPdfToText(pdf_save_path)
                
                # Create a .txt filename (e.g., document.pdf -> document.txt)
                txt_filename = os.path.splitext(filename)[0] + ".txt"
                
                # Save text using your module
                pdf_utils.storeTextsInFolder(extracted_text, txt_filename, TEXT_FOLDER)
                converted_files.append(txt_filename)
                
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

    return jsonify({
        "message": f"Processed {len(saved_files)} files", 
        "pdfs_saved": saved_files,
        "texts_generated": converted_files
    }), 200

@app.route('/output', methods=['GET'])
def output():
    return render_template('output.html')
    

if __name__ == "__main__":
    app.run(debug= True)


