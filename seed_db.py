import sqlite3
import os

DB_FILE = 'vending.db'
SCHEMA_FILE = 'schema.sql'

def run_seed():
    # Connect
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Enable FK
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Clean existing data (or recreate tables if needed)
    # For safety, let's wipe the data but keep schema if possible, or just drop all.
    # Since schema.sql exists, let's just reload schema.
    
    # Read Schema
    with open(SCHEMA_FILE, 'r') as f:
        schema_sql = f.read()
    
    # Execute Schema (Script)
    # This might fail if tables exist, so let's DROP first
    tables = ['problem_reports', 'surveys', 'purchases', 'inventory', 'items', 'vending_machines', 'business_users', 'users']
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
        
    cursor.executescript(schema_sql)
    print("Schema initialized.")

    # 2. Insert Users
    users = [
        ('Jack Bajc', 'jack@example.com', 5000, 'None'), # 5000 credits = $50.00
        ('Demo User', 'demo@test.com', 1500, 'Highlight items')
    ]
    cursor.executemany("INSERT INTO users (name, email, credits, accessibility_preferences) VALUES (?, ?, ?, ?)", users)

    # 3. Insert Items
    items = [
        ('Cheez-its', 'Snack'),
        ('Coca-Cola', 'Drink'),
        ('Doritos', 'Snack'),
        ('Snickers', 'Candy'),
        ('Dasani Water', 'Drink'),
        ('Pepsi', 'Drink'),
        ('Granola Bar', 'Health')
    ]
    cursor.executemany("INSERT INTO items (name, category) VALUES (?, ?)", items)
    
    # Get Item IDs
    cursor.execute("SELECT item_id, name FROM items")
    item_map = {name: id for id, name in cursor.fetchall()}

    # 4. Insert Vending Machines (Locations around a fake campus center)
    machines = [
        (40.7128, -74.0060, 'Abbot Hall', 'Ramp access'),          # Center
        (40.7135, -74.0065, 'Library 1st Floor', 'Braille keypad'), # NW
        (40.7120, -74.0055, 'Gym', 'Voice guidance'),               # SE
        (40.7125, -74.0070, 'Student Center', 'Standard'),          # W
        (40.7140, -74.0080, 'Science Building', 'Elevator'),
        (40.7115, -74.0040, 'Dorm A', 'Standard'),
        (40.7110, -74.0050, 'Dorm B', 'Ramp access'),
        (40.7130, -74.0030, 'Engineering Hall', 'Voice guidance'),
        (40.7150, -74.0060, 'North Parking', 'Standard')
    ]
    cursor.executemany("INSERT INTO vending_machines (location_lat, location_lng, address, accessible_features) VALUES (?, ?, ?, ?)", machines)

    # Get Machine IDs
    cursor.execute("SELECT machine_id, address FROM vending_machines")
    machine_map = {addr: id for id, addr in cursor.fetchall()}

    # 5. Insert Inventory (Stock machines)
    inventory_data = []
    
    # helper to stock list of items
    def stock_machine(mach_name, item_names):
        if mach_name not in machine_map: return
        for it in item_names:
            if it in item_map:
                inventory_data.append((machine_map[mach_name], item_map[it], 10))

    stock_machine('Abbot Hall', ['Cheez-its', 'Coca-Cola', 'Snickers', 'Dasani Water'])
    stock_machine('Library 1st Floor', ['Coca-Cola', 'Pepsi', 'Dasani Water'])
    stock_machine('Gym', ['Dasani Water', 'Granola Bar'])
    stock_machine('Student Center', ['Doritos', 'Cheez-its', 'Snickers'])
    stock_machine('Science Building', ['Coca-Cola', 'Doritos', 'Granola Bar'])
    stock_machine('Dorm A', ['Cheez-its', 'Snickers', 'Pepsi'])
    stock_machine('Dorm B', ['Coca-Cola', 'Dasani Water'])
    stock_machine('Engineering Hall', ['Doritos', 'Pepsi', 'Granola Bar'])
    stock_machine('North Parking', ['Snickers', 'Dasani Water'])

    cursor.executemany("INSERT INTO inventory (machine_id, item_id, quantity) VALUES (?, ?, ?)", inventory_data)

    # 6. Insert Activity/Purchases (History)
    # user_id 1 bought some things
    purchases = [
        (1, machine_map['Abbot Hall'], item_map['Cheez-its'], '2023-10-25 14:30', 10),
        (1, machine_map['Library 1st Floor'], item_map['Coca-Cola'], '2023-10-24 09:15', 5),
        (1, machine_map['Gym'], item_map['Dasani Water'], '2023-10-20 18:00', 5),
        (1, machine_map['Abbot Hall'], item_map['Snickers'], '2023-10-18 12:45', 5)
    ]
    cursor.executemany("INSERT INTO purchases (user_id, machine_id, item_id, timestamp, credits_earned) VALUES (?, ?, ?, ?, ?)", purchases)

    conn.commit()
    conn.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    run_seed()
