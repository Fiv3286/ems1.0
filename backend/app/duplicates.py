import pandas as pd
from fuzzywuzzy import process, fuzz, utils

############################### duplicate committees checking ##################################
def similar_first_name(row1, df, threshold):
    """
    Compare first name similarity.

    Find the possible duplicate first names among all committees 
    which have higher or equal similarity scores to the threshold,
    return a generator of tuples containing the committee id, member id, 
    matched indicator and index.

    Arguments:
        row1: A row representing the committee member we want to check with.
        df: A dataframe representing all the committee members in a selected year.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.

    Return:
        Generator of tuples containing the matched committee id list, member id list, 
        matched bool indicator and member index list in dataframe.
        All returned lists contain unique values.

        If matched bool indicator is false, meaning there is no possible duplicate among all committees,
        committee id list, member id list and member index list will be empty.
    """
    mat_idx = set()
    mat_id = set()
    mat_mid = set()
    mat_bool = False

    # Compare current member's first name with other members in dataframe
    if utils.full_process(row1['first_name']):
    # wont execute and not produce a warning
        matches = process.extract(row1['first_name'], list(df['first_name']), limit=10)
        for match in matches:
            if match[1] >= threshold:
                mat_bool = True
                matchIndex = df.first_name[df.first_name == match[0]].index
                # Add other duplicate member to the result list
                for i in matchIndex:
                    tmp_id = df.loc[i, '_id']
                    tmp_mid = df.loc[i, 'mid']
                    mat_id.add(tmp_id)
                    mat_mid.add(tmp_mid)
                    mat_idx.add(i)
    # Add current member to the result list if duplicates have been found
    if mat_bool:
        mat_id.add(row1["_id"])
        mat_mid.add(row1["mid"])
    return list(mat_id), list(mat_mid), mat_bool, list(mat_idx)


def similar_last_name(row1, df, threshold):
    """
    Compare last name similarity.

    Find the possible duplicate last names among all committees 
    which have higher or equal similarity scores to the threshold,
    return a generator of tuples containing the committee id, member id, 
    matched indicator and index.

    Arguments:
        row1: A row representing the committee member we want to check with.
        df: A dataframe representing all the committee members in a selected year.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.

    Return:
        Generator of tuples containing the matched committee id list, member id list, 
        matched bool indicator and member index list in dataframe.
        All returned lists contain unique values.

        If matched bool indicator is false, meaning there is no possible duplicate among all committees,
        committee id list, member id list and member index list will be empty.
    """
    mat_idx = set()
    mat_id = set()
    mat_mid = set()
    mat_bool = False

    # Compare current member's last name with other members in dataframe
    if utils.full_process(row1['last_name']):
    # wont execute and not produce a warning
        matches = process.extract(row1['last_name'], list(df['last_name']), limit=10)
        for match in matches:
            if match[1] >= threshold:
                mat_bool = True
                matchIndex = df.last_name[df.last_name == match[0]].index
                # Add other duplicate member to the result list
                for i in matchIndex:
                    tmp_id = df.loc[i, '_id']
                    tmp_mid = df.loc[i, 'mid']
                    mat_id.add(tmp_id)
                    mat_mid.add(tmp_mid)
                    mat_idx.add(i)
    # Add current member to the list if duplicates have been found
    if mat_bool:
        mat_id.add(row1["_id"])
        mat_mid.add(row1["mid"])
    return list(mat_id), list(mat_mid), mat_bool, list(mat_idx)


