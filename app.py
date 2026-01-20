import os
import uuid
import traceback
import asyncio
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import edge_tts  # ✅ Edge TTS

from google.adk.runners import Runner, InMemorySessionService, types
from chatbot_agent import root_agent  # ✅ YOUR EXISTING AGENT

# -------------------------
# Flask setup
# -------------------------
app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# -------------------------
# Audio folder
# -------------------------
AUDIO_FOLDER = "static/tts_audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# -------------------------
# ADK Setup
# -------------------------
APP_NAME = "medical_chatbot"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service
)

Content = types.Content
Part = types.Part

# -------------------------
# SESSION STORE
# -------------------------
USER_SESSIONS = {}  # user_id -> session_id

def get_or_create_session(user_id: str):
    if user_id in USER_SESSIONS:
        return USER_SESSIONS[user_id]

    print("Creating brand new ADK session...")

    async def _create():
        return await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id
        )

    session = asyncio.run(_create())
    USER_SESSIONS[user_id] = session.id
    return session.id

# -------------------------
# Edge TTS function
# -------------------------
async def generate_tts(text, output_path):
    communicate = edge_tts.Communicate(
        text=text,
        voice="en-US-AriaNeural",  # ✅ Super natural female voice
        rate="+0%",
        pitch="+0Hz"
    )
    await communicate.save(output_path)

# -------------------------
# STATIC FILES
# -------------------------
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('static', 'style.css', mimetype='text/css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('static', 'script.js', mimetype='application/javascript')

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/tts_audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename, mimetype="audio/mpeg")

# -------------------------
# CHAT ENDPOINT
# -------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'success': False, 'error': 'Empty message'}), 400

        user_id = data.get('user_id', 'default_user')

        print(f"User: {user_message}")

        # -------------------------
        # Get or create session
        # -------------------------
        session_id = get_or_create_session(user_id)

        # -------------------------
        # Create content
        # -------------------------
        user_content = Content(parts=[Part(text=user_message)])

        # -------------------------
        # Run agent
        # -------------------------
        final_text = ""

        events = runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=user_content
        )

        for event in events:
            if hasattr(event, "content") and event.content:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        final_text = part.text

        if not final_text.strip():
            final_text = "I could not generate a response."

        print(f"Agent: {final_text}")

        # -------------------------
        # Generate TTS
        # -------------------------
        audio_filename = f"{uuid.uuid4()}.mp3"
        audio_path = os.path.join(AUDIO_FOLDER, audio_filename)

        asyncio.run(generate_tts(final_text, audio_path))

        audio_url = f"/tts_audio/{audio_filename}"

        return jsonify({
            "success": True,
            "response": final_text,
            "audio_url": audio_url
        })

    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

# -------------------------
# MAIN
# -------------------------
if __name__ == '__main__':
    os.makedirs('static', exist_ok=True)
    os.makedirs(AUDIO_FOLDER, exist_ok=True)

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        use_reloader=False
    )
