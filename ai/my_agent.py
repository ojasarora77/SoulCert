from langchain_openai import ChatOpenAI
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper  
from langchain.tools import Tool
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from typing import Dict, Any

from dotenv import load_dotenv
load_dotenv()

# Initialize base setup
llm = ChatOpenAI(model="gpt-4o-mini")
cdp = CdpAgentkitWrapper()
cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)
tools = cdp_toolkit.get_tools()

# Your deployed contract address on Base Sepolia
CONTRACT_ADDRESS = "0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789"

# Certificate verification function
def verify_and_mint_certificate(student_address: str, ipfs_hash: str) -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        contract = contract.connect(signer)

        tx = contract.mintCertificate(student_address, ipfs_hash)
        return f"✅ Certificate minted successfully. Transaction: {tx.hash}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Scanned certificate verification
def verify_scanned_certificate(student_address: str, ipfs_hash: str, scan_hash: str) -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        contract = contract.connect(signer)

        tx = contract.mintScannedCertificate(student_address, ipfs_hash, scan_hash)
        return f"✅ Scanned certificate minted. Transaction: {tx.hash}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Add university function
def add_university(university_address: str) -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        contract = contract.connect(signer)

        tx = contract.addUniversity(university_address)
        return f"✅ University added successfully. Transaction: {tx.hash}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

def check_university_role(address: str) -> bool:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        UNIVERSITY_ROLE = contract.UNIVERSITY_ROLE()
        return contract.hasRole(UNIVERSITY_ROLE, address)
    except Exception as e:
        return False

def verify_and_mint_certificate(student_address: str, ipfs_hash: str = "default_hash") -> str:
    try:
        contract = cdp.get_contract(CONTRACT_ADDRESS, "UniversityCertificate")
        signer = cdp.get_signer()
        signer_address = signer.get_address()
        
        # Check if signer has university role
        if not check_university_role(signer_address):
            return "❌ Error: Signer does not have university role"

        contract = contract.connect(signer)
        tx = contract.mintCertificate(student_address, ipfs_hash)
        return f"✅ Certificate minted successfully. Transaction: {tx.hash}"
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
    ),
    Tool.from_function(
        name="add_university",
        description="Add a new university address (admin only)",
        func=add_university
    )
])

# Create agent with updated tools
agent_executor = create_react_agent(
    llm,
    tools=tools,
    state_modifier="""You are a university certificate management agent that can:
    1. Mint new certificates for students
    2. Process and verify scanned certificates
    3. Add new universities to the system
    4. Manage certificate verification on Base Sepolia network
    
    Always verify permissions before executing transactions."""
)

def ask_agent(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "certificate_verification_agent"}}
    ):
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)
        print("-------------------")

if __name__ == "__main__":
    print("🎓 University Certificate Management Agent")
    print("✅ Connected to Base Sepolia")
    print("📝 Type 'exit' to quit")
    print("\nExample commands:")
    print("- 'Mint a certificate for student 0x...'")
    print("- 'Add university 0x...'")
    print("- 'Verify scanned certificate for student 0x...'")
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'exit':
            break
        ask_agent(user_input)