from datetime import datetime

# config values
FORMAT_STRING_FULL_DATE = "%Y-%m-%d %H:%M:%S"
FORMAT_STRING_DATE = "%Y-%m-%d"
FORMAT_STRING_TIME = "%H:%M:%S"
FORMAT_STRING_TIME_H_M = "%H:%M"

PLACEHOLDER_LINK = None
PLACEHOLDER_URL = None
PLACEHOLDER_ROOM = None

CONFERENCE_COLOURS = {
    'TACAS': ['blue', 'green'],
    'ESOP': ['red', 'purple'],
    'FASE': ['orange', 'red'],
    'FOSSACS': ['purple', 'orange'],
    'MISC': ['gray', 'green', 'purple', 'red', 'orange', 'blue', 'gray'],
    'TUTORIAL': ['highlight']
}

CONFERENCE_SORT = ['highlight', 'blue', 'red', 'orange', 'purple', 'green', 'gray']


def get_session_colour(session_name, colours_used):
    """
    Returns the colour for the given session so that no colour is used twice except maybe for gray.
    """
    i = 0
    while CONFERENCE_COLOURS[session_name][i] in colours_used and i - 1 < len(CONFERENCE_COLOURS[session_name]):
        i = i + 1

    if CONFERENCE_COLOURS[session_name][i] not in colours_used:
        colours_used.append(CONFERENCE_COLOURS[session_name][i])

    return CONFERENCE_COLOURS[session_name][i]


def find_filter_and_sort_sessions_by_day_and_time(sessions, day):
    # find all sessions for that day
    matches = list()
    for session in sessions:
        if day == session['day']:
            matches.append(session)
    matches = sorted(matches, key=lambda x: (x['datetime'], x['session_order']))
    return matches


def find_sessions_with_common_start_times_by_day_and_time(sessions, day, time):
    sessions_times_dict = dict()
    # returns a list of sessions that have common start times
    for session in sessions:
        if day == session['day'] and time == session['start_time'] and session['type'] == "CONFERENCE":
            if session['conference'] not in sessions_times_dict.keys():
                sessions_times_dict[session['conference']] = []
            sessions_times_dict[session['conference']].append(session)

    return sessions_times_dict


def slot_session_builder(sessions):
    formatted = list()
    # deep copy
    sessions_to_build = sessions.copy()
    session_colours = dict()

    for session in sessions_to_build:

        session_start_time = session['start_time']

        slot = dict()
        session_time = datetime.strptime(session_start_time, FORMAT_STRING_TIME)
        session_time = session_time.strftime("%H:%M")

        if session_time not in session_colours:
            session_colours[session_time] = list()

        slot['time'] = session_time
        slot['type'] = 'highlight' if session['type'] == 'SPEAKER' else 'list' if session['type'] in ['CONFERENCE',
                                                                                                      'TUTORIAL',
                                                                                                      'MISC'] else 'common'
        # "speakers" and "misc" with session_order 1 are sessions that span the whole row
        if session['type'] not in ['CONFERENCE', 'TUTORIAL', 'MISC'] and session['session_order'] == 1:
            slot['label'] = session['description']

            if slot['type'] == "SPEAKER":
                slot['link'] = None

            if session['type'] == "MISC":
                slot['url'] = None
            else:
                slot['room'] = None
            formatted.append(slot)
        else:
            # otherwise we create a new nested object
            presentations = [presentation for presentation in session['presentations']]
            sorted_presentations = sorted(presentations, key=lambda presentation: presentation['start_time'])
            concurrent_sessions = [session for session in sessions if session['start_time'] == session_start_time]
            max_concurrent_order = max([len(sess['presentations']) for sess in concurrent_sessions])
            # by sorting the presentations and filling in the new structure
            items = []
            if len(sorted_presentations) > 0:
                for pres in sorted_presentations:
                    time = pres['start_time']
                    dtime = datetime.strptime(time, FORMAT_STRING_TIME).strftime("%H:%M")
                    items.append({"time": dtime, "label": pres['title'], "description": pres['authors']})
            else:
                # find all adjacent sessions in correct order
                for i in range(max_concurrent_order):
                    res = dict()
                    if i == 0:
                        time = session['start_time']
                        dtime = datetime.strptime(time, FORMAT_STRING_TIME).strftime("%H:%M")
                        res['time'] = dtime
                        if session['type'] == 'TUTORIAL':
                            res['label'] = session['description']
                    else:
                        res['time'] = None
                    items.append(res)
            # append the results to the list
            res = {
                'label': f"{session['conference']}: {session['title']}" if session['type'] == 'CONFERENCE'
                else 'Invited Tutorial' if session['type'] == 'TUTORIAL'
                else session['description'],
                'description': session['description'] if session['type'] not in ['TUTORIAL', 'MISC'] else 'Chair: ',
                'room': None,
                'style': get_session_colour(
                    session['conference'] if session['type'] == 'CONFERENCE' else session['type'],
                    session_colours[session_time]),
                'items': [{'time': session_time, 'label': session['description']}] if session['type'] not in [
                    'CONFERENCE', 'TUTORIAL', 'MISC'] and session['session_order'] == 1 else items
            }
            already_present = False
            for item in formatted:
                if item['time'] == session_time:
                    try:
                        item['columns'].append(res)
                    except:
                        item['columns'] = list()
                        item['columns'].append(res)

                    # Sorting of the columns – to start with important things
                    try:
                        item['columns'] = sorted(item['columns'], key=lambda x: CONFERENCE_SORT.index(x['style']))
                    except Exception as e:  # In case of something went wrong, do not interrupt the export
                        print(e)

                    already_present = True
            if not already_present:
                slot['columns'] = [res]
                formatted.append(slot)

    return formatted


def generate_yaml_format(sessions_dict=None):
    print('export started')

    contents = sessions_dict
    unique_days = set(session['day'] for session in contents)
    # create necessary fields
    for session in contents:
        dt_str = session['day'] + ' ' + session['start_time']
        date_time_obj = datetime.strptime(dt_str, FORMAT_STRING_FULL_DATE)
        session['datetime'] = date_time_obj
        weekday = date_time_obj.strftime('%A')
        session['weekday'] = weekday

    # init new dict with empty days list
    export_structure = {
        'days': []
    }
    # create list by days (unique days available in data set)
    for day in unique_days:
        # date formats
        full_date = datetime.strptime(day, FORMAT_STRING_DATE)
        date = full_date.strftime("%d %B")
        weekday = full_date.strftime('%A')
        # first identify all sessions that occur on this day
        sorted_sessions_this_day = find_filter_and_sort_sessions_by_day_and_time(contents, day)
        # then build the slots for the sessions
        # Note: differentiate between sessions spanning for all conferences
        # and parallel sessions
        slots = slot_session_builder(sorted_sessions_this_day)
        export_structure['days'].append({"day": weekday,
                                         "date": date,
                                         "slots": slots})

    # returns export structure in json
    weekdays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    export_structure['days'] = sorted(export_structure['days'], key=lambda x: weekdays.index(x['day']), reverse=False)
    return export_structure
