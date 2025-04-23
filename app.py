from flask import Flask,request, render_template,jsonify,session,redirect,url_for,flash
from extractor import extract_text
from query_llm import query_llm
from render_pdf import render_contract_pdf
import os
import json
import uuid
from datetime import datetime

app  = Flask(__name__)
app.secret_key = "uuid:1232" 
UPLOAD_FOLDER = "media/file"

# Directory to store contracts
CONTRACTS_DIR = 'contracts'
os.makedirs(CONTRACTS_DIR, exist_ok=True)
# Directory to store custom templates
TEMPLATES_DIR = 'custom_templates'
os.makedirs(TEMPLATES_DIR, exist_ok=True)
# Default templates
default_templates = {
    'employment': None,
    'sales': None,
    'service': None
}

def load_default_templates():
    """Load default templates when the app starts"""
    for contract_type in default_templates.keys():
        template_path = os.path.join('templates', f'{contract_type}_contract_default.html')
        if os.path.exists(template_path):
            with open(template_path, 'r') as file:
                default_templates[contract_type] = file.read()

@app.route('/',methods=['GET','POST'])
def index():
    new_chat = request.args.get('new')
    chat_history = session.get("chat_history", [])
    # print(chat_history)
    if new_chat and new_chat=='True':
        conv = session.get('conversation')
        if conv and len(conv['conversation']) > 0:
            conversation_id = session.get('conversation').get('id')
            chat_index = None
            for i,c in enumerate(chat_history):
                if c.get("id") == conversation_id:
                    chat_index = i
            if(chat_index):
                chat_history[chat_index] = session.get('conversation')
            else:
                chat_history.insert(0,session['conversation'])
            session['chat_history'] = chat_history
            session['conversation'] = {'conversation':[],"id":str(uuid.uuid4())}
        return redirect(url_for('index'))
   
    if "conversation" not in session:
        session["conversation"] = {'conversation':[],"id":str(uuid.uuid4())}

    context = session['conversation']
    # print(chat_history)
    return render_template('index.html',messages=context.get('conversation'),history=chat_history)

