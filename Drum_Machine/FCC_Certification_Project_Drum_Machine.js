const triggerBtns = document.querySelectorAll(".drum-pad");
const display = document.getElementById("display");
const descriptions = {
    "Q" : "Heater 1",
    "W" : "Heater 2",
    "E" : "Heater 3",
    "A" : "Heater 4-1",
    "S" : "Heater 6",
    "D" : "DSC OH",
    "Z" : "Kick n' Hat",
    "X" : "RP4 Kick-1",
    "C" : "Cev H2",
};

const audio = new Audio();
let currentAudio = {
    id: null,
    currentTime: 0,
};

function handleKeyButtonPress(event)
{
    const key = event.code.slice(3);
    if (Object.keys(descriptions).includes(key))
    {
        const src = document.getElementById(key);
        handleAudio(key, src);
    }
    else
    {
        clearDisplay();
    }
}

//this will call other functions to stop any playing audio,
//play any new audio (or restart it if already playing),
//and update the display (with a timeout function) with the
//corresponding audio source description name
function handleTriggerButtonPress(event)
{
    const key = event.currentTarget.innerText;
    const src = document.getElementById(key).src;
    handleAudio(key, src);
}

function handleAudio(key, src)
{
    clearDisplay();
    audio.pause();
    audio.currentTime = 0;
    currentAudio.id = key;
    currentAudio.currentTime = 0;
    updateDisplay();
    playAudio(src);
}

const playAudio = (src) => {
    audio.src = src;
    audio.play();
}

const updateDisplay = () => {
    display.innerText = descriptions[currentAudio.id];
}

const clearDisplay = () => {
    display.innerText = "";
}

const clearCurrentAudio = () => {
    currentAudio.id = null;
    currentTime = 0;
    clearDisplay();
}

//remove current audio data since sample has finished playing
audio.addEventListener("ended", clearCurrentAudio);
triggerBtns.forEach((button) => {
    button.addEventListener("click", handleTriggerButtonPress);
});
document.addEventListener("keyup", handleKeyButtonPress);