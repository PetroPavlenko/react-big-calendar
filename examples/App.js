import React from 'react';
// import Api from './Api';
// import Intro from './Intro.md';
import cn from 'classnames';
import {render} from 'react-dom';

import localizer from 'react-big-calendar/lib/localizers/globalize';
import globalize from 'globalize';

localizer(globalize);

import 'react-big-calendar/lib/less/styles.less';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror-formatting/formatting';
import './styles.less';
import './prism.less';
import Basic from './demos/basic';
import Selectable from './demos/selectable';
import Cultures from './demos/cultures';
import Popup from './demos/popup';
import Rendering from './demos/rendering';
import CustomView from './demos/customView';
import Timeslots from './demos/timeslots';
import Dnd from './demos/dnd';

const Example = React.createClass({
  getInitialState() {
    return {
      selected: 'dnd',
    };
  },

  render() {
    let selected = this.state.selected;
    let Current = {
      basic: Basic,
      selectable: Selectable,
      cultures: Cultures,
      popup: Popup,
      rendering: Rendering,
      customView: CustomView,
      timeslots: Timeslots,
      dnd: Dnd,
    }[selected];

    return (
      <div className='app'>
        <div className='examples'>
          <header className="contain">
          </header>
          <div className='example'>
            <Current className='demo'/>
          </div>
        </div>
      </div>
    );
  },

  select(selected, e) {
    e.preventDefault();
    this.setState({selected})
  }
});

render(<Example/>, document.getElementById('root'));
