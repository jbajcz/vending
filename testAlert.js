const http = require("http");

const data = JSON.stringify({
  machine_id: 1,
  inventory: { "1": 1, "3": 2, "4": 0 },   // all low stock
  temperature: 55,                         // high temp
  power: "off",                            // power alert
  last_heartbeat: "2026-01-31T21:05:00Z"
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/machine/update",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = http.request(options, res => {
  let body = "";
  res.on("data", chunk => (body += chunk));
  res.on("end", () => console.log("SERVER RESPONSE:", body));
});

req.on("error", err => console.error("REQUEST ERROR:", err));
req.write(data);
req.end();