def similar_email(row1, df, threshold=99):
    """
    Compare email similarity.

    Find the possible duplicate emails among all committees 
    which have higher or equal similarity scores to the threshold,
    return a generator of tuples containing the committee id, member id, 
    matched indicator and index.

    Arguments:
        row1: A row representing the committee member we want to check with.
        df: A dataframe representing all the committee members in a selected year.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.
                   threshold is 99 by default.

    Return:
        Generator of tuples containing the matched committee id list, member id list, 
        matched bool indicator and member index list in dataframe.
        All returned lists contain unique values.

        If matched bool indicator is false, meaning there is no possible duplicate among all committees,
        committee id list, member id list and member index list will be empty.
    """
    mat_idx = set()
    mat_id = set()
    mat_mid = set()
    mat_bool = False

    # Compare current member's email with other members in dataframe
    if utils.full_process(row1['email']):
    # wont execute and not produce a warning
        matches = process.extract(row1['email'], list(df['email']), limit=10, scorer=fuzz.ratio) #ignore issue of fuzz.ratio
        for match in matches:
            if match[1] >= threshold:
                mat_bool = True
                matchIndex = df.email[df.email == match[0]].index
                # Add other duplicate member to the result list
                for i in matchIndex:
                    tmp_id = df.loc[i, '_id']
                    tmp_mid = df.loc[i, 'mid']
                    mat_id.add(tmp_id)
                    mat_mid.add(tmp_mid)
                    mat_idx.add(i)
    # Add current member to the result list if duplicates have been found
    if mat_bool:
        mat_id.add(row1["_id"])
        mat_mid.add(row1["mid"])
    return list(mat_id), list(mat_mid), mat_bool, list(mat_idx)


def intersection(lst1, lst2):
    """
    Find the intersected part of lst1 and lst2.

    For example, two members may have identical first name initials but different last name. 
    We would consider they are different and unique members and exclude them from duplicate lists.

    Argument:
        lst1: A duplicate id list returned from similar_first_name, similar_last_name or similar_email.
              For example: first_name member id = ["1a", "2b", "3c"]
        lst2: A duplicate id list returned from similar_first_name, similar_last_name or similar_email.
              For example: last_name member id = ["2b", "3c", "4d"]

    Return:
        the intersection list of lst1 and lst2. 
        For example: intersection of first_name member id and last_name member id = ["2b", "3c"]
    """
    return list(set(lst1) & set(lst2))


def same_member01(row1, row1_idx, df, threshold):
    """
    Find possible duplicate members in dataframe by checking their first_name, last_name and email, 
    and generate corresponding error messages.
    Return the indices of the duplicates in list 
    and a dictionary of current member row index, duplicate members ids and error message.

    Arguments:
        row1: A row representing the committee member we want to check with.
        row1_idx: An index of the row representing the committee member we want to check with.
        df: A dataframe representing all the committee members in a selected year.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.

    Return:
        mat_idx: A list of row indices representing the duplicate members
        duplicate info: A dictionary of duplicate info containing the current row index, duplicate member id list 
                        and an error message indicating the duplicate. For example: 
                        "Possible duplicates, please check first_name, last_name and email."

    """
    fname_id, fname_mid, fname_bool, fname_idx = similar_first_name(row1, df, threshold)
    lname_id, lname_mid, lname_bool, lname_idx = similar_last_name(row1, df, threshold)
    email_id, email_mid, email_bool, email_idx = similar_email(row1, df, threshold)
    mat_idx = []
    # if email is duplicate
    if email_bool:
        mat_id = list(set(email_id))
        mat_mid = list(set(email_mid))
        mat_idx = email_idx
        # if first name and last name are duplicate
        if fname_bool and lname_bool:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid,
                    "errorMessage": "Possible duplicates, please check first_name, last_name and email."} #typo in first_name, email
        # if first name is duplicate
        if fname_bool and not lname_bool:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid, 
                    "errorMessage": "Possible duplicates, please check first_name and email."} #typo in first_name, email
        # if last name is duplicate
        if not fname_bool and lname_bool:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid, 
                    "errorMessage": "Possible duplicates, please check last_name and email."} #typo in last_name, email
        # if only the email is duplicate
        if not fname_bool and not lname_bool:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid,
                    "errorMessage": "Possible duplicates, please check email."} #typo in email
    
    # if the email is not duplicate
    else:
        mat_id = intersection(fname_id, lname_id)
        mat_mid = intersection(fname_mid, lname_mid)
        mat_idx = intersection(fname_idx, lname_idx)
        # check whether first name and last name are both duplicate or not
        if fname_bool and lname_bool:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid, 
                    "errorMessage": "Possible duplicates, please check first_name and last_name."} #typo in first_name, last_name
        # if either first name or last name is possibly duplicate, or neither of them is duplicate, 
        # we consider the current member is unique
        else:
            return mat_idx, {"_id": row1_idx, "ids": mat_mid, 
                    "errorMessage": "UNIQUE"} #all unique
    
    # should never go here, just in case unexpected error occurs
    return mat_idx, {"_id": row1_idx, "ids": mat_mid,
                    "errorMessage": "ERROR"}


