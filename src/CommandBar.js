import { html, css, LitElement } from 'lit';
import {} from 'idb';
import Fuse from 'fuse.js';

const DEFAULT_OPTIONS = [
  {
    name: 'Google',
    url: 'google.com/search',
    params: ['q'], // use to validate? "Missing Param Q"
  },
];

export class CommandBar extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        // padding: 25px;
        color: var(--command-bar-text-color, #000);
      }
      .Form {
      }
      .SubmitButton {
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
      search: { type: String },
      options: { type: Array },
      previousSearches: { type: Array },
    };
  }

  constructor() {
    super();
    this.options = [...DEFAULT_OPTIONS];

    // this.fuse = new Fuse(this.options, {});

    this._updateSearch = this._updateSearch.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._executeCommand = this._executeCommand.bind(this);
  }

  updated(changedProps) {
    for (const [prop] of changedProps) {
      if (prop === 'options') {
        this.fuse = new Fuse(this.options);
      }
    }
  }

  render() {
    return html`
      <!-- <div class="CommandBar"> -->
      <form class="Form" @submit="{_executeCommand}">
        <input
          type="search"
          name="command_bar_search"
          class="Search"
          @input=${this._updateSearch}
        />
        <button type="submit" class="SubmitButton">Run</button>
      </form>
      <div>${this.search}</div>
      <ul>
        ${this.currentResults?.map(result => {
          return html`<li>${result.name}</li>`;
        })}
      </ul>
      <!-- </div> -->
    `;
  }

  _updateSearch(event) {
    // debounce
    this.search = event.target.value;
    console.log(this.search);
    console.log(this.fuse.search(this.search));
    // const results = this.fuse.search(this.search);
    // this.currentResults = results;
  }

  _handleSubmit(event) {
    event.preventDefault();
    this._executeCommand();
  }

  _executeCommand() {
    const selectedItem = this.options[this.selected];

    // get highlighted item deets
    // get params
    // go
    // assemble params
    window.location.replace(this.options[this.selected]);
    // this.search('');
  }

  saveItem({ name, data }) {}
}

function run() {}
