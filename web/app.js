let stratagems = {};
let currentStratagem = "";
let currentBind = [];

async function loadStratagems() {
  stratagems = await eel.get_stratagems()();
  filterStratagems();
}

function filterStratagems() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const showEnabled = document.getElementById("showEnabledOnly").checked;
  const grid = document.getElementById("stratagemGrid");
  grid.innerHTML = "";

  for (const [name, data] of Object.entries(stratagems)) {
    const { bind, state } = normalizeData(data);
    if (search && !name.toLowerCase().includes(search)) continue;
    if (showEnabled && !state) continue;

    const fileName = name.toLowerCase().replace(/\s+/g, "_");
    const div = document.createElement("div");
    div.className = "stratagem";

    const img = document.createElement("img");

    const formats = ["png", "jpg", "webp"];
    let formatIndex = 0;

    function tryLoadImage() {
      if (formatIndex >= formats.length) {
        img.style.display = "none";
        return;
      }
      img.src = `stratagems/${fileName}.${formats[formatIndex]}`;
      formatIndex++;
    }

    img.style.objectFit = "contain";
    img.style.aspectRatio = "1 / 1";
    img.style.width = "100%";
    img.style.height = "auto";

    img.alt = name;
    img.onerror = tryLoadImage;
    tryLoadImage();

    const title = document.createElement("div");
    title.className = "title";
    title.innerText = name;

    const bindDisplay = document.createElement("div");
    bindDisplay.className = "bind";
    bindDisplay.innerHTML = bind.length
      ? `<span class="ctrl-key">Ctrl</span> + ${bind.join(" + ")}`
      : "No Bind";

    // Toggle switch
    const toggleLabel = document.createElement("label");
    toggleLabel.className = "toggle-switch";

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = state;

    const slider = document.createElement("span");
    slider.className = "slider";

    toggleLabel.append(toggle, slider);

    toggle.onchange = () => {
      stratagems[name].state = toggle.checked;
      eel.save_bind(name, stratagems[name].bind || [], toggle.checked)().then(() => {
        updateStratagemUI(name);
      });
    };

    // Clear button
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "Clear";
    clearBtn.onclick = () => {
      stratagems[name].bind = [];
      eel.save_bind(name, [], stratagems[name].state)().then(() => {
        updateStratagemUI(name);
      });
    };

    const controls = document.createElement("div");
    controls.className = "stratagem-controls";
    controls.append(toggleLabel, clearBtn);

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(bindDisplay);
    div.appendChild(controls);

    div.onclick = (e) => {
      if (
        e.target.closest("button") ||
        e.target.closest("input") ||
        e.target.closest("label.toggle-switch")
      ) {
        return;
      }
      openBindModal(name);
    };

    grid.appendChild(div);
  }
}

function updateStratagemUI(name) {
  const stratDiv = [...document.querySelectorAll(".stratagem")].find(div =>
    div.querySelector(".title").innerText === name
  );
  if (!stratDiv) return;

  const data = stratagems[name];
  const { bind, state } = normalizeData(data);

  // Update toggle switch
  const toggle = stratDiv.querySelector('input[type="checkbox"]');
  if (toggle) toggle.checked = state;

  // Update bind display
  const bindDisplay = stratDiv.querySelector(".bind");
  if (bindDisplay) {
    bindDisplay.innerHTML = bind.length
      ? `<span class="ctrl-key">Ctrl</span> + ${bind.join(" + ")}`
      : "No Bind";
  }
}

function normalizeData(data) {
  if (Array.isArray(data)) {
    return { bind: data, state: true };
  }
  return {
    bind: Array.isArray(data.bind) ? data.bind : [],
    state: typeof data.state === "boolean" ? data.state : true,
  };
}

function openBindModal(name) {
  currentStratagem = name;
  currentBind = [];
  document.getElementById("modalTitle").innerText = name;
  document.getElementById("bindPreview").innerHTML = '<span class="ctrl-key">Ctrl</span>';
  document.getElementById("bindModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("bindModal").classList.add("hidden");
}

document.getElementById("saveBtn").onclick = async () => {
  stratagems[currentStratagem].bind = currentBind;
  await eel.save_bind(currentStratagem, currentBind, stratagems[currentStratagem].state)();
  closeModal();
  updateStratagemUI(currentStratagem);
};

document.getElementById("cancelBtn").onclick = closeModal;

document.addEventListener("keydown", (e) => {
  if (document.getElementById("bindModal").classList.contains("hidden")) return;
  if (e.key.toLowerCase() === "control") return;

  const key = e.key.toLowerCase();
  if (!currentBind.includes(key)) {
    currentBind.push(key);
    document.getElementById("bindPreview").innerHTML =
      '<span class="ctrl-key">Ctrl</span> + ' + currentBind.join(" + ");
  }
});

document.getElementById("searchBox").addEventListener("input", filterStratagems);
document.getElementById("showEnabledOnly").addEventListener("change", filterStratagems);

loadStratagems();