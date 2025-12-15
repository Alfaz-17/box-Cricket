import { exec } from "child_process";
import path from "path";

export const transcribeWithWhisper = (audioPath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve("whisper/transcribe.py"); // Path to Python script

    const command = `python "${pythonScript}" "${audioPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Whisper error:", error);
        return reject(error);
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result.text.trim());
      } catch (err) {
        reject("Failed to parse Whisper output");
      }
    });
  });
};
