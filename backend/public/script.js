const btn = document.getElementById("generateBtn");
btn.addEventListener("click", generateStory);

async function generateStory() {
    const text = document.getElementById("memoryText").value;
    const imageFiles = document.getElementById("imageUpload").files;

    if (!text) {
        alert("Please describe your memory.");
        return;
    }

    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("storyCard").classList.add("hidden");

    try {
        // Convert images to base64
        const images = await Promise.all(
            [...imageFiles].map(async (file) => ({
                data: await fileToBase64(file),
                mediaType: file.type || "image/png"
            }))
        );

        const prompt = `You are a cinematic storyteller.
Create a vivid emotional narrative based on the memory below.
${images.length > 0 ? "I have also attached an image related to this memory." : ""}
Memory:
${text}
Write about 250 words.`;

        const response = await fetch("/generate-story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: prompt, images })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Backend Error:", errData);
            alert(`Story generation failed: ${errData.detail || response.statusText}`);
            document.getElementById("loading").classList.add("hidden");
            return;
        }

        const { story } = await response.json();

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("storyCard").classList.remove("hidden");
        document.getElementById("storyOutput").innerText = story || "Story generation failed.";

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
            const base64 = reader.result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}