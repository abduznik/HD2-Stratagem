import psutil, time, json
from ahk import AHK
from threading import Thread

ahk = AHK()

def is_game_running(process_name="Helldivers.exe"):
    return any(proc.name() == process_name for proc in psutil.process_iter())

def load_binds():
    with open("stratagems.json") as f:
        return json.load(f)

def listen_for_binds():
    binds = load_binds()
    while True:
        if is_game_running():
            if ahk.key_state('Ctrl'):
                for strat, keys in binds.items():
                    if all(ahk.key_state(k) for k in keys):
                        ahk.type(keys)
        time.sleep(0.1)

if __name__ == "__main__":
    Thread(target=listen_for_binds).start()