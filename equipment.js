const saveKey = "equipmentData";

function getSaveData() {
    return JSON.parse(
        localStorage.getItem(saveKey) || "{}"
    );
}

function saveData(data) {
    localStorage.setItem(
        saveKey,
        JSON.stringify(data)
    );
}

function sortEquipment(equipment) {

    const slotOrder = {
        weapon: 1,
        head: 2,
        armor: 3,
        accessory: 4
    };

    return equipment.sort((a, b) => {

        const slotDiff =
            slotOrder[a.slot] -
            slotOrder[b.slot];

        if (slotDiff !== 0) {
            return slotDiff;
        }

        return a.name.localeCompare(
            b.name,
            "ja"
        );
    });
}



async function loadEquipment() {

    const response =
        await fetch("data/equipment.json");

const equipment =
    await response.json();

sortEquipment(equipment);

const save =
    getSaveData();

    const grid =
        document.getElementById(
            "equipment-grid"
        );

    grid.innerHTML = "";

    const slotFilter =
        document
            .getElementById("slot-filter")
            .value;

    const statFilter =
        document
            .getElementById("stat-filter")
            .value;

    equipment.forEach(item => {

if (!save[item.id]) {
    save[item.id] = {
        total: 0,
        max: 0,

        effect1: 0,
        effect2: 0,
        effect3: 0,
        effect4: 0,
        effect5: 0
    };
}

        const matchSlot =
            slotFilter === "all" ||
            item.slot === slotFilter;

        const matchStat =
            statFilter === "all" ||
            item.stats.includes(statFilter);

        if (
            !matchSlot ||
            !matchStat
        ) {
            return;
        }

const card =
    document.createElement("div");

card.className =
    "character-card";

if (save[item.id].total === 0) {
    card.classList.add("not-owned");
}

const effects = [];

if (save[item.id].effect1 > 0)
    effects.push(`E1:${save[item.id].effect1}`);

if (save[item.id].effect2 > 0)
    effects.push(`E2:${save[item.id].effect2}`);

if (save[item.id].effect3 > 0)
    effects.push(`E3:${save[item.id].effect3}`);

if (save[item.id].effect4 > 0)
    effects.push(`E4:${save[item.id].effect4}`);

if (save[item.id].effect5 > 0)
    effects.push(`E5:${save[item.id].effect5}`);

card.innerHTML = `
<img src="images/${item.id}.webp">

<div class="status">
    ${save[item.id].total}/${save[item.id].max}

    <div class="effect-summary">
        ${effects.join(" ")}
    </div>
</div>
`;

card.onclick = () => {
    showEquipmentDetail(item);
};
grid.appendChild(card);

    });

    saveData(save);
}

document
    .getElementById("slot-filter")
    .addEventListener(
        "change",
        loadEquipment
    );

document
    .getElementById("stat-filter")
    .addEventListener(
        "change",
        loadEquipment
    );

loadEquipment();

function showEquipmentDetail(item) {

    const save = getSaveData();

    const detail =
        document.getElementById(
            "equipment-detail"
        );

    detail.innerHTML = `
        <h2>${item.name}</h2>

        <img
            src="images/${item.id}.webp"
            style="
                width:200px;
                border-radius:12px;
            "
        >

        <div class="row">
            <span>所持</span>

            <button id="detail-total-minus">−</button>

            <span id="detail-total">
                ${save[item.id].total}
            </span>

            <button id="detail-total-plus">＋</button>
        </div>

        <div class="row">
            <span>完凸</span>

            <button id="detail-max-minus">−</button>

            <span id="detail-max">
                ${save[item.id].max}
            </span>

            <button id="detail-max-plus">＋</button>
        </div>
<div class="row">
    <span>効果1</span>
    <button id="effect1-minus">−</button>
    <span>${save[item.id].effect1}</span>
    <button id="effect1-plus">＋</button>
</div>

<div class="row">
    <span>効果2</span>
    <button id="effect2-minus">−</button>
    <span>${save[item.id].effect2}</span>
    <button id="effect2-plus">＋</button>
</div>

<div class="row">
    <span>効果3</span>
    <button id="effect3-minus">−</button>
    <span>${save[item.id].effect3}</span>
    <button id="effect3-plus">＋</button>
</div>

<div class="row">
    <span>効果4</span>
    <button id="effect4-minus">−</button>
    <span>${save[item.id].effect4}</span>
    <button id="effect4-plus">＋</button>
</div>

<div class="row">
    <span>効果5</span>
    <button id="effect5-minus">−</button>
    <span>${save[item.id].effect5}</span>
    <button id="effect5-plus">＋</button>
</div>

    `;

    document
        .getElementById("detail-total-plus")
        .onclick = () => {

            save[item.id].total++;

            saveData(save);

            showEquipmentDetail(item);
            loadEquipment();
        };

    document
        .getElementById("detail-total-minus")
        .onclick = () => {

            if (save[item.id].total > 0) {

                save[item.id].total--;

                if (
                    save[item.id].max >
                    save[item.id].total
                ) {
                    save[item.id].max =
                        save[item.id].total;
                }

                saveData(save);

                showEquipmentDetail(item);
                loadEquipment();
            }
        };

    document
        .getElementById("detail-max-plus")
        .onclick = () => {

            if (
                save[item.id].max <
                save[item.id].total
            ) {

                save[item.id].max++;

                saveData(save);

                showEquipmentDetail(item);
                loadEquipment();
            }
        };

    document
        .getElementById("detail-max-minus")
        .onclick = () => {

            if (save[item.id].max > 0) {

                save[item.id].max--;

                saveData(save);

                showEquipmentDetail(item);
                loadEquipment();
            }
        };

        for (let i = 1; i <= 5; i++) {

document
    .getElementById(`effect${i}-plus`)
    .onclick = () => {

        const totalEffects =
            save[item.id].effect1 +
            save[item.id].effect2 +
            save[item.id].effect3 +
            save[item.id].effect4 +
            save[item.id].effect5;

        if (
            totalEffects <
            save[item.id].total
        ) {

            save[item.id][`effect${i}`]++;

saveData(save);

showEquipmentDetail(item);
loadEquipment();
        }
    };

    document
        .getElementById(`effect${i}-minus`)
        .onclick = () => {

            if (
                save[item.id][`effect${i}`] > 0
            ) {

                save[item.id][`effect${i}`]--;
saveData(save);

showEquipmentDetail(item);
loadEquipment();
            }
        };
}
}

