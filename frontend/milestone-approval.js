"use strict";

const logoutBtn = document.getElementById("logoutBtn");
const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");
const resetBtn = document.getElementById("resetBtn");
const statusBadge = document.getElementById("statusBadge");
const detailStatus = document.getElementById("detailStatus");
const formMessage = document.getElementById("formMessage");

const initialStatus = "Pending Review";

function checkClientAccess() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "login.html";
        return false;
    }

    try {
        const user = JSON.parse(userData);

        if (!user || user.role !== "client") {
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
    formMessage.className = "form-message";

    if (type) {
        formMessage.classList.add(type);
    }
}

function updateStatus(status) {
    statusBadge.textContent = status;
    detailStatus.textContent = status;

    statusBadge.className = "status-badge";

    if (status === "Approved") {
        statusBadge.classList.add("approved");
    } else if (status === "Rejected") {
        statusBadge.classList.add("rejected");
    } else {
        statusBadge.classList.add("pending");
    }
}

function setDecisionComplete() {
    approveBtn.disabled = true;
    rejectBtn.disabled = true;
    resetBtn.hidden = false;
}

function previewDecision(decision) {
    const isApproval = decision === "Approved";

    const confirmationMessage = isApproval
        ? "Are you sure you want to approve this milestone?"
        : "Are you sure you want to reject this milestone?";

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    updateStatus(decision);
    setDecisionComplete();

    if (isApproval) {
        showMessage(
            "Approval preview complete. This decision has not been saved to the server.",
            "success"
        );
    } else {
        showMessage(
            "Rejection preview complete. This decision has not been saved to the server.",
            "info"
        );
    }
}

approveBtn.addEventListener("click", function () {
    previewDecision("Approved");
});

rejectBtn.addEventListener("click", function () {
    previewDecision("Rejected");
});

resetBtn.addEventListener("click", function () {
    updateStatus(initialStatus);

    approveBtn.disabled = false;
    rejectBtn.disabled = false;
    resetBtn.hidden = true;

    showMessage(
        "The preview has been reset. No server data was changed.",
        "info"
    );
});

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

if (checkClientAccess()) {
    updateStatus(initialStatus);
}