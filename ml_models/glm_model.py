import requests

# Your OpenRouter API key
API_KEY = "YOURAPIKEY"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "z-ai/glm-4.5-air:free"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def query_model(user_input):
    data = {
        "model": MODEL,
        "messages": [{"role": "user", "content": user_input}],
        "temperature": 0.7
    }
    try:
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content']
    except requests.exceptions.RequestException as e:
        return f"❌ API request error: {e}"
    except KeyError:
        return f"❌ Unexpected API response: {response.text}"

def main():
    print("🌾 GLM-4.5 Crop Advisor (type 'exit' to quit)")
    while True:
        query = input("\nFarmer query: ").strip()
        if query.lower() in ['exit', 'quit']:
            print("👋 Exiting...")
            break
        answer = query_model(query)
        print("\n💡 Model Response:\n", answer)

if __name__ == "__main__":
    main()
