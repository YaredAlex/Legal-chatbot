import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from langchain_cohere import ChatCohere
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable, RunnableConfig
from langgraph.graph import END, START, StateGraph
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import AnyMessage, add_messages
from langgraph.prebuilt import tools_condition, ToolNode
from langchain_core.messages import ToolMessage
from langchain_core.runnables import RunnableLambda
from typing import Annotated
from typing_extensions import TypedDict

from helper import retrieve_legal_information,generate_contract

load_dotenv()

class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

class Assistant:
    def __init__(self, runnable: Runnable):
        self.runnable = runnable

    def __call__(self, state: State, config: RunnableConfig):
        while True:
            user_info = config.get("configurable", {}).get("user_id")
            state = {**state, "user_info": user_info}
            result = self.runnable.invoke(state)

            if not result.tool_calls and (
                not result.content or (isinstance(result.content, list) and not result.content[0].get("text"))
            ):
                messages = state["messages"] + [("user", "Respond with a real output.")]
                state = {**state, "messages": messages}
            else:
                break
        return {"messages": result}


def create_tool_node_with_fallback(tools: list):
    def handle_tool_error(state):
        error = state.get("error")
        tool_calls = state["messages"][-1].tool_calls
        return {
            "messages": [
                ToolMessage(
                    content=f"Error: {repr(error)}\n please fix your mistakes.",
                    tool_call_id=tc["id"],
                ) for tc in tool_calls
            ]
        }
    return ToolNode(tools).with_fallbacks([RunnableLambda(handle_tool_error)], exception_key="error")
if "COHERE_API_KEY" in os.environ:
    del os.environ["COHERE_API_KEY"]
load_dotenv()
API_KEY = os.getenv("COHERE_API_KEY")
cohere_llm = ChatCohere(cohere_api_key=API_KEY, temperature=0.5, max_tokens=1000)


def build_executor(mode="analysis"):
    if mode == "analysis":
        tools = [retrieve_legal_information]
        system_prompt = (
            "You are a highly knowledgeable and detail-oriented legal assistant."
            " Your job is to analyze legal documents and assist users by retrieving accurate, relevant legal information."
            " Use the tool provided to support your legal research and provide thorough insights."
        )
    else:
        tools = [generate_contract]
        system_prompt = (
    "You are a smart and efficient contract generation and modification assistant. "
    "You will be provided with two key inputs: a 'query:' which outlines the user's request, and a 'contract_template:' "
    "which is the base contract to be modified or used for generation. "
    "If the query explicitly requests to 'generate' a contract, create a new contract based on the provided template and query, ensuring it is legally sound, professionally formatted, and incorporates all relevant instructions. "
    "If the query is not a generate request, modify the existing contract_template according to the user's instructions. "
    "In both cases, maintain legal clarity, structure, and tone. "
    "After presenting any explanation or confirmation message, output the final contract under the key 'revised:'. "
    "Do not include any additional commentary after 'revised:'."
)




    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt + "\n\nCurrent user:\n<User>\n{user_info}\n</User>\nCurrent time: {time}.",),
        ("placeholder", "{messages}"),
    ]).partial(time=datetime.now)

    assistant_runnable = prompt | cohere_llm.bind_tools(tools)

    builder = StateGraph(State)
    builder.add_node("assistant", Assistant(assistant_runnable))
    builder.add_node("tools", create_tool_node_with_fallback(tools))
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "assistant")
    memory = MemorySaver()
    return builder.compile(checkpointer=memory)


executors = {
    "analysis": build_executor("analysis"),
    "generate": build_executor("generate")
}


def query_llm(query=None, mode="analysis"):
    if query is None:
        print("query: is required")
        return

    executor = executors.get(mode)
    if not executor:
        print(f"Invalid mode: {mode}")
        return

    config = {
        "configurable": {
            "user_id": "1",
            "thread_id": str(uuid.uuid4())
        }
    }

    events = executor.stream({"messages": ("user", query)}, config, stream_mode="values")
    response = ""
    for event in events:
        response = event
    return response.get("messages")[-1].content