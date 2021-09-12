import { html, css, LitElement } from 'lit';
import {} from 'idb';
import Fuse from 'fuse.js';

const DEFAULT_OPTIONS = [
  {
    name: 'Google',
    url: 'https://google.com/search',
    params: ['q'], // use to validate? "Missing Param Q"
    label: 'Google search for {query}',
  },
  {
    name: 'DownloadVideo',
    url: 'https://materialistic-brook-king.glitch.me/dl',
    params: ['url'],
    label: 'Download video from {query}',
  },
];

const propHandlers = {
  options() {
    this.fuse?.setCollection(this.options);
  },
  search() {
    const results = [];
    const [command, ...queries] = this.search.split(' ');
    // need to do OR for queries
    for (const result of this.fuse.search(command)) {
      const {
        item: { url, params },
      } = result;
      const urlObject = constructedUrl(url, params, queries);

      params.forEach((param, index) => {
        if (queries[index]) {
          urlObject.searchParams.set(param, queries[index]);
        }
      });

      const label = result.item.label.replace('{query}', queries.join(' '));
      results.push({ ...result.item, url: urlObject, label });
    }
    this.results = results;
  },
};

export class CommandBar extends LitElement {
  static get styles() {
    return css`
      :host {
        --theme-default-face: rgba(255, 255, 255, 1);
        --theme-default-border: rgba(34, 34, 34, 1);

        display: block;
        color: var(--command-bar-text-color, #000);
      }
      .Form {
      }
      .Search {
        background: var(
          --command-bar-search-background,
          var(--theme-default-face)
        );
        border: 2px solid
          var(--command-bar-border-color, var(--theme-default-border));

        border-radius: 3px;

        font-size: 2rem;
        width: 100%;

        padding: 0.4rem;
      }
      .SubmitButton {
      }

      .Result {
        display: flex;
        align-items: center;

        padding: 1.2rem;

        font-size: 1.6rem;
        font-family: sans-serif;

        text-decoration: none;
        color: rgba(0, 0, 0, 1);
      }

      .Result + .Result {
        margin-top: 1rem;
      }

      .Result__action {
        // background: rgba(114, 114, 230, 1);
        background: rgba(85, 185, 120, 1);
        padding: 0.4rem 1.6rem;
        border-radius: 6px;
        color: rgba(255, 255, 255, 1);
      }
      .Result__url {
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

  constructor() {
    super();
    this.search = 'goog mysickquerygoeshereitssolongomg';
    this.options = [...DEFAULT_OPTIONS];
    this.fuse = new Fuse(this.options, {
      keys: ['name'],
      includeMatches: true,
      includeScore: true,
    });
  }

  updated(changedProps) {
    for (const [prop] of changedProps) propHandlers[prop]?.bind(this)();
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
        <div class="Results">
          <dl class="DescriptionList">
            ${this.results?.map(
              result => html`<a
                href="${result.url}"
                class="Result"
                aria-label="${result.label}"
              >
                <dt class="Result__action">${result.name}</dt>
                <dd class="Result__url">${result.url}</dd>
              </a> `
            )}
          </dl>
        </div>

        <button
          style="opacity: 0; position: absolute; pointer-events: none;"
          type="submit"
          class="SubmitButton"
        >
          Run
        </button>
      </form>
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
    // this should also execute custom, can open window OR..
    window.open(this.results[0].url);
    console.log(this.results[0].url);
    // this.onExecute();
  }

  onExecute() {}

  saveItem({ name, data }) {}
}

function constructedUrl(url, params, args) {
  const urlObject = new URL(`${url}`);
  params.forEach((param, index) => {
    if (args[index]) urlObject.searchParams.set(param, args[index]);
  });
  return urlObject;
}
