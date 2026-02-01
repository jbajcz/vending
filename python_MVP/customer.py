import streamlit as st
import pandas as pd

st.set_page_config(page_title="Vending-Go Customer", layout="centered")

# Load Data
inv = pd.read_csv('inventory.csv')

st.title("🥤 Vending-Go")
st.caption("Nearby Snack Tracker")

tab1, tab2, tab3 = st.tabs(["Home", "Map", "Request"])

with tab1:
    st.header("Recommended for You")
    col1, col2 = st.columns(2)
    col1.metric("Current Credit", "$12.50", "+$2.00")
    col2.metric("Reward Score", "740", "Gold Tier")
    
    st.subheader("Fast Restocks Near You")
    st.dataframe(inv[['name', 'top_item', 'stock_level']])

with tab2:
    st.header("Find a Machine")
    # Search functionality
    search = st.text_input("Search for an item (e.g., Snickers)")
    
    # Filter by accessibility or search
    acc_only = st.checkbox("Only show accessible machines")
    
    filtered_df = inv
    if acc_only:
        filtered_df = filtered_df[filtered_df['is_accessible'] == True]
    if search:
        filtered_df = filtered_df[filtered_df['top_item'].str.contains(search, case=False)]

    st.map(filtered_df)
    st.table(filtered_df[['name', 'university', 'is_accessible']])

with tab3:
    st.header("Request or Report")
    with st.form("feedback_form"):
        m_id = st.selectbox("Which machine?", inv['id'])
        f_type = st.radio("Type", ["Request New Item", "Report Issue"])
        content = st.text_area("Details")
        
        if st.form_submit_button("Submit"):
            # JANK ALERT: In a real app, this would write to the CSV
            st.success("Submitted! (In MVP mode, this doesn't save to file yet)")