if (!customElements.get('countdown-timer')) {
  customElements.define(
    'countdown-timer',
    class CountdownTimer extends HTMLElement {
      connectedCallback() {
        this.target = new Date(this.dataset.target).getTime();
        this.endedMessage = document.getElementById(this.dataset.endedId);
        this.liveText = this.querySelector('[data-countdown-live]');
        this.groups = {
          days: this.querySelector('[data-unit="days"]'),
          hours: this.querySelector('[data-unit="hours"]'),
          minutes: this.querySelector('[data-unit="minutes"]'),
        };

        if (isNaN(this.target)) return;

        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
      }

      disconnectedCallback() {
        clearInterval(this.timer);
      }

      setTiles(el, value) {
        if (!el) return;
        const digits = String(Math.max(0, value)).padStart(2, '0').split('');
        el.querySelectorAll('span').forEach((span, i) => {
          if (span.textContent !== digits[i]) span.textContent = digits[i];
        });
      }

      tick() {
        const diff = this.target - Date.now();

        if (diff <= 0) {
          this.setTiles(this.groups.days, 0);
          this.setTiles(this.groups.hours, 0);
          this.setTiles(this.groups.minutes, 0);
          this.hidden = true;
          if (this.endedMessage) this.endedMessage.hidden = false;
          clearInterval(this.timer);
          return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.min(Math.floor(totalSeconds / 86400), 99);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        this.setTiles(this.groups.days, days);
        this.setTiles(this.groups.hours, hours);
        this.setTiles(this.groups.minutes, minutes);

        if (this.liveText) {
          this.liveText.textContent = `${days} days, ${hours} hours, ${minutes} minutes remaining`;
        }
      }
    }
  );
}
