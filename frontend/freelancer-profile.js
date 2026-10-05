const profileForm = document.getElementById("profileForm");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");
const formMessage = document.getElementById("formMessage");

const nameInput = document.getElementById("name");
const headlineInput = document.getElementById("headline");
const skillsInput = document.getElementById("skills");
const bioInput = document.getElementById("bio");
const experienceInput = document.getElementById("experience");
const hourlyRateInput = document.getElementById("hourlyRate");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");

const previewName = document.getElementById("previewName");
const previewHeadline = document.getElementById("previewHeadline");
const previewSkills = document.getElementById("previewSkills");
const previewBio = document.getElementById("previewBio");
const previewExperience = document.getElementById("previewExperience");
const previewRate = document.getElementById("previewRate");

const defaultProfile = {
    name: "Freelancer Name",
    email: "freelancer@example.com",
    headline: "",
    skills: "",
    bio: "",
    experience: "",
    hourlyRate: ""
};

let profile = {
    ...defaultProfile
};

function getStoredProfile() {
    const storedProfile = localStorage.getItem("freelancerProfile");

    if (!storedProfile) {
        return {
            ...defaultProfile
        };
    }

    try {
        return {
            ...defaultProfile,
            ...JSON.parse(storedProfile)
        };
    } catch (error) {
        return {
            ...defaultProfile
        };
    }
}

function updateProfileSummary() {
    profileName.textContent = profile.name || "Freelancer Name";
    profileEmail.textContent = profile.email || "freelancer@example.com";

    const firstLetter = (profile.name || "F").trim().charAt(0).toUpperCase();
    profileAvatar.textContent = firstLetter || "F";
}

function updatePreview() {
    previewName.textContent = profile.name || "Freelancer Name";
    previewHeadline.textContent =
        profile.headline || "Professional headline";

    previewBio.textContent =
        profile.bio || "No biography added yet.";

    previewExperience.textContent =
        profile.experience || "Not specified";

    previewRate.textContent =
        profile.hourlyRate
            ? `$${profile.hourlyRate}/hour`
            : "Not specified";

    previewSkills.innerHTML = "";

    const skills = profile.skills
        ? profile.skills
              .split(",")
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0)
        : [];

    if (skills.length === 0) {
        const emptyText = document.createElement("span");
        emptyText.className = "empty-text";
        emptyText.textContent = "No skills added yet.";
        previewSkills.appendChild(emptyText);
        return;
    }

    skills.forEach(skill => {
        const skillTag = document.createElement("span");
        skillTag.className = "skill-tag";
        skillTag.textContent = skill;
        previewSkills.appendChild(skillTag);
    });
}

function loadForm() {
    nameInput.value = profile.name;
    headlineInput.value = profile.headline;
    skillsInput.value = profile.skills;
    bioInput.value = profile.bio;
    experienceInput.value = profile.experience;
    hourlyRateInput.value = profile.hourlyRate;
}

function loadProfile() {
    profile = getStoredProfile();

    updateProfileSummary();
    loadForm();
    updatePreview();
}

profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();

    if (!name) {
        formMessage.textContent = "Please enter your full name.";
        return;
    }

    profile = {
        name,
        email: profile.email || defaultProfile.email,
        headline: headlineInput.value.trim(),
        skills: skillsInput.value.trim(),
        bio: bioInput.value.trim(),
        experience: experienceInput.value,
        hourlyRate: hourlyRateInput.value
    };

    localStorage.setItem(
        "freelancerProfile",
        JSON.stringify(profile)
    );

    updateProfileSummary();
    updatePreview();

    formMessage.textContent = "Profile saved successfully.";

    setTimeout(() => {
        formMessage.textContent = "";
    }, 3000);
});

cancelBtn.addEventListener("click", function () {
    loadProfile();
    formMessage.textContent = "Changes cancelled.";

    setTimeout(() => {
        formMessage.textContent = "";
    }, 2000);
});

logoutBtn.addEventListener("click", function () {
    window.location.href = "login.html";
});

loadProfile();