document
    .getElementById("export-json-btn")
    .onclick = () => {

        const data =
            getSaveData();

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement("a");

        a.href = url;

const now = new Date();

const fileName =
    `equipment_${
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

a.download = fileName;

        a.click();

        URL.revokeObjectURL(url);
    };

    document
    .getElementById("import-json-btn")
    .onclick = () => {

        document
            .getElementById(
                "import-json"
            )
            .click();
    };

document
    .getElementById(
        "import-json"
    )
    .addEventListener(
        "change",
        e => {

            const file =
                e.target.files[0];

            if (!file)
                return;

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    const data =
                        JSON.parse(
                            event.target.result
                        );

                    saveData(data);

                    loadEquipment();

                    alert(
                        "読込完了"
                    );
                };

            reader.readAsText(
                file
            );
        }
    );

    document
    .getElementById(
        "export-png-btn"
    )
    .onclick =
        exportEquipmentPNG;

async function exportEquipmentPNG() {

    const save = getSaveData();

    const response =
        await fetch("data/equipment.json");

    const equipment =
        await response.json();
        sortEquipment(equipment);

    const exportArea =
        document.createElement("div");

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
            <h1>装備所持チェッカー</h1>
            <div class="png-date">${dateText}</div>
        </div>

        <div class="png-grid"></div>
    `;

    const pngGrid =
        exportArea.querySelector(".png-grid");

    equipment.forEach(item => {

        const data = save[item.id];

        // 未所持は表示しない
        if (!data || data.total === 0) {
            return;
        }

        const effects = [];

        for (let i = 1; i <= 5; i++) {

            if (data[`effect${i}`] > 0) {

                effects.push(
                    `E${i}:${data[`effect${i}`]}`
                );
            }
        }

        const card =
            document.createElement("div");

        card.className = "png-card";

        card.innerHTML = `
            <img src="images/${item.id}.webp">

            <div class="png-status">
                所持${data.total}
                ｜完凸${data.max}

                ${
                    effects.length
                    ? `<br>${effects.join(" ")}`
                    : ""
                }
            </div>
        `;

        pngGrid.appendChild(card);
    });

    await Promise.all(
        [...exportArea.querySelectorAll("img")]
            .map(img => {

                if (img.complete) {
                    return Promise.resolve();
                }

                return new Promise(resolve => {

                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })
    );

    const canvas =
        await html2canvas(
            exportArea,
            {
                backgroundColor:
                    "#f5f7fb",
                scale: 2,
                useCORS: true
            }
        );

    exportArea.remove();

    const link =
        document.createElement("a");

    const fileName =
    `equipment_${
        now.getFullYear()
    }${
        String(now.getMonth() + 1).padStart(2, "0")
    }${
        String(now.getDate()).padStart(2, "0")
    }_${
        String(now.getHours()).padStart(2, "0")
    }${
        String(now.getMinutes()).padStart(2, "0")
    }.png`;

link.download = fileName;

    link.href =
        canvas.toDataURL("image/png");

    link.click();
}