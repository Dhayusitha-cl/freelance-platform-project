const jobsContainer = document.getElementById("jobsContainer");
const jobsMessage = document.getElementById("jobsMessage");

const jobs = [
    {
        id: 1,
        title: "Frontend Developer",
        description: "Build a responsive frontend application for a freelance platform.",
        budget: 25000,
        deadline: "2026-10-20",
        category: "web-development",
        skills: "HTML, CSS, JavaScript"
    },
    {
        id: 2,
        title: "Backend API Developer",
        description: "Develop REST APIs and integrate them with the frontend application.",
        budget: 30000,
        deadline: "2026-10-25",
        category: "web-development",
        skills: "Node.js, Express, REST API"
    }
];

function formatDeadline(deadline) {
    const date = new Date(deadline);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatCategory(category) {
    return category
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function displayJobs() {
    if (jobs.length === 0) {
        jobsMessage.textContent = "No jobs are currently available.";
        return;
    }

    jobsMessage.remove();

    jobsContainer.innerHTML = jobs.map(job => `
        <article class="job-card">

            <h2>${job.title}</h2>

            <p class="job-description">
                ${job.description}
            </p>

            <div class="job-details">
                <p><strong>Budget:</strong> ₹${job.budget.toLocaleString("en-IN")}</p>
                <p><strong>Deadline:</strong> ${formatDeadline(job.deadline)}</p>
                <p><strong>Category:</strong> ${formatCategory(job.category)}</p>
                <p><strong>Skills:</strong> ${job.skills}</p>
            </div>

            <button
                type="button"
                class="view-job-button"
                data-job-id="${job.id}"
            >
                View Details
            </button>

        </article>
    `).join("");

    document.querySelectorAll(".view-job-button").forEach(button => {
        button.addEventListener("click", function () {
            const jobId = Number(this.dataset.jobId);
            const selectedJob = jobs.find(job => job.id === jobId);

            if (selectedJob) {
                alert(
                    `Job: ${selectedJob.title}\n\n` +
                    `Budget: ₹${selectedJob.budget.toLocaleString("en-IN")}\n` +
                    `Deadline: ${formatDeadline(selectedJob.deadline)}`
                );
            }
        });
    });
}

setTimeout(() => {
    displayJobs();
}, 500);