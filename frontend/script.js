const form = document.querySelector("form");
const urlInput = document.getElementById("url");
const button = document.querySelector("button");

const videoInfoDiv = document.getElementById("video-info");
const getInfoLoader = document.getElementById("get-info-loader");
const downloadAudioLoader = document.getElementById("download-audio-loader");
const downloadAudioButtonText = document.getElementById("download-audio-button-text");

const vidoInfoContent = document.getElementById("video-info--content");
const videoTitleDiv = document.getElementById("video-title");
const videoThumbnail = document.getElementById("video-thumbnail");
const videoDuration = document.getElementById("video-duration");
const videoUploader = document.getElementById("video-uploader");
const videoId = document.getElementById("video-id");

const downloadAudioBtn = document.getElementById("download-audio");

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
    const response = await convertToAudio(url);
    if (response.done) {
        downloadAudioLoader.style.display = "none";
        downloadAudioButtonText.innerText = "Download Audio";
        window.location.href = `/download/${response.jobId}`;
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

async function convertToAudio(url) {
    try {
        const query = new URLSearchParams({ url }).toString();
        const response = await fetch(`/convert?${query}`);

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


