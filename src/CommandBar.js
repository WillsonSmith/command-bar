import { html, css, LitElement } from 'lit';
import {} from 'idb';
import Fuse from 'fuse.js';

const DEFAULT_OPTIONS = [
  {
    name: 'Google',
    url: 'https://google.com/search',
    params: ['q'], // use to validate? "Missing Param Q"
  },
  {
    name: 'DownloadVideo',
    url: 'https://materialistic-brook-king.glitch.me/dl',
    params: ['url'],
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
        this.results = this.fuse.search(this.search).map(result => {
          const {
            item: { url, params },
          } = result;
          const [, ...args] = this.search.split(' ');
          const urlObject = new URL(`${url}`);
          params.forEach((param, index) => {
            if (args[index]) urlObject.searchParams.set(param, args[index]);
          });

          return { ...result.item, url: urlObject };
        });
      },
    };
  }

  constructor() {
    super();
    this.options = [...DEFAULT_OPTIONS];
    this.fuse = new Fuse(this.options, { keys: ['name'] });
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
          return html`<li><a href="${result.url}">${result.name}</a></li>`;
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
