$(document).ready(function(){
	var config = {
    apiKey: "AIzaSyCc27S4SCsjt14m38Feu4AOtmXr2Yrqf6Q",
    authDomain: "webhomework-3b5c5.firebaseapp.com",
    databaseURL: "https://webhomework-3b5c5.firebaseio.com",
    projectId: "webhomework-3b5c5",
    storageBucket: "webhomework-3b5c5.appspot.com",
    messagingSenderId: "691250129160"
  };
  firebase.initializeApp(config);
  var dbRef = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL = '';
  var $img = $('img');

  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');

  var $messageField = $('#messageInput');
  var $nameField = $('#nameInput');
  var $messageList = $('#example-messages');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');


  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled');
  } 
  else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled');
    $btnSignUp.removeAttr('disabled');
  }

  // SignIn
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(e){
    	window.location.href = "./profile.html";
    });
  });

    // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log('SignIn '+user.email);
      $signInfo.html(user.email+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')

      // Add a callback that is triggered for each chat message.
      dbRef.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous";
        var message = data.text;

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        $nameElement.text(username);
        $messageElement.text(message).prepend($nameElement);

        //ADD MESSAGE
        $messageList.append($messageElement)

        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });
    } else {
      console.log("not logged in");
    }
  });

  // LISTEN FOR KEYPRESS EVENT
  $messageField.keypress(function (e) {
  	const user = firebase.auth().currentUser;
    if (e.keyCode == 13) {
      //FIELD VALUES
      firebase.database().ref('/user/' + user.uid).once('value').then(function(snapshot) {
      	var username = snapshot.val().displayName;
      var message = $messageField.val();
      console.log(username);
      console.log(message);

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      dbRef.push({name:username, text:message});
      $messageField.val('');
      });
    }
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user = " + user);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.set({
        email: user.email,
        displayName:'',
        userOccupation:'',
        userAge:'',
        photoURL: '',
        userDescription:''
      });
      window.location.href = "./profile.html";
      LoadUserProfile();
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      $signInfo.html(user.email+" is login...");
      LoadUserProfile();
      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.displayName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });
    } else {
      console.log("not logged in");
    }
  });

  // Signout
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled');
    $signInfo.html('No one login...');
    window.location.href = "./index.html";
  });

   // Submit
  $btnSubmit.click(function(){
    const user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const $userOccupation = $('#userOccupation').val();
    const $userAge = $('#userAge').val();
    const $userDescription = $('#userDescription').val();

    if(user){
    	const dbUserid = dbUser.child(user.uid);
    		const promise = dbUserid.update({
        	displayName: $userName,
	      	userOccupation: $userOccupation,
	      	userAge : $userAge,
	      	photoURL: photoURL,
	      	userDescription : $userDescription
      	});
      console.log('Upload photo: ' + photoURL);
      promise.then(function(){
        console.log("Update info successful.");
        LoadUserProfile();
      });
    }
      // window.location.href = "./index.html";
  });

  function LoadUserProfile()
  {
    const user = firebase.auth().currentUser;
    if (user) {
    	firebase.database().ref('/user/' + user.uid).once('value').then(function(snapshot) {
        $('#profile-name').html(snapshot.val().displayName);
        $('#profile-email').html(snapshot.val().email);
        $('#profile-occupation').html(snapshot.val().userOccupation);
        $('#profile-age').html(snapshot.val().userAge);
        $('#profile-img').attr('src', snapshot.val().photoURL);
        $('#profile-description').html(snapshot.val().userDescription);
        //Chat Room Name update
        $('#nameInput').html(snapshot.val().displayName || 'Anonymous');
      });
   	}
   }
});