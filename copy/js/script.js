// =======================
// SELECT ELEMENTS
// =======================

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultBox = document.getElementById("resultBox");

console.log("DropArea:", dropArea);
console.log("FileInput:", fileInput);

// =======================
// FAKE RESULT GENERATOR
// =======================

function generateFakeResult() {

    const percent = Math.floor(Math.random() * 40) + 10; 
    // Random 10–50%

    let status = "";

    if (percent < 20) {
        status = "Highly Original ✅";
    } 
    else if (percent < 35) {
        status = "Moderate Similarity ⚠️";
    } 
    else {
        status = "High Plagiarism ❌";
    }

    return { percent, status };
}

// =======================
// MAIN SCAN FUNCTION
// =======================

async function simulateScan() {

    const file = fileInput.files[0];

    if (!file) {
        alert("Upload a file first 😑");
        return;
    }

    try {
        resultBox.innerHTML = "";
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";
        progressText.innerText = "Uploading: 0%";

        const storageRef = storage.ref();
        const fileRef = storageRef.child(`scans/${Date.now()}_${file.name}`);

        const uploadTask = fileRef.put(file);

        uploadTask.on(
            "state_changed",

            // 🔄 PROGRESS
            (snapshot) => {
                const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = percent + "%";
                progressText.innerText = `Uploading: ${Math.floor(percent)}%`;
            },

            // ❌ ERROR
            (error) => {
                console.error("Upload Error:", error);
                alert("Upload failed ❌");
            },

            // ✅ SUCCESS
            async () => {

                progressText.innerText = "Processing scan... 🔍";

                const downloadURL = await fileRef.getDownloadURL();

                const fake = generateFakeResult();

                await db.collection("scans").add({
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    fileURL: downloadURL,
                    scannedAt: new Date(),
                    plagiarismPercent: fake.percent,
                    status: fake.status
                });

                progressBar.style.width = "100%";
                progressText.innerText = "Scan Complete ✅";

                showResult(fake);
            }
        );

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong ❌");
    }
}

// =======================
// SHOW RESULT IN UI
// =======================

function showResult(fake) {

    resultBox.innerHTML = `
        <h3>Scan Result</h3>
        <p><strong>${fake.percent}%</strong> similarity detected</p>
        <p>${fake.status}</p>
    `;

    // 🎨 Color logic
    if (fake.percent < 20) {
        resultBox.style.color = "green";
    } 
    else if (fake.percent < 35) {
        resultBox.style.color = "orange";
    } 
    else {
        resultBox.style.color = "red";
    }
}

// =======================
// DRAG & DROP LOGIC
// =======================

if (dropArea && fileInput) {

    // Click → file picker
    dropArea.addEventListener("click", () => {
        fileInput.click();
    });

    // Drag over
    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.background = "#eff6ff";
        dropArea.style.borderColor = "#007bff";
    });

    // Drag leave
    dropArea.addEventListener("dragleave", () => {
        dropArea.style.background = "#f8fafc";
        dropArea.style.borderColor = "#4da6ff";
    });

    // Drop
    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();

        dropArea.style.background = "#f8fafc";
        dropArea.style.borderColor = "#4da6ff";

        const files = e.dataTransfer.files;

        if (files.length > 0) {
            fileInput.files = files;
            console.log("File dropped:", files[0]);
            alert("File selected ✅");
        }
    });
}