import threading
import subprocess
import sys
import os
import time
import pystray
from PIL import Image
import importlib
import signal

import backend  # This should start the backend listener thread

GUI_SCRIPT = os.path.join(os.path.dirname(__file__), "gui.py")
FAVICON_PATH = os.path.join(os.path.dirname(__file__), "web", "favicon.png")
gui_process = None

def launch_gui():
    global gui_process
    if gui_process is None or gui_process.poll() is not None:
        gui_process = subprocess.Popen([sys.executable, GUI_SCRIPT])

def on_tray_icon_clicked(icon, item):
    launch_gui()

def quit_app(icon, item):
    global gui_process
    # Try to terminate the GUI process and its children
    if gui_process and gui_process.poll() is None:
        try:
            if os.name == 'nt':
                # Windows: terminate process tree
                import psutil
                parent = psutil.Process(gui_process.pid)
                for child in parent.children(recursive=True):
                    child.terminate()
                parent.terminate()
            else:
                os.killpg(os.getpgid(gui_process.pid), signal.SIGTERM)
            gui_process.wait(timeout=5)
        except Exception as e:
            print(f"[DEBUG] Exception terminating GUI: {e}")
    icon.stop()
    os._exit(0)  # Ensure all threads/processes are killed

def tray_thread():
    # Load favicon.png as tray icon
    try:
        icon_img = Image.open(FAVICON_PATH)
    except Exception:
        # Fallback: blank icon
        icon_img = Image.new('RGB', (64, 64), color=(0, 0, 0))

    icon = pystray.Icon(
        "HD2-Stratagem",
        icon_img,
        "Helldivers 2 Stratagem Helper",
        menu=pystray.Menu(
            pystray.MenuItem("Open GUI", on_tray_icon_clicked),
            pystray.MenuItem("Quit", quit_app)
        )
    )
    icon.on_click = on_tray_icon_clicked
    icon.run()

def backend_thread():
    # Patch backend to reload stratagems_data before each use
    import stratagems_data
    orig_get = backend.stratagems_data.STRATAGEMS

    def reload_stratagems_data():
        importlib.reload(stratagems_data)
        backend.stratagems_data = stratagems_data

    # Monkey-patch listen_for_binds to reload stratagems_data each loop
    orig_listen_for_binds = backend.listen_for_binds
    def listen_for_binds_with_reload():
        while True:
            reload_stratagems_data()
            orig_listen_for_binds()
            time.sleep(0.5)
    threading.Thread(target=listen_for_binds_with_reload, daemon=True).start()

if __name__ == "__main__":
    # Start backend listener thread with hot-reloading
    backend_thread()
    launch_gui()  # Start GUI on first run
    tray_thread()  # Start tray icon (blocking)