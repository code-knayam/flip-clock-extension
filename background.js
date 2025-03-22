// Default phase durations (in seconds)
const TIMER_PHASES = {
    WORK: 'WORK',
    SHORT_BREAK: 'SHORT_BREAK',
    LONG_BREAK: 'LONG_BREAK'
}

const DEFAULT_PHASES = {
    [TIMER_PHASES.WORK]: 25 * 60,      
    [TIMER_PHASES.SHORT_BREAK]: 5 * 60, 
    [TIMER_PHASES.LONG_BREAK]: 15 * 60 
};

const MESSAGES = {
    START_TIMER: 'START_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    TIMER_UPDATE: 'TIMER_UPDATE',
    RESET_TIMER: 'RESET_TIMER'
}

let timer = getDefaultTimerState();

// Initialize state on extension install or update
chrome.runtime.onInstalled.addListener(() => {
    // Reset timer state
    timer = getDefaultTimerState();

    // Clear and reset storage
    chrome.storage.local.clear(() => {
        chrome.storage.local.set({
            ...getDefaultTimerState()
        });
    });

    // Request permissions
    chrome.permissions.contains({
        permissions: ['audio', 'alarms', 'notifications']
    }, (result) => {
        if (!result) {
            chrome.permissions.request({
                permissions: ['audio', 'alarms', 'notifications']
            });
        }
    });
});

// Load phases when background script starts
chrome.storage.local.get(['phases'], (result) => {
    if (result.phases) {
        timer.phases = result.phases;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type) {
        case MESSAGES.START_TIMER:
            handleStartTimerEvent(message);
            break;
        case MESSAGES.STOP_TIMER:
            handleStopTimerEvent();
            break;
        case MESSAGES.RESET_TIMER:
            handleResetTimerEvent();
            break;
        default:
            console.error('invalid message type');
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroTimer' && timer.isRunning) {
        timer.timeLeft--;
        
        if (timer.timeLeft <= 0) {
            playChime();
            moveToNextPhase();
        }

        // Save state
        chrome.storage.local.set({
            timeLeft: timer.timeLeft,
            currentPhase: timer.currentPhase,
            pomodoroCount: timer.pomodoroCount
        });

        sendTimerUpdate();        
    }
});

function handleStartTimerEvent(message) {
    timer.phases = message.phases;
    timer.isRunning = true;
    chrome.storage.local.set({ isRunning: true });
    
    sendTimerUpdate();
    startAlarm();
}

function handleStopTimerEvent() {
    timer.isRunning = false;
    // Reset timer to the start of current phase
    timer.timeLeft = timer.phases[timer.currentPhase];
    
    // Save the reset state
    chrome.storage.local.set({ 
        isRunning: false,
        timeLeft: timer.timeLeft
    });

    sendTimerUpdate();

    chrome.alarms.clear('pomodoroTimer');
}

function handleResetTimerEvent() {
    timer = getDefaultTimerState();

    // Clear alarm if running
    chrome.alarms.clear('pomodoroTimer');

    // Reset storage
    chrome.storage.local.set({
        ...getDefaultTimerState()
    });

    sendTimerUpdate();
}

function startAlarm() {
    chrome.alarms.create('pomodoroTimer', {
        periodInMinutes: 1/60  // Fires every second
    });
}

function sendTimerUpdate() {
    chrome.tabs.query({}, (tabs) => {  // Query all tabs
        tabs.forEach(tab => {
            // Check if it's a new tab URL
            if (tab.url === 'chrome://newtab/') {
                chrome.tabs.sendMessage(tab.id, {
                    type: MESSAGES.TIMER_UPDATE,
                    timeLeft: timer.timeLeft,
                    currentPhase: timer.currentPhase,
                    isRunning: timer.isRunning,
                    pomodoroCount: timer.pomodoroCount
                });
            }
        });
    });
}

function moveToNextPhase() {
    if (timer.currentPhase === TIMER_PHASES.WORK) {
        timer.pomodoroCount = (timer.pomodoroCount+1) % 4;
        if (timer.pomodoroCount === 0) {
            timer.currentPhase = TIMER_PHASES.LONG_BREAK;
            timer.timeLeft = timer.phases.LONG_BREAK;
        } else {
            timer.currentPhase = TIMER_PHASES.SHORT_BREAK;
            timer.timeLeft = timer.phases.SHORT_BREAK;
        }
    } else {
        timer.currentPhase = TIMER_PHASES.WORK;
        timer.timeLeft = timer.phases.WORK;
    }
}

async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing pomodoro timer sounds'
    });
}

async function playChime() {
    try {
        await createOffscreen();
        await chrome.runtime.sendMessage({ type: 'PLAY_SOUND' });
        sendNotification();
    } catch (error) {
        console.error('Failed to play sound:', error);
        sendNotification();
    }
}

function sendNotification() {
    const currentCount = (timer.pomodoroCount + 1);
    const message = timer.currentPhase === TIMER_PHASES.WORK 
        ? `Time's up! Starting Work session ${currentCount}/4`
        : `Time's up! Taking a ${timer.pomodoroCount === 0 ? 'long' : 'short'} break`;

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: 'Pomodoro Timer',
        message: message,
        silent: true,
    });
}

function getDefaultTimerState() {
    const DEFAULT_TIMER_STATE = {
        timeLeft: DEFAULT_PHASES.WORK,
        currentPhase: TIMER_PHASES.WORK,
        isRunning: false,
        pomodoroCount: 0,
        phases: DEFAULT_PHASES
    }; 

    return JSON.parse(JSON.stringify(DEFAULT_TIMER_STATE));
}