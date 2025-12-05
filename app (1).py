import os
from flask import Flask, render_template, url_for, request, jsonify
from werkzeug.utils import secure_filename
from groq import Groq 
import pdf_utils

app = Flask(__name__)   

# CONFIGURATION
UPLOAD_FOLDER = 'uploads'
TEXT_FOLDER = 'texts'
TEAMS_FILE = 'teams.json' 
os.environ["GROQ_API_KEY"] = "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"  # REPLACE THIS WITH YOUR ACTUAL KEY

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def load_teams_context():
    try:
        with open(TEAMS_FILE, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "No team context available."

@app.route('/')
def intro():
    return render_template('landing.html')

@app.route('/upload_handler', methods=['POST'])
def upload_handler():
    if 'files[]' not in request.files:
        return jsonify({"error": "No files received"}), 400
    
    files = request.files.getlist('files[]')
    saved_files = []
    converted_files = []

    # Optional: Clean old text files
    # files_to_clean = glob.glob(os.path.join(TEXT_FOLDER, '*'))
    # for f in files_to_clean: os.remove(f)

    for file in files:
        if file.filename == '' or not file:
            continue
            
        filename = secure_filename(file.filename)
        pdf_save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(pdf_save_path)
        saved_files.append(filename)

        try:
            extracted_text = pdf_utils.convertPdfToText(pdf_save_path)
            txt_filename = os.path.splitext(filename)[0] + ".txt"
            pdf_utils.storeTextsInFolder(extracted_text, txt_filename, TEXT_FOLDER)
            converted_files.append(txt_filename)
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

    return jsonify({
        "message": "Files processed", 
        "pdfs_saved": saved_files,
        "texts_generated": converted_files
    }), 200

@app.route('/output', methods=['GET'])
def output():
    return render_template('output.html')

@app.route('/api/analyze')
def analyze_text():
    try:
        # 1. Read PDF Text
        all_text_content = ""
        text_files_path = os.path.join(os.getcwd(), TEXT_FOLDER)
        
        if os.path.exists(text_files_path):
            for filename in os.listdir(text_files_path):
                if filename.endswith(".txt"):
                    file_path = os.path.join(text_files_path, filename)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        all_text_content += f.read() + "\n\n"
        
        if not all_text_content.strip():
            return jsonify({"error": "No text content found to analyze."}), 404

        # 2. Read Team Context
        teams_context = load_teams_context()

        # 3. Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""
                    You are a project manager for 'FlairEX'. 
                    Analyze the user documents and assign tasks.
                    
                    RULES:
                    1. Assign roles ONLY to people listed in TEAM CONTEXT.
                    2. Use the 'teams' list provided.
                    3. Output JSON only.

                    TEAM CONTEXT:
                    {teams_context}

                    JSON STRUCTURE:
                    {{
                        "summary": "Brief summary of the project.",
                        "key_decisions": ["Decision 1", "Decision 2"],
                        "roles": [
                            {{
                                "team_name": "Team Name",
                                "name": "Lead Name",
                                "position": "Role",
                                "email": "Email",
                                "phone": "Phone"
                            }}
                        ]
                    }}
                    """
                },
                {
                    "role": "user",
                    "content": f"Document Content:\n{all_text_content}"
                }
            ],
            model="qwen/qwen3-32b", 
            response_format={"type": "json_object"},
        )

        ai_response = chat_completion.choices[0].message.content
        return ai_response, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)