import { html } from 'lit';
import '../command-bar.js';

export default {
  title: 'CommandBar',
  component: 'command-bar',
  argTypes: {
    title: { control: 'text' },
    counter: { control: 'number' },
    textColor: { control: 'color' },
  },
};

function Template() {
  return html`
    <command-bar
      .options=${[
        {
          name: 'DuckDuckGo',
          url: 'https://duckduckgo.com',
          params: ['q'],
          label: 'Search DuckDuckGo for {query}',
        },
        {
          name: 'Google',
          url: 'https://google.com/search',
          params: ['q'], // use to validate? "Missing Param Q"
          label: 'Google search for {query}',
        },
        {
          name: 'Download Video',
          url: 'https://materialistic-brook-king.glitch.me/dl',
          params: ['url'],
          label: 'Download video from {query}',
        },
        {
          name: 'Log',
          action: args => console.log('Logging', args),
          label: 'Run Log with {query}',
        },
      ]}
    >
      some light-dom
    </command-bar>
  `;
}

export const Regular = Template.bind({});

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  title: 'My title',
};

export const CustomCounter = Template.bind({});
CustomCounter.args = {
  counter: 123456,
};

export const SlottedContent = Template.bind({});
SlottedContent.args = {
  slot: html`<p>Slotted content</p>`,
};
SlottedContent.argTypes = {
  slot: { table: { disable: true } },
};