def committees_check(input, threshold=85, drop_unique=True):
    """
    Find the possible duplicate committee members in the input. 
    This is the interface used by the /committees/duplicate endpoint.
    Return a list of JSON duplicate info that can be used by the frontend.

    Arguments:
        input: JSON data representing committee members in a selected year, 
                extracted from the database.
        threshold: A user defined threshold used to compare similarity scores.
                   It is 85 by default.
        drop_unique: indicator representing whether return unique member info.
                     If it is True, only return duplicate member info; 
                     otherwise, return comparison result of all committee members.

    Return:
        A list of JSON duplicate info containing a unique '_id", a list of member ids, and an error message.
        For example:
        [
            {'_id': 10,
             'ids': ['8819e3b3-9415-3306-74a5-58e328738383', '8w59e3b3-9425-3306-74a5-58e328736785'],
             'errorMessage': 'Possible duplicates, please check first_name and last_name.'},
            {'_id': 12,
             'ids': ['8we39e3b3-9415-3306-74a5-58e375438383', '8w5123b3-9425-3306-74a5-58e328767890', '8w5673b3-9425-3306-74a5-123328736767'],
             'errorMessage': 'Possible duplicates, please check first_name.'}
        ]
    """
    df = pd.read_json(input)
    df_mat = []
    excl_idx = []
    for index, row in df.iterrows():
        # exclude rows that have been compared with before in the iteration, to improve efficiency.
        if index not in excl_idx:
            excl_idx.append(index)
            compare_df = df.drop(index=excl_idx)
            mat_idx, matches = same_member01(row, index, compare_df, threshold)
            excl_idx = excl_idx + mat_idx
            excl_idx.sort()
            if drop_unique:
                if matches["errorMessage"] == "UNIQUE":
                    continue
            df_mat.append(matches)
    return df_mat

############################### duplicate sessions checking ##################################
def split_col(df, col_name):
    """
    Data preprocessing: split the column in the dataframe. 
    This is used to separate author names from the "authors" list in each row by comma or "and".

    Arguments:
        df: A dataframe representing all the sessions in a selected day
        col_name: A name of the column that we want to split

    Return:
        new_df: A new dataframe containing the original column and the splited columns.
    """
    
    # split the col_name column by comma or 'and' using a regular expression
    df[col_name] = df[col_name].str.split(r', | and ')#, expand=True)
    
    # explode the column and reset index
    new_df = df.explode(col_name).reset_index(drop=True)
    
    # remove multiple spaces within a string from [col_name] column
    new_df[col_name] = new_df[col_name].apply(lambda x: ' '.join(x.split()))
    
    return new_df


def strip_strings(x):
    """
    Data preprocessing: function to apply strip() method to string values.

    Arguments:
        x: A dataframe that we want to apply strip() method.

    Return:
        x: A cleaned dataframe.
    """
    if isinstance(x, str):
        # remove whitespace characters from the beginning and end of a string in dataframe
        return x.strip('\t ')
    else:
        return x


