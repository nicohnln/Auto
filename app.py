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
user_name_input = st.text_input("Dein Autodarts-Benutzername (exakt wie im Spiel):", placeholder="z.B. DartPro123")

if user_name_input:
    try:
        # 1. Alle User laden (Autodarts API Suche)
        all_users = requests.get("https://api.autodarts.io/external/users").json()
        
        # 2. Den richtigen User filtern (Groß-/Kleinschreibung ignorieren)
        user_data = next((u for u in all_users if u['name'].lower() == user_name_input.lower()), None)
        
        if user_data:
            user_id = user_data['id']
            st.success(f"Konto gefunden! Lade Daten für: {user_data['name']}")
            
            # 3. Matches laden
            matches = requests.get(f"https://api.autodarts.io/external/users/{user_id}/matches").json()
            
            leg_data = []
            for m in matches:
                # Wir schauen in jedes Match und jedes Leg
                for l in m.get('legs', []):
                    # Wir brauchen die Punkte des Users in diesem Leg
                    # Autodarts speichert Scores oft pro Spieler ab
                    throws = []
                    # Suche die Throws für deine User-ID in diesem Leg
                    for p in l.get('players', []):
                        if p.get('userId') == user_id:
                            throws = p.get('throws', [])
                            avg = p.get('average', 0)
                            co = p.get('checkout', 0)
                    
                    if not throws: continue
                    
                    leg_data.append({
                        'Match': m.get('id')[:8],
                        'Avg': round(float(avg), 2),
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
                c2.metric("180er", int(df['180'].sum()))
                c3.metric("140+", int(df['140+'].sum()))
                c4.metric("Höchster Checkout", int(df['Checkout'].max()))

                # --- Trend Graph ---
                fig = go.Figure()
                fig.add_trace(go.Scatter(y=df['Avg'], mode='lines+markers', line=dict(color='#00FFAA', width=3), name="Avg per Leg"))
                fig.update_layout(title="Deine Formkurve (Average pro Leg)", paper_bgcolor='#0E1117', plot_bgcolor='#161B22', font_color="white")
                st.plotly_chart(fig, use_container_width=True)

                # --- Tabelle ---
                st.write("### Detail-Statistik pro Leg")
                st.dataframe(df.sort_index(ascending=False), use_container_width=True)
            else:
                st.warning("Keine Spieldaten in deiner Historie gefunden.")
        else:
            st.error(f"Der Name '{user_name_input}' wurde bei Autodarts nicht gefunden. Achte auf Sonderzeichen!")
            
    except Exception as e:
        st.error(f"Fehler beim Abrufen: {e}")
else:
    st.info("Bitte gib oben deinen Namen ein.")
