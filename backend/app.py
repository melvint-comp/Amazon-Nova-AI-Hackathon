from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os

app = Flask(__name__, static_folder="public")
CORS(app, origins="*")

client = openai.OpenAI(
    api_key=os.environ.get("AWS_BEARER_TOKEN_BEDROCK"),
    base_url=f"https://bedrock-mantle.{os.environ.get('BEDROCK_REGION', 'us-east-1')}.api.aws/v1"
)

# Serve frontend
@app.route("/")
def index():
    return send_from_directory("public", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("public", path)

@app.route("/generate-story", methods=["POST"])
def generate_story():
    data = request.json
    text = data.get("text")
    images = data.get("images", [])

    if not text:
        return jsonify({"error": "No text provided"}), 400

    content = []

    for img in images:
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{img['mediaType']};base64,{img['data']}"
            }
        })

    content.append({"type": "text", "text": text})

    try:
        response = client.chat.completions.create(
            model="us.amazon.nova-lite-v1:0",
            max_tokens=512,
            messages=[{"role": "user", "content": content}]
        )
        story = response.choices[0].message.content
        return jsonify({"story": story})

    except Exception as e:
        print("Bedrock error:", str(e))
        return jsonify({"error": "Story generation failed", "detail": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)