import { auth, db } from "./firebase.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// -----------------------------
// LOAD AND DISPLAY ALL TASKS
// -----------------------------
export async function loadTasks() {
  const taskContainer = document.getElementById("taskContainer");
  taskContainer.innerHTML = "Loading tasks…";

  const snap = await getDocs(collection(db, "tasks"));

  if (snap.empty) {
    taskContainer.innerHTML = "<p>No tasks available right now.</p>";
    return;
  }

  taskContainer.innerHTML = "";

  snap.forEach((docSnap) => {
    const task = docSnap.data();
    const taskId = docSnap.id;

    const card = document.createElement("div");
    card.className = "task-card";

    card.innerHTML = `
      <img src="${task.imageUrl}" class="task-img" />

      <h3>${task.title}</h3>
      <p>${task.description}</p>

      <p><strong>Reward:</strong> $${task.reward.toFixed(2)}</p>
      <p><strong>Timer:</strong> ${task.timer} seconds</p>

      <button class="task-btn" onclick="startTask('${taskId}')">
        Start Task
      </button>

      <div id="timer_${taskId}" class="timer-box"></div>

      <button id="complete_${taskId}" class="complete-btn" disabled>
        Complete Task
      </button>
    `;

    taskContainer.appendChild(card);
  });
}

// -----------------------------
// START TASK (USER PRESSES START)
// -----------------------------
window.startTask = async function (taskId) {
  const user = auth.currentUser;
  if (!user) return alert("You must log in.");

  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) return;

  const task = taskSnap.data();
  const timerBox = document.getElementById(`timer_${taskId}`);
  const completeBtn = document.getElementById(`complete_${taskId}`);

  let timeLeft = task.timer;

  timerBox.innerHTML = `⏳ ${timeLeft} seconds remaining`;
  completeBtn.disabled = true;

  const countdown = setInterval(() => {
    timeLeft--;
    timerBox.innerHTML = `⏳ ${timeLeft} seconds remaining`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      timerBox.innerHTML = "✅ You can now complete the task";
      completeBtn.disabled = false;
      completeBtn.onclick = () => completeTask(taskId);
    }
  }, 1000);

  // OPEN LINK
  window.open(task.linkUrl, "_blank");
};

// -----------------------------
// COMPLETE TASK (REWARD ADDED)
// -----------------------------
async function completeTask(taskId) {
  const user = auth.currentUser;
  if (!user) return alert("You must log in.");

  const uid = user.uid;

  // Prevent duplicate completion
  const q = query(
    collection(db, "completedTasks"),
    where("taskId", "==", taskId),
    where("userId", "==", uid)
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    return alert("You have already completed this task.");
  }

  // Get task reward
  const taskData = await getDoc(doc(db, "tasks", taskId));
  const reward = taskData.data().reward;

  // Add to completed tasks
  await addDoc(collection(db, "completedTasks"), {
    taskId: taskId,
    userId: uid,
    completedAt: Date.now()
  });

  // Add reward to user wallet
  await updateDoc(doc(db, "users", uid), {
    balance: (await getUserBalance(uid)) + reward
  });

  alert(`Task completed! You earned $${reward.toFixed(2)}`);
}

// -----------------------------
// GET USER BALANCE
// -----------------------------
async function getUserBalance(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().balance || 0 : 0;
}

// -----------------------------
// INITIALIZE PAGE
// -----------------------------
export function initTasksPage() {
  loadTasks();
}
