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
      search: { type: String },
      options: { type: Array },
      results: { type: Array },
      // previousSearches: { type: Array },
    };
  }

  get propHandlers() {
    return {
      options() {
        this.fuse?.setCollection(this.options);
      },
      search() {
        this.results = this.fuse.search(this.search).map(result => result.item);
      },
    };
  }

  constructor() {
    super();
    this.options = [...DEFAULT_OPTIONS];
    this.fuse = new Fuse(this.options, { keys: ['name', 'url'] });
  }

  updated(changedProps) {
    for (const [prop] of changedProps) this.propHandlers[prop]?.bind(this)();
  }

  render() {
    return html`
      <!-- <div class="CommandBar"> -->
      <form class="Form" @submit=${this._handleSubmit}>
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
        ${this.results?.map(result => {
          console.log(result);
          return html`<li>${result.name}</li>`;
        })}
      </ul>
      <!-- </div> -->
    `;
  }

  _updateSearch(event) {
    // debounce
    this.search = event.target.value;
  }

  _handleSubmit(event) {
    event.preventDefault();
    this._executeCommand();
  }

  _executeCommand() {
    // const selectedItem = this.options[this.selected];
    // get highlighted item deets
    // get params
    // go
    // assemble params
    // window.location.replace(this.options[this.selected]);
    // this.search('');
  }

  saveItem({ name, data }) {}
}
