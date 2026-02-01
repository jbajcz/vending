import sqlite3
import random
from datetime import datetime, timedelta

DB_FILE = 'vending.db'
SCHEMA_FILE = 'schema.sql'

def run_seed():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Reset Database
    with open(SCHEMA_FILE, 'r') as f:
        schema_sql = f.read()
    
    tables = ['problem_reports', 'surveys', 'purchases', 'inventory', 'items', 'vending_machines', 'business_users', 'users']
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
    cursor.executescript(schema_sql)
    print("Schema initialized.")

    # 2. Insert Users (50 Users)
    users = []
    names = ['Jack', 'Jill', 'Bob', 'Alice', 'Charlie', 'Megan', 'Tom', 'Sarah', 'Mike', 'Emily', 'David', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia', 'John', 'Isabella', 'Robert', 'Mia', 'Michael', 'Charlotte', 'William', 'Amelia', 'Mary', 'Harper']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    
    # Specific demo user
    users.append(('Jack Bajc', 'jack@example.com', 5000, 'None'))

    for i in range(50):
        first = random.choice(names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        credits = random.randint(0, 10000)
        users.append((name, email, credits, 'None'))
    
    cursor.executemany("INSERT INTO users (name, email, credits, accessibility_preferences) VALUES (?, ?, ?, ?)", users)
    print(f"Inserted {len(users)} users.")

    # 3. Insert Items
    items = [
        ('Cheez-its', 'Snack'), ('Coca-Cola', 'Drink'), ('Doritos', 'Snack'), ('Snickers', 'Candy'),
        ('Dasani Water', 'Drink'), ('Pepsi', 'Drink'), ('Granola Bar', 'Health'), ('Sprite', 'Drink'),
        ('M&Ms', 'Candy'), ('Oreos', 'Snack'), ('Gatorade', 'Drink'), ('Trail Mix', 'Health'),
        ('Reeses', 'Candy'), ('Dr Pepper', 'Drink'), ('Pretzels', 'Snack'), ('Red Bull', 'Drink'),
        ('Vitamin Water', 'Drink'), ('Apple', 'Health'), ('Banana', 'Health'), ('Protein Bar', 'Health')
    ]
    cursor.executemany("INSERT INTO items (name, category) VALUES (?, ?)", items)
    cursor.execute("SELECT item_id, name FROM items")
    item_map = {name: id for id, name in cursor.fetchall()}

    # 4. Insert Machines (50 Machines around a center point)
    machines = []
    base_lat, base_lng = 40.7128, -74.0060
    buildings = ['Abbot Hall', 'Mason Hall', 'STEM Building', 'Library', 'Gym', 'Student Center', 'Dorm A', 'Dorm B', 'Engineering Lab', 'Design Studio', 'Cafeteria', 'Admin Block', 'North Garage', 'South Garage', 'East Wing', 'West Wing']
    features = ['Standard', 'Ramp access', 'Voice guidance', 'Braille keypad', 'Elevator']

    for i in range(50):
        lat = base_lat + random.uniform(-0.02, 0.02)
        lng = base_lng + random.uniform(-0.02, 0.02)
        bldg = random.choice(buildings)
        floor = random.randint(1, 5)
        address = f"{bldg} Floor {floor}" if floor > 1 else f"{bldg} Lobby"
        # Unique-ish address
        address = f"{address} (#{i+1})"
        feat = random.choice(features)
        machines.append((lat, lng, address, feat))

    cursor.executemany("INSERT INTO vending_machines (location_lat, location_lng, address, accessible_features) VALUES (?, ?, ?, ?)", machines)
    print(f"Inserted {len(machines)} machines.")

    cursor.execute("SELECT machine_id FROM vending_machines")
    machine_ids = [row[0] for row in cursor.fetchall()]

    # 5. Inventory
    inventory_data = []
    item_ids = list(item_map.values())
    
    for mid in machine_ids:
        # Stock random selection of items
        num_items = random.randint(5, 12)
        selected_items = random.sample(item_ids, num_items)
        for iid in selected_items:
            qty = random.randint(0, 15) # Some might be out of stock (0)
            inventory_data.append((mid, iid, qty))
    
    cursor.executemany("INSERT INTO inventory (machine_id, item_id, quantity) VALUES (?, ?, ?)", inventory_data)
    print("Inventory stocked.")

    # 6. Purchases (Past History)
    purchases = []
    cursor.execute("SELECT user_id FROM users")
    user_ids = [row[0] for row in cursor.fetchall()]

    # Generate 200 purchases over last 30 days
    start_date = datetime.now() - timedelta(days=30)
    
    for _ in range(200):
        uid = random.choice(user_ids)
        mid = random.choice(machine_ids)
        iid = random.choice(item_ids)
        
        # Random time
        days_offset = random.randint(0, 30)
        seconds_offset = random.randint(0, 86400)
        ts = start_date + timedelta(days=days_offset, seconds=seconds_offset)
        ts_str = ts.strftime('%Y-%m-%d %H:%M:%S')
        
        credits = random.choice([5, 10, 15, 20]) # Price simulation
        purchases.append((uid, mid, iid, ts_str, credits))

    cursor.executemany("INSERT INTO purchases (user_id, machine_id, item_id, timestamp, credits_earned) VALUES (?, ?, ?, ?, ?)", purchases)
    print(f"Inserted {len(purchases)} purchase records.")

    conn.commit()
    conn.close()
    print("Seed complete.")

if __name__ == "__main__":
    run_seed()
