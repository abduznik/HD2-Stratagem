import eel
import json
import os

eel.init('web')

@eel.expose
def get_stratagems():
    with open("stratagems.json") as f:
        return json.load(f)

@eel.expose
def save_bind(name, keys, state):
    with open("stratagems.json", "r") as f:
        data = json.load(f)

    # Preserve existing entry and only update 'bind' and 'state'
    if name in data:
        data[name]["bind"] = keys
        data[name]["state"] = state
    else:
        # In case the entry does not exist yet
        data[name] = {
            "bind": keys,
            "state": state,
            "category": "Uncategorized"  # Optional default
        }

    with open("stratagems.json", "w") as f:
        json.dump(data, f, indent=2)

@eel.expose
def set_mode(mode):
    with open('stratagems.json', 'r+', encoding='utf-8') as f:
        data = json.load(f)
        if "settings" not in data:
            data["settings"] = {}
        data["settings"]["mode"] = mode
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()

@eel.expose
def get_mode():
    with open('stratagems.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        return data.get("settings", {}).get("mode", "wasd")

eel.start(
    "index.html",
    #mode="chrome-app",
    size=(1024, 960)
)
