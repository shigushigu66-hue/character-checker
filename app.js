const MAX_CHAR = 5;
const MAX_EQUIP = 5;

function getSaveData() {
    return JSON.parse(localStorage.getItem("characterData") || "{}");
}

function saveData(data) {
    localStorage.setItem("characterData", JSON.stringify(data));
}

async function loadCharacters() {
    const response = await fetch("data/characters.json");
    const characters = await response.json();

    const grid = document.getElementById("character-grid");
    const save = getSaveData();

    grid.innerHTML = "";

    characters.forEach(character => {

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

loadCharacters();

document
    .getElementById("export-btn")
    .addEventListener("click", exportPNG);

async function exportPNG() {

    const save = getSaveData();

    const response = await fetch("data/characters.json");
    const characters = await response.json();

    const pngLayout = document.getElementById("png-layout");

    const now = new Date();

    const dateText =
        `${now.getFullYear()}/` +
        `${String(now.getMonth() + 1).padStart(2, "0")}/` +
        `${String(now.getDate()).padStart(2, "0")}`;

    pngLayout.innerHTML = `
        <div class="png-header">
            <h1>キャラ装備所持率チェッカー</h1>
            <div class="png-date">${dateText}</div>
        </div>

        <div class="png-grid"></div>
    `;

    const pngGrid = pngLayout.querySelector(".png-grid");

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

    pngLayout.style.display = "block";

    const canvas = await html2canvas(pngLayout, {
        backgroundColor: "#f5f7fb",
        scale: 2,
        useCORS: true
    });

    pngLayout.style.display = "none";

    const link = document.createElement("a");

    link.download = "character_checker.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
}