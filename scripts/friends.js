const USER_ID = window.location.search.match(/\?id=(.*)/)[1];

document.getElementById("timeline-link").addEventListener("click", function () {
    window.location = `../pages/timeline.html?id=${USER_ID}`;
})

$(document).ready(() => {

    database.ref("users").once("value")
        .then(function (snapshot) {
            const users = snapshot.val();
            snapshot.forEach(function (childSnapshot) {
                const key = childSnapshot.key;
                suggestion(users[key].username, key);
                friendList(users[key].username, key);
            });
        })
});

function suggestion(name, key) {
    database.ref("friendship/" + USER_ID).orderByChild("friendId").equalTo(key).once("value", snapshot => {
        if (!snapshot.exists()) {
            if (key !== USER_ID) {
                $("#suggestion-list").append(`  
                <li>
                    <span>${name}</span>
                    <button data-friend-id=${key}>Seguir</button>
                </li>
                `)
            }
            $(`button[data-friend-id=${key}]`).click(function () {
                database.ref("friendship/" + USER_ID).push({
                    friendId: key
                })
                friendList(name, key);
                $(this).parent().remove();
            })
        }
    });
}

function friendList(name, key) {
    database.ref("friendship/" + USER_ID).orderByChild("friendId").equalTo(key).once("value", snapshot => {
        if (snapshot.exists()) {
            if (key !== USER_ID) {
                $("#friend-list").append(`  
                <li>
                    <span>${name}</span>
                    <button data-friend-id=${key}>Remover</button>
                </li>
                `)
            }
            $(`button[data-friend-id=${key}]`).click(function () {
                database.ref("friendship/" + USER_ID).once("value")
                    .then(function (snapshot) {
                        const temp = snapshot.val();
                        snapshot.forEach(function (childSnapshot) {
                            const friendKey = childSnapshot.key;
                            if (key == temp[friendKey].friendId) {
                                database.ref(`friendship/${USER_ID}/${friendKey}`).remove();
                            }
                        });
                    })
                $(this).parent().remove();
                suggestion(name, key);
            })
        }
    });
}

function search(email) {
    // database.ref("users").orderByChild("email").equalTo(email).once("value", snapshot => {
    database.ref("users").once("value")
        .then(function (snapshot) {
            const temp = snapshot.val();
            let notFound = true;
            snapshot.forEach(function (childSnapshot) {
                const friendKey = childSnapshot.key;
                if (email === temp[friendKey].email) {
                    notFound = false;
                    $("#search").append(`  
                <li>
                    <span>${temp[friendKey].username}</span>
                    <button data-friend-id=${friendKey}>Seguir</button>
                </li>
                `)
                }
            });
            if (notFound) {
                $("#search").append(`  
                <li>
                    <span>Usuária não encontrada!</span>
                </li>
                `)
            }
        });
}

document.getElementById("friend-search-btn").addEventListener("click", function () {
    let inputName = $("#friend-search").val();
    $("#search").find("li").remove();
    search(inputName);
})
