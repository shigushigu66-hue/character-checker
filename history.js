async function loadHistory() {

    const response =
        await fetch(
            "data/history.json"
        );

    const history =
        await response.json();

    const body =
        document.querySelector(
            ".history-body"
        );

    body.innerHTML =
        "<h2>更新履歴</h2><ul>" +
        history.map(item => `
            <li>
                ${item.date}
                ${item.text}
            </li>
        `).join("") +
        "</ul>";
}

loadHistory();