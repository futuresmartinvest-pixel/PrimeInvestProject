// ---------------------------------------------------------
// Firebase Imports (v10 CDN)
// ---------------------------------------------------------
import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ---------------------------------------------------------
// ADMIN UID — ONLY YOU CAN MANAGE TASKS
// ---------------------------------------------------------
const ADMIN_UID = "3xM6WyDqPTVkX0L4sOTNQ8f4VWO2"; // your admin UID

document.getElementById("adminUID").textContent = ADMIN_UID;

// ---------------------------------------------------------
// Check Admin Login
// ---------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in as admin.");
    location.href = "index.html";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("ACCESS DENIED. Admin only.");
    location.href = "index.html";
    return;
  }

  loadTasks();
});

// ---------------------------------------------------------
// Upload Image to Firebase Storage
// ---------------------------------------------------------
async function uploadTaskImage(file) {
  const path = `tasks/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ---------------------------------------------------------
// Create New Task
// ---------------------------------------------------------
document.getElementById("createTaskBtn").onclick = async () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const reward = parseFloat(document.getElementById("taskReward").value);
  const timer = parseInt(document.getElementById("taskTimer").value);
  const link = document.getElementById("taskLink").value.trim();
  const imageFile = document.getElementById("taskImage").files[0];

  if (!title || !description || !reward || !timer || !link || !imageFile) {
    alert("Fill all fields and select an image.");
    return;
  }

  // Upload image
  const imageURL = await uploadTaskImage(imageFile);

  // Save task in Firestore
  await addDoc(collection(db, "tasks"), {
    title,
    description,
    reward,
    timer,
    link,
    image: imageURL,
    createdAt: Date.now()
  });

  alert("Task Created!");
  clearForm();
};

// ---------------------------------------------------------
// Clear form after submit
// ---------------------------------------------------------
function clearForm() {
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskReward").value = "";
  document.getElementById("taskTimer").value = "";
  document.getElementById("taskLink").value = "";
  document.getElementById("taskImage").value = "";
}

// ---------------------------------------------------------
// Load Existing Tasks (Real-time)
// ---------------------------------------------------------
function loadTasks() {
  const taskList = document.getElementById("taskList");

  onSnapshot(collection(db, "tasks"), (snapshot) => {
    taskList.innerHTML = "";

    snapshot.docs.forEach((docSnap) => {
      const task = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "task-card";

      card.innerHTML = `
        <img src="${task.image}" />
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><b>Reward:</b> $${task.reward}</p>
        <p><b>Timer:</b> ${task.timer} sec</p>
        <button class="edit-btn" onclick="editTask('${id}')">Edit</button>
        <button class="delete-btn" onclick="deleteTask('${id}')">Delete</button>
      `;

      taskList.appendChild(card);
    });
  });
}

// ---------------------------------------------------------
// Delete Task
// ---------------------------------------------------------
window.deleteTask = async function (taskId) {
  if (!confirm("Delete this task?")) return;

  await deleteDoc(doc(db, "tasks", taskId));
  alert("Task deleted.");
};

// ---------------------------------------------------------
// Edit Task (Simple Example)
// ---------------------------------------------------------
window.editTask = async function (taskId) {
  const newTitle = prompt("Enter new title:");
  if (!newTitle) return;

  await updateDoc(doc(db, "tasks", taskId), {
    title: newTitle
  });

  alert("Task updated.");
};
