import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import requests

# --- Design ---
st.set_page_config(page_title="Autodarts Pro Stats", layout="wide")
st.markdown("""
    <style>
    .stApp { background-color: #0E1117; color: white; }
    .stMetric { background-color: #161B22; border: 1px solid #333; padding: 10px; border-radius: 10px; }
    </style>
    """, unsafe_allow_html=True)

st.title("🎯 Autodarts Live-Statistik")

# --- User Suche ---
user_name = st.text_input("Dein Autodarts-Benutzername:", placeholder="z.B. DartPro123")

if user_name:
    try:
        # 1. User-ID über den Namen finden
        user_res = requests.get(f"https://api.autodarts.io/external/users/?name={user_name}").json()
        user_id = user_res[0]['id']
        
        # 2. Matches laden
        matches = requests.get(f"https://api.autodarts.io/external/users/{user_id}/matches").json()
        
        leg_data = []
        for m in matches:
            for l in m.get('legs', []):
                throws = l.get('throws', [])
                if not throws: continue
                
                # Stats berechnen
                avg = sum(throws) / (len(throws) / 3)
                co = l.get('checkout', 0)
                
                leg_data.append({
                    'Datum': m.get('createdAt')[:10],
                    'Avg': round(avg, 2),
                    '60+': len([t for t in throws if 60 <= t < 80]),
                    '80+': len([t for t in throws if 80 <= t < 100]),
                    '100+': len([t for t in throws if 100 <= t < 120]),
                    '120+': len([t for t in throws if 120 <= t < 140]),
                    '140+': len([t for t in throws if 140 <= t < 180]),
                    '180': len([t for t in throws if t == 180]),
                    'Checkout': co if co > 40 else 0
                })
        
        df = pd.DataFrame(leg_data)

        if not df.empty:
            # --- Metriken ---
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Gesamt Avg", f"{round(df['Avg'].mean(), 2)}")
            c2.metric("180er", df['180'].sum())
            c3.metric("140+", df['140+'].sum())
            c4.metric("Top Checkout", df['Checkout'].max())

            # --- Trend Graph ---
            fig = go.Figure()
            fig.add_trace(go.Scatter(y=df['Avg'], mode='lines+markers', line=dict(color='#00FFAA')))
            fig.update_layout(title="Average Trend pro Leg", paper_bgcolor='#0E1117', plot_bgcolor='#161B22', font_color="white")
            st.plotly_chart(fig, use_container_width=True)

            # --- Tabelle ---
            st.write("### Deine Leg-Historie")
            st.dataframe(df.sort_index(ascending=False), use_container_width=True)
        else:
            st.warning("Keine Spiele gefunden.")
            
    except Exception as e:
        st.error("User nicht gefunden oder API-Fehler. Prüfe deinen Namen!")
else:
    st.info("Bitte gib oben deinen Namen ein, um deine Daten zu laden.")
