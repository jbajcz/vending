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

    # 2. Insert Users (100 Users)
    users = []
    names = ['Jack', 'Jill', 'Bob', 'Alice', 'Charlie', 'Megan', 'Tom', 'Sarah', 'Mike', 'Emily', 'David', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia', 'John', 'Isabella', 'Robert', 'Mia', 'Michael', 'Charlotte', 'William', 'Amelia', 'Mary', 'Harper']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    
    # Specific demo user
    users.append(('Jack Bajc', 'jack@example.com', 5000, 'None'))

    for i in range(100):
        first = random.choice(names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        credits = random.randint(0, 10000)
        users.append((name, email, credits, 'None'))
    
    cursor.executemany("INSERT INTO users (name, email, credits, accessibility_preferences) VALUES (?, ?, ?, ?)", users)
    print(f"Inserted {len(users)} users.")

    # 3. Insert Items
    # 3. Insert Items
    items = [
        # Drinks
        ('Coca-Cola', 'Drink', 1.75), ('Sprite', 'Drink', 1.75), ('Dr Pepper', 'Drink', 1.75), ('Pepsi', 'Drink', 1.75),
        ('Dasani Water', 'Drink', 1.50), ('Vitamin Water', 'Drink', 2.25), ('Red Bull', 'Drink', 3.00), ('Gatorade', 'Drink', 2.00),
        
        # Snacks
        ('Doritos', 'Snack', 1.75), ('Cheez-its', 'Snack', 1.75), ('Pretzels', 'Snack', 1.50), ('Oreos', 'Snack', 2.00),
        ('Trail Mix', 'Snack', 2.25), ('Granola Bar', 'Snack', 1.25), ('Protein Bar', 'Snack', 2.50),
        
        # Candy
        ('Snickers', 'Candy', 1.50), ('M&Ms', 'Candy', 1.50), ('Reeses', 'Candy', 1.50),
        
        # Health
        ('Apple', 'Health', 1.00), ('Banana', 'Health', 0.75),
        
        # Meals
        ('Ham Sandwich', 'Meal', 6.50), ('Turkey Sandwich', 'Meal', 6.50), ('Tuna Wrap', 'Meal', 7.00), ('Chicken Caesar Salad', 'Meal', 7.50), ('Garden Salad', 'Meal', 6.00),
        ('Pasta Salad', 'Meal', 6.50), ('Sushi Roll', 'Meal', 8.50), ('Burrito', 'Meal', 7.50), ('Pizza Slice', 'Meal', 4.50), ('Hot Pocket', 'Meal', 3.50),
        ('Cup Noodles', 'Meal', 2.00), ('Mac n Cheese', 'Meal', 3.00), ('Soup Bowl', 'Meal', 4.00), ('Bagel Cream Cheese', 'Meal', 3.50), ('Croissant', 'Meal', 3.00),
        ('Muffin', 'Meal', 2.50), ('Donut', 'Meal', 1.50), ('Hard Boiled Eggs', 'Meal', 2.00), ('Cheese Stick Crackers', 'Meal', 2.50), ('Lunchable', 'Meal', 4.50)
    ]
    cursor.executemany("INSERT INTO items (name, category, price) VALUES (?, ?, ?)", items)
    
    # Create lookup maps
    cursor.execute("SELECT item_id, name, price FROM items")
    rows = cursor.fetchall()
    item_map = {row[1]: row[0] for row in rows} # name -> id
    price_map = {row[0]: row[2] for row in rows} # id -> price

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
    item_ids = list(price_map.keys())
    
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

    # Generate 3572 purchases over last 30 days
    start_date = datetime.now() - timedelta(days=30)
    
    for _ in range(3572):
        uid = random.choice(user_ids)
        mid = random.choice(machine_ids)
        iid = random.choice(item_ids)
        
        # Random time
        days_offset = random.randint(0, 30)
        seconds_offset = random.randint(0, 86400)
        ts = start_date + timedelta(days=days_offset, seconds=seconds_offset)
        ts_str = ts.strftime('%Y-%m-%d %H:%M:%S')
        
        credits = price_map[iid] # Use actual price
        purchases.append((uid, mid, iid, ts_str, credits))

    cursor.executemany("INSERT INTO purchases (user_id, machine_id, item_id, timestamp, credits_earned) VALUES (?, ?, ?, ?, ?)", purchases)
    print(f"Inserted {len(purchases)} purchase records.")

    conn.commit()
    conn.close()
    print("Seed complete.")

if __name__ == "__main__":
    run_seed()
