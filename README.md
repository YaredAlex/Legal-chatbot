# Legal-chatbot

The legal-chatbot is developed to help users analyze their documents and generate contracts. It uses Cohere API currently for analyzing any document and generating three types of contracts:

- employee contracts
- sales contracts
- service contracts

## To run chatbot

- Clone the repository

```
git clone https://github.com/YaredAlex/Legal-chatbot.git
```

- Install dependencies

```
pip install -r requirements.txt
```

- Create .env file and save your API key

```
COHERE_API_KEY=YOUR_KEY
```

- Run flask app

```
python app.py
```
