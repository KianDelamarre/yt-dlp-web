const form = document.querySelector("form");
const urlInput = document.getElementById("url");
const button = document.querySelector("button");

const videoInfoDiv = document.getElementById("video-info");
const getInfoLoader = document.getElementById("get-info-loader");
const downloadAudioLoader = document.getElementById("download-audio-loader");
const downloadAudioButtonText = document.getElementById("download-audio-button-text");
const downloadVideoLoader = document.getElementById("download-video-loader");
const downloadVideoButtonText = document.getElementById("download-video-button-text");

const vidoInfoContent = document.getElementById("video-info--content");
const videoTitleDiv = document.getElementById("video-title");
const videoThumbnail = document.getElementById("video-thumbnail");
const videoDuration = document.getElementById("video-duration");
const videoUploader = document.getElementById("video-uploader");
const videoId = document.getElementById("video-id");

const downloadAudioBtn = document.getElementById("download-audio");
const downloadVideoBtn = document.getElementById("download-video");

let videoTitle;

document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    videoInfoDiv.style.display = "flex"; //start loading animation
    getInfoLoader.style.display = "inline-block";

    const videoInfo = await getVideoInfo(url);
    if (videoInfo) {
        getInfoLoader.style.display = "none";
        vidoInfoContent.style.display = "flex";
        videoTitle = videoInfo.title;
        generateInfoHtml(videoInfo);
    }
    // console.log(videoInfo);

})

downloadAudioBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;
    downloadAudioLoader.style.display = "inline-block";
    downloadAudioButtonText.innerText = "Converting";
    const response = await convertMedia(url, "audio");
    if (response.done) {
        downloadAudioButtonText.innerText = "Downloading...";
        const { jobId } = response;
        downloadFile(jobId, "audio");
        downloadAudioLoader.style.display = "none";
        downloadAudioButtonText.innerText = "Download Audio";
    }

})

downloadVideoBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;
    downloadVideoLoader.style.display = "inline-block";
    downloadVideoButtonText.innerText = "Converting";
    const response = await convertMedia(url, "video");
    if (response && response.done) {
        downloadVideoButtonText.innerText = "Downloading...";
        const { jobId } = response;
        downloadFile(jobId, "video");
        downloadVideoLoader.style.display = "none";
        downloadVideoButtonText.innerText = "Download Video";
    }

})


async function getVideoInfo(url) {
    try {
        const query = new URLSearchParams({ url }).toString();
        const response = await fetch(`/info?${query}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // { title, duration, thumbnail, uploader, id }
        return data;
    } catch (err) {
        console.error("Error fetching info:", err);
    }
}

function generateInfoHtml(videoInfo) {
    videoTitleDiv.innerHTML = "";
    const title = document.createElement("h2");
    title.textContent = videoInfo.title;
    videoTitleDiv.appendChild(title);

    videoDuration.innerHTML = "";
    const duration = document.createElement("p");
    duration.textContent = `Duration: ${videoInfo.duration}`;
    videoDuration.appendChild(duration);

    videoThumbnail.innerHTML = "";
    const thumbnail = document.createElement("img");
    thumbnail.src = videoInfo.thumbnail;
    videoThumbnail.appendChild(thumbnail);

    videoUploader.innerHTML = "";
    const uploader = document.createElement("p");
    uploader.textContent = `Uploader: ${videoInfo.uploader}`;
    videoUploader.appendChild(uploader);

    // videoId.innerHTML = "";
    // const id = document.createElement("p");
    // id.textContent = videoInfo.id;
    // videoId.appendChild(id);
}

async function convertMedia(url, type) {
    try {
        // const query = new URLSearchParams({ url }).toString();
        const response = await fetch(`/convert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                convertParams: {
                    url: url,
                    type: type
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // { done, path, jobid}
        return data;
    } catch (err) {
        console.error("Error converting to audio:", err);
    }
}





// async function downloadFile(jobId, type) {
//     try {
//         const response = await fetch(`/download`, {
//             method: "POST", // POST allows the JSON body
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 downloadParams: {
//                     jobId: jobId,
//                     type: type
//                 }
//             }),
//         });

//         const extensions = {
//             'audio': 'mp3',
//             'video': 'mp4'
//         }

//         const ext = extensions[type];
//         console.log("file extension is ", ext);

//         if (!response.ok) {
//             throw new Error("Download failed. File might have expired.");
//         }

//         // 1. Convert the response into a Blob (the raw file data)
//         const blob = await response.blob();

//         // 2. Create a temporary URL for this binary data
//         const url = window.URL.createObjectURL(blob);

//         // 3. Create a "ghost" anchor link and click it programmatically
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `video-${jobId}.${ext}`; // The filename the user sees
//         document.body.appendChild(a);
//         a.click();

//         // 4. Cleanup: remove the link and revoke the URL to save memory
//         a.remove();
//         window.URL.revokeObjectURL(url);

//     } catch (error) {
//         console.error("Download Error:", error);
//         alert("Could not download file: " + error.message);
//     }
// }

function downloadFile(jobId, type) {



    // Build the URL with Query Parameters
    const downloadUrl = `/download/${jobId}?type=${type}`;

    // Trigger the native browser download manager
    window.location.href = downloadUrl;
}