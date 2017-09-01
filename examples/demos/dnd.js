import React from 'react'
import events from '../events'
import HTML5Backend from 'react-dnd-html5-backend'
import {DragDropContext} from 'react-dnd'
import ContentLoader, {Rect} from 'react-content-loader'
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';

window.$ = $;
window.jquery = $;
import toastr from 'toastr';

import BigCalendar from 'react-big-calendar'
import dateMath from 'date-arithmetic';

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import {post} from './fetcher';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.less';

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const START_DATE = new Date(2017, 3, 12);
const START_TYPE = 'day';
const REQUEST_TYPE = 'DD/MM/YYYY';
const CREATE_TYPE = 'YYYY-MM-DD';

class Dnd extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      events,
      isLoading: true
    }

    this.calendarState = {
      date: START_DATE,
      view: START_TYPE
    };

    this.updateEvents()
  }

  loadPost = (url, data, postOpt) => {
    let timeout = setTimeout(() => {
      this.setState({
        isLoading: true
      })
    }, 1000)
    return post(url, data, postOpt)
      .catch(e => {
        clearTimeout(timeout);
        this.setState({
          isLoading: false
        })
        return Promise.reject(e);
      })
      .then(resp => {
        clearTimeout(timeout);
        if (_.get(resp, 'status') !== 200) {
          console.error("can't fetch, error : " + _.get(resp, 'status'))
          this.setState({
            isLoading: false
          })
          return Promise.reject(resp);
        }
        return resp
      })
  };

  moveEvent = ({event, start, end}) => {
    if (event.background) {
      return;
    }
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

      this.loadPost('timeslot/saveorupdate', {
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
        createBy: null,
        deletedBy: null,
        endDate: moment.parseZone(end).format(CREATE_TYPE),
        startDate: moment.parseZone(start).format(CREATE_TYPE),
        state: null,
        schedule: null,
        appointment: null
      })
        .then(resp => {
          // updatedEvent = resp.data
          nextEvents.splice(i, 1, updatedEvent)
          this.setState({
            isLoading: false,
            events: nextEvents
          })
          setTimeout(() => toastr.success(
            `${event.title} was dropped onto ${event.start}`
          ), 100);
        });
    }
    else {
      toastr.error('Provider is unavailable')
    }
  }

  updateEvents = (calendarState) => {
    if (calendarState) this.calendarState = calendarState;
    let start, end;
    let viewType = this.calendarState.view;
    if (viewType === 'week') {
      viewType = 'isoWeek';
    }
    start = moment(this.calendarState.date).startOf(viewType)
    end = moment(this.calendarState.date).endOf(viewType)
    this.loadPost(
      'timeslot/bystartandenddate',
      {
        enddate: end.format(REQUEST_TYPE),
        startdate: start.format(REQUEST_TYPE)
      },
      {isFormData: true}
    )
      .then(resp => this.setState({
        isLoading: false,
        events: resp.data.length ? resp.data : events
      }));
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
          defaultView={START_TYPE}
          step={15}
          onNavigate={(date, view) => {
            if (dateMath.eq(date, this.calendarState.date)) return;
            this.updateEvents({
              date,
              view: view || this.calendarState.view
            })
          }}
          onView={view => {
            if (dateMath.eq(view, this.calendarState.view)) return;
            this.calendarState.view = view;
            this.updateEvents();
          }}
          defaultDate={START_DATE}
        />
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(Dnd)
