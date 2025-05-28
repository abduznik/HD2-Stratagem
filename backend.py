import psutil
import time
import json
from ahk import AHK
from threading import Thread
import stratagems_data
import win32gui
import win32process
import re

ahk = AHK()

GAME_PROCESS = "Helldivers2.exe"
GAME_WINDOW = "HELLDIVERS™ 2"  # Use a unique substring

def is_game_running(process_name=GAME_PROCESS):
    return any(proc.name() == process_name for proc in psutil.process_iter())

def normalize(s):
    return re.sub(r'\W+', '', s).lower()

def get_helldivers_pid():
    for proc in psutil.process_iter():
        if proc.name().lower() == GAME_PROCESS.lower():
            return proc.pid
    return None

def get_helldivers_pid_by_window():
    """Find the PID of a window whose title contains 'helldivers'."""
    target = "helldivers"
    def enum_handler(hwnd, result):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if target in title.lower():
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                result.append(pid)
    result = []
    win32gui.EnumWindows(enum_handler, result)
    return result[0] if result else None

def get_helldivers_window_info():
    """Find the first visible window with 'helldivers' in the title."""
    target = "helldivers"
    windows = []

    def enum_handler(hwnd, result):
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if target in title.lower():
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                result.append((hwnd, title, pid))
    win32gui.EnumWindows(enum_handler, windows)
    return windows  # List of (hwnd, title, pid)

def is_game_focused():
    try:
        fg_hwnd = win32gui.GetForegroundWindow()
        fg_title = win32gui.GetWindowText(fg_hwnd)
        fg_pid = win32process.GetWindowThreadProcessId(fg_hwnd)[1]
        helldivers_windows = get_helldivers_window_info()
        for hwnd, title, pid in helldivers_windows:
            if fg_pid == pid:
                print(f"[DEBUG] Helldivers process is focused! Title: '{title}' | PID: {pid}")
                return True
        #print(f"[DEBUG] Foreground window: '{fg_title}' | PID: {fg_pid} -- Helldivers not focused.")
        return False
    except Exception as e:
        print(f"[DEBUG] Exception in is_game_focused: {e}")
        return False

def load_binds():
    with open("stratagems.json") as f:
        return json.load(f)

def listen_for_binds():
    while True:
        if is_game_focused():
            binds = load_binds()
            for strat, data in binds.items():
                if strat == "settings":
                    continue
                if not data.get("state"):
                    continue
                bind_keys = data.get("bind", [])
                if not bind_keys:
                    continue
                if ahk.key_state('Ctrl'):
                    if all(ahk.key_state(k) for k in bind_keys):
                        #print(f"[DEBUG] Triggering stratagem: {strat} with bind {bind_keys}")
                        strat_key = strat.lower()
                        mode = binds.get("settings", {}).get("mode", "wasd")
                        seq = stratagems_data.STRATAGEMS.get(strat_key, {}).get(mode, [])
                        time.sleep(0.05)
                        #print(f"[DEBUG] Sequence to send: {seq}")
                        if seq:
                            #print(f"[DEBUG] Forcing Ctrl down for sequence")
                            ahk.key_down('Ctrl')  # Always hold Ctrl with AHK
                                 # Small delay to ensure Ctrl is registered
                            for key in seq:
                                #print(f"[DEBUG] Sending key: {key}")
                                time.sleep(0.06)
                                ahk.key_down(key)
                                time.sleep(0.06)
                                ahk.key_up(key)
                            ahk.key_up('Ctrl')    # Release Ctrl after sequence
                            time.sleep(0.5)       # Prevent repeat
        time.sleep(0.1)

if __name__ == "__main__":
    Thread(target=listen_for_binds, daemon=True).start()

    # Debug loop: print focused window title and process name every second
    import os
    while True:
        try:
            hwnd = win32gui.GetForegroundWindow()
            title = win32gui.GetWindowText(hwnd)
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            proc_name = ""
            try:
                proc = psutil.Process(pid)
                proc_name = proc.name()
            except Exception:
                proc_name = "Unknown"
            print(f"[FOCUS DEBUG] Title: '{title}' | PID: {pid} | Process: {proc_name}")
        except Exception as e:
            print(f"[FOCUS DEBUG] Exception: {e}")
        time.sleep(1)