@app.route('/api/chat',methods=['GET','POST'])
def chat_llm():
    user_message = request.form.get('message','')
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    file = request.files.get('file')
    if (file):
        file_text = extract_text(file)
        user_message = f'''
                        query: {user_message} analyze the document
                        document: {file_text}
                        '''
    ## call agent Model
    response = query_llm(user_message)
    generated_filename = None
    _assistant = {"text":response,'sender':'assistant'}
    if(generated_filename):
        _assistant['file'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    # Append new conversation turn
    conversation = session.get("conversation", {})
    conversation['conversation'].append({"text": user_message, "sender": 'user'})
    conversation['conversation'].append(_assistant)
    session['conversation'] = conversation
    _response = {"response": response}
    if(generated_filename):
        _response['file_url'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    return jsonify(_response)

    
#clearning session
@app.route("/clear_session",methods=['GET'])
def clear_session():
    session.pop('chat_history',None)
    session.pop('conversation',None)
    return jsonify({'response':"session cleared!"})

@app.route("/history/<string:id>",methods=['GET'])
def history(id):
    chat_history = session.get('chat_history',[])
    save_conversation(session.get('conversation',{}))
    conversation_index = None
    for index,hist in enumerate(chat_history):
            if hist['id'] == id:
                conversation_index = index 
                break
    if conversation_index!=None:
        conversation = chat_history[conversation_index]
        return render_template('index.html',messages=conversation['conversation'],history=chat_history)
        
    return redirect(url_for('index'))

def save_conversation(conversation):
    if conversation.get('conversation')== None or len(conversation.get('conversation'))<1:
        return
    chat_index = None
    chat_history = session.get('chat_history',[])
    for index,hist in enumerate(chat_history):
        if conversation['id'] == hist['id']:
            chat_index = index
            break
    if chat_index!=None:
         chat_history[chat_index] = conversation
    else:
        chat_history.insert(0,conversation)
    session['chat_history'] = chat_history

@app.route('/api/employment-contract',methods=['POST'])
def change_employment_template():
    user_message = request.json.get("message", "")
    contract_template = request.json.get('template',"")
    contract_template = [line for line in contract_template.splitlines() if line.strip()]
    contract_template = "\n".join(contract_template)
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    prompt = f''''
    query: {user_message}
    contract_template: {contract_template}
    '''
    response = query_llm(prompt,mode='generate')
    #check if generation is required
    generated_filename = None
    _assistant = {"text":response,'sender':'assistant'}
    if(generated_filename):
        _assistant['file'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    # Append new conversation turn
    conversation = session.get("conversation", {})
    conversation['conversation'].append({"text": user_message, "sender": 'user'})
    conversation['conversation'].append(_assistant)
    session['conversation'] = conversation
    _response = {"response": response}
    if(generated_filename):
        _response['file_url'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    return jsonify(_response)

@app.route('/api/sales-contract',methods=['POST'])
def change_sales_template():
    user_message = request.json.get("message", "")
    contract_template = request.json.get('template',"")
    contract_template = [line for line in contract_template.splitlines() if line.strip()]
    contract_template = "\n".join(contract_template)
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    prompt = f''''
    query: {user_message}
    contract_template: {contract_template}
    '''
    response = query_llm(prompt,mode='generate')
    #check if generation is required
    generated_filename = None
    _assistant = {"text":response,'sender':'assistant'}
    if(generated_filename):
        _assistant['file'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    # Append new conversation turn
    conversation = session.get("conversation", {})
    conversation['conversation'].append({"text": user_message, "sender": 'user'})
    conversation['conversation'].append(_assistant)
    session['conversation'] = conversation
    _response = {"response": response}
    if(generated_filename):
        _response['file_url'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    return jsonify(_response)

@app.route('/api/service-contract',methods=['POST'])
def change_service_template():
    user_message = request.json.get("message", "")
    contract_template = str(request.json.get('template',""))
    contract_template = [line for line in contract_template.splitlines() if line.strip()]
    contract_template = "\n".join(contract_template)
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    prompt = f''''
    query: {user_message}
    contract_template: {contract_template}
    '''
    response = query_llm(prompt,mode='generate')
    #check if generation is required
    generated_filename = None
    _assistant = {"text":response,'sender':'assistant'}
    if(generated_filename):
        _assistant['file'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    # Append new conversation turn
    conversation = session.get("conversation", {})
    conversation['conversation'].append({"text": user_message, "sender": 'user'})
    conversation['conversation'].append(_assistant)
    session['conversation'] = conversation
    _response = {"response": response}
    if(generated_filename):
        _response['file_url'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    return jsonify(_response)

@app.route('/employment-contract')
def employment_contract():
    # Check if there's a custom template
    custom_template = get_custom_template('employment')
    return render_template('employment_contract.html', custom_template=custom_template)

@app.route('/sales-contract')
def sales_contract():
    # Check if there's a custom template
    custom_template = get_custom_template('sales')
    return render_template('sales_contract.html', custom_template=custom_template)

@app.route('/service-contract')
def service_contract():
    # Check if there's a custom template
    custom_template = get_custom_template('service')
    return render_template('service_contract.html', custom_template=custom_template)


def get_custom_template(contract_type):
    """Retrieve custom template if it exists"""
    template_path = os.path.join(TEMPLATES_DIR, f'{contract_type}_template.html')
    if os.path.exists(template_path):
        with open(template_path, 'r') as file:
            return file.read()
    return default_templates.get(contract_type, '')

@app.route('/save-employment-template', methods=['POST'])
def save_employment_template():
    template = request.form.get('template')
    save_template('employment', template)
    flash('Template saved successfully!', 'success')
    return redirect(url_for('employment_contract'))

@app.route('/save-sales-template', methods=['POST'])
def save_sales_template():
    template = request.form.get('template')
    save_template('sales', template)
    flash('Template saved successfully!', 'success')
    return redirect(url_for('sales_contract'))

@app.route('/save-service-template', methods=['POST'])
def save_service_template():
    template = request.form.get('template')
    save_template('service', template)
    flash('Template saved successfully!', 'success')
    return redirect(url_for('service_contract'))

def save_template(contract_type, template):
    """Save a custom template"""
    template_path = os.path.join(TEMPLATES_DIR, f'{contract_type}_template.html')
    with open(template_path, 'w') as file:
        file.write(template)

@app.route('/api/default-template/<contract_type>')
def get_default_template(contract_type):
    """API endpoint to get default template"""
    if contract_type in default_templates and default_templates[contract_type]:
        return default_templates[contract_type]
    else:
        return "Default template not found", 404

@app.route('/submit-employment-contract', methods=['POST'])
def submit_employment_contract():
    # Process form data
    contract_data = {}
    
    # If preview data is provided, use it instead of form fields
    if 'preview_data' in request.form and request.form['preview_data']:
        # Store the HTML preview as-is
        contract_data['html_content'] = request.form['preview_data']
    else:
        # Process individual form fields
        for field, value in request.form.items():
            contract_data[field] = value
    
    # Create a unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"employment_contract_{timestamp}.json"
    file_path = os.path.join(CONTRACTS_DIR, filename)
    
    # Save contract data to file
    with open(file_path, 'w') as file:
        json.dump(contract_data, file, indent=4)
    
    flash('Employment contract submitted successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/submit-sales-contract', methods=['POST'])
def submit_sales_contract():
    # Process form data
    contract_data = {}
    
    # If preview data is provided, use it instead of form fields
    if 'preview_data' in request.form and request.form['preview_data']:
        # Store the HTML preview as-is
        contract_data['html_content'] = request.form['preview_data']
    else:
        # Process individual form fields
        for field, value in request.form.items():
            contract_data[field] = value
    
    # Create a unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sales_contract_{timestamp}.json"
    file_path = os.path.join(CONTRACTS_DIR, filename)
    
    # Save contract data to file
    with open(file_path, 'w') as file:
        json.dump(contract_data, file, indent=4)
    
    flash('Sales contract submitted successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/submit-service-contract', methods=['POST'])
def submit_service_contract():
    # Process form data
    contract_data = {}
    
    # If preview data is provided, use it instead of form fields
    if 'preview_data' in request.form and request.form['preview_data']:
        # Store the HTML preview as-is
        contract_data['html_content'] = request.form['preview_data']
    else:
        # Process individual form fields
        for field, value in request.form.items():
            contract_data[field] = value
    
    # Create a unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"service_contract_{timestamp}.json"
    file_path = os.path.join(CONTRACTS_DIR, filename)
    
    # Save contract data to file
    with open(file_path, 'w') as file:
        json.dump(contract_data, file, indent=4)
    
    flash('Service contract submitted successfully!', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    load_default_templates()
    app.run(debug=True)