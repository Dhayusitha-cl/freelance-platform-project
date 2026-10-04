const jobPostForm = document.getElementById("jobPostForm");
const jobPostMessage = document.getElementById("jobPostMessage");

jobPostForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const jobDescription = document.getElementById("jobDescription").value.trim();
    const budget = Number(document.getElementById("budget").value);
    const deadline = document.getElementById("deadline").value;
    const category = document.getElementById("category").value;
    const skills = document.getElementById("skills").value.trim();

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

    jobPostMessage.textContent = "Posting job...";

    try {
        const response = await fetch("http://localhost:3000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: jobTitle,
                description: jobDescription,
                budget: budget,
                deadline: deadline,
                category: category,
                skills: skills
            })
        });

        const data = await response.json();

        if (!response.ok) {
            jobPostMessage.textContent = data.message || "Failed to create job.";
            return;
        }

        jobPostMessage.textContent = data.message;

        jobPostForm.reset();

    } catch (error) {
        console.error("Job posting error:", error);
        jobPostMessage.textContent =
            "Unable to connect to the server.";
    }
});