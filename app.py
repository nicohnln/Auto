import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import requests

# --- DEINE DATEN (Fest eingestellt) ---
USER_ID = "f272827a-590d-4050-9889-4089c7c29377" 
USER_NAME = "Nico"

# --- Design ---
st.set_page_config(page_title="Nico's Darts Stats", layout="wide")
st.markdown("""
    <style>
    .stApp { background-color: #0E1117; color: white; }
    [data-testid="stMetricValue"] { color: #00FFAA !important; }
    .stDataFrame { background-color: #161B22; border-radius: 10px; }
    </style>
    """, unsafe_allow_html=True)

st.title(f"🎯 Autodarts Stats: {USER_NAME}")

@st.cache_data(ttl=300) # Speichert Daten für 5 Min, um Ladezeit zu sparen
def load_data():
    try:
        # Matches abrufen
        url = f"https://api.autodarts.io/external/users/{USER_ID}/matches"
        matches = requests.get(url).json()
        
        leg_data = []
        for m in matches:
            for l in m.get('legs', []):
                # Wir suchen deine Stats in diesem Leg
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
    except:
        return pd.DataFrame()

df = load_data()

if not df.empty:
    # --- Metriken ---
    c1, c2, c3, c4 = st.columns(4)
    with c1: st.metric("Gesamt Avg", f"{round(df['Avg'].mean(), 2)}")
    with c2: st.metric("180er", df['180'].sum())
    with c3: st.metric("140er", df['140+'].sum())
    with c4: st.metric("Max Checkout", df['Checkout'].max())

    # --- Trend Graph ---
    fig = go.Figure()
    fig.add_trace(go.Scatter(y=df['Avg'], mode='lines+markers', line=dict(color='#00FFAA', width=3), name="Average"))
    fig.update_layout(
        title="Deine Formkurve (Avg pro Leg)",
        paper_bgcolor='#0E1117', plot_bgcolor='#161B22',
        font_color="white", xaxis_title="Legs (Verlauf)", yaxis_title="3-Dart Average"
    )
    st.plotly_chart(fig, use_container_width=True)

    # --- Checkout Tabelle (Nur > 40) ---
    st.subheader("🎯 Hohe Finishes (> 40)")
    high_co = df[df['Checkout'] > 40][['Datum', 'Checkout']].sort_values(by='Checkout', ascending=False)
    if not high_co.empty:
        st.table(high_co)
    else:
        st.write("Noch keine Finishes über 40 erfasst.")
    
    # --- Detail Tabelle ---
    with st.expander("Alle Leg-Details anzeigen"):
        st.dataframe(df.sort_index(ascending=False), use_container_width=True)
else:
    st.error("Konnte keine Daten laden. Bitte checke deine Autodarts-Privatsphäre-Einstellungen!")

if st.button('Daten aktualisieren'):
    st.cache_data.clear()
    st.rerun()
