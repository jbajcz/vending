import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# 1. Generate Expanded Inventory (15 Machines)
locations = [
    ("Engineering Hall", 42.725, -84.481),
    ("Main Library", 42.730, -84.482),
    ("IM West Gym", 42.728, -84.475),
    ("Business College", 42.729, -84.471),
    ("Biomedical Physical Sciences", 42.724, -84.476),
    ("Spartan Stadium", 42.728, -84.484),
    ("Hubbard Hall", 42.723, -84.467),
    ("Brody Neighborhood", 42.729, -84.492),
    ("Union Building", 42.733, -84.483),
    ("Chemistry Building", 42.725, -84.477),
    ("Anthony Hall", 42.724, -84.483),
    ("Erickson Hall", 42.726, -84.485),
    ("Wells Hall", 42.728, -84.481),
    ("Communication Arts", 42.724, -84.485),
    ("Case Hall", 42.727, -84.488)
]

items = ["Snickers", "Monster Energy", "Protein Bar", "Cool Ranch Doritos", "Celsius", "SmartWater", "Pop-Tarts", "Cheez-Its"]

inventory_data = []
for i, (name, lat, lon) in enumerate(locations):
    inventory_data.append({
        "id": i + 1,
        "name": name,
        "lat": lat + (random.uniform(-0.001, 0.001)), # Tiny jitter for map visuals
        "lon": lon + (random.uniform(-0.001, 0.001)),
        "stock_level": random.randint(10, 100),
        "is_accessible": random.choice([True, True, True, False]), # 75% accessible
        "university": "MSU",
        "top_item": random.choice(items)
    })

pd.DataFrame(inventory_data).to_csv('inventory.csv', index=False)

# 2. Generate Expanded Feedback (100 Entries)
feedback_types = ["request", "issue"]
issue_contents = ["Scanner too high", "Out of change", "Stuck item", "Screen flickering", "Card reader error"]
request_items = ["Celsius", "Oatmilk Latte", "Yerba Mate", "Gluten Free Cookies", "Hot Cheetos", "Kind Bar", "Red Bull"]

feedback_data = []
start_date = datetime.now() - timedelta(days=7)

for i in range(100):
    f_type = random.choices(feedback_types, weights=[0.7, 0.3])[0] # More requests than issues
    feedback_data.append({
        "id": i + 1,
        "machine_id": random.randint(1, 15),
        "type": f_type,
        "content": random.choice(request_items) if f_type == "request" else random.choice(issue_contents),
        "timestamp": (start_date + timedelta(hours=random.randint(1, 168))).strftime("%Y-%m-%d %H:%M")
    })

pd.DataFrame(feedback_data).to_csv('feedback.csv', index=False)
print("CSVs generated: inventory.csv (15 rows) and feedback.csv (100 rows)")