const wsUrl = window.WS_URL || `${location.origin.replace("http", "ws")}/ws`;
const gqlUrl = window.GRAPHQL_URL || "/graphql";
const ws = new WebSocket(wsUrl);
ws.onopen = () => ws.send(JSON.stringify({ type: "JOIN", boardId: window.BOARD_ID }));

ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "TASK_CREATED") {
        const li = document.createElement("li");
        li.textContent = msg.task.text;
        document.querySelector("#tasks").appendChild(li);
    }
    if (msg.type === "MEMBER_ADDED") {
        const li = document.createElement("li");
        li.textContent = `${msg.member.userEmail || msg.member.userId} (${msg.member.role})`;
        document.querySelector("#members").appendChild(li);
    }
};

document.querySelector("#taskForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.querySelector("#taskText").value.trim();
    if (!text) return;
    fetch(gqlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
            query: `mutation { createTask(boardId:"${window.BOARD_ID}", text:"${text}") { id text status } }`,
        }),
    })
        .then(r => r.json())
        .then(j => {
            if (j.errors) {
                console.error(j.errors);
                alert("Failed to create task: " + (j.errors[0]?.message || "Unknown error"));
            }
        })
        .catch(console.error);
    document.querySelector("#taskText").value = "";
});

document.querySelector("#inviteForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#inviteEmail").value.trim();
    const role = document.querySelector("#inviteRole").value;
    if (!email) return;
    const query = `mutation { addMember(boardId:"${window.BOARD_ID}", email:"${email}", role:${role}) { userId role } }`;
    fetch(gqlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ query })
    })
        .then(r => r.json())
        .then(j => {
            if (j.errors) {
                console.error(j.errors);
                document.querySelector('#inviteMsg').textContent = 'Invite failed.';
            } else {
                document.querySelector('#inviteMsg').textContent = 'Invite sent. Waiting for acceptance.';
                document.querySelector('#inviteEmail').value = '';
            }
        })
        .catch(err => {
            console.error(err);
            document.querySelector('#inviteMsg').textContent = 'Invite failed.';
        });
});
