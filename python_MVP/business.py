import streamlit as st
import pandas as pd

st.set_page_config(page_title="Vending-Go Admin", layout="wide")

inv = pd.read_csv('inventory.csv')
fb = pd.read_csv('feedback.csv')

st.title("📈 Business Analytics Portal")

# Level 1: Grand Totals (Anonymized)
col1, col2, col3 = st.columns(3)
col1.metric("Total Machines", len(inv))
col2.metric("Active Issues", len(fb[fb['type'] == 'issue']))
col3.metric("Stock Health", f"{inv['stock_level'].mean():.1f}%")

# Level 2: Recommendations and Demand
st.divider()
st.subheader("Customer Demand (Anonymized)")

# This counts requests for items
request_counts = fb[fb['type'] == 'request']['content'].value_counts()
st.bar_chart(request_counts)

# Level 3: Individual Machine Drill-down
st.subheader("Machine Status")
selected_machine = st.selectbox("Select Machine to Inspect", inv['name'])

machine_data = inv[inv['name'] == selected_machine].iloc[0]
st.write(f"**Location:** {machine_data['university']}")
st.write(f"**Current Top Seller:** {machine_data['top_item']}")

# Display issues for this specific machine
st.warning("Reported Issues:")
st.table(fb[(fb['machine_id'] == machine_data['id']) & (fb['type'] == 'issue')])

# Add this to business.py under the bar chart section
st.divider()
st.subheader("⚠️ Urgent Maintenance Needed")

# Join feedback and inventory to see which names have the most issues
issue_df = fb[fb['type'] == 'issue']
priority_list = issue_df.groupby('machine_id').size().reset_index(name='issue_count')
priority_list = priority_list.merge(inv[['id', 'name']], left_on='machine_id', right_on='id').sort_values(by='issue_count', ascending=False)

st.table(priority_list[['name', 'issue_count']].head(5))