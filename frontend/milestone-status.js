const statusForm = document.getElementById("statusForm");
const newStatus = document.getElementById("newStatus");
const currentStatus = document.getElementById("currentStatus");
const formMessage = document.getElementById("formMessage");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

const initialStatus = "Pending";

function checkFreelancerAccess() {
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

```
if (!token || !userData) {
    window.location.href = "login.html";
    return false;
}

try {
    const user = JSON.parse(userData);

    if (!user || user.role !== "freelancer") {
        window.location.href = "login.html";
        return false;
    }

    return true;
} catch (error) {
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return false;
}
```

}

function showMessage(message, type) {
formMessage.textContent = message;
formMessage.className = "form-message";

```
if (type) {
    formMessage.classList.add(type);
}
```

}

function updateStatusBadge(status) {
currentStatus.textContent = status;
currentStatus.className = "status-badge";

```
if (status === "Pending") {
    currentStatus.classList.add("pending");
} else if (status === "In Progress") {
    currentStatus.classList.add("in-progress");
} else if (status === "Completed") {
    currentStatus.classList.add("completed");
}
```

}

statusForm.addEventListener("submit", function (event) {
event.preventDefault();

```
const selectedStatus = newStatus.value;

if (!selectedStatus) {
    showMessage("Please select a status.", "error");
    return;
}

if (selectedStatus === currentStatus.textContent) {
    showMessage("Please select a different status.", "error");
    return;
}

// UI demonstration only. No backend request is performed.
updateStatusBadge(selectedStatus);

showMessage(
    "Status preview updated. This change has not been saved to the backend.",
    "success"
);

console.log("Milestone status preview:", selectedStatus);
```

});

cancelBtn.addEventListener("click", function () {
updateStatusBadge(initialStatus);
newStatus.value = "";
showMessage("", "");
});

logoutBtn.addEventListener("click", function () {
localStorage.removeItem("token");
localStorage.removeItem("user");
window.location.href = "login.html";
});

if (checkFreelancerAccess()) {
newStatus.focus();
}
