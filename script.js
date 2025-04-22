class Timer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.interval = null;
        this.speakers = [];
        this.initTheme();
    }

    initTheme() {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Add event listener for theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatFinalTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} minutes ${seconds} seconds`;
    }

    startMeeting() {
        this.startTime = new Date();
        this.interval = setInterval(() => {
            const now = new Date();
            const duration = now - this.startTime;
            document.getElementById('meetingDuration').textContent = `Meeting Duration: ${this.formatTime(duration)}`;
        }, 1000);
        document.getElementById('startMeeting').disabled = true;
        document.getElementById('endMeeting').disabled = false;
    }

    endMeeting() {
        if (this.interval) {
            clearInterval(this.interval);
            this.endTime = new Date();
            document.getElementById('startMeeting').disabled = false;
            document.getElementById('endMeeting').disabled = true;
        }
    }

    addSpeaker(name, role) {
        const speaker = {
            id: Date.now(),
            name,
            role,
            startTime: null,
            endTime: null,
            duration: 0,
            interval: null
        };
        this.speakers.push(speaker);
        this.renderSpeakers();
    }

    startSpeakerTimer(speakerId) {
        const speaker = this.speakers.find(s => s.id === speakerId);
        if (speaker) {
            speaker.startTime = new Date();
            speaker.interval = setInterval(() => {
                const now = new Date();
                speaker.duration = now - speaker.startTime;
                this.updateSpeakerDisplay(speakerId);
            }, 1000);
            this.updateSpeakerControls(speakerId);
        }
    }

    stopSpeakerTimer(speakerId) {
        const speaker = this.speakers.find(s => s.id === speakerId);
        if (speaker && speaker.interval) {
            clearInterval(speaker.interval);
            speaker.endTime = new Date();
            speaker.duration = speaker.endTime - speaker.startTime;
            this.updateSpeakerControls(speakerId);
            this.renderSpeakers();
        }
    }

    updateSpeakerRole(speakerId, newRole) {
        const speaker = this.speakers.find(s => s.id === speakerId);
        if (speaker) {
            speaker.role = newRole;
            this.renderSpeakers();
        }
    }

    updateSpeakerDisplay(speakerId) {
        const speaker = this.speakers.find(s => s.id === speakerId);
        if (speaker) {
            const timeElement = document.querySelector(`[data-speaker-id="${speakerId}"] .time`);
            if (timeElement) {
                timeElement.textContent = `Time: ${this.formatTime(speaker.duration)}`;
            }
        }
    }

    updateSpeakerControls(speakerId) {
        const speaker = this.speakers.find(s => s.id === speakerId);
        if (speaker) {
            const startBtn = document.querySelector(`[data-speaker-id="${speakerId}"] .start-btn`);
            const stopBtn = document.querySelector(`[data-speaker-id="${speakerId}"] .stop-btn`);
            if (startBtn && stopBtn) {
                startBtn.disabled = speaker.startTime !== null;
                stopBtn.disabled = speaker.startTime === null;
            }
        }
    }

    renderSpeakers() {
        const container = document.getElementById('speakersContainer');
        container.innerHTML = this.speakers.map(speaker => `
            <div class="speaker-card" data-speaker-id="${speaker.id}">
                <h3>${speaker.name} - ${speaker.role}</h3>
                ${speaker.endTime ? `<div class="final-time">${this.formatFinalTime(speaker.duration)}</div>` : ''}
                <div class="time">Time: ${this.formatTime(speaker.duration)}</div>
                <div class="controls">
                    <button class="btn start-btn" onclick="timer.startSpeakerTimer(${speaker.id})" ${speaker.startTime ? 'disabled' : ''}>Start</button>
                    <button class="btn stop-btn" onclick="timer.stopSpeakerTimer(${speaker.id})" ${!speaker.startTime ? 'disabled' : ''}>Stop</button>
                    <select onchange="timer.updateSpeakerRole(${speaker.id}, this.value)">
                        <option value="Speaker" ${speaker.role === 'Speaker' ? 'selected' : ''}>Speaker</option>
                        <option value="Tabletopics" ${speaker.role === 'Tabletopics' ? 'selected' : ''}>Tabletopics</option>
                        <option value="Evaluator" ${speaker.role === 'Evaluator' ? 'selected' : ''}>Evaluator</option>
                    </select>
                </div>
            </div>
        `).join('');
    }
}

const timer = new Timer();

// Event Listeners
document.getElementById('startMeeting').addEventListener('click', () => timer.startMeeting());
document.getElementById('endMeeting').addEventListener('click', () => timer.endMeeting());
document.getElementById('addSpeaker').addEventListener('click', () => {
    const name = document.getElementById('speakerName').value;
    const role = document.getElementById('speakerRole').value;
    if (name) {
        timer.addSpeaker(name, role);
        document.getElementById('speakerName').value = '';
    }
}); 