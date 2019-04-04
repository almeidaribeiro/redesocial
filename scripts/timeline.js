// Get a reference to the database service
const USER_ID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function() {
  database.ref("posts/" + USER_ID).once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let childKey = childSnapshot.key;
      let childData = childSnapshot.val();
      if (childData.post) {
        database.ref("users/" + USER_ID).once('value').then(function(snapshot) {
          const username = snapshot.val().username;
          $(".post-list").prepend(templateStringPost(childData.post, username, childKey))
          paloma(childKey);
        });
      };
    });
  });

  $(".post-text-btn").click(function(event) {
    event.preventDefault();
    let text = $(".post-input").val();
    if (text === "") {
      $(".post-text-btn").on(function() {
        $(this).prop("disabled", true);
      });
    } else {
      post(text, database, USER_ID);
      database.ref("users/" + USER_ID).once('value').then(function(snapshot) {
      
        const username = snapshot.val().username;
        $(".post-list").prepend(templateStringPost(text, username))
      })
      $(".post-input").val("");
    };
  });
});

function templateStringPost(text, name, key) {
  return `<div>
  <p><strong>${name}</strong></p>
  <p>${text}</p>
  <button data-key="${key}" type="button" class="delete"> Excluir </button>
  </div>`
}

function paloma (key){
  $(`button[data-key=${key}]`).click(function(){
    $(this).parent().remove();
    database.ref(`posts/${USER_ID}/${key}`).remove();
   })
 

}

