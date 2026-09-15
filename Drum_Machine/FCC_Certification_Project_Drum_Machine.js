const triggerBtns = document.querySelectorAll(".drum-pad");
const display = document.getElementById("display");

const audio = new Audio();
let currentAudio = {
    id: null,
    currentTime: 0,
};

//this will call other functions to stop any playing audio,
//play any new audio (or restart it if already playing),
//and update the display (with a timeout function) with the
//corresponding audio source description name
const handleTriggerButtonPress = () => {
    if (currentAudio.id)
    {

    }
}

const clearCurrentAudio = () => {
    currentAudio.id = null;
    currentTime = 0;
}

//remove current audio data since sample has finished playing
audio.addEventListener("ended", clearCurrentAudio);
triggerBtns.forEach((button) => {
    button.addEventListener("click", handleTriggerButtonPress);
})