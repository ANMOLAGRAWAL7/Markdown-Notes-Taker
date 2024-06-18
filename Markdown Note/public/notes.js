document.querySelector('.add-note-button').addEventListener('click', async function () {
    const title = prompt("Enter note title:");
    const note = document.getElementById("markdown-output").innerHTML;
    //console.log(note);
    try {
        const response = await fetch("/addnote", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title, note: note })
        });
        if (!response.ok) {
            console.log("error in routing to /addnote");
        }
    } catch (error) {
        console.log("error in adding notes", error);
    }
});
