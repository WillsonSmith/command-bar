import { html, css, LitElement } from 'lit';
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
  params.forEach((param, index) => {
    if (queries[index]) urlObject.searchParams.set(param, queries[index]);
  });
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
        background: rgba(85, 185, 120, 1);
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
      search: { type: String },
      options: { type: Array },
      results: { type: Array },
      width: { type: Number },
      selected: { type: Number }, // index of selected result
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

    // const resizeObserver = new ResizeObserver(entries => {
    //   for (const entry of entries) {
    //     const { width } = entry.contentRect;
    //     console.log(width);
    //     this.width = width;
    //     // this.style.width = `${width}px`;
    //   }
    // });

    // resizeObserver.observe(this);

    // need to removeEventListener on unmount
    this.addEventListener('keydown', event => {
      if (event.key === ' ') {
        // don't do this if the search bar is focused
        // event.preventDefault();
        // this._executeCommand();
      }
      if (event.key === 'ArrowDown') {
        if (this.selected === null) this.selected = -1;
        event.preventDefault();
        if (this.selected < this.results.length - 1) {
          this.selected += 1;
        }
      }
      if (event.key === 'ArrowUp') {
        if (this.selected === null) this.selected = this.results.length;
        event.preventDefault();
        if (this.selected > 0) {
          this.selected -= 1;
        }
      }
    });
  }

  updated(changedProps) {
    for (const [prop] of changedProps) this[`_${prop}Changed`]?.bind(this)();
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
                  href="${result.url.toString()}"
                  data-focused=${index === this.selected}
                  class="Result"
                  aria-label="${result.label}"
                  @focus=${() => (this.selected = index)}
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

  _searchChanged() {
    const results = [];
    const [command, ...queries] = this.search.split(' ');
    // need to do OR for queries
    for (const result of this.fuse.search(command)) {
      const {
        item: { url, params },
      } = result;
      const urlObject = constructedUrl(url, params, queries);

      // get queries length, get params length, if queries > params, concat
      params.forEach((param, index) => {
        if (queries[index]) {
          // urlObject.searchParams.set(param, queries[index]);
        }
      });

      const label = result.item.label.replace('{query}', queries.join(' '));
      results.push({ ...result.item, url: urlObject, label });
    }
    this.results = results;
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

  _executeCommand() {
    // this should also execute custom, can open window OR..
    if (!this.selected) {
      window.open(this.results[0]?.url);
      return;
    }
    window.open(this.results[this.selected]?.url);
  }
}
