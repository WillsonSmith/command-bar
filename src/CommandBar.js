import { html, css, LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {} from 'idb';
import Fuse from 'fuse.js'; // this is probably overweight tbh, could just filter by name

const DEFAULT_OPTIONS = [
  {
    name: 'Google',
    url: 'https://google.com/search',
    params: ['q'], // use to validate? "Missing Param Q"
    label: 'Google search for {query}',
  },
];

function constructedUrl(url, params, queries) {
  const urlObject = new URL(`${url}`);
  // case where only one, want to join all queries instead of just one
  if (params.length === 1) {
    /**
     * Make autofill less gross to read
     * Only supports autoFill for one param rn
     * Should maybe have autoFill on option instead of param, so that it can be used for multiple params
     */
    const param = params[0];
    if (param.autoFill) {
      const query = param.autoFill();
      urlObject.searchParams.set(param.name, query);
    } else {
      urlObject.searchParams.set(params[0], queries.join(' '));
    }
  }
  if (params.length > 1) {
    params.forEach((param, index) => {
      if (queries[index]) urlObject.searchParams.set(param, queries[index]);
    });
  }
  return urlObject;
}

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
        background: rgba(155, 155, 155, 0.2);
        backdrop-filter: blur(5px);
        padding: 1rem;
        border-radius: 1.6rem;
      }
      .Search {
        background: var(
          --command-bar-search-background,
          var(--theme-default-face)
        );
        border: none;
        border-bottom: 2px solid rgba(85, 155, 110, 1);
        box-shadow: inset 1rem 0 -1rem 0 var(--command-bar-search-border, #000);
        font-size: 2rem;
        width: 100%;

        padding: 0.4rem;
      }

      .Search:focus,
      .Search:focus-visible {
        outline: none;
        box-shadow: inset 0 -2px 0 rgba(85, 185, 120, 1);
      }

      .DescriptionList {
        margin: 0;
      }

      .Wrapper {
        border-radius: 1.6rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 1);
      }

      .Result:first-child {
        margin-top: 1rem;
      }

      .Result {
        border: 1px solid transparent;
        display: block;
        padding: 1.2rem;

        font-size: 1.6rem;
        font-family: sans-serif;

        text-decoration: none;
        color: rgba(0, 0, 0, 1);
      }

      .Result[data-focused='true'] {
        border: 1px solid rgba(85, 155, 110, 1);
        border-radius: 1rem;
      }

      .Result__action {
        display: inline-block;
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

        margin-left: 0;
        margin-top: 0.6rem;
      }
    `;
  }

  static get properties() {
    return {
      autofocus: { type: Boolean },
      search: { type: String },
      selected: { type: Number }, // index of selected result
      options: { attribute: false, type: Array },
      results: { attribute: false, type: Array },
      width: { attribute: false, type: Number },
    };
  }

  constructor() {
    super();
    this.selected = 0;
    this.options = [...DEFAULT_OPTIONS];
    this.fuse = new Fuse(this.options, {
      keys: ['name'],
      includeMatches: true,
      includeScore: true,
    });
    // need to removeEventListener on unmount
    this.addEventListener('keydown', this._handleKeyDown);
  }

  updated(changedProps) {
    for (const [prop] of changedProps) {
      this[`_${prop}Changed`]?.bind(this)();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  render() {
    return html`
      <form class="Form" @submit=${this._handleSubmit}>
        <div class="Wrapper">
          <input
            type="search"
            name="command_bar_search"
            class="Search"
            placeholder="Search actions..."
            @input=${this._updateSearch}
          />
          <div class="Results ${this.width < 600 ? 'narrow' : ''}">
            <dl class="DescriptionList">
              ${this.results?.map(
                (result, index) => html`<a
                  href="${result?.url?.toString()}"
                  @click=${event => {
                    const url = result?.url?.toString();
                    if (!url) event.preventDefault();
                    ifDefined(result.action?.(result.queries));
                  }}
                  data-focused=${index === this.selected}
                  class="Result"
                  aria-label="${result.label}"
                  @focus=${() => {
                    this.selected = index;
                  }}
                >
                  <dt class="Result__action">${result.name}</dt>
                  <dd class="Result__url">${result.url}</dd>
                </a> `
              )}
            </dl>
          </div>
        </div>

        <button
          style="opacity: 0; position: absolute; pointer-events: none;"
          type="submit"
          class="SubmitButton"
        >
          Run
        </button>
      </form>
    `;
  }

  _handleKeyDown(event) {
    event.stopPropagation();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.selected === null) this.selected = -1;
      if (this.selected < this.results.length - 1) {
        this.selected += 1;
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.selected === null) this.selected = this.results.length;
      if (this.selected > 0) {
        this.selected -= 1;
      }
    }
  }

  _searchChanged() {
    const results = [];
    const [command, ...queries] = this.search.split(' ');
    // need to do OR for queries
    for (const result of this.fuse.search(command)) {
      const {
        item: { action, url, params },
      } = result;
      // if ()

      const urlObject = url && constructedUrl(url, params, queries);

      const label = result.item.label?.replace('{query}', queries.join(' '));
      results.push({ ...result.item, action, url: urlObject, label, queries });
    }
    this.results = results;
  }

  _autofocusChanged() {
    if (!this.autofocus) return;
    const input = this.shadowRoot.querySelector('.Search');
    input.focus();
  }

  _optionsChanged() {
    this.fuse.setCollection(this.options);
  }

  _updateSearch(event) {
    // debounce
    this.search = event.target.value;
  }

  _handleSubmit(event) {
    event.preventDefault();
    this._executeCommand();
  }

  _executeCommand(args) {
    // this should also execute custom, can open window OR..
    const selected = this.results[this.selected];
    if (selected.action) return selected.action(args);
    if (selected.url) return window.open(selected.url);
  }
}
