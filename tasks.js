// ------------------------------------------------------
// Firebase Imports
// ------------------------------------------------------
import { db, auth } from "./firebase.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ------------------------------------------------------
// Load Tasks on Tasks Page
// ------------------------------------------------------
export async function initTasksPage() {
  const container = document.getElementById("taskContainer");
  container.innerHTML = "Loading tasks...";

  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = "<p>Please log in to see tasks.</p>";
    return;
  }

  // Load tasks from Firestore
  const snap = await getDocs(collection(db, "tasks"));

  if (snap.empty) {
    container.innerHTML = "<p>No tasks available today.</p>";
    return;
  }

  container.innerHTML = "";

  snap.forEach((docSnap) => {
    const task = docSnap.data();
    const card = createTaskCard(task, docSnap.id);
    container.appendChild(card);
  });
}

// ------------------------------------------------------
// Create Task Card UI
// ------------------------------------------------------
function createTaskCard(task, taskId) {
  const card = document.createElement("div");
  card.className = "task-card";

  card.innerHTML = `
    <img src="${task.image}" class="task-img" />

    <h3>${task.title}</h3>

    <button class="task-btn" onclick="window.open('${task.link}', '_blank')">
      Open Task
    </button>

    <button class="complete-btn" id="complete-${taskId}">
      Complete Task (+$${task.reward})
    </button>

    <div class="timer-box" id="timer-${taskId}"></div>
  `;

  // Add functionality
  setupTaskCompletion(taskId, task.reward);

  return card;
}

// ------------------------------------------------------
// Completion Logic
// ------------------------------------------------------
async function setupTaskCompletion(taskId, reward) {
  const user = auth.currentUser;
  if (!user) return;

  const btn = document.getElementById(`complete-${taskId}`);
  const timerBox = document.getElementById(`timer-${taskId}`);

  const userTaskRef = doc(db, "users", user.uid, "completedTasks", taskId);
  const userTaskSnap = await getDoc(userTaskRef);

  if (userTaskSnap.exists()) {
    btn.disabled = true;
    timerBox.textContent = "Completed ✔";
    return;
  }

  btn.onclick = async () => {
    btn.disabled = true;
    timerBox.textContent = "Processing...";

    // Save task completion
    await setDoc(userTaskRef, {
      completedAt: Date.now(),
      reward
    });

    // Update balance
    await updateDoc(doc(db, "users", user.uid), {
      balance: (userTaskSnap.data()?.balance || 0) + reward
    });

    timerBox.textContent = "Completed ✔";
  };
}
