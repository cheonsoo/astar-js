class ToggleSwitch extends HTMLElement {
  constructor(label = '', onChange = () => {}) {
    super();

    this.label = label;
    this.onChange = onChange;
    this.template = `
      <label>
        <span>{label}</span>
        <input role="switch" type="checkbox" />
      </label>
    `;
  }

  connectedCallback() {
    this.label = this.getAttribute('label') + ' ###';

    const toggleSwitch = document.createElement('div');
    this.appendChild(toggleSwitch);
    this.innerHTML = this.template.replace('{label}', this.label);
  }
}

customElements.define('toggle-switch', ToggleSwitch);