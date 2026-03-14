import streamlit as st
import pandas as pd
import plotly.graph_objects as go

# Design-Einstellungen
st.set_page_config(page_title="Darts Stats", layout="wide")
st.markdown("<style>.stApp { background-color: #121212; color: white; }</style>", unsafe_allow_html=True)

st.title("🎯 Mein Autodarts Dashboard")

# Beispiel-Daten
data = {
    'Leg': [1, 2, 3, 4, 5],
    'Avg': [50.5, 55.2, 48.9, 62.1, 58.4],
    '140+': [0, 1, 0, 2, 1],
    '180': [0, 0, 0, 1, 0],
    'Checkout': [0, 52, 0, 100, 40]
}
df = pd.DataFrame(data)

# Anzeige
c1, c2 = st.columns(2)
c1.metric("Letzter Average", f"{df['Avg'].iloc[-1]}")
c2.metric("180er Gesamt", df['180'].sum())

fig = go.Figure(go.Scatter(x=df['Leg'], y=df['Avg'], mode='lines+markers', line=dict(color='#00FFAA')))
fig.update_layout(title="Average Trend", paper_bgcolor='#121212', plot_bgcolor='#1E1E1E', font_color="white")
st.plotly_chart(fig, use_container_width=True)

st.write("### Alle Checkouts > 40")
st.table(df[df['Checkout'] >= 40][['Leg', 'Checkout']])
