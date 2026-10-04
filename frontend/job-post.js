const jobPostForm = document.getElementById("jobPostForm");
const jobPostMessage = document.getElementById("jobPostMessage");

jobPostForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const jobDescription = document.getElementById("jobDescription").value.trim();
    const budget = document.getElementById("budget").value;
    const deadline = document.getElementById("deadline").value;
    const category = document.getElementById("category").value;

    if (!jobTitle) {
        jobPostMessage.textContent = "Please enter a job title.";
        return;
    }

    if (!jobDescription) {
        jobPostMessage.textContent = "Please enter a job description.";
        return;
    }

    if (!budget) {
        jobPostMessage.textContent = "Please enter a budget.";
        return;
    }

    if (!deadline) {
        jobPostMessage.textContent = "Please select a deadline.";
        return;
    }

    if (!category) {
        jobPostMessage.textContent = "Please select a category.";
        return;
    }

    jobPostMessage.textContent =
        "Job posting form is ready for submission.";
});