import os
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
import json
from pathlib import Path
from datetime import date
# Setup retriever
path = 'doc'
loader = DirectoryLoader(
    path,
    glob='*.txt',
    loader_cls=TextLoader,
    loader_kwargs={"encoding": "utf-8"}
)
documents = loader.load_and_split(
    RecursiveCharacterTextSplitter(chunk_overlap=200, chunk_size=1000)
)
embedding = HuggingFaceEmbeddings(model_name='sentence-transformers/all-mpnet-base-v2')
vector_db = FAISS.from_documents(documents, embedding)

@tool
def retrieve_legal_information(query: str, k: int = 3) -> list:
    """
    Retrieve relevant legal related information, for analyzing document.

    Args:
        query (str): The search query related legal.
        k (int): Number of relevant documents to retrieve (default: 3).

    Returns:
        list: A list of relevant document contents matching the query.
    """
    retriever = vector_db.as_retriever(search_kwargs={"k": k})
    retrieved_docs = retriever.get_relevant_documents(query)
    return [doc.page_content for doc in retrieved_docs] if retrieved_docs else ["No relevant information found for the query."]


# generate_tool.py
TEMPLATE_DIR = Path("templates")

@tool
def generate_contract(information: str) -> str:
    """
    Generates a contract by loading a .md template and replacing placeholders.

    Args:
        information (str): JSON string containing:
            - template_type: "service" | "sales" | "employee"
            - fields: dictionary with required values

    Returns:
        str: The rendered contract or error message.
    """
    try:
        data = json.loads(information)
        template_type = data["template_type"].lower()
        fields = data["fields"]

        fields.setdefault("date", date.today().strftime("%Y-%m-%d"))
        template_path = TEMPLATE_DIR / f"{template_type}_contract.md"

        if not template_path.exists():
            return f"Error: Template '{template_type}_contract.md' not found."

        template_text = template_path.read_text()
        return template_text.format(**fields)

    except Exception as e:
        return f"Error generating contract: {str(e)}"