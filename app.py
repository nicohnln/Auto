import streamlit as st
import pandas as pd
import requests

st.set_page_config(page_title="Schorsch's Darts Check", layout="wide")

st.title("🎯 Autodarts Verbindungs-Check")

# Name eingeben
name = st.text_input("Gib deinen Namen exakt ein (schorsch):", value="schorsch")

if st.button("Daten suchen"):
    try:
        # 1. Versuche die ID für den Namen zu finden
        st.write("Suche User-Daten...")
        search_url = f"https://api.autodarts.io/external/users/?name={name}"
        res = requests.get(search_url).json()
        
        if res:
            user_id = res[0]['id']
            st.success(f"Gefunden! Deine ID ist: {user_id}")
            
            # 2. Versuche Matches zu laden
            match_url = f"https://api.autodarts.io/external/users/{user_id}/matches"
            matches = requests.get(match_url).json()
            
            if matches:
                st.balloons()
                st.write(f"Erfolg! {len(matches)} Matches gefunden.")
                st.json(matches[0]) # Zeigt das letzte Match als Test
            else:
                st.warning("User gefunden, aber die Match-Liste ist leer. Steht dein Profil auf PRIVAT?")
        else:
            st.error("Kein User mit diesem Namen gefunden.")
    except Exception as e:
        st.error(f"Fehler: {e}")

st.info("💡 Falls 'Match-Liste leer' kommt: Logge dich bei Autodarts ein, geh auf dein Profil und schau, ob deine Spiele für andere sichtbar sind.")
