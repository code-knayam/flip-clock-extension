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
        this.tickInterval = null;
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
                
                if(message.isPhaseChange) {
                    this.startTimer();
                }
            }
        });
    }

    loadState() {
        chrome.storage.local.get(['timeLeft', 'currentPhase', 'isRunning', 'pomodoroCount', 'timerStartTime'], (result) => {
            if (result.timeLeft !== undefined) {
                let timeLeft = result.timeLeft;
                
                // If timer is running, calculate actual time remaining
                if (result.isRunning && result.timerStartTime) {
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - result.timerStartTime) / 1000);
                    timeLeft = Math.max(result.timeLeft - elapsedSeconds, 0);
                    
                    // Start UI updates if timer is running
                    this.startUIUpdates();
                }

                this.updateDisplay(
                    timeLeft, 
                    result.currentPhase, 
                    result.isRunning,
                    result.pomodoroCount
                );
            }
        });
    }

    startTimer() {
        chrome.storage.local.get(['phases'], (result) => {
            this.button.textContent = 'Stop';
            
            // Start local UI updates
            this.startUIUpdates();
            
            chrome.runtime.sendMessage({ 
                type: 'START_TIMER',
                phases: result.phases || DEFAULT_PHASES
            });
        });
    }

    startUIUpdates() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }

        this.tickInterval = setInterval(() => {
            chrome.storage.local.get(['timeLeft', 'currentPhase', 'isRunning', 'timerStartTime','pomodoroCount'], (result) => {
                if (result.isRunning) {
                    // Calculate actual time remaining based on start time
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - result.timerStartTime) / 1000);
                    const actualTimeLeft = Math.max(result.timeLeft - elapsedSeconds, 0);

                    this.updateDisplay(
                        actualTimeLeft,
                        result.currentPhase,
                        result.isRunning,
                        result.pomodoroCount
                    );

                    // If time's up, trigger phase change from UI
                    if (actualTimeLeft <= 0) {
                        clearInterval(this.tickInterval);
                        chrome.runtime.sendMessage({ type: 'PHASE_COMPLETE' });
                    }
                } else {
                    clearInterval(this.tickInterval);
                }
            });
        }, 1000);
    }

    stopTimer() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }
        chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
    }

    resetTimer() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }
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