from flask import Flask,request, render_template,jsonify,session
from query_llm import query_llm
from render_pdf import render_contract_pdf
app  = Flask(__name__)
app.secret_key = "uuid:1232" 
UPLOAD_FOLDER = "media/file"
@app.route('/',methods=['GET','POST'])
def home():
    if "chat_history" not in session:
        session["chat_history"] = []
    context = session['chat_history']
    return render_template('index.html',messages=context)

@app.route('/api/chat',methods=['GET','POST'])
def generate():
    user_message = request.json.get("message", "")
    if not user_message:
        return jsonify({"error": "Empty message"}), 400
    ## call agent Model
    response = query_llm(user_message)
    #check if generation is required
    generated_filename = None
    _assistant = {"text":response,'sender':'assistant'}
    if(generated_filename):
        _assistant['file'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    # Append new conversation turn
    context = session.get("chat_history", [])
    context.append({"text": user_message, "sender": 'user'})
    context.append(_assistant)
    session['chat_history'] = context
    _response = {"response": response}
    if(generated_filename):
        _response['file_url'] = f"/{UPLOAD_FOLDER}/{generated_filename}"
    return jsonify(_response)
    
#clearning session
@app.route("/clear_session",methods=['GET'])
def clear_session():
    session['chat_history'] = []
    return jsonify({'response':"session cleared!"})

if __name__ == "__main__":
    app.run(host='127.0.0.1',debug=True)