import fs from "fs";
import path from "path";

const logFilePath = path.join(
  __dirname,
  "../../../volumes/logs/failed_logins.log"
);

const logDirectory = path.dirname(logFilePath);
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

export const logFailedLogin = (ip: string | undefined, email: string) => {
  const timestamp = new Date().toISOString();
  const ipAddress = ip || "unknown";
  const logMessage = `[${timestamp}] Failed login attempt for email: ${email} from IP: ${ipAddress}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
};
