const MAX_CHAR = 5;
const MAX_EQUIP = 5;

function getSaveData() {
    return JSON.parse(localStorage.getItem("characterData") || "{}");
}

function saveData(data) {
    localStorage.setItem("characterData", JSON.stringify(data));
}

function sortCharacters(characters) {

    const nationOrder = {
        "神霄帝国": 1,
        "イズモ": 2,
        "ミスト": 3,
        "エレン": 4,
        "聖教会": 5,
        "ウトピア": 6,
        "中立": 7,
    };

    return characters.sort((a, b) => {
        return nationOrder[a.nation] - nationOrder[b.nation];
    });
}



function exportJSON() {

    const save = getSaveData();

    const json =
        JSON.stringify(save, null, 2);

    const blob = new Blob(
        [json],
        {
            type: "application/json"
        }
    );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

const now = new Date();

const fileName =
    `backup_${
        now.getFullYear()
    }${
        String(now.getMonth() + 1).padStart(2, "0")
    }${
        String(now.getDate()).padStart(2, "0")
    }_${
        String(now.getHours()).padStart(2, "0")
    }${
        String(now.getMinutes()).padStart(2, "0")
    }.json`;

link.download = fileName;

    link.click();

    URL.revokeObjectURL(link.href);
}

async function importJSON(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    try {

        const text =
            await file.text();

        const data =
            JSON.parse(text);

if (
    !confirm(
        "現在のデータを上書きしますか？"
    )
) {
    return;
}

        saveData(data);

        await loadCharacters();

        alert(
            "データを読み込みました"
        );

    } catch {

        alert(
            "JSONファイルが正しくありません"
        );
    }
}

async function loadCharacters() {
    const response = await fetch("data/characters.json");
    const characters = await response.json();

    const grid = document.getElementById("character-grid");
    const save = getSaveData();

    grid.innerHTML = "";

const keyword =
    document
        .getElementById("search-box")
        .value
        .trim()
        .toLowerCase();

const nation =
    document
        .getElementById("nation-filter")
        .value;

const ownership =
    document
        .getElementById("ownership-filter")
        .value;

sortCharacters(characters);

characters.forEach(character => {

    const matchName =
        character.name
            .toLowerCase()
            .includes(keyword);

const matchNation =
    nation === "all" ||
    character.nation === nation;

const isOwned =
    save[character.id] &&
    (
        save[character.id].char !== -1 ||
        save[character.id].equip !== -1
    );

const matchOwnership =
    ownership === "all" ||
    (ownership === "owned" && isOwned) ||
    (ownership === "unowned" && !isOwned);

if (
    !matchName ||
    !matchNation ||
    !matchOwnership
) {
    return;
}

        if (!save[character.id]) {
            save[character.id] = {
                char: -1,
                equip: -1
            };
        }

        const card = document.createElement("div");
        card.className = "character-card";

        card.innerHTML = `
            <img src="images/${character.id}.webp">

            <div class="status">

                <div class="row">
                    <span class="label">本体</span>
                    <button class="char-minus">−</button>
                    <span class="char-value">
                        ${save[character.id].char === -1 ? "--" : save[character.id].char}
                    </span>/5
                    <button class="char-plus">＋</button>
                </div>

                <div class="row">
                    <span class="label">装備</span>
                    <button class="equip-minus">−</button>
                    <span class="equip-value">
                        ${save[character.id].equip === -1 ? "--" : save[character.id].equip}
                    </span>/5
                    <button class="equip-plus">＋</button>
                </div>

            </div>
        `;

        const charValue = card.querySelector(".char-value");
        const equipValue = card.querySelector(".equip-value");

        function updateCardColor() {
            if (
                save[character.id].char === -1 &&
                save[character.id].equip === -1
            ) {
                card.classList.add("not-owned");
            } else {
                card.classList.remove("not-owned");
            }
        }

        updateCardColor();

        card.querySelector(".char-plus").onclick = () => {
            if (save[character.id].char < MAX_CHAR) {
                save[character.id].char++;
                charValue.textContent =
                    save[character.id].char === -1
                        ? "--"
                        : save[character.id].char;

                updateCardColor();
                saveData(save);
            }
        };

        card.querySelector(".char-minus").onclick = () => {
            if (save[character.id].char > -1) {
                save[character.id].char--;
                charValue.textContent =
                    save[character.id].char === -1
                        ? "--"
                        : save[character.id].char;

                updateCardColor();
                saveData(save);
            }
        };

        card.querySelector(".equip-plus").onclick = () => {
            if (save[character.id].equip < MAX_EQUIP) {
                save[character.id].equip++;
                equipValue.textContent =
                    save[character.id].equip === -1
                        ? "--"
                        : save[character.id].equip;

                updateCardColor();
                saveData(save);
            }
        };

        card.querySelector(".equip-minus").onclick = () => {
            if (save[character.id].equip > -1) {
                save[character.id].equip--;
                equipValue.textContent =
                    save[character.id].equip === -1
                        ? "--"
                        : save[character.id].equip;

                updateCardColor();
                saveData(save);
            }
        };

        grid.appendChild(card);
    });

    saveData(save);
}


