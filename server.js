console.log(">>> THIS IS THE CORRECT SERVER.JS <<<");

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'vending.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

app.use(express.json());

// Helper: Create alert
function createAlert(machine_id, type, message) {
  const sql = `
    INSERT INTO alerts (machine_id, type, message)
    VALUES (?, ?, ?);
  `;
  db.run(sql, [machine_id, type, message], (err) => {
    if (err) {
      console.error("Failed to insert alert:", err.message);
    }
  });
}

// GET all vending machines
app.get('/machines', (req, res) => {
  const sql = 'SELECT * FROM vending_machines';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET inventory for a machine
app.get('/machines/:id/inventory', (req, res) => {
  const sql = `
    SELECT i.item_id, i.name, i.category, inv.quantity
    FROM inventory inv
    JOIN items i ON inv.item_id = i.item_id
    WHERE inv.machine_id = ?;
  `;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Search machines by item name
app.get('/search/item', (req, res) => {
  const { name } = req.query;

  const sql = `
    SELECT vm.machine_id, vm.address, inv.quantity
    FROM inventory inv
    JOIN vending_machines vm ON inv.machine_id = vm.machine_id
    JOIN items i ON inv.item_id = i.item_id
    WHERE i.name = ? AND inv.quantity > 0;
  `;

  db.all(sql, [name], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Analytics: items sold
app.get('/analytics/items-sold', (req, res) => {
  const sql = `
    SELECT i.name AS item_name, COUNT(*) AS times_sold
    FROM purchases p
    JOIN items i ON p.item_id = i.item_id
    GROUP BY i.item_id
    ORDER BY times_sold DESC;
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all active alerts
app.get('/alerts', (req, res) => {
  console.log("GET /alerts route loaded");
  const sql = `
    SELECT * FROM alerts
    WHERE resolved = 0
    ORDER BY created_at DESC;
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Resolve an alert
app.post('/alerts/:id/resolve', (req, res) => {
  const sql = `
    UPDATE alerts
    SET resolved = 1
    WHERE alert_id = ?;
  `;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: "alert resolved" });
  });
});

// Test route
app.post('/test', (req, res) => {
  res.send("TEST ROUTE WORKS");
});

// Machine update endpoint (IoT-style updates)
app.post('/machine/update', (req, res) => {
  const { machine_id, inventory, temperature, power, last_heartbeat } = req.body;

  if (!machine_id) {
    return res.status(400).json({ error: "machine_id is required" });
  }

  // Update machine status
  const status = power === 'off' ? 'offline' : 'operational';
  const updateMachineSQL = `
    UPDATE vending_machines
    SET status = ?
    WHERE machine_id = ?;
  `;
  db.run(updateMachineSQL, [status, machine_id]);

  // Update inventory
  if (inventory) {
    for (const item_id in inventory) {
      const quantity = inventory[item_id];
      const updateInventorySQL = `
        UPDATE inventory
        SET quantity = ?
        WHERE machine_id = ? AND item_id = ?;
      `;
      db.run(updateInventorySQL, [quantity, machine_id, item_id]);
    }
  }

  // Low stock alerts
  if (inventory) {
    for (const item_id in inventory) {
      const quantity = inventory[item_id];
      if (quantity < 3) {
        createAlert(
          machine_id,
          "low_stock",
          `Item ${item_id} low stock (${quantity} left)`
        );
      }
    }
  }

  // Temperature alert
  if (temperature > 45) {
    createAlert(
      machine_id,
      "high_temperature",
      `Temperature high: ${temperature}°C`
    );
  }

  // Power alert
  if (power === "off") {
    createAlert(
      machine_id,
      "power_off",
      "Machine power is OFF"
    );
  }

  res.json({ status: "update processed" });
});

console.log("POST /machine/update route loaded");

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});