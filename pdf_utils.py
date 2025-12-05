from pydoc import text
from pypdf import PdfReader
import os 

def convertPdfToText(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def storeTextsInFolder(text_content, filename, folder_name):
    directory_path = os.path.join(os.getcwd(), folder_name)

    # Ensure the directory exists
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        print(f"Created directory: {directory_path}")

    
    # create the full path to the text file
    file_path = os.path.join(directory_path, filename)

    # write the text content to the file
    try:
        with open(file_path, 'w', encoding = "utf-8") as f:
            f.write(text_content)
        print(f"Successfully wrote to: {file_path}")
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