loadCharacters();

document
    .getElementById("reset-btn")
    .addEventListener("click", resetData);

document
    .getElementById("ownership-filter")
    .addEventListener(
        "change",
        loadCharacters
    );

document
    .getElementById("search-box")
    .addEventListener("input", loadCharacters);

document
    .getElementById("nation-filter")
    .addEventListener("change", loadCharacters);

document
    .getElementById("export-btn")
    .addEventListener("click", exportPNG);

    document
    .getElementById("export-json-btn")
    .addEventListener("click", exportJSON);

document
    .getElementById("import-json")
    .addEventListener("change", importJSON);

async function exportPNG() {

    const save = getSaveData();

    const response = await fetch("data/characters.json");
    const characters = await response.json();
    sortCharacters(characters);

const exportArea = document.createElement("div");

exportArea.style.position = "absolute";
exportArea.style.left = "-99999px";
exportArea.style.top = "0";

exportArea.style.width = "1024px";

exportArea.style.background = "#f5f7fb";

document.body.appendChild(exportArea);

    const now = new Date();

    const dateText =
        `${now.getFullYear()}/` +
        `${String(now.getMonth() + 1).padStart(2, "0")}/` +
        `${String(now.getDate()).padStart(2, "0")}`;

    exportArea.innerHTML = `
        <div class="png-header">
            <h1>キャラ装備所持率チェッカー</h1>
            <div class="png-date">${dateText}</div>
        </div>

        <div class="png-grid"></div>
    `;

const pngGrid =
    exportArea.querySelector(".png-grid");

characters.forEach(character => {

        const data = save[character.id] || {
            char: -1,
            equip: -1
        };

        let className = "png-card";

        const charText =
            data.char === -1
                ? "--"
                : data.char;

        const equipText =
            data.equip === -1
                ? "--"
                : data.equip;

        const isMissing =
            data.char === -1 &&
            data.equip === -1;

        const isPerfect =
            data.char === 5 &&
            data.equip === 5;

        const isMaxChar =
            data.char === 5;

        if (isMissing) {
            className += " missing";
        }
        else if (isPerfect) {
            className += " perfect";
        }
        else if (isMaxChar) {
            className += " max-char";
        }

        const card = document.createElement("div");

        card.className = className;

        card.innerHTML = `
            <img src="images/${character.id}.webp">

            <div class="png-status">
                本体${charText}/5｜装備${equipText}/5
            </div>
        `;

        pngGrid.appendChild(card);
    });

await Promise.all(
    [...exportArea.querySelectorAll("img")].map(img => {
        if (img.complete) return Promise.resolve();

        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    })
);

const canvas = await html2canvas(exportArea, {
    backgroundColor: "#f5f7fb",
    scale: 2,
    useCORS: true
});

exportArea.remove();

    const link = document.createElement("a");

    link.download = "character_checker.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
}

function resetData() {

    if (
        !confirm(
            "全キャラのデータをリセットしますか？"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        "characterData"
    );

    loadCharacters();
}