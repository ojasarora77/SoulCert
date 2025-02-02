from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import hashlib
from typing import Dict, Any

# Import your existing agent setup
from langchain_openai import ChatOpenAI
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from langchain.tools import Tool
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize your AI agent
llm = ChatOpenAI(model="gpt-4o-mini")
cdp = CdpAgentkitWrapper()
cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)
tools = cdp_toolkit.get_tools()

CONTRACT_ADDRESS = "0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789"

# Certificate verification functions
def verify_and_mint_certificate(student_address: str, ipfs_hash: str) -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        contract = contract.connect(signer)
        tx = contract.mintCertificate(student_address, ipfs_hash)
        return f"✅ Certificate minted successfully. Transaction: {tx.hash}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def verify_scanned_certificate(student_address: str, ipfs_hash: str, scan_hash: str) -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        contract = contract.connect(signer)
        tx = contract.mintScannedCertificate(student_address, ipfs_hash, scan_hash)
        return f"✅ Scanned certificate minted. Transaction: {tx.hash}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Register tools
tools.extend([
    Tool.from_function(
        name="mint_certificate",
        description="Mint a new certificate for a student (university only)",
        func=verify_and_mint_certificate
    ),
    Tool.from_function(
        name="mint_scanned_certificate",
        description="Mint a scanned certificate after verification",
        func=verify_scanned_certificate
    )
])

# Create the agent
agent_executor = create_react_agent(
    llm,
    tools=tools,
    state_modifier="""You are a certificate verification agent that validates university certificates 
    and prepares them for blockchain storage. Verify authenticity before minting."""
)

def process_certificate(file_path, student_address: str):
    """Process certificate using AI agent"""
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        certificate_hash = hashlib.sha256(content).hexdigest()
        scan_hash = hashlib.sha256(f"scan_{content}".encode()).hexdigest()

        verification_prompt = f"""
        Analyze this certificate file and:
        1. Verify if it's a valid university certificate
        2. Extract: university name, degree type, date
        3. Check for any inconsistencies
        4. If valid, mint it as an SBT for student address: {student_address}
        Certificate hash: {certificate_hash}
        Scan hash: {scan_hash}
        """

        verification_result = []
        for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=verification_prompt)]},
            {"configurable": {"thread_id": "certificate_verification"}}
        ):
            if "agent" in chunk:
                verification_result.append(chunk["agent"]["messages"][0].content)

        return {
            'certificateHash': certificate_hash,
            'scanHash': scan_hash,
            'verificationResult': verification_result,
            'studentAddress': student_address
        }

    except Exception as e:
        print(f"Error in certificate processing: {str(e)}")
        return None

@app.route('/')
def home():
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Certificate Verification Service</title>
        <style>
            body {{
                font-family: Arial;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #13141a;
                color: white;
            }}
            .endpoint {{
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            code {{
                background: #2d2d2d;
                padding: 2px 5px;
                border-radius: 3px;
            }}
            .test-form {{
                margin-top: 20px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }}
            input, button {{
                margin: 10px 0;
                padding: 8px;
            }}
            button {{
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
            }}
            .chat-section {{
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <h1>🎓 Certificate Verification Service</h1>
        <p>Status: ✅ Connected to Base Sepolia</p>
        <p>Contract: <code>{CONTRACT_ADDRESS}</code></p>
        
        <div class="test-form">
            <h3>Test Certificate Upload</h3>
            <form action="/verify" method="post" enctype="multipart/form-data">
                <div>
                    <label for="certificate">Certificate File:</label><br>
                    <input type="file" id="certificate" name="certificate" accept=".pdf,.jpg,.jpeg,.png"><br>
                </div>
                <div>
                    <label for="studentAddress">Student Address:</label><br>
                    <input type="text" id="studentAddress" name="studentAddress" placeholder="0x..."><br>
                </div>
                <button type="submit">Verify Certificate</button>
            </form>
        </div>

        <div class="chat-section">
            <h3>AI Chat Agent</h3>
            <div id="chat-messages"></div>
            <input type="text" id="chat-input" placeholder="Ask about certificate verification..." style="width: 80%;">
            <button onclick="sendMessage()">Send</button>
        </div>

        <script>
            function sendMessage() {{
                const input = document.getElementById('chat-input');
                const message = input.value;
                if (!message) return;

                const messagesDiv = document.getElementById('chat-messages');
                messagesDiv.innerHTML += `<div class="message user-message">You: ${{message}}</div>`;
                
                fetch('/chat', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                    }},
                    body: JSON.stringify({{ message: message }})
                }})
                .then(response => response.json())
                .then(data => {{
                    messagesDiv.innerHTML += `<div class="message agent-message">Agent: ${{data.response}}</div>`;
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }})
                .catch(error => {{
                    console.error('Error:', error);
                    messagesDiv.innerHTML += '<div class="message error">Error: Failed to get response</div>';
                }});
                
                input.value = '';
            }}

            document.getElementById('chat-input').addEventListener('keypress', function(e) {{
                if (e.key === 'Enter') {{
                    sendMessage();
                }}
            }});
        </script>
    </body>
    </html>
    """
    

@app.route('/verify', methods=['POST'])
def verify_certificate():
    if 'certificate' not in request.files:
        return jsonify({'error': 'No certificate file'}), 400
    
    file = request.files['certificate']
    student_address = request.form.get('studentAddress')
    
    if not student_address:
        return jsonify({'error': 'Student address is required'}), 400
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        os.makedirs('temp', exist_ok=True)
        filename = secure_filename(file.filename)
        filepath = os.path.join('temp', filename)
        file.save(filepath)

        result = process_certificate(filepath, student_address)
        os.remove(filepath)

        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Certificate processing failed'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    
    try:
        response = ""
        for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=message)]},
            {"configurable": {"thread_id": "certificate_verification_agent"}}
        ):
            if "agent" in chunk:
                response += chunk["agent"]["messages"][0].content
            elif "tools" in chunk:
                response += chunk["tools"]["messages"][0].content

        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Certificate verification service is running',
        'contract': CONTRACT_ADDRESS
    })

if __name__ == '__main__':
    print("🎓 Certificate Verification Service")
    print("✅ Connected to Base Sepolia")
    print(f"📝 Contract Address: {CONTRACT_ADDRESS}")
    app.run(debug=True, port=5000)