def get_similar_authors(x, candidates, threshold):
    """
    Get the most similar author name that can be used to group the authors in dataframe.
    Return a most similar author_name of the current author.

    Compare the current author with other authors in dataframe,
    and label the duplicate authors with a consistent similar author name that can be used to groupby.

    Arguments:
        x: A full name of the current author containing first name and last name.
        candidates: all authors' full names in the dataframe containing first names and last names.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.
    
    Return:
        res: a most similar author name among the current user's duplicates.
    """
    # split x into first_name and last_name
    x_parts = x.split()
    first_name = x_parts[0] if len(x_parts) > 0 else ''
    last_name = x_parts[-1] if len(x_parts) > 1 else ''
    
    # split the "candidates" column into "first_name" and "last_name" columns
    tmp_candidates = candidates.str.split(expand=True)
    candidates_first_name = tmp_candidates[0].fillna('')
    candidates_last_name = tmp_candidates[1].fillna('')
    
    # use fuzz.WRatio scorer to get similarity scores for all candidates
    #if utils.full_process(first_name) and utils.full_process(last_name):
    scores_first = [(s, fuzz.WRatio(first_name, s)) for s in candidates_first_name]
    scores_last = [(s, fuzz.WRatio(last_name, s)) for s in candidates_last_name]

    # combine the first_name and last_name into a full name, 
    # and add the scores of first_name and last_name
    scores = [(t1[0] + ' ' + t2[0], t1[1] + t2[1]) for t1, t2 in zip(scores_first, scores_last)]

    # filter scores based on a threshold
    scores_filtered = [(x[0], x[1]) for x in scores if x[1] >= threshold*2]

    # sort scores_filtered based on the length of the full names
    sorted_scores = sorted(scores_filtered, key=lambda tup: len(tup[0]), reverse=True)

    # get only the full names (without scores)
    tmp_res = [c for c, s in sorted_scores]
    # check whether there is more than one duplicate of the current author
    if len(tmp_res) > 0:
        # return the longest full name among the duplicates
        res = tmp_res[0]
    else:
        # if there is one duplicate which is itself, then return its own name
        res = x
    return res


def similar_author01(df, threshold):
    """
    Compare author similarity.

    Find the possible duplicate author among all sessions 
    which have higher or equal similarity scores to the threshold,
    return the dataframe containing a consistent duplicate author_name label for each duplicate group.

    Arguments:
        df: A dataframe representing all sessions in a selected day.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.

    Return:
        A dataframe with a newly added column named "similar_author", which representing the most similar author name for each duplicate group.
    """
    # apply the function to the authors column
    df['similar_author'] = df['authors'].apply(lambda x: get_similar_authors(x, df['authors'], threshold))
    return df


def preprocess01(df, threshold):
    """
    Data preprocess and group by similar author name.

    Clean the invalid characters: '\r\n' and whitespaces in dataframe, 
    format start_time and end_time,
    split authors into separate rows, 
    and add a consistent label for each duplicate group in the dataframe.
    For example, "Bob Bonakdarpour" and "B. Bonakdarpour" will have a similar_author name: "Bob Bonakdarpour".

    Arguments:
        df: A dataframe representing all sessions in a selected day.
        threshold: A based similarity score defined by the user. 
                   Only members who have higher or equivalent scores will be returned.

    Return:
        df: A dataframe with the "similar_author" column.
    """
    # clean dataframe
    df = df.replace(r'\r\n', '', regex=True)
    
    # split column "authors" by comma or 'and'
    df = split_col(df, "authors")
    
    # apply strip() method to string columns using applymap()
    df = df.applymap(strip_strings)
    
    # convert the desired column to a string without adding the current date
    df['start_time'] = pd.to_datetime(df['start_time'], format='%H:%M')
    df['end_time'] = pd.to_datetime(df['end_time'], format='%H:%M')
    
    # add column "similar_author" representing the most similar author name for each duplicate group
    df = similar_author01(df, threshold)

    return df


def check_intersection(start1, end1, start2, end2):
    """
    Function to check if two time slots have intersection. 
    If time slots are overlapped, return True; otherwise, return False.

    Arguments:
        start1: start_time of the time_slot_1
        end1: end_time of the time_slot_1
        start2:start_time of the time_slot_2
        end2: end_time of the time_slot_2

        For example: check_intersection("10:45", "11:15", "10:30", "11:00")

    Return: True if there is an intersection; False if no intersection.
    """
    if ((start1 < end2) and (end1 > start2)) or ((start1 == start2) and (end1 == end2)):        
        return True
    else:
        return False
    
