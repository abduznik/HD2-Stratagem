let stratagems = {};
let currentStratagem = "";
let currentBind = [];
let categories = new Set();

async function loadStratagems() {
  stratagems = await eel.get_stratagems()();

  // Extract unique categories from the stratagem data
  categories = new Set(
    Object.values(stratagems).map(s => s.category || "Uncategorized")
  );

  populateCategoryFilter();
  filterStratagems();
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return; // In case the element is missing

  // Clear previous options except the first ("All Categories")
  categoryFilter.querySelectorAll("option:not(:first-child)").forEach(opt => opt.remove());

  // Add sorted category options
  Array.from(categories)
    .sort()
    .forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat.replace(/_/g, " "); // Optional: beautify category text
      categoryFilter.appendChild(option);
    });
}

function filterStratagems() {
  const search = document.getElementById("searchBox").value.toLowerCase();
  const showEnabled = document.getElementById("showEnabledOnly").checked;
  const selectedCategory = document.getElementById("categoryFilter")?.value || "";
  const grid = document.getElementById("stratagemGrid");
  grid.innerHTML = "";

  for (const [name, data] of Object.entries(stratagems)) {
    const { bind, state, category } = normalizeData(data);

    if (search && !name.toLowerCase().includes(search)) continue;
    if (showEnabled && !state) continue;
    if (selectedCategory && category !== selectedCategory) continue;

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
      stratagems[name].state = false;
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
  // Provide defaults for missing properties including category
  return {
    bind: Array.isArray(data.bind) ? data.bind : [],
    state: typeof data.state === "boolean" ? data.state : true,
    category: typeof data.category === "string" ? data.category : "Uncategorized",
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

// Add event listener for category filter dropdown
const categoryFilterElem = document.getElementById("categoryFilter");
if (categoryFilterElem) {
  categoryFilterElem.addEventListener("change", filterStratagems);
}

loadStratagems();