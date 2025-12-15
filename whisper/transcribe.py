import sys
import whisper
import json

audio_path = sys.argv[1]

model = whisper.load_model("medium")  # medium = balance speed/accuracy
result = model.transcribe(audio_path, language=None)


print(json.dumps({"text": result["text"]}))