def groupby_time_slot(df):    
    """
    Group the dataframe by similar_author and intersected time_slot, 
    to check whether the duplicate authors show up the the parallel sessions.
    It will return the union of intersected time_slots. For example:
        we have time slots "10:30-11:00" and "10:45-11:15", 
        and these two slots will be labelled as intersections with their union "10:30-11:15".
    Return the groupby dataframe.

    Arguments:
        df: a dataframe representing all the seesions in a selected day, all authors are in separate rows.
    
    Return:
        df: a grouped dataframe by similar_author and intersected time_slot.
    """
    df = df.sort_values(by=['start_time', 'end_time'], ascending=[True, False])
    df['time_slot'] = ''
    # group the dataframe based on 'similar_author'
    grouped = df.groupby('similar_author')
    
    # iterate through each group and check for intersection of time periods
    for name, group in grouped:
        min_start_time = min(group['start_time']).strftime('%H:%M')
        max_end_time = max(group['end_time']).strftime('%H:%M')
        
        # iterate through each row in the group and check for intersection with other rows
        for i, row in group.iterrows():
            row_start = row['start_time']
            row_end = row['end_time']
            
            # drop the current row in group when checking intersection
            group_excl = group.drop(i)
            start_times = group_excl['start_time']
            end_times = group_excl['end_time']

            has_intersection = any([check_intersection(row_start, row_end, start, end) 
                                    for start, end in zip(start_times, end_times)]) 

            if has_intersection:
                #print(f"1111 --- idx={i}, {row_start.strftime('%H:%M')}, {row_end.strftime('%H:%M')}")
                group.at[i, 'time_slot'] = '{}-{}'.format(min_start_time, max_end_time)
            else:
                #print(f"2222 --- idx={i}, {row_start.strftime('%H:%M')}, {row_end.strftime('%H:%M')}")
                group.at[i, 'time_slot'] = '{}-{}'.format(row_start.strftime('%H:%M'), row_end.strftime('%H:%M'))

        # replace the group in the original dataframe
        df.loc[group.index] = group
    res = df.groupby(['similar_author', 'time_slot'])
    return res


def format_time_slot(group):
    """
    Format intersected time_slot in error message.

    Arguments:
        group: A group representing duplicate authors in intersected time_slot.

    Return:
        res: Formated time_slot message. For example, "10:45-11:30"
    """
    min_start_time = min(group['start_time']).strftime('%H:%M')
    max_end_time = max(group['end_time']).strftime('%H:%M')
    res = '{}-{}'.format(min_start_time, max_end_time)
    return res


def programs_check01(input, threshold=85, drop_unique=True):
    """
    Find the possible duplicate authors among parallel sessions in the input. 
    This is the interface used by the /programs/duplicate endpoint.
    Return a list of JSON duplicate info that can be used by the frontend.

    Arguments:
        input: JSON data representing sessions in a selected day, 
                extracted from the database.
        threshold: A user defined threshold used to compare similarity scores.
                   It is 85 by default.
        drop_unique: indicator representing whether return unique session info.
                     If it is True, only return duplicate sessions info; 
                     otherwise, return comparison result of all sessions.

    Return:
        A list of JSON duplicate info containing a unique '_id", a list of program(activity) ids, and an error message.
        For example:
        [
            {'_id': 40,
            'ids': ['68c504ce-5209-4824-9dd8-1b71d7886b60',
            '281decef-b7e3-43ff-a2e8-ff0f6f055518'],
            'errorMessage': 'Possible duplicate, please check the author: M. Heule, in time_slot: 16:30-17:30'},
            {'_id': 41,
            'ids': ['95e8dcad-e728-4007-8590-fd7179739d29',
            '5f9d37e4-ad12-4796-a61b-f2c9f0cb99db'],
            'errorMessage': 'Possible duplicate, please check the author: M. Kokologiannakis, in time_slot: 12:00-12:30'}
        ]
    """
    df = pd.read_json(input)
    df = preprocess01(df, threshold)
    grouped = groupby_time_slot(df)
    output = []
    i = 0
    for name, group in grouped:
        ids = []
        if len(group) > 1:
            ids = list(group['_id'])
            time = format_time_slot(group)
            tmp = {"_id": i, "ids": ids,
                "errorMessage": f"Possible duplicate, please check the author: {name[0]}, in time_slot: {time}"}
        else:
            tmp = {"_id": i, "ids": ids, 
                    "errorMessage": "UNIQUE"} #all unique
        i+=1
        if drop_unique:
            if tmp["errorMessage"] == "UNIQUE":
                continue
        output.append(tmp)
    return output