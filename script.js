const resources = JSON.parse(localStorage.getItem("resources")) || [];
const pending = JSON.parse(localStorage.getItem("pending")) || [];

const lockedResources = [
    { title: "Sample Resource", description: "A top-notch gym facility that provides an extensive range of free activities. These activities include equipment, free weights, strength training, and group classes. This center was designed with any body type in mind. So whether you look like Captain America or Homer Simpson, come join us at Riverside Meadows' Fitness Center. Open 24 hours a day; closed Sundays.", category: "Health & Fitness" },
    { title: "Sample Resource", description: "We host many chess tournaments here at Riverside Meadows, and love to accommodate players of all ages and skill levels. At our tournaments, participants can sharpen their skills, expand their knowledge of the game, and connect with other chess players. To join the tournament, contact chess@riversidemeadows.com.", category: "Recreation" },
    { title: "Sample Resource", description: "The Career & Learning Hub at Riverside Meadows is a center for educational growth and excellence. By providing before and after school tutoring for students and increasing readiness in the workforce, the Career & Learning Center accounts for the educational needs of all ages. We also provide training for certifications and college readiness courses for those seeking higher education.", category: "Education" },
    { title: "Sample Resource", description: "Neighborhood Watch HQ ensures community safety and carries out crime prevention initiatives. Residents can report concerns or crimes that may affect the overall well-being of other residents' communities. This in turn strengthens community awareness and cooperation. Email security@riversidemeadows.com to contribute.", category: "Community Safety" },
    { title: "Sample Resource", description: "The Riverside Credit Union is a place where residents go to receive financial assistance with their savings accounts, loans, and financial education. By using accessible and trustworthy banking, the residents experience a fine experience for setting up their finances.", category: "Finance" },
    { title: "Sample Resource", description: "The River Side Clean-Up Crew is dedicated to keeping our beautiful river clean. We love to include all of our community in this hands-on experience, and our members often report feeling happiness and humility after engaging in these activities. Help us keep our community and families safe and healthy and email clean@riversidemeadows.com to join.", category: "Environment" },
    { title: "Sample Resource", description: "Transportation is a major problem for senior citizens living by themselves. Because of this, many senior citizens often stay indoors and do not explore our community to the fullest extent possible. Thus, we have incorporated senior shuttles into our communities to help our lovely senior citizens explore Riverside Meadows.", category: "Transportation" },
    { title: "Sample Resource", description: "Looking for a welcoming place where you can enjoy meals, coffee, and spend time with friends? Lola’s Cafe is your place. A cafe that was founded when Riverside Meadows was first established 54 years ago, Lola’s Cafe provides a relaxing setting where residents can come and unwind after a long day. Hours of Operation: closed on Tuesdays; open 11 AM to 11 PM all other days.", category: "Food & Drink" }
];

const list = document.getElementById("resourceList");
let selectedCategory = "";
function showToast(message, type = "success") {
    const container = document.querySelector(".toast-container");

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
    toastEl.role = "alert";

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}








function renderResources(filter = "") {
    list.innerHTML = "";
    [...lockedResources, ...resources].forEach(r => {
        const categoryMatch = selectedCategory === "" || r.category === selectedCategory;
        const textMatch =
            r.title.toLowerCase().includes(filter) ||
            r.description.toLowerCase().includes(filter);

        if (categoryMatch && textMatch) {
            list.innerHTML += `
            <div class="col-md-4">
                <div class="card p-3 h-100">
                    <h5>${r.title}</h5>
                    <p>${r.description}</p>
                    <small class="text-muted">Category: ${r.category}</small>
                </div>
            </div>`;
        }
    });
}

const searchContainer = document.getElementById("search").parentElement;
const categories = ["", "Health & Fitness", "Recreation", "Education", "Community Safety", "Finance", "Environment", "Transportation", "Food & Drink", "Uncategorized"];

const categorySelect = document.createElement("select");
categorySelect.className = "form-select mb-3";



categorySelect.innerHTML = categories.map(c =>
    `<option value="${c}">${c || "All Categories"}</option>`
).join("");

searchContainer.insertBefore(categorySelect, document.getElementById("search"));

categorySelect.addEventListener("change", e => {
    selectedCategory = e.target.value;
    renderResources(search.value.toLowerCase());
});

document.getElementById("search").addEventListener("input", e => {
    renderResources(e.target.value.toLowerCase());
});

