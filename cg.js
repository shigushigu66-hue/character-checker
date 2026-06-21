const MAX_CG = 6;

function getSaveData() {
    return JSON.parse(
        localStorage.getItem("cgData") || "{}"
    );
}

function saveData(data) {
    localStorage.setItem(
        "cgData",
        JSON.stringify(data)
    );
}

function getStage(value) {

    if (value >= 6) {
        return "最終段階";
    }

    if (value >= 3) {
        return "第二段階";
    }

    if (value >= 1) {
        return "第一段階";
    }

    return "未開放";
}

function sortCharacters(characters) {

    const nationOrder = {
        "神霄帝国": 1,
        "イズモ": 2,
        "ミスト": 3,
        "エレン": 4,
        "聖教会": 5,
        "ウトピア": 6,
        "中立": 7
    };

    return characters.sort((a, b) => {
        return (
            nationOrder[a.nation] -
            nationOrder[b.nation]
        );
    });
}

async function loadCG() {

const response =
    await fetch("data/characters.json");

const cgs =
    await response.json();

    const save =
        getSaveData();

    const grid =
        document.getElementById(
            "character-grid"
        );

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

        sortCharacters(cgs);

    cgs.forEach(cg => {

const matchName =
    cg.name
        .toLowerCase()
        .includes(keyword);

const matchNation =
    nation === "all" ||
    cg.nation === nation;

if (
    !matchName ||
    !matchNation
) {
    return;
}

        if (!save[cg.id]) {

            save[cg.id] = {
                progress: 0
            };
        }

        const card =
            document.createElement("div");

        card.className =
            "character-card";

            if (save[cg.id].progress === 0) {
    card.classList.add("not-owned");
}

if (save[cg.id].progress === 6) {
    card.classList.add("cg-complete");
}

        card.innerHTML = `
            <img src="images/${cg.id}.webp">

            <div class="status">

                <div class="row">

                    <button class="minus">
                        −
                    </button>

                    <span class="value">
                        ${save[cg.id].progress}
                    </span>/6

                    <button class="plus">
                        ＋
                    </button>

                </div>

                <div class="row">
                    ${getStage(
                        save[cg.id].progress
                    )}
                </div>

            </div>
        `;

        card
            .querySelector(".plus")
            .onclick = () => {

                if (
                    save[cg.id].progress <
                    MAX_CG
                ) {

                    save[cg.id].progress++;

                    saveData(save);

                    loadCG();
                }
            };

        card
            .querySelector(".minus")
            .onclick = () => {

                if (
                    save[cg.id].progress > 0
                ) {

                    save[cg.id].progress--;

                    saveData(save);

                    loadCG();
                }
            };

        grid.appendChild(card);
    });

    saveData(save);
}

loadCG();

document
    .getElementById("export-btn")
    .addEventListener(
        "click",
        exportPNG
    );

