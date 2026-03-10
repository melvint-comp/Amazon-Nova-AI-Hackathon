const btn = document.getElementById("generateBtn");
btn.addEventListener("click", generateStory);

async function generateStory() {
    const text = document.getElementById("memoryText").value;
    const images = document.getElementById("imageUpload").files;

    if (!text) {
        alert("Please describe your memory.");
        return;
    }
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("storyCard").classList.add("hidden");

    try {
        const base64Images = await Promise.all([...images].map(file => fileToBase64(file)));

        const prompt = `
You are a cinematic storyteller.
Create a vivid emotional narrative based on the memory below.
Memory:
${text}
Write about 250 words.
`;

        const payload = {
            model: "nova-2-lite-v1",
            input: {
                text: prompt,
                images: base64Images.map(b64 => ({ type: "image/png", data: b64 }))
            }
        };

        const response = await fetch("http://localhost:3000/generate-story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Backend Error:", errText);
            alert("Story generation failed. See console.");
            document.getElementById("loading").classList.add("hidden");
            return;
        }

        const result = await response.json();

        let story = "Story generation failed.";
        if (result.output && result.output.text) story = result.output.text;

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("storyCard").classList.remove("hidden");
        document.getElementById("storyOutput").innerText = story;

    } catch (err) {
        console.error("Fetch Error:", err);
        alert("An error occurred. Check console.");
        document.getElementById("loading").classList.add("hidden");
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
