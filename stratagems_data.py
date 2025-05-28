# stratagems_data.py

STRATAGEMS = {
    "machine gun": {
        "arrows": ["down", "left", "down", "up", "right"],
        "wasd": ["s", "a", "s", "w", "d"],
    },
    "anti material rifle": {
        "arrows": ["down", "left", "right", "up", "down"],
        "wasd": ["s", "a", "d", "w", "s"],
    },
    "stalwart": {
        "arrows": ["down", "left", "down", "up", "up", "left"],
        "wasd": ["s", "a", "s", "w", "w", "a"],
    },
    "expendable anti tank": {
        "arrows": ["down", "down", "left", "up", "right"],
        "wasd": ["s", "s", "a", "w", "d"],
    },
    "recoilless rifle": {
        "arrows": ["down", "left", "right", "left", "right"],
        "wasd": ["s", "a", "d", "a", "d"],
    },
    "flamethrower": {
        "arrows": ["down", "left", "up", "down", "up"],
        "wasd": ["s", "a", "w", "s", "w"],
    },
    "autocannon": {
        "arrows": ["down", "left", "down", "up", "up", "right"],
        "wasd": ["s", "a", "s", "w", "w", "d"],
    },
    "heavy machine gun": {
        "arrows": ["down", "left", "up", "down", "down"],
        "wasd": ["s", "a", "w", "s", "s"],
    },
    "airburst rocket launcher": {
        "arrows": ["down", "up", "up", "left", "right"],
        "wasd": ["s", "w", "w", "a", "d"],
    },
    "commando": {
        "arrows": ["down", "left", "up", "down", "right"],
        "wasd": ["s", "a", "w", "s", "d"],
    },
    "railgun": {
        "arrows": ["down", "right", "down", "up", "left", "right"],
        "wasd": ["s", "d", "s", "w", "a", "d"],
    },
    "spear": {
        "arrows": ["down", "down", "up", "down", "down"],
        "wasd": ["s", "s", "w", "s", "s"],
    },
    "wasp": {
        "arrows": ["down", "down", "up", "down", "right"],
        "wasd": ["s", "s", "w", "s", "d"],
    },
}

def get_stratagem_bindings(key_type):
    """
    Return all stratagems with bindings for the specified key_type.

    Args:
        key_type (str): "arrows" or "wasd"

    Returns:
        dict: {stratagem_name: [list of keys]}
    """
    key_type = key_type.lower()
    if key_type not in ("arrows", "wasd"):
        raise ValueError("key_type must be 'arrows' or 'wasd'")
    return {name: bindings[key_type] for name, bindings in STRATAGEMS.items()}