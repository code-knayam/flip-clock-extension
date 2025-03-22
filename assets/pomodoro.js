const DEFAULT_PHASES = {
    WORK: 25 * 60,      
    SHORT_BREAK: 5 * 60, 
    LONG_BREAK: 15 * 60  
};

class PomodoroTimer {
    
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadState();
        this.setupProgressRing();
    }

    initializeElements() {
        this.icon = document.querySelector('#pomodoro-icon');
        this.drawer = document.querySelector('.pomodoro-drawer');
        this.closeBtn = document.querySelector('.close-drawer');
        this.phaseElement = document.querySelector('.phase');
        this.timerElement = document.querySelector('.timer-display');
        this.button = document.querySelector('.pomodoro-btn');
        this.progressRing = document.querySelector('.progress-ring-circle');
        this.countElement = document.querySelector('.pomodoro-count');
        this.resetButton = document.querySelector('.reset-btn');
    }

    setupProgressRing() {
        const circle = this.progressRing;
        const radius = circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        
        // Set initial state
        circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.setProgress(100); // Start with full circle
    }

    setProgress(percent) {
        // Convert percent to offset (reverse the percentage as we want clockwise)
        const offset = this.circumference - ((100 - percent) / 100 * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }

    setupEventListeners() {
        this.icon.addEventListener('change', () => {
            this.drawer.classList.add('show');
        });

        this.closeBtn.addEventListener('click', () => {
            this.drawer.classList.remove('show');
        });

        this.button.addEventListener('click', () => {
            chrome.storage.local.get(['isRunning'], (result) => {
                if (result.isRunning) {
                    this.stopTimer();
                } else {
                    this.startTimer();
                }
            });
        });

        this.resetButton.addEventListener('click', () => {
            this.resetTimer();
        });

        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'TIMER_UPDATE') {
                this.updateDisplay(message.timeLeft, message.currentPhase, message.isRunning, message.pomodoroCount);
            }
        });
    }

    loadState() {
        chrome.storage.local.get(['timeLeft', 'currentPhase', 'isRunning', 'pomodoroCount'], (result) => {
            if (result.timeLeft !== undefined) {
                this.updateDisplay(
                    result.timeLeft, 
                    result.currentPhase, 
                    result.isRunning,
                    result.pomodoroCount
                );
            }
        });
    }

    startTimer() {
        chrome.storage.local.get(['phases'], (result) => {
            // Update UI immediately
            this.button.textContent = 'Stop';
            
            chrome.runtime.sendMessage({ 
                type: 'START_TIMER',
                phases: result.phases || DEFAULT_PHASES
            });
        });
    }

    stopTimer() {
        chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
    }

    resetTimer() {
        chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
    }

    updateDisplay(timeLeft, currentPhase, isRunning, pomodoroCount = 0) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update phase with count for WORK phase
        const currentCount = (pomodoroCount % 4) + 1;
        if (currentPhase === 'WORK') {
            this.phaseElement.textContent = `WORK (${currentCount}/4)`;
        } else {
            this.phaseElement.textContent = currentPhase.replace('_', ' ');
        }
        
        this.button.textContent = isRunning ? 'Stop' : 'Start';

        // Update progress ring - Calculate directly without storage call
        const phases = DEFAULT_PHASES; // Use default phases for now
        const totalTime = phases[currentPhase];
        const progress = (timeLeft / totalTime) * 100;
        this.setProgress(progress);
    }
}

// Initialize the Pomodoro timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 