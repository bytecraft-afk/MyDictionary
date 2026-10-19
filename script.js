
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const result = document.getElementById("result");

const mainView = document.getElementById("main-view");
const wotdView = document.getElementById("wotd-view");
const wotdCard = document.getElementById("wotd-card");
const wotdPreview = document.getElementById("wotd-preview");
const wotdDate = document.getElementById("wotd-date");
const wotdDetail = document.getElementById("wotd-detail");
const backButton = document.getElementById("back-button");
const tryWordButton = document.getElementById("try-word-button");

// Curated vocabulary for the daily word feature.
const dailyWords = [
    "serendipity",
    "ephemeral",
    "ubiquitous",
    "petrichor",
    "eloquent",
    "resilient",
    "benevolent",
    "meticulous",
    "tranquil",
    "nostalgia",
    "perseverance",
    "eloquence",
    "luminous",
    "ambiguous",
    "pragmatic",
    "compassion",
    "astute",
    "diligent",
    "vivid",
    "profound",
    "magnanimous",
    "tenacious",
    "candid",
    "ingenious",
    "melancholy",
    "audacious",
    "harmony",
    "elusive",
    "articulate",
    "ineffable"
];

// Select one word consistently for the current local calendar day.
function getDailyWord() {
    const today = new Date();
    const dateKey =
        today.getFullYear() + "-" +
        (today.getMonth() + 1) + "-" +
        today.getDate();

    let hash = 0;

    for (let i = 0; i < dateKey.length; i++) {
        hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }

    return dailyWords[hash % dailyWords.length];
}

const wordOfTheDay = getDailyWord();

// Format today's date.
wotdDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

// Show the word on the card.
wotdPreview.textContent =
    wordOfTheDay.charAt(0).toUpperCase() +
    wordOfTheDay.slice(1) +
    " — tap to discover its meaning";

// Fetch a word from the dictionary API.
async function fetchDefinition(word) {
    const url =
        "https://api.gargantuan.dev/v1/dictionary/" +
        encodeURIComponent(word) +
        "?lang=en";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            response.status === 429
                ? "Too many requests. Please try again later."
                : "Unable to retrieve this word."
        );
    }

    const data = await response.json();

    if (!data.exists || !data.has_definition || !data.definition) {
        throw new Error("No definition found for this word.");
    }

    return data;
}

// Safely create and display the definition.
function displayDefinition(container, data) {
    container.replaceChildren();

    const entry = data.definition;

    const title = document.createElement("h2");
    title.textContent = data.word || "Word";
    container.appendChild(title);

    if (entry.pronunciation) {
        const pronunciation = document.createElement("p");
        pronunciation.className = "wotd-pronunciation";
        pronunciation.textContent = entry.pronunciation;
        container.appendChild(pronunciation);
    }

    const definitions = entry.definitions || [];

    definitions.forEach(function (item, index) {
        const section = document.createElement("section");

        const partOfSpeech = document.createElement("h3");
        partOfSpeech.textContent =
            item.partOfSpeech || "Meaning " + (index + 1);
        section.appendChild(partOfSpeech);

        const meaning = document.createElement("p");
        meaning.textContent =
            (index + 1) + ". " + item.definition;
        section.appendChild(meaning);

        const examples = [];

        if (Array.isArray(item.examples)) {
            examples.push(...item.examples);
        } else if (item.example) {
            examples.push(item.example);
        }

        examples.slice(0, 2).forEach(function (text) {
            const example = document.createElement("p");
            example.className = "wotd-example";
            example.textContent = "Example: " + text;
            section.appendChild(example);
        });

        container.appendChild(section);
    });

    if (definitions.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No definitions are available.";
        container.appendChild(message);
    }
}

// Main dictionary search.
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const word = input.value.trim();
    if (!word) return;

    result.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Looking up your word...";
    result.appendChild(loading);

    try {
        const data = await fetchDefinition(word);
        displayDefinition(result, data);
    } catch (error) {
        console.error("Dictionary lookup error:", error);

        result.replaceChildren();

        const message = document.createElement("p");
        message.textContent = error.message.includes("Too many requests")
            ? error.message
            : "We couldn't load this definition. Check your connection and try again.";

        result.appendChild(message);
    }
});

// Open the dedicated Word of the Day screen.
wotdCard.addEventListener("click", async function () {
    mainView.hidden = true;
    wotdView.hidden = false;

    wotdDetail.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Discovering your word...";
    wotdDetail.appendChild(loading);

    try {
        const data = await fetchDefinition(wordOfTheDay);
        displayDefinition(wotdDetail, data);
    } catch (error) {
        console.error("Word of the Day error:", error);

        wotdDetail.replaceChildren();

        const message = document.createElement("p");
        message.textContent =
            "We couldn't load today's word. Please check your connection and try again.";

        wotdDetail.appendChild(message);
    }
});

// Return to the main dictionary.
backButton.addEventListener("click", function () {
    wotdView.hidden = true;
    mainView.hidden = false;
});

// Search the daily word using the main search interface.
tryWordButton.addEventListener("click", function () {
    input.value = wordOfTheDay;
    wotdView.hidden = true;
    mainView.hidden = false;

    form.requestSubmit();
});
