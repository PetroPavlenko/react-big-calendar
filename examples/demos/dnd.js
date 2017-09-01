import React from 'react'
import events from '../events'
import HTML5Backend from 'react-dnd-html5-backend'
import {DragDropContext} from 'react-dnd'
import ContentLoader, {Rect} from 'react-content-loader'
import _ from 'lodash';
import $ from "jquery";
window.$ = $;
window.jquery = $;
import toastr from 'toastr';

import BigCalendar from 'react-big-calendar'
import dateMath from 'date-arithmetic';

import dates from '../../src/utils/dates';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.less';

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

class Dnd extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events: events,
      isLoading: true
    }

    //get request
    this.moveEvent = this.moveEvent.bind(this)
    setTimeout(() => {

      this.setState({isLoading: false})
    }, 2000)
  }

  moveEvent({event, start, end}) {
    const {events} = this.state;

    const i = events.indexOf(event);
    const updatedEvent = {...event, start, end};

    const nextEvents = [...events]

    const availabilities = _.filter(events, 'background')

    const simpleEvents = _.filter(events, ev => !ev.background);

    if (
      availabilities.some(avab =>
        dateMath.inRange(start, avab.start, avab.end, 'minutes') &&
        dateMath.inRange(end, avab.start, avab.end, 'minutes')
      ) &&
      !simpleEvents.some(unAvab =>
        dateMath.inRange(unAvab.start, start, end, 'minutes') ||
        dateMath.inRange(unAvab.end, start, end, 'minutes')
      )
    ) {
      nextEvents.splice(i, 1, updatedEvent)
      // this.setState({isLoading: true});
      // post request
      // setTimeout(() => {
      this.setState({
        events: nextEvents,
        isLoading: false
      })
      setTimeout(() => toastr.success(
        `${event.title} was dropped onto ${event.start}`
      ), 100);

      // }, 2000);
    }
    else {
      toastr.error(`Provider is unavailable`)
    }
  }

  render() {
    return (
      <div>
        {
          this.state.isLoading &&
          <ContentLoader height={2000} speed={1} primaryColor={'#3174ad'} secondaryColor={'#3c9ee8'}>
            <Rect x={50} y={20} height={10} radius={5} width={300}/>
            {_.times(10).map(i => <Rect
              x={50} y={(i + 1) * 20} height={10} radius={5} width={300} key={i}
            />)}
          </ContentLoader>
        }
        <DragAndDropCalendar
          selectable
          events={this.state.events}
          onEventDrop={this.moveEvent}
          defaultView='day'
          step={15}
          defaultDate={new Date(2017, 3, 12)}
        />
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Dnd)
