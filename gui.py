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
    data[name] = {
    	"bind": keys,
    	"state": state
    }
    with open("stratagems.json", "w") as f:
        json.dump(data, f, indent=2)

eel.start("index.html",mode="chrome-app", size=(1024, 720))