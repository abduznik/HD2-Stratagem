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
    if (search && !name.toLowerCase().includes(search)) continue;
    if (showEnabled && data.length === 0) continue;

    const fileName = name.toLowerCase().replace(/\s+/g, "_");
    const div = document.createElement("div");
    div.className = "stratagem";

    const img = document.createElement("img");
    img.src = `stratagems/${fileName}.png`;
    img.alt = name;
    img.onerror = () => img.style.display = "none";

    const title = document.createElement("div");
    title.className = "title";
    title.innerText = name;

    const bind = document.createElement("div");
    bind.className = "bind";
    bind.innerHTML = data.length ? `<span class="ctrl-key">Ctrl</span> + ${data.join(" + ")}` : "No Bind";

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(bind);
    div.onclick = () => openBindModal(name);
    grid.appendChild(div);
  }
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
  await eel.save_bind(currentStratagem, currentBind)();
  stratagems[currentStratagem] = currentBind;
  closeModal();
  filterStratagems();
};

document.addEventListener("keydown", (e) => {
  if (document.getElementById("bindModal").classList.contains("hidden")) return;
  if (e.key.toLowerCase() === "control") return;

  currentBind.push(e.key.toLowerCase());
  const bindPreview = document.getElementById("bindPreview");
  bindPreview.innerHTML = '<span class="ctrl-key">Ctrl</span> + ' + currentBind.join(" + ");
});

document.getElementById("searchBox").addEventListener("input", filterStratagems);
document.getElementById("showEnabledOnly").addEventListener("change", filterStratagems);

loadStratagems();