async function exportPNG() {

    const save =
        getSaveData();

    const response =
        await fetch(
            "data/characters.json"
        );

    const characters =
        await response.json();

    const hideComplete =
        document.getElementById(
            "hide-complete-cg"
        ).checked;

    const userName =
        localStorage.getItem(
            "userName"
        ) || "NoName";

    const exportArea =
        document.createElement("div");

    exportArea.style.position =
        "absolute";

    exportArea.style.left =
        "-99999px";

    exportArea.style.top = "0";

    exportArea.style.width =
        "1024px";

    exportArea.style.background =
        "#f5f7fb";

    exportArea.style.padding =
        "30px";

    document.body.appendChild(
        exportArea
    );

    const now = new Date();

    const dateText =
        `${now.getFullYear()}/` +
        `${String(
            now.getMonth() + 1
        ).padStart(2,"0")}/` +
        `${String(
            now.getDate()
        ).padStart(2,"0")}`;

    exportArea.innerHTML = `
        <div class="png-header">
            <h1>CGチェッカー</h1>

            <div class="png-user">
                ${userName}
            </div>

            <div class="png-date">
                ${dateText}
            </div>
        </div>

        <div class="png-grid"></div>
    `;

    const pngGrid =
        exportArea.querySelector(
            ".png-grid"
        );

    characters.forEach(character => {

        const data =
            save[character.id] || {
                progress: 0
            };

        if (
            hideComplete &&
            data.progress === 6
        ) {
            return;
        }

        let className =
            "png-card";

        if (
            data.progress === 0
        ) {
            className +=
                " missing";
        }

        if (
            data.progress === 6
        ) {
            className +=
                " complete";
        }

        const card =
            document.createElement(
                "div"
            );

        card.className =
            className;

        card.innerHTML = `
            <img src="images/${character.id}.webp">

            <div class="png-status">
                ${data.progress}/6
            </div>
        `;

        pngGrid.appendChild(card);
    });

    await Promise.all(
        [
            ...exportArea.querySelectorAll(
                "img"
            )
        ].map(img => {

            if (
                img.complete
            ) {
                return Promise.resolve();
            }

            return new Promise(
                resolve => {

                    img.onload =
                        resolve;

                    img.onerror =
                        resolve;
                }
            );
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
        document.createElement(
            "a"
        );

    const fileName =
        `cg_${
            now.getFullYear()
        }${
            String(
                now.getMonth() + 1
            ).padStart(2,"0")
        }${
            String(
                now.getDate()
            ).padStart(2,"0")
        }_${
            String(
                now.getHours()
            ).padStart(2,"0")
        }${
            String(
                now.getMinutes()
            ).padStart(2,"0")
        }.png`;

    link.download =
        fileName;

    link.href =
        canvas.toDataURL(
            "image/png"
        );

    link.click();
}

const menuBtn =
    document.getElementById("menu-btn");

const sideMenu =
    document.getElementById("side-menu");

const overlay =
    document.getElementById("menu-overlay");

menuBtn.onclick = () => {

    sideMenu.classList.add("open");

    overlay.classList.add("show");

    menuBtn.classList.add("hide");
};

overlay.onclick = () => {

    sideMenu.classList.remove("open");

    overlay.classList.remove("show");

    menuBtn.classList.remove("hide");
};

function loadUserName() {

    let userName =
        localStorage.getItem("userName");

    if (!userName) {

        userName = "NoName";

        localStorage.setItem(
            "userName",
            userName
        );
    }

    document.querySelector(
        ".menu-user"
    ).textContent = userName;
}

loadUserName();

document
.getElementById("change-name-btn")
.onclick = () => {

    let newName =
        prompt(
            "ユーザー名を入力",
            localStorage.getItem("userName")
        );

    if (!newName) return;

    newName =
        newName.trim()
        .substring(0,25);

    localStorage.setItem(
        "userName",
        newName
    );

    loadUserName();
};

document
.getElementById("close-menu")
.onclick = () => {

    sideMenu.classList.remove("open");

    overlay.classList.remove("show");

    menuBtn.classList.remove("hide");
};

document
    .getElementById(
        "export-json-btn"
    )
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
            document.createElement(
                "a"
            );

        const now =
            new Date();

        a.href = url;

        a.download =
            `cg_${
                now.getFullYear()
            }${
                String(
                    now.getMonth() + 1
                ).padStart(2,"0")
            }${
                String(
                    now.getDate()
                ).padStart(2,"0")
            }_${
                String(
                    now.getHours()
                ).padStart(2,"0")
            }${
                String(
                    now.getMinutes()
                ).padStart(2,"0")
            }.json`;

        a.click();

        URL.revokeObjectURL(
            url
        );
    };

    document
    .getElementById(
        "import-json-btn"
    )
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
        async e => {

            const file =
                e.target.files[0];

            if (!file)
                return;

            try {

                const text =
                    await file.text();

                const data =
                    JSON.parse(
                        text
                    );

                if (
                    !confirm(
                        "現在のCGデータを上書きしますか？"
                    )
                ) {
                    return;
                }

                saveData(
                    data
                );

                loadCG();

                alert(
                    "読込完了"
                );

            } catch {

                alert(
                    "JSONファイルが不正です"
                );
            }
        }
    );

    document
    .getElementById(
        "reset-btn"
    )
    .onclick = () => {

        if (
            !confirm(
                "CGデータを全てリセットしますか？"
            )
        ) {
            return;
        }

        localStorage.removeItem(
            "cgData"
        );

        loadCG();
    };

    document
    .getElementById("search-box")
    .addEventListener(
        "input",
        loadCG
    );

document
    .getElementById("nation-filter")
    .addEventListener(
        "change",
        loadCG
    );

    document
.getElementById("history-btn")
.onclick = () => {

    document
    .getElementById("history-modal")
    .classList.add("show");
};

document
.getElementById("close-history")
.onclick = () => {

    document
    .getElementById("history-modal")
    .classList.remove("show");
};