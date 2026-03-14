import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import requests

# --- DEINE KORREKTEN DATEN ---
USER_ID = "6ec6e838-8c1d-4034-8b63-95638c471018" 
USER_NAME = "schorsch"

# --- Design ---
st.set_page_config(page_title=f"{USER_NAME}'s Darts Stats", layout="wide")
st.markdown("""
    <style>
    .stApp { background-color: #0E1117; color: white; }
    [data-testid="stMetricValue"] { color: #00FFAA !important; }
    .stTable { background-color: #161B22; color: white; }
    </style>
    """, unsafe_allow_html=True)

st.title(f"🎯 Autodarts Stats: {USER_NAME}")

@st.cache_data(ttl=60)
def load_data():
    try:
        # Abruf der Matches für schorsch
        url = f"https://api.autodarts.io/external/users/{USER_ID}/matches"
        response = requests.get(url)
        matches = response.json()
        
        leg_data = []
        for m in matches:
            for l in m.get('legs', []):
                for p in l.get('players', []):
                    if p.get('userId') == USER_ID:
                        throws = p.get('throws', [])
                        if not throws: continue
                        
                        avg = p.get('average', 0)
                        co = p.get('checkout', 0)
                        
                        leg_data.append({
                            'Datum': m.get('createdAt')[:10],
                            'Avg': round(float(avg), 2),
                            '60+': len([t for t in throws if 60 <= t < 80]),
                            '80+': len([t for t in throws if 80 <= t < 100]),
                            '100+': len([t for t in throws if 100 <= t < 120]),
                            '120+': len([t for t in throws if 120 <= t < 140]),
                            '140+': len([t for t in throws if 140 <= t < 180]),
                            '180': len([t for t in throws if t == 180]),
                            'Checkout': int(co) if co else 0
                        })
        return pd.DataFrame(leg_data)
    except Exception:
        return pd.DataFrame()

df = load_data()

if not df.empty:
    # Metriken für schorsch
    c1, c2, c3, c4 = st.columns(4)
    with c1: st.metric("Gesamt Avg", f"{round(df['Avg'].mean(), 2)}")
    with c2: st.metric("180er", int(df['180'].sum()))
    with c3: st.metric("140er", int(df['140+'].sum()))
    with c4: st.metric("Max Checkout", int(df['Checkout'].max()))

    # Der Average-Verlauf
    fig = go.Figure()
    fig.add_trace(go.Scatter(y=df['Avg'], mode='lines+markers', line=dict(color='#00FFAA', width=3)))
    fig.update_layout(title="Dein Average Trend (pro Leg)", paper_bgcolor='#0E1117', plot_bgcolor='#161B22', font_color="white")
    st.plotly_chart(fig, use_container_width=True)

    # Checkout Tabelle
    st.subheader("🎯 Deine hohen Finishes (> 40)")
    high_co = df[df['Checkout'] > 40][['Datum', 'Checkout']].sort_values(by='Checkout', ascending=False)
    if not high_co.empty:
        st.table(high_co)
    else:
        st.write("Noch keine Finishes über 40 erfasst.")
    
else:
    st.error(f"Keine Daten für '{USER_NAME}' gefunden. Bitte prüfe, ob deine Spiele in Autodarts auf 'Öffentlich' stehen!")

if st.button('Daten jetzt aktualisieren'):
    st.cache_data.clear()
    st.rerun()
