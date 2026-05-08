# Phishing Lab — Defender Web Module

⚠️ **Educational use only.** This project is for cybersecurity awareness training in a controlled environment.

This lab intentionally avoids copying a real login page and does **not** capture, log, store, or forward passwords. It demonstrates the defensive concepts behind phishing awareness while keeping the exercise safe.

## What You Will Learn

- How phishing pages pressure users into entering sensitive information.
- Which clues help reveal a fake login flow, including suspicious URLs, poor context, and unexpected prompts.
- Why defenders should avoid collecting real credentials during awareness training.
- How phishing-resistant MFA, password managers, and reporting workflows reduce risk.

## Run Locally

```bash
npm install
npm start
```

Open <http://localhost:3000> in your browser.

## Project Structure

```text
phish-lab/
├── public/
│   └── index.html     # Safe awareness page
├── server.js          # Express server that discards password data
├── package.json
└── README.md
```

## Safety Design

- The browser sends only a training identifier and password length to the server.
- The server logs a masked identifier and explicitly reports that password data was discarded.
- The UI warns learners not to enter real passwords.
- The page uses generic training branding instead of impersonating a real service.