document.getElementById("requestForm").addEventListener("submit", e => {
    e.preventDefault();

    pending.push({
        title: title.value,
        description: description.value,
        category: category.value
    });

    localStorage.setItem("pending", JSON.stringify(pending));
    e.target.reset();

    showToast("Resource request submitted for admin review!", "success");
});

renderResources();

const aiModal = document.getElementById("aiChatModal");
const aiChatBody = document.getElementById("aiChatBody");
const aiUserInput = document.getElementById("aiUserInput");

const startBtn = document.getElementById("startAI");
const closeBtn = document.getElementById("closeAI");
const sendBtn = document.getElementById("aiSendBtn");

let aiStep = 0;
let aiAnswers = {};
let aiQuestions = [
    { id:"interest", text:"What are you interested in? Please type your choice exactly as seen below.", options:["Health & Fitness","Education","Finance","Food & Drink","Recreation","Community Safety","Environment","Transportation"] },
   
                                { id:"format", text:"Do you prefer in-person or online resources?", options:["In-person","Online"] }
];

startBtn.addEventListener("click", () => {
    aiModal.style.display = "flex";
    aiStep = 0;
    aiAnswers = JSON.parse(localStorage.getItem("aiMemory")) || {};
    aiChatBody.innerHTML = "";

    setTimeout(() => showAIMessage("Hi! I'm ResBot 🤖. I will help you find the best community resources. Enter the requests exactly as shown. Capitalization, spacing, and hyphens matter! Ready? Say 'Yes' to start."), 500);
});

closeBtn.addEventListener("click", () => aiModal.style.display = "none");

sendBtn.addEventListener("click", handleAIInput);


aiUserInput.addEventListener("keypress", e => { if(e.key === "Enter") handleAIInput(); });

function showAIMessage(text){
    const div = document.createElement("div");
    div.className = "ai-msg bot";
    div.textContent = text;
    aiChatBody.appendChild(div);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
}

function showUserMessage(text){
    const div = document.createElement("div");
    div.className = "ai-msg user";
    div.textContent = text;
    aiChatBody.appendChild(div);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
}

function handleAIInput(){
    const val = aiUserInput.value.trim();
    if(!val) return;
    showUserMessage(val);
    aiUserInput.value = "";
    if(aiStep === 0){
        if(val.toLowerCase() === "yes"){
            aiStep++;
            askNextQuestion();
        } else {
            showAIMessage("No worries! You can start me anytime by clicking the button again.");
        }
    } else if(aiStep <= aiQuestions.length){
        const question = aiQuestions[aiStep-1];
        aiAnswers[question.id] = val;
        aiStep++;
        askNextQuestion();


    }
}

function askNextQuestion(){
    if(aiStep <= aiQuestions.length){
        const question = aiQuestions[aiStep-1];
        showAIMessage(question.text + " Options: " + question.options.join(", "));
    } else {
        showAIMessage("Great! Let me find the best resources for you. Gimme one sec...");
        setTimeout(showAIRecommendations, 800);
    }
}

function showAIRecommendations(){
    localStorage.setItem("aiMemory", JSON.stringify(aiAnswers));

    let filtered = [...lockedResources,...resources].filter(r => {
        return (aiAnswers.interest ? r.category === aiAnswers.interest : true);
    });

    if(filtered.length === 0) {
        showAIMessage("Apologies. I couldn't find anything matching your answers, but feel free to explore the directory!");
        return;
    }

    filtered.forEach(r => {
        showAIMessage(`⭐ ${r.title}: ${r.description}`);
    });

    showToast("ResBot finished recommendations! Scroll down to see all resources.", "success");
}

if(!localStorage.getItem("progress")) {
    localStorage.setItem("progress", JSON.stringify({ resBotUses: 0, requestsSubmitted: 0 }));
}


startBtn.addEventListener("click", () => {
    const progress = JSON.parse(localStorage.getItem("progress"));
    progress.resBotUses++;
    localStorage.setItem("progress", JSON.stringify(progress));
});

document.getElementById("requestForm").addEventListener("submit", e => {
    const progress = JSON.parse(localStorage.getItem("progress"));
    progress.requestsSubmitted++;
    localStorage.setItem("progress", JSON.stringify(progress));
});


const faders = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

faders.forEach(el => observer.observe(el));
