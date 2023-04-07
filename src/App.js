import './App.css';
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebase.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from 'react';



const app = initializeApp(firebaseConfig);


function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const handleSignIn = () => {

    signInWithPopup(auth, provider)
      .then((result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        console.log(displayName, email, photoURL);

      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  const handleSignOut = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      const signOutUser = {
        isSignedIn: false,

        name: '',
        email: '',
        photo: '',
        error: '',
        success: false,
      }
      setUser(signOutUser);
    }).catch((error) => {
      // An error happened.
    });
    console.log("sign out");
  }

  const handleChange = (event) => {
    let isFormValid = true;
    if (event.target.name === 'email') {
      isFormValid = /^\S+@\S+\.\S+$/.test(event.target.value);
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }

  }
  const handleSubmit = (event) => {
    if (newUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // const user = userCredential.user;
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName();
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
      console.log("submitting");
      // console.log(user.password);
    }
    if (!newUser && user.email && user.password) {
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // const user = userCredential.user;
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in user info",userCredential.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    event.preventDefault();
  }

  const updateUserName = () => {
    updateProfile(auth.currentUser, {
      displayName: user.name,
    }).then(() => {
     console.log("user name updated successfully");
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>sign out </button>
          : <button onClick={handleSignIn}>sign in </button>

      }
      {
        user.isSignedIn && <p>welcome , {user.name}</p>
      }

      <h1>our own authentication</h1>
      <p>name= {user.name}</p>
      <p>email= {user.email}</p>
      <p>password = {user.password}</p>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">new user sign up </label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" placeholder="name" onBlur={handleChange} />}
        <br />
        <input type="text" name="email" onBlur={handleChange} placeholder='enter your email' required />
        <br /><br />
        <input type="password" name="password" onBlur={handleChange} id="" placeholder='enter your password' required />
        <br /><br />
        <input type="submit" value={newUser?'sign up':'sign in'} />
      </form>
      <p style={{ color: "red" }}>{user.error}</p>
      {user.success && <p style={{ color: "green" }}>user {newUser ? 'created' : 'logged in'} successfully.</p>}
    </div>
  );
}

export default App;
