// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrEDO9tHNXZkZnhCI0uZxVGXez-VMBn0E",
  authDomain: "securitytrap.firebaseapp.com",
  databaseURL: "https://securitytrap-default-rtdb.firebaseio.com",
  projectId: "securitytrap",
  storageBucket: "securitytrap.firebasestorage.app",
  messagingSenderId: "1074157431505",
  appId: "1:1074157431505:web:4cf4c11a3264cc8086b3f0",
  measurementId: "G-8FGT22S36N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

function sanitizeInput(input) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

function validateInput(event) {
  const invalidChars = /[{}+´'"-,]/g;
  if (invalidChars.test(event.target.value)) {
    event.target.value = event.target.value.replace(invalidChars, '');
    showMessage('Special characters are not allowed', 'signInMessage');
  }
}

document.getElementById('email').addEventListener('input', validateInput);
document.getElementById('password').addEventListener('input', validateInput);

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
  event.preventDefault();
  const email = sanitizeInput(document.getElementById('rEmail').value);
  const password = sanitizeInput(document.getElementById('rPassword').value);
  const firstName = sanitizeInput(document.getElementById('fName').value);
  const lastName = sanitizeInput(document.getElementById('lName').value);

  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName
      };
      showMessage('Account Created Successfully', 'signUpMessage');
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error("error writing document", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        showMessage('unable to create User', 'signUpMessage');
      }
    });
});

let loginAttempts = 0;
const maxAttempts = 3;

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
  event.preventDefault();
  const email = sanitizeInput(document.getElementById('email').value);
  const password = sanitizeInput(document.getElementById('password').value);
  const auth = getAuth();

  if (loginAttempts >= maxAttempts) {
    showMessage('Too many failed attempts. Please try again later.', 'signInMessage');
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showMessage('Login is successful', 'signInMessage');
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      // Set secure cookie attributes
      document.cookie = `session=${user.stsTokenManager.accessToken}; Secure; HttpOnly; SameSite=Strict; path=/; max-age=300`;
      window.location.href = 'homepage.html';
    })
    .catch((error) => {
      loginAttempts++;
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-credential') {
        showMessage('Incorrect Email or Password', 'signInMessage');
      } else {
        showMessage('Account does not Exist', 'signInMessage');
      }
    });
});