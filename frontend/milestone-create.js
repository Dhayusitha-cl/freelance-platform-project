
const milestoneForm = document.getElementById("milestoneForm");
const formMessage = document.getElementById("formMessage");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

function checkFreelancerAccess() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

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
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

milestoneForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!milestoneForm.checkValidity()) {
        milestoneForm.reportValidity();
        return;
    }

    const milestone = {
        jobTitle: document.getElementById("jobTitle").value.trim(),
        title: document.getElementById("milestoneTitle").value.trim(),
        description: document.getElementById("description").value.trim(),
        dueDate: document.getElementById("dueDate").value,
        amount: Number(document.getElementById("amount").value)
    };

    if (
        !milestone.jobTitle ||
        !milestone.title ||
        !milestone.description
    ) {
        showMessage("Please complete all required fields.", "error");
        return;
    }

    if (!Number.isFinite(milestone.amount) || milestone.amount < 0) {
        showMessage("Please enter a valid milestone amount.", "error");
        return;
    }

    // UI demonstration only. No API request or data storage is performed.
    showMessage(
        "Form looks good! No milestone has been saved yet. API integration will be added separately.",
        "success"
    );

    console.log("Milestone form preview:", milestone);
});

cancelBtn.addEventListener("click", function () {
    milestoneForm.reset();
    showMessage("", "");
});

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

if (checkFreelancerAccess()) {
    milestoneForm.querySelector("input").